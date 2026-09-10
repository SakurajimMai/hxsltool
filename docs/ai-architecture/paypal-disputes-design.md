# PayPal 争议：金额级核算前置审查

2026-09-08。本文保留金额级最终核算的设计要求。观察/暂挂/胜诉释放/后台复查已进入实现，见[paypal-disputes.md](paypal-disputes.md)；最终败诉、赔付与退款重叠核算仍未完成，PayPal live 新购买继续关闭。

## 已核验的外部契约

- 官方查询为 `GET /v1/customer/disputes/{id}`，OAuth schema 列出 read-seller 等读权限；需要实际商户授权验证，不能用“已填 App 密钥”替代权限验收。
- 响应含 `dispute_id`、`update_time`、`disputed_transactions[].seller_transaction_id`、对应 `seller.merchant_id`、`gross_amount`、`dispute_amount` 和 `dispute_outcome`。
- `dispute_amount` 可以小于交易总额。`amount_refunded` 可能由商户或 PayPal 支付，不等于必然从商户收款中退回。`RESOLVED_WITH_PAYOUT` 不能直接归为本站胜诉或败诉。
- NONE 表示旧争议在同交易新争议产生后无决定关闭；不能因此自动恢复所有权益。

依据：[Dispute details](https://developer.paypal.com/api/customer-disputes/v1/disputes-get)、[官方 OpenAPI schema](https://github.com/paypal/paypal-rest-api-specifications/blob/main/openapi/customer_disputes_v1.json)。本次通过官方页面及原始 JSON 交叉核对，未调用真实商户 API。

## 实施前的明确差距（历史基线）

当前 `PaymentFact.dispute` 只记录 open/won/lost，不带争议金额；`refreshRecovery` 对 open/lost 都按整笔授信计算。它可表示风险期间整笔暂挂，但不能精确表示最终只退回部分款项的情形。

因此不得直接把所有 PayPal 买家胜诉映射为现有 lost 并宣称金额正确；不得把 payout/NONE 当成无条件 won；也不能将官方 GET 200 当成自动恢复成功。

## 完整实现契约（部分已实施，不缩减验收范围）

1. 区分未决风险暂停和最终金额回收；给持久争议/结算事实增加必要的金额与核对状态，迁移只增列/表，原账本和历史证据保留。
2. 只在当前环境和商户的私有查询后使用卖方交易 ID，关联本站冻结订单/已核验收据。争议先于付款到达时，后续入账必须同事务应用已核实的暂停/回收，不能短暂发出可消费的争议积分。
3. 部分退款、争议金额、商户损失和 PayPal 赔付分别核对；现金退款与争议回收可能重叠，不能盲目相加，也不能仅取最大值后声称已覆盖互不重叠的损失。
4. 已核实的卖家胜诉或买家撤回释放争议暂停，但已有真实退款不撤销。模糊结案进入可审计待核对状态，不伪造 resolved 或退款。
5. 前后顺序使用 canonical 对象的更新时间；验证旧回调、争议复议、新替代争议和晚到回复。不能用旧的“任何终态后永不 reopen”规则拒绝真实复议。
6. 后台只允许受保护的只读核对/限定结算；不增加代商户接受索赔、发送钱款、提交证据或任意 URL 操作。没有授权不能发起真实退款。
7. 回调原文、证据、消息、买家/商户邮件不持久化到本站日志或运营导出；仅存白名单作用域、案例/交易 ID、金额和核对结果。保留响应大小和并发预算，不加载证据附件。

## 必须补的证明

- 全额/部分争议、先争议后付款、已消费与冻结积分、部分退款重叠/独立、胜诉恢复、赔付归属、NONE 后继争议、复议重开、重复/乱序/跨商户事件。
- 实际 API/SQLite 合同、管理员权限/重认证/CSRF/幂等重试与 UI 状态，以及有真实商户配置后的 Sandbox 联调。
- 不以文档、测试替身或关闭 live 开关代替最终功能完成。
