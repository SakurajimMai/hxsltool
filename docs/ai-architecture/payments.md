# 支付、订阅和积分运营（实施中）

最新追加（2026-09-08）：已有订单无回调时的Stripe主动核对、退款/争议净额和受保护后台入口见[checkout-recovery.md](checkout-recovery.md)。下方为早期Stripe阶段记录；后续PayPal、15语言、WAL备份、容器等进展以[acceptance.md](acceptance.md)为准，早期“尚未实现”不能当作最新状态。真实三渠道沙箱和完整财务对账仍未完成。

2026-09-08。当前已实现 Stripe 和 Creem 内部链路；Creem 争议恢复/完整对账、PayPal 适配和三家实际商户沙箱验收仍未完成。默认不开放购买。下文主要描述 Stripe；Creem 部署与契约见 `creem.md`。不是上线或真实收款证明。

## 用户与管理员路径

- `/<locale>/ai/pricing`：显示后台已发布套餐、金额、积分和周期；Google 用户会话、明确价格确认后才创建结账。没有配置的渠道不出现可购买按钮。
- Stripe 托管结账：敏感付款资料在 Stripe 页面填写，不经过本站表单。网页返回账户页不发放积分，只查询状态。
- `/<locale>/ai/account`：自己的订单、积分发放/回收/待回收、订阅状态、周期结束时间与停止续费。停续费需要确认，服务器实际请求商户并核对返回状态。不会将停续费称为退款。
- `/admin` → 建筑 AI → 支付与对账：分页订单及最新 100 条未完成回调问题。只显示内部 ID、套餐、渠道、去敏错误和积分，不返回支付链接、原始报文、账单地址或用户文件。
- 重新核对：仅已记录的回调异常可操作，要求近期管理员验证、CSRF 和确认。从当前商户读取对应事件和付款事实后入账；不创建新结账、不重新收款。失败不显示成功。

## 部署前配置

保持既有 Next.js/Node 部署，无需 Python、GPU 或独立支付微服务。服务器仅承担认证、外部请求、订单和账本事务，不开放第三方转换 API。

| 配置 | 作用 |
| --- | --- |
| `AI_PAYMENTS_ENABLED=false` | 默认禁止新购买；关闭新购买后仍处理已验证回调，不丢弃旧订单付款 |
| `AI_PAYMENT_MODE=test` | `test` / `live` 显式隔离；不能在同一实例随意切换后遗弃旧环境订单 |
| `STRIPE_SECRET_KEY` | 对应环境服务端商户密钥，只放部署秘密 |
| `STRIPE_ACCOUNT_ID` | `acct_…`，每次渠道处理验证实际账户匹配 |
| `STRIPE_WEBHOOK_SECRET` | 该端点的签名秘密，只放部署秘密 |
| `STRIPE_AUTOMATIC_TAX=false` | 是否请求 Stripe Automatic Tax；税务配置与真实商户测试另行核验，不代表税务合规承诺 |
| `AI_PUBLIC_ORIGIN` | 正式 HTTPS origin；只有本地隔离测试允许 HTTP。不要将裸 IP 写死为生产域名 |

后台套餐 `products.stripe` 填 **Price ID**，金额、USD、单次/月/年周期须与真实 Price 一致。固定价格、数量 1、licensed 周期、无试用/优惠/按量/按比例结算。配置只是期望值，服务器再次向商户校验实际商品。订阅首次激活不发积分；经核验的 `invoice.paid` 按每期发放。

新增服务端 SDK `stripe@22.6.1`，固定 API 版本 `2026-08-26.dahlia`。HTTPS 回调地址为 `<AI_PUBLIC_ORIGIN>/api/ai/payments/stripe/webhook`，注册为本商户对应版本的 snapshot 端点。监听：

- `checkout.session.completed`、`checkout.session.async_payment_succeeded`、`checkout.session.expired`、`checkout.session.async_payment_failed`
- `invoice.paid`
- `customer.subscription.created`、`customer.subscription.updated`、`customer.subscription.deleted`
- `refund.created`、`refund.updated`
- `charge.dispute.created`、`charge.dispute.updated`、`charge.dispute.closed`

回调按原始 body 验签（时间容差 300 秒、最大 256 KiB），再读取规范商户资源核对环境、关联、商品、金额、货币与实际支付。未完成事务返回非 2xx 供渠道重试，不把“收到请求”当作“入账”。当前同步查询多次外部 API，仍需真实沙箱验证超时/重试；尚未实现持久化异步回调 inbox。

