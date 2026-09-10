# Creem 支付适配与验收边界

2026-09-08。内部实现与隔离验证，不是实际 Creem 商户沙箱收款证明。

## 已实现

- 复用既有用户会话、CSRF、订单快照、整数积分账本及风控暂停；新增独立 Creem HTTPS/JSON 适配，无新框架或公开 API 产品。
- 后台套餐填写 `products.creem` 的 Product ID。前台按配置显示 Stripe / Creem；用户确认价格和周期后选择一个渠道。不确定的购买会禁用其他渠道，重试保持同一请求 ID。
- 服务器先校验商品、环境、USD 金额、固定单次/月/年周期、数量 1，再调用 `POST /v1/checkouts`，元数据只带不透明订单 ID 和商户作用域。不向支付商户传送用户 brief、图片、文件名或 Google 身份数据。
- Webhook 原始报文 HMAC-SHA256 恒时比较，验签后读取当前商户资源验证实际交易，原始报文不持久化。Checkout 返回页不发积分，订阅激活不发积分；已验证单次交易或 `subscription.paid` 才发放。
- 订阅续费使用**签名事件所指的历史 transaction ID**，不能用当前订阅的最新 transaction 替代旧月份。实际付款 ID、订单周期与事件 ID 分别防重。
- 退款以真实渠道 `refunded_amount` 累计值核对。Schema 4 增加 `ai_payment_refund_totals`，不覆盖原账本/数据；累计值只增不减，和单笔退款取覆盖范围的最大值，不叠加重复回收。
- 退款/争议先到时，同事务校验原付款与回收，避免先把已退款积分放进可消费余额。已消费积分显示待回收，进行中任务冻结积分不被挪用。
- 历史退款/争议回收及订阅状态、取消不再读取当前商品目录价格；原交易、旧报价、商户与对象关联检查保留。商品改价/归档不阻断这类已绑定旧业务操作。新授信仍走 entitlement 校验，状态同步走 state；用途参数必须显式填写。
- 账户的停止续费调用 `POST /v1/subscriptions/{id}/cancel`，显式 `mode=scheduled,onExecute=cancel`，再 GET 核对。查询/操作都验证用户与订阅所有权。
- 迟到付款区分已验证创建和仅回调绑定：只有原 `createCreemCheckout` 完成商品及响应校验、`bindCheckout` 同时保存外部 ID 与安全结账链接时，才不再要求当前目录价格等于历史价格。仍读取商户私有 checkout/transaction，核对原订单、商品、请求 ID、金额、币种、客户及交易关联；订阅付款还回查原 checkout 与订阅/客户关联。新配置不能改变旧订单积分。
- 取消使用独立 `cancellation` 用途：必须存在本地同订单、同商户环境、同客户的订阅绑定，取消前后两次私有查询都检查。商品 ID、数量、折扣或收款方式变化不阻止结束该绑定订阅，但不因此允许发积分。POST 响应丢失后保留未知结果；重试先 GET，已经安排取消时不再 POST。
- 后台显示安全订单和异常。Creem 异常提供事件编号与商户后台重新发送说明，不假装有未经实现的后台事件读取/争议关闭 API。
- 已入账且本地绑定的历史付款可在订阅产品/数量/折扣/收款方式改变后继续回收退款或暂停争议权益；只产生回收事实，不重新发积分。无绑定的退款先到收据仍走严格商业校验，关联丢失报错并保留重试。[本组55项Creem测试与生产回归](creem-history-recovery.md)不是实际商户联调。

## 部署配置（尚未对公网启用）

在部署秘密中配置，不在聊天、前端或普通导出中填写：

| 变量 | 说明 |
| --- | --- |
| `CREEM_API_KEY` | 当前商户环境的私有 API Key |
| `CREEM_WEBHOOK_SECRET` | 同一商户端点的 HMAC 秘密 |
| `CREEM_ACCOUNT_ID` | 固定商户/店铺标识，作为持久订单作用域，不可复用给另一店铺 |
| `AI_PAYMENT_MODE` | `test` → `https://test-api.creem.io`；`live` → `https://api.creem.io` |
| `AI_PAYMENTS_ENABLED` | 默认 false，仅控制新购买；旧回调仍可结算 |
| `AI_PUBLIC_ORIGIN` | 站点正式 HTTPS origin；只有本地隔离环境允许 HTTP |

回调：`<origin>/api/ai/payments/creem/webhook`。监听 `checkout.completed`、`subscription.active`、`subscription.paid`、`subscription.canceled`、`subscription.scheduled_cancel`、`subscription.past_due`、`subscription.unpaid`、`subscription.expired`、`subscription.update`、`subscription.trialing`、`subscription.paused`、`refund.created`、`dispute.created`。

