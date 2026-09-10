# PayPal 争议：观察、暂挂与受保护复查

2026-09-08。已实现下述内部流程；另新增[付款级人工积分核对](paypal-settlements.md)，但**自动资金归属核算及完整金额级验收仍未完成**，不是 PayPal Sandbox 或真实收款验收。普通文件工具、Google 登录边界和“不引入 infinite-canvas”不变。

## 实际用户路径

管理员登录 → 建筑 AI → 支付与对账 → PayPal 争议与积分暂挂。显示最近100条，待核对优先；仅有真实记录时显示金额、环境、更新时间及是否关联本站付款。重新读取须确认、有效管理员会话、同源、CSRF和15分钟内重新认证。

重新读取仅请求当前部署商户的已知争议，不收款、不接受索赔、不提交证据、不退款，不提供任意URL/脚本。每管理员每分钟6次，与已有PayPal并发租约及全局60次/分钟预算共享保护。环境或商户不匹配先失败，不查询另一商户。失败仍保留原状态；成功仅表示最新观察已保存，`stage=review`不是最终结算。

普通用户的付款争议提示与生图/结账阻断使用同一账本状态；已开始的生图保留原冻结结算规则。没有可验证付款收据的争议不创建账号、订单或积分。

## 数据与安全契约

- 验签后的 `CUSTOMER.DISPUTE.CREATED / UPDATED / RESOLVED` 再通过固定官方主机 `GET /v1/customer/disputes/{id}` 获取canonical对象。回调中的金额、状态、证据地址不可信，不直接使用。多交易争议不猜测分配，返回可重试异常供后续核对。
- 校验同环境/商户、案例ID、卖方交易ID、USD整数金额、原交易总额、更新时间及允许的状态。先争议后付款与先付款后争议均核对金额；不匹配时整个账本事务回滚。
- v6只新增 `ai_paypal_disputes`、索引、`ai_paypal_dispute_versions`及禁止修改/删除历史的触发器。每个canonical更新时间对应不可变白名单快照；同版本矛盾拒绝，旧观察保留历史但不覆盖新状态，真实较新复议允许重新开启。
- `open`按争议金额暂挂，整数毫积分向上舍入。多个案例与现金退款合计的临时风险上界不超过原交易积分；这可能暂时包含重叠，不宣称是净损失或最终应扣金额。
- `RESOLVED_SELLER_FAVOUR / CANCELED_BY_BUYER`在没有矛盾退款字段时释放争议暂挂，真实现金退款不撤销。买家胜诉、赔付、NONE、旧枚举、未知归属、已报告退款或OTHER保留`review`，不假装已核实卖方资金损失。
- 管理员复查使用canonical白名单内容的摘要作为独立幂等事件ID，不复用已ack回调ID；晚到GET只返回当前已接受的状态，不能让UI显示过时释放。
- 不保存消息、证据、姓名、邮箱、付款token或原始响应。只保留去敏作用域/编号/金额/状态/指纹及审计；响应限制256KiB，禁止读取证据附件。
- 新表与账本同持久库。最新备份/恢复支持schema1–7，拒绝未知8和缺少迁移表的快照。v7新增人工权益核对，旧v6/v5镜像不能直接接管新版财务状态，详见[备份恢复](backup-restore.md)。

官方契约核对：[争议详情](https://developer.paypal.com/api/customer-disputes/v1/disputes-get)、[PayPal OpenAPI](https://github.com/paypal/paypal-rest-api-specifications/blob/main/openapi/customer_disputes_v1.json)。`amount_refunded`并不单独证明卖方承担款项；本轮未把`RESOLVED_WITH_PAYOUT`或NONE当作无条件胜诉。请求权限必须在实际商户中验证。

## 可运行检查

```sh
pnpm --filter @hxsl/web exec vitest run lib/ai/paypal-disputes.test.ts
pnpm test:ai:disputes
pnpm test:backup
pnpm lint
pnpm typecheck
pnpm exec tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --allowImportingTsExtensions --allowJs --skipLibCheck --esModuleInterop --strict scripts/ai-disputes-check.mts scripts/ai-backup-check.mts scripts/ai-container-check.mts
```

浏览器脚本仅用新私有目录及127.0.0.1:13323，不读取生产用户文件；确认查询的上游为明确替身。真实Route Handler/私有HTTP适配器/SQLite合同另由单测覆盖，不能把两类证明合成“真实商户已验收”。错误图必须包含真实错误，键盘焦点断言必须通过；首次失败日志保留在 `evidence/paypal-disputes/before/`。精确运行结果见[validation.md](validation.md)。

## 仍需继续的完整范围

1. 最终败诉金额、商户/PayPal赔付、退款重叠与独立损失的关联核算。现在的risk上界不是最终财务实现，不能长期用review代替应完成的结算。
2. 后继案例关联、多交易分配、申诉资金反转、历史资金交易查询与受保护限定结算。
3. PayPal全部未支持事件、无已记录案例的异常主动恢复、未知checkout和三家支付完整对账。
4. 新v7容器重建、兼容镜像回退和跨支付/生图未知窗口灾难恢复；之前v5演练仅作为历史证据。
5. 实际PayPal权限/商户Sandbox、Google OAuth、建筑生图供应商、所有工具真实输出、多语言完整状态及性能验收。

没有执行正式部署、DNS/TLS变更或真实付款。维护记录和测试中的合成账号不是生产凭据。
