# PayPal 接入进度与契约

2026-09-08：一次性订单和月/年订阅服务端、用户返回核对/明确付款、立即取消界面已实现并隔离验证，**PayPal 正式收款尚未开放**。新购买只允许显式开启的 sandbox，争议、完整后台对账和真实商户沙箱仍待完成，不能将内部测试当作渠道上线验收。

最新增量：争议canonical观察、金额暂挂、胜诉释放、较新复议、不可变历史及后台受保护GET复查已实现，新增28项测试。完整败诉/赔付/退款重叠最终核算仍未完成。实际操作、v6迁移与回滚边界见[paypal-disputes.md](paypal-disputes.md)，新旧验收报告以validation.md为准；下方早期计数保留为历史记录。

## 当前代码路径

- `paypal-api.ts`：官方固定 HTTPS 主机、OAuth client credentials、进程内短期 token 缓存/同客户端并发合并、响应与超时限制、端点/方法白名单、在线回调验签。
- `paypal-orders.ts`：冻结的一次性套餐 → 创建订单 → 查询核对 → 批准链接；用户批准后由服务端 capture → 重新读取实际 capture → 原子积分入账。
- `POST /api/ai/orders/[id]/paypal-capture`：真实用户会话、来源/CSRF、订单所有权；只接受 `{ "action": "capture" }`。账户每分钟最多 6 次 capture 查询/尝试，计数持久化；任何网络调用前检查归属与限流。没有 GET 扣款路由。
- `POST /api/ai/payments/paypal/webhook`：原文验签 → 已验证事件去重 → 私有 API 查询 → 账本事务；异常持久化安全错误码，返回可重试失败。没有存储回调原文、付款人资料、token 或证书。
- `paypal-subscriptions.ts`：月/年方案核验、订阅创建/状态同步、实际历史 Sale 与交易列表双重核对、退款及取消；`paypal-payments.ts` 统一分派入站事件。
- `paypal-budget.ts`：复用现有限流表，schema 5 幂等新增 `ai_payment_leases` 限制回调并发；原订单/账本/退款/审计保留，没有新数据库服务、数据删除或账号迁移。

`/api/ai/orders` 已按冻结套餐分派 PayPal 一次性/订阅创建。前台渠道来自同一个 readiness 服务，不把设置存在等同于真实商户可用。`AI_PAYMENTS_ENABLED=true`、`AI_PAYMENT_MODE=test`、`PAYPAL_SANDBOX_CHECKOUT_ENABLED=true` 且四个 PayPal 字段通过校验时才显示可购买按钮；默认不开启，live 始终不开放新建。旧订单的核对、取消与回调不依赖新购买开关，关闭购买不丢弃已有财务事实。

## 用户返回与取消路径

1. 在定价页确认套餐金额、积分和周期，选择 PayPal；服务器根据不可变配置创建订单/订阅并给受限官方批准链接。
2. PayPal 返回 `/{locale}/ai/account?paypal_order=<本站UUID>`。初始页面只读本人本地订单，不自动向 PayPal 扣款、激活或核对。URL 内 token、PayerID、subscription_id 不是付款证明，也不进入登录返回路径/浏览器持久存储。
3. 登录失效时 Google state 只保留受控语言账户路径和本站 UUID；登录后再次按当前用户校验归属。跨语言切换丢失返回参数时，账户每条 PayPal 订单提供“打开付款核对”；完整语言切换上下文保留仍待后续统一处理。
4. 点击“向 PayPal 核对状态”调用用户/CSRF 保护的 `POST .../paypal-review`。上游只有私有 GET，查询完的收据才可同步到账；订阅 ACTIVE 仅同步状态，不用 last_payment 发积分。每用户每分钟最多 6 次核对。
5. 一次性订单 APPROVED 时显示冻结金额、独立勾选和“确认付款”按钮。显式 POST capture 再核验批准状态并使用原幂等键。未知响应撤下付款确认，要求先核对同一订单；只有核对为 approval_required 才重新显示批准链接。订单列表也先进入核对页。
6. PayPal 订阅用“立即取消”及明确确认提示，与 Stripe/Creem 的期末停续费区分。取消不退款、不追回既有积分；服务端 POST 后再 GET 核对终态，失败明确显示尚未确认。

