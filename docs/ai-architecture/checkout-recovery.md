# 未知结账的订单级核对

当前缺口：后台只可读取已记录的Stripe回调异常，创建响应丢失且没有回调时无法从本站订单恢复。保持建筑AI完整PRD、不引入infinite-canvas、不修改三渠道目标。

## 本轮边界

- Stripe适配器提取现有结账/发票事实读取，回调沿用同一金额、商户、环境和订单校验；旧测试防止分叉退化。
- 新订单级核对服务仅服务端GET商户资源；无外部ID时按创建时间分页搜索，最多300条，只接受双方订单标签一致且唯一的记录。未找到、扫描未完成或多条匹配保持未知，不推断付款失败。
- 已付款还需读取Charge累计退款及争议，订阅只根据真实初始发票的已结算付款发积分，不按激活状态发放。与账本同一短事务提交，无网络事务、无重复收款、无新schema。
- 后台路由逐请求授权、CSRF、近期认证；固定订单作用域、短时持久租约/限频、订单状态冲突检查、去敏结果与审计。界面明确区分已验款、订阅状态已读取、待付款和关闭；未知保持错误而非成功。
- 不接真实支付账号，不提供任意交易ID/URL查询器，不改变生产环境开关/密钥/数据。Creem、PayPal未知创建与全部续费/争议自动对账仍未完成；本轮不是三渠道完整验收。

## 官方契约