官方依据：[Stripe Webhooks](https://docs.stripe.com/webhooks)、[订阅事件](https://docs.stripe.com/billing/subscriptions/webhooks)、[创建 Checkout](https://docs.stripe.com/api/checkout/sessions/create)、[Invoice Payment](https://docs.stripe.com/api/invoice-payment/object)、[Refund](https://docs.stripe.com/api/refunds/object)。这些资料定义接口契约，不是本站真实联调证据。

## 金额和积分一致性

1. 订单冻结配置版本、套餐、价格和发放积分。保存草稿或修改套餐不会改变旧订单/已有订阅的冻结价格。
2. 创建订单不加积分。用户请求键、支付渠道事件 ID、实际付款 ID、订单计费期分别约束幂等，短 SQLite 事务中不发网络请求。
3. 不确定的结账使用同一幂等键核对；60 秒 claim 防并发。只能在创建后的前 30 分钟重试创建，之后提示对账，避免 Stripe 最小到期窗口/幂等重用问题。一小时后不继续提供旧结账链接。
4. 真实部分退款按付款总额比例回收毫积分，用整数向上取整，合计不超过本次发放。退款先于入账到达时先留事实，入账后同事务回收。
5. 争议处理中或败诉暂停对应付款权益；胜诉只恢复实际已回收部分，并扣除有效退款。晚到旧 open 状态不能重新打开终态。
6. 已消费或冻结额度不伪造负余额，不擅自扣其他进行中任务的冻结积分。待回收金额明确显示，暂停新购买/生成；未来可用额度和释放额度按账本自动回收，旧任务按原约定结算。
7. 订阅/争议从渠道 GET 读取当前快照，用读取开始时间排序，不用触发它的旧事件时间给最新快照排序。终态仍有防回退保护。

当前不支持已有订阅改价/套餐升级降级、试用、折扣、多付款拆分或人工标记发票已付等复杂账单形态；遇到不符合冻结契约的款项保留异常，不发放假积分。退款在商户控制台发起，本站处理已验证的退款事实；没有伪造一键退款入口。

## 持久化、更新与回滚

Schema 3 在既有持久 SQLite 增加 `ai_checkout_state`、付款收据、退款/争议事实、信用回收、事件投递、订阅状态和去敏异常表；仅 `CREATE IF NOT EXISTS` 与幂等 schema 标记，不删除历史凭据/业务表。旧占位 `ai_payment_events` 表保留但不作为新结算来源。账本和金融事实必须与配置数据库一起持久化。

部署继续使用 `compose.yaml` 的既有管理员数据卷；不得 `down -v` 或把 SQLite 仅写容器层。当前已有真实 standalone 进程重启验证，但**不代替容器重建/数据库恢复验收**。

上线前先停止接受新购买，保持旧回调可处理，确认没有未核对结账与付款。备份必须是完整 SQLite 一致性快照并包括 WAL 已提交内容，独立保管部署秘密。现有 `admin-backup.mjs` 只是复制主文件，不能作为活跃 WAL 数据库的可靠备份；本轮后续须修正并实际恢复演练，不能照当前脚本直接宣称安全升级。付款入账后不得回滚到不认识新账本的旧代码或只恢复旧余额；必须先核对渠道事实、账本和回调恢复能力。

## 已有验证与缺口

- `pnpm --filter @hxsl/web exec vitest run lib/ai/payments.test.ts`：24 项实际逻辑/SQLite/SDK 编码与原始验签测试；SDK HTTP 为显式替身，没有商户扣款。
- `pnpm test:ai:payments`：真实 Next HTTP、SQLite 与 Chromium；6 组断言、12 张截图、限定 AI/后台组件 axe 检查。购买未知响应是明确浏览器替身，金融事实是隔离构造，不是 Stripe 沙箱交易。原始前后截图见 `evidence/payments/`。
- `pnpm test:ai:standalone`：实际生产构建的进程重启/发布/回滚/会话/静态资源检查，详见 `validation.md`；不代表 Docker 重建。

仍需：PayPal 渠道、Creem 争议恢复/完整对账、未知结账但未产生已知回调异常时的完整管理对账、取消操作并发恢复的真实商户验证、商户环境迁移/秘密轮换策略、实际支付沙箱（成功/失败/重复/续费/退款/争议）、其余 13 种 AI 翻译、完整 SEO、备份恢复与容器验收。Creem 基础订单/付款/累计退款与停续费已追加实现，见 `creem.md`。未执行真实 OAuth、生图、收款、DNS 或生产发布。