REST 响应 `mode` 的 `test/sandbox` 仅接受测试环境，`prod` 仅接受正式环境；文档历史样例中的 `local` 不作为生产允许值。API 固定域名、禁止跳转、不自动重试、10 秒超时、256 KiB JSON 上限。重试通过应用相同订单 `request_id`，不新建购买。

Creem 当前引用的响应 schema 没有直接返回店铺 ID；`CREEM_ACCOUNT_ID` 是部署作用域标识，**不是已远程验证的 account-me 结果**。实际资源归属依靠私有商户 API Key 查询、同店铺 webhook 秘密、不可猜测订单元数据和商品/交易关联共同核对。开通前必须用该店铺测试密钥与端点实际验证，不能只凭“已配置”标记上线。

套餐与商品一旦被订单引用，运营上应新建商品进行改价，不直接变更原商品周期/价格。新购买和缺少已验证创建绑定的付款仍要求当前商品匹配，不能仅凭 webhook 保存的 checkout ID 免除目录检查。已验证创建的历史付款使用冻结订单；退款和取消不受当前目录售价影响。订阅当前产品 ID、数量、折扣、收款方式变化仍会拒绝新授信或一般状态同步；取消及已有收据、同订单/客户/商户订阅绑定的历史回收使用独立用途，不因此支持任意升级降级。无绑定的历史收据仍保留严格当前商业条件检查。支持范围不包含折扣、试用发放、任意数量/动态价格或按比例升级降级。

## 未完成/待外部核验

1. 真实 Creem 商户沙箱：支付成功/失败/续费/退款/乱序/重放/停止续费尚未执行；使用过的金额/图片/会话均为测试夹具。
2. 文档明确 `dispute.created`，未提供本轮可证实的胜诉/关闭事件契约。当前保留付款权益暂停，不伪造自动恢复；该部分仍属未完成目标，需要实际渠道结论和可审计恢复流程。
3. 没有已知 checkout ID 的未知结账，仍需完整人工核对流程。本站一小时链接保留窗口不是 Creem 远程 session 真实失效的证明；不能宣称本站超时已撤销渠道结账。
4. 没有保存原始 webhook，因此后台不从本地原文伪造重放。商户后台重发后重新验签/查询；进一步可观测对账和运营处理仍待完善。
   本轮补验真实签名 handler：首次不合法交易失败后记去敏异常，同一事件重发且实际交易修正后成功、解除异常、再重发不重复授信。网络结果仍是隔离替身，不是假造商户重发操作已执行。
5. 其余 AI 语言、PayPal、完整备份/容器恢复、真实供应商/Google 与三家支付联调继续进行，整体 Goal 未完成。

## 可复现验证

```sh
pnpm --filter @hxsl/web exec vitest run lib/ai/creem-payments.test.ts lib/ai/payments.test.ts
AI_CHECK_PAYMENT_PROVIDER=creem pnpm test:ai:payments
```

`creem-payments.test.ts` 当前 34 项。保留原 23 项，新增 11 项覆盖：已验证创建后目录不可用的首次付款/续费、冻结金额及积分/数据库重开、仅 webhook ID 不可冒充创建证明、金额/币种/关联/数量/折扣的反向验证、变更订阅取消、取消前后客户替换、丢失响应重试，以及真实签名 handler 失败→重启→重发成功→重复去重。全 web 304 项通过（AI 235），报告 `evidence/web-tests-creem-bound.json`；商户 HTTP 仍为显式替身。

外部 HTTP 是显式注入替身，不是线上 API 已兼容认证。原浏览器证据使用真实应用 HTTP/SQLite/页面及明确金融夹具，未知结账响应是显式替身。截图和报告位于 `evidence/creem/`，本轮服务端修复没有改 UI，也没有把旧截图声称为本轮新增截图。

## 官方依据

[API 索引与环境](https://docs.creem.io/llms.txt)、[创建结账](https://docs.creem.io/api-reference/endpoint/create-checkout)、[结账查询](https://docs.creem.io/api-reference/endpoint/get-checkout)、[商品](https://docs.creem.io/api-reference/endpoint/get-product)、[交易](https://docs.creem.io/api-reference/endpoint/get-transaction)、[订阅取消](https://docs.creem.io/api-reference/endpoint/cancel-subscription)、[Webhook](https://docs.creem.io/code/webhooks)、[request_id 幂等说明](https://docs.creem.io/skills/creem-api/REFERENCE)。没有引入该站 CLI 或向终端用户提供支付/转换 CLI 产品。