页面关闭或浏览器超时只停止观察，不把它称为真实付款取消。上游 capture 可能已经受理，必须保留同一订单并再次只读核对。反向代理仍应避免记录完整支付返回查询串；本轮没有修改公网日志策略。

## 环境与秘密

`.env.example` / `compose.yaml` 只添加空值可选配置，不含实际凭据：

- `PAYPAL_CLIENT_ID`、`PAYPAL_CLIENT_SECRET`：同一 PayPal REST App 的服务端凭据。
- `PAYPAL_MERCHANT_ID`：实际收款商户的 13 位 ID，不是电子邮件或客户端 ID。
- `PAYPAL_WEBHOOK_ID`：这个 App / 环境的真实 Webhook ID。
- `PAYPAL_SANDBOX_CHECKOUT_ENABLED=false`：本阶段受控测试入口，只有 test 模式可用。不是绕过商户验收的 live 开关。
- `AI_PAYMENT_MODE=test|live`：选择 sandbox / live；与现有支付部署开关分开，停止新购买不丢弃已有回调结算。

API 主机固定为 `api-m.sandbox.paypal.com` 或 `api-m.paypal.com`。不允许后台填写任意支付主机。秘密只存在服务器配置/内存；不加入公开配置或浏览器 bundle。

## 已实现的核验规则

Orders v2 创建仅支持一次性、固定 USD 总价，一个 purchase unit，无运费、优惠、数量覆盖或自动税费计算。套餐 `products.paypal` 在一次性购买时是冻结的本地商品映射，不冒充 PayPal Price API；订阅使用真实 `P-…` plan_id 并独立验证周期/价格。更改运营价格不改变旧订单快照。

远端订单必须匹配：CAPTURE intent、HXSL 订单追踪/发票标识、商户、冻结金额及已经绑定的外部 ID。PayPal 返回最小响应时再 GET 查询验证，批准链接严格匹配当前环境、`/checkoutnow` 与订单 token。创建请求和扣款请求使用不同的稳定幂等键；创建响应未知保留 unknown，不马上放开另一笔购买。

只有实际 canonical capture 的商户、关联订单、唯一 capture、final_capture、USD 金额与已完成状态匹配时才生成收据。批准、订单完成通知、pending/denied 通知均不能直接发积分，也不会仅凭回调主动扣款。浏览器返回参数不是付款证明。扣款响应丢失后，下一次明确重试先 GET 状态；已经完成不会再发一次 capture。

回调在线验签保留收到的 `webhook_event` 原始字节，包括空格和数字格式，避免重序列化改变签名。证书 URL 只作为 PayPal 验签请求字段，应用不会访问它；仍校验 HTTPS、官方环境对应主机和证书路径。缺头、错误环境、未来时间、错误验证结果被拒绝；合法旧重试依赖持久事件 ID 去重，不用任意短时限误拒。

退款查询实际 Refund API，提取并验证官方 `up` 关联 capture ID，再查询本站归属与累计退款金额。原收据、逐笔退款和累计回收在同一事务入账，避免退款先到时产生全额可消费积分；累计与逐笔重叠不重复回收。已用积分形成待追回，不扣冻结余额。全额退款的 capture 即使先于 paid 通知抵达，也不会留下可消费余额。

若首次看到的 capture 已部分退款，但尚无已核对退款/收据，不猜退款数额：返回 `PAYMENT_REFUND_RECONCILIATION_REQUIRED`。已核对退款事件原子写入收据后，迟到 paid 通知可以去重完成而不补发积分。若退款事件缺失，仍需要后续真实后台对账能力；当前不能宣称自动恢复已完整。

## 尚待实现与开放条件

