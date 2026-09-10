# Bug Analysis: 后台争议错误不可见与刷新后焦点丢失

## 1. Root Cause Category

- D（测试覆盖缺口）及E（隐含假设）：旧支付后台将错误渲染在整个操作区上方，假定设置role=alert便足够。重新查询按钮位于下方；屏幕阅读器播报不代表错误在视口内。刷新设置data=null再加载，原按钮DOM被卸载，键盘焦点会丢失。
- 截图工具另有定位缺陷：错误图只滚动整个大容器，没有断言错误边界框，smooth scroll途中就采集。因此一张命名error的图中实际没有错误。不是仅凭图片判断服务端没有返回428；HTTP与DOM已证明428及真实提示存在。

## 2. Why Fixes Failed

1. 首次E2E使用全页getByRole(alert)，匹配Next路由播报器和真实后台错误。改成操作区内匹配，未删掉错误断言。
2. 初次8图/4组通过仍不足以证明错误可见。实际图片审查发现缺失，保留问题图并新增toBeFocused断言。旧UI准确退出1，Received inactive，日志`evidence/paypal-disputes/before/error-focus-red.log`。

## 3. Prevention Mechanisms

| Priority | Mechanism | Specific Action | Status |
| --- | --- | --- | --- |
| P0 | UI | 失败时聚焦可程序聚焦的错误提示；不把焦点交给页面播报器 | 已实施，最终实际焦点/截图通过 |
| P0 | UI | 成功重新加载案例列表后，根据案例环境/ID恢复原操作按钮焦点 | 已实施，payout及win刷新后焦点断言通过 |
| P0 | E2E | 实测错误与成功后的activeElement，错误图包含提示边界框 | 已实施 |
| P1 | Screenshot | 明确anchor，瞬时定位，禁截图中的过渡动画；实际看图 | 已实施 |
| P1 | Types | 新旧维护脚本一起严格检查，包含JS模块推断和SQLite行类型 | 已执行，不升级依赖 |

## 4. Systematic Expansion

- 类似问题可能存在其他长运营表单中，尚不宣称全站错误焦点已检查。本次公共支付错误区域覆盖Stripe查询错误与PayPal错误，不改其他工具交互。
- 将“响应返回错误”“DOM有alert”“用户可见并可继续操作”“截图真实记录错误”分开验证。一次green不能替代人工截图审查。
- 财务状态与金额也分层：canonical观察、临时风险、已验证现金退款和最终归属不能混成一个布尔disputed。

## 5. Knowledge Capture

- 本文件和paypal-disputes.md记录行为、复现与测试规则；新用例纳入verify。
- 仓库没有Git或Trellis目录，未虚构spec同步、模板生成或提交。沿用现有docs/ai-architecture文档，保留失败证据。