[Session读取](https://docs.stripe.com/api/checkout/sessions/retrieve)与[列表分页/创建时间筛选](https://docs.stripe.com/api/checkout/sessions/list)用于恢复关联，不是付款证据。[Charge](https://docs.stripe.com/api/charges/object)的实际捕获和累计退款、[争议列表](https://docs.stripe.com/api/disputes/list)用于查询当前风险。已结算积分仍须通过既有PaymentIntent/Invoice校验。资料核对日期2026-09-08，不代表已完成真实商户联调。

## 验证计划

真实SQLite＋Stripe SDK的显式固定HTTP替身：未知/过期窗口、分页、零/多匹配、跨商户、跨订单、模式/金额错误、付款/退款/争议、订阅首次发票、重试/重开、查询失败不变、并发与去敏；全部旧支付用例保留。后台真实HTTP验证授权/CSRF/近期认证，真实浏览器验证新按钮/提示/错误/焦点与桌面手机深浅截图。使用隔离数据库及应用进程，不触碰13080。

## 操作与生效

后台 → 建筑 AI → 支付与对账 → 订单记录 → “读取 Stripe 结账与付款”。当前部署必须有匹配原订单环境/商户的Stripe凭据；无需开启新购买，停止新购买后仍可核对旧订单。近期认证、确认和CSRF保护均由服务器执行。接口不接受商户Session ID、任意URL、秘密或金额输入。

服务只GET商户账户、创建时间范围内的Session列表/具体Session、原商品/付款及必要发票/Charge/争议。最多3页各100条、每管理员每分钟6次、同时2个核对；租约300秒并带唯一令牌。查询期间若有创建请求/回调更新订单，拒绝覆盖，提示刷新。租约过期后旧请求不能提交或清除后继租约。

已绑定Session直接读取；未绑定时从冻结创建窗口查找，不能把零匹配当作未付款。扫描未完/多匹配需商户人工核查，不自动选择。订阅本入口核对初始发票，**不补扫所有历史续费**；其他期仍走已验证发票回调。退款采用已捕获Charge的累计值、争议沿用现有暂挂规则；复杂拆分付款/多争议拒绝，不能据此宣称完整财务自动对账。

成功只表示已观测到可接受的状态。界面分别显示“已验款并按退款/争议核对”“只读取订阅状态”“待付款”“已关闭”。事务同时保存事实、绑定合法结账链接、更新积分与去敏审计；失败没有成功delivery记录，不存商户原文。用户账户读取同一SQLite账本。已发布新套餐不改旧订单积分。

无schema迁移或部署密钥改动；沿用schema7持久卷。部署前按[备份恢复说明](backup-restore.md)做完整一致快照，只能使用认识schema7金融状态的兼容版本回退；不能恢复旧余额抹去已核对付款。不修改DNS/TLS/生产服务。

## 可复跑命令

```bash
hxsl_checkout_check=$(mktemp -d /tmp/hxsl-checkout-check-XXXXXX)
NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build \
HXSL_ADMIN_DB_PATH="$hxsl_checkout_check/admin.sqlite" AI_ASSET_DIR="$hxsl_checkout_check/images" \
AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build
pnpm --filter @hxsl/web exec vitest run lib/ai/stripe-checkout-review.test.ts lib/ai/payments.test.ts
pnpm test:ai:checkout-review
```

浏览器脚本使用已构建standalone、私有SQLite、本地自签HTTPS代理13327及内部13328，先检查空闲，不停止未知进程。仅浏览器接受该测试证书，应用仍使用生产Secure Cookie。所有账号、付款与图片供应商均合成；成功浏览器POST明确调用真实service＋SDK HTTP替身，**不冒称真实Next成功POST到Stripe的全外部链路**；真正Route Handler成功另有单元合同测试，生产HTTP独立检查未登录、CSRF、跨来源、近期认证和无关字段。报告success必须伴随四组完成和所有断言通过。

## 最终证据（2026-09-08）

- [Web JSON](evidence/checkout-review/web-tests.json)：475通过、0失败/跳过；新增26项核对测试，旧Stripe24项及Creem/PayPal账本/争议测试均保留。完整`pnpm test`退出0：Web475、Registry4、Worker8、宿主共享处理12通过/5项缺引擎跳过，见workspace-tests.log。本轮没有重跑隔离引擎镜像，不把跳过算通过。
- `pnpm lint`、四包`pnpm typecheck`、新脚本独立严格tsc通过；content:check82工具×15语言、seo:check1230源URL通过。这不是全站新一轮原始HTML/输出验收。
- 三次隔离生产build退出0；build-before-lease.log、build-before-layout.log与最终build.log。最后包含事务/租约及手机分页修复；首页173kB、AI工作台116kB、账户112kB、定价110kB，后台136→137kB First Load JS。没有新Lighthouse或真实用户p75测量。
- [最终生产HTTPS浏览器报告](evidence/checkout-review/browser/report.json)：2026-09-08T13:09:59.516Z，4组全部完成、7张最终截图均实际查看，7次组件范围axe、点击尺寸/分页同排/焦点断言通过；页面异常/站外浏览器请求为空。前台实际显示发放10积分、追回5积分，与合成SQLite净5000毫积分一致；购买返回不发积分，丢失核对响应后重试仍只有1条收据。
- 失败证据：[初版9项测试失败](evidence/checkout-review/before-tests.json)、HTTP生产Cookie失败before-https、首次HTTPS通过但分页不齐的7图before-layout、layout-red.log及layout-red-report.json。位置断言真实检出unknown-390分页换行，最终修复不删除断言。
- 最终查看桌面1440、手机390/320、深浅主题、无回调的未知订单、真实近期认证错误、未找到、恢复结果和用户账户。分页修复后同排；错误聚焦可见，恢复后焦点返回按钮，长ID换行，无本截图区域遮挡/横向溢出。不声称全后台缩放、所有语言或全部支付状态验收。
- 自有应用和HTTPS代理已退出，13327/13328无监听；未发布13080，未修改生产数据、DNS/TLS或使用真实商户/Google/图像凭据。

## Bug Analysis: 核对事务、租约与移动分页

### 1. Root Cause Category

B/D/E：跨层事务所有权没有显式区分。初版外层事务调用自带BEGIN的记账/绑定函数；9个成功路径失败，旧Stripe24项保持通过。新完整流程测试才揭示组合错误，而不是供应商真实错误。

### 2. Why Fixes Failed

首次修复后剩一条失败来自测试漏列统一响应的`ok:true`，按真实apiOk契约补齐精确断言。脚本最初把生产站放HTTP，Secure Cookie正确拒绝发送；随后改本地HTTPS，没有弱化应用。SDK CJS/ESM类型入口不一致只修改检查脚本，保留严格tsc。截图显示390/320分页换行，新增位置断言在旧构建真实失败。

### 3. Prevention Mechanisms

| 优先级 | 机制 | 实施 |
| --- | --- | --- |
| P0 | 单一事务所有者 | store内部私有记账/绑定函数，原公开写函数保留事务包装；新commit统一状态检查、写账与审计，未修改全局transaction实现 |
| P0 | 租约隔离 | 随机令牌、提交检查有效期、finally只删自身令牌；真实过期/后继租约回归 |
| P0 | 不重复或错误发积分 | 付款/发票/Charge/争议关联校验、冻结价格、实际退款后净额、重试/回调去重、危险链接整体回滚 |
| P1 | 真实生产保护 | 本地HTTPS、自签证书仅检查端接受；真实Secure/CSRF/fresh/白名单断言 |
| P1 | 手机排版 | 仅订单分页三列，不改变其他后台操作栏；两按钮同一行及点击尺寸断言 |

### 4. Systematic Expansion

共享记账包装影响Stripe/Creem/PayPal，因此运行全Web而非只测新函数。真实商户未知创建、历史续费、多交易争议、请求响应大小预算、渠道轮换与全链路外部验证仍需继续；没有把本次有限GET核对当作完整对账系统。

### 5. Knowledge Capture

契约与失败证据保存在本文件和evidence/checkout-review；仓库没有Git/Trellis目录，不虚构模板同步、提交或归档。按trellis-check/trellis-break-loop记录原因和可执行断言，而非仅在对话里报通过。