1. PayPal Subscriptions 服务端已实现月/年价格与周期核验、批准/生效区分、实际交易核对、退款与取消；仍需真实商户验证（尤其 Sale v1 查询兼容、退款完整事件集、周期/时间字段）。不是一次性订单循环调用。
2. 返回核对、明确付款、登录返回和渠道选择已实现 en/zh-CN 并有隔离浏览器证据；其余 13 种 AI 语言仍待完成。GET 页面不可隐式扣款。
3. 争议生命周期、人工对账、未知创建恢复；不支持的回调当前保留去敏异常并返回 503，不返回虚假处理成功。
4. 应用层全局回调预算已实现并验证；真实反向代理入口防滥用、支付资源压力与可用性验证未完成。应用层预算不是 WAF 或抗 DDoS 证明。
5. 用户 PayPal 9 张桌面/手机/深浅主题/错误截图已实际查看；PayPal 后台主动对账 UI 仍待实现，不拿其他渠道后台截图代替。
6. 完整渠道合同回归、真实 PayPal Sandbox 商户/买家/回调联调，再考虑启用购买。未调用真实扣款、未配置真实商户、未更改公网 13080 部署。

## 测试边界与命令

`pnpm --filter @hxsl/web exec vitest run lib/ai/paypal-orders.test.ts`

21 项测试通过。调用真实自建 HTTP 客户端、真实 SQLite 事务与真实 Route Handler；外部 fetch 明确替身，PayPal 验签 SUCCESS 也是替身返回，**不是 PayPal 密码学/互联网联调证据**。覆盖创建与捕获未知响应、原文透传、主机/权限/CSRF、实际金额核验、重放、退款乱序/累计回收、重启后的去重和限流、输入/响应限制。路由测试直接调用 handler，不能称为真实监听端口的浏览器 E2E。

最新完整 web 测试：250 通过，0 失败，证据 `evidence/web-tests.json`。PayPal 一次性/返回 26、订阅 20、预算/迁移 5，合计 51；Stripe 24、Creem 16。另新增 Google 返回路径白名单测试。`pnpm test:ai:paypal-ui`：5 组浏览器检查、9 张截图和 scoped axe 通过。仍不代表全部 82 工具文件输出或三个真实支付渠道已验收。

### 订阅与资源预算追加

服务端创建前 GET plan，限定一个无限 REGULAR 周期、MONTH/YEAR × 1、固定 USD 价格、无试用/数量阶梯/运费/初始化费用/附加税。为避免累计欠款合并收费被误计为一个周期，当前要求 `auto_bill_outstanding=false`、`payment_failure_threshold=1`。运营需在 PayPal 创建符合条件的计划并填入 ID，不支持的计划会明确拒绝。

创建使用稳定 PayPal-Request-Id 和 `hxsl:<订单>:<商户作用域>:<环境>` custom_id；GET 实际订阅后再绑定当前环境的批准链接。APPROVAL_PENDING 没有真实 payer_id 时不伪造买家 ID；ACTIVATED/last_payment 仅更新状态、不发积分。原生用户确认页采用 SUBSCRIBE_NOW 由 PayPal 接受周期授权，本站不在 GET 返回页激活或扣款。

每笔 PAYMENT.SALE.COMPLETED 从私有 Sale 查询取得真实订阅与交易时间，再查 Subscriptions 的两分钟交易窗口，匹配**这笔** Sale ID、已完成状态、金额及冻结套餐。不会用 latest payment 代替历史月份；结果分页不完整或金额/状态异常则要求核对。积分按真实收费交易发放一次，账本 `periodId=paypal-sale:<交易ID>` 是支付交易幂等键，**不是 API 没提供的日历计费期编号**。缺失周期证据不能编造自动按日历归属成功。

订阅退款仅查询旧 Sale/Refund，不使用旧 v1 接口创建或执行付款。逐笔退款与原收据原子入账；确认全额退款时复用累计回收机制。部分退款涉及多事件，缺失事件仍需要对账，不能宣称已自动枚举所有历史退款。历史退款与取消仅使用所有权/原金额校验，不因远端后来改价/覆盖选项而拒绝安全取消或回收；新授信仍校验实际订阅方案，不匹配则进入异常核对。

取消 POST 验证用户/CSRF/归属，调用真实取消 API，接受官方 204 后仍 GET 确认 CANCELLED/EXPIRED。取消是立即停止后续计费，`cancelAtPeriodEnd=false`；不扣回已买积分，也不冒充退款。若远端未确认则返回 unknown，重试先读状态。账户已增加与这一语义一致的 PayPal 取消按钮，已测试取消确认框的放弃与确认分支。

订阅 API 没有像 Orders purchase_units.payee 那样返回收款商户 ID。订阅归属依靠同一单商户 App 的私有 API 权限、创建时持久订单映射、custom_id 作用域、外部订阅 ID、官方在线验签和实际交易匹配；`PAYPAL_MERCHANT_ID` 是部署作用域，不伪称已通过订阅响应重新读取了商户 ID。真实沙箱仍需验证 App 属于指定收款商户，当前不支持 multiparty/代商户 OAuth。

回调全局最多 2 个处理租约，每分钟 60 次受理（包含签名失败），超限返回真实 429/503。每次结束在 finally 释放；崩溃租约 120 秒过期后回收，DB 连接间共享；不修改账本或真实生成任务。捕获/取消各自每用户每分钟 6 次，限流跨重启保留。每个外部请求 10 秒超时、256 KiB 响应边界，无自动重试。无效请求消耗全局配额意味着攻击可能影响可用性，仍需可信反向代理的入口限流；资源上限不是充分的抗攻击验收。

测试命令：`pnpm --filter @hxsl/web exec vitest run lib/ai/paypal-subscriptions.test.ts lib/ai/paypal-budget.test.ts lib/ai/paypal-orders.test.ts`。首次定向通过 43 项，随后新增 schema-4 → 5 的隔离数据保留用例，由全 web 242 项执行覆盖；当前 18 项订阅、5 项预算/迁移。包含月度/年度、退款先到、旧价退款、取消 204 及确认失败、越权、实际 Route Handler 分派、付款资料不落日志、独立连接并发预算、租约失效和幂等 schema。所有 PayPal 网络仍为测试替身。

尚未处理的事件明确留待支付完整验收：PayPal 争议与 reversal、Orders v2 `PAYMENT.CAPTURE.DECLINED`（不同于 v1 DENIED）、订阅 SALE pending/denied 和退款 pending/failed、后台主动拉取/重放异常。当前不支持的事件返回失败并记录安全错误，不能将这一行为称为已完成异常恢复。

## 官方依据

- OAuth token 与环境：[PayPal REST Authentication](https://developer.paypal.com/api/rest/authentication)。
- 创建/批准订单、幂等请求头：[Orders v2 Create](https://developer.paypal.com/api/orders/v2/orders-create)；[Capture order](https://developer.paypal.com/api/orders/v2/orders-capture)。
- 服务器查询实际 capture 的归属/金额/状态：[Capture details](https://developer.paypal.com/api/payments/v2/captures-get)。
- 退款关联与 `total_refunded_amount`：[Refund details](https://developer.paypal.com/api/payments/v2/refunds-get)。
- 在线验签字段与结果：[Verify webhook signature](https://developer.paypal.com/api/webhooks/v1/verify-webhook-signature-post)。
- 原文保留要求与 sandbox 验证区别：[Integrate webhooks](https://developer.paypal.com/api/rest/webhooks/rest/)。
- 月/年方案、实际订阅与独立交易查询：[Plans](https://developer.paypal.com/api/subscriptions/v1/plans-get)、[Subscription details](https://developer.paypal.com/api/subscriptions/v1/subscriptions-get)、[Transactions](https://developer.paypal.com/api/subscriptions/v1/subscriptions-transactions)。
- 创建/取消契约：[Create subscription](https://developer.paypal.com/api/subscriptions/v1/subscriptions-create)、[Cancel subscription](https://developer.paypal.com/api/subscriptions/v1/subscriptions-cancel)。
- 官方仍列出的 PAYMENT.SALE 订阅通知：[Webhook events](https://developer.paypal.com/api/rest/webhooks/event-names/)；兼容查询依据为 [Sale v1](https://developer.paypal.com/api/deprecated/payments/v1/sale-get)、[Refund v1](https://developer.paypal.com/api/deprecated/payments/v1/refund-get)，二者文档带有弃用提示，真实商户适用性必须继续验证。
- 结构化字段交叉核查：[PayPal 官方 OpenAPI](https://github.com/paypal/paypal-rest-api-specifications/blob/main/openapi/billing_subscriptions_v1.json)，本次读取 blob SHA `5a8849a2f6844d6110549ca694b256d9d85d9d6b`；不把样例空数组当成真实交易字段缺失。

访问日期 2026-09-08。官方结构决定传输契约；本站数据边界、积分记账与限流为本项目实现，不是 PayPal 官方完整认证。
