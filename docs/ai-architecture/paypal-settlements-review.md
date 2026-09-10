# 核对表单与备份回归复盘

2026-09-08。沿用 trellis-check / trellis-break-loop 检查；仓库无 Git/Trellis 元数据，记录在现有任务文档，不虚构提交或模板同步。

## 1. 根因类别

- C（变更传递遗漏）：服务端已记录有效人工核对，争议列表仍仅按上游阶段显示“待财务核对”。现在从完整商户作用域读取有效/失效审批，再显示人工确认状态；不会标作自动验款。
- D（覆盖缺口）：按钮有44px断言，但同意标签与复选框没被覆盖。真实1440截图里确认框约13px，标签单行高度不足44px；检查发现相邻消费者专用的`.ai-consent`布局没有覆盖新后台表单。
- E（隐式假设）：错误`.focus()`受全局smooth滚动影响，已聚焦不等于已在视口；独立重跑保留了错误仍在视口外的失败与截图。备份损坏夹具则隐含只有一名用户，新增第二名用户后对所有钱包改相同主键触发UNIQUE，未到预期外键断言。

## 2. 原检查为何不足

首轮浏览器6组/14图通过不能证明全部触达尺寸。逐张看图后新增标签/checkbox尺寸断言，先在旧UI准确失败：`settlement-ready-1440-light consent touch target`。更早一次重跑先暴露smooth滚动问题；保留两个不同失败，不把错误替换成预期红色。

备份不应把UNIQUE错误当作“已证明外键损坏能拒绝”；改为准确定位一个测试账户制造孤儿钱包，保留原来的 `DATABASE_FOREIGN_KEYS_FAILED` 断言。

容器首轮另暴露 Node SQLite 行使用 null prototype，而 HTTP JSON 钱包是普通对象。数值4000/0一致仍会被 strict deepEqual 原型比较拒绝；改为只展开行原型，再严格比较全部余额字段，同时保留账本一致性和HTTP状态断言。失败保存在`evidence/container/536d5a5c/failure.json`，该次不能计为容器验收通过；其实际构建的A镜像可经标签/ID验证后用于后续兼容更新演练。

## 3. 防止重复

| 优先级 | 措施 | 状态 |
| --- | --- | --- |
| P0 | 列表用精确商户作用域读状态，输出剥离私有字段；两个商户同案例编号的单测 | 已实施 |
| P0 | 错误/结果focus preventScroll，加即时滚动；测试同时断言焦点、错误实际屏幕边界 | 已实施 |
| P1 | 后台本地化checkbox18px、同意标签≥44px、文字独立flex项；桌面/320/390尺寸和axe检查 | 已实施 |
| P1 | 金额越界提供实际允许范围和两位小数要求，aria-invalid及aria-describedby关联；不能只禁用按钮 | 已实施 |
| P0 | 备份真实审批和第二账户，校验当前指纹、精确余额、不可变触发器；损坏夹具定位明确目标 | 已实施 |

## 4. 扩展检查与边界

同意框只改新后台范围，没有全局改变已可靠工作台、定价页和PayPal返回页样式。共享支付页另跑回归。未使用减少功能、删断言或禁用语言解决问题。这里只处理局部组件，不声称完成全部15语言/200%或400%缩放/WCAG人工审查。

前后证据在 `evidence/paypal-disputes/`：`settlement-checkbox-before.png`、`settlement-amount-before.png`、`settlement-before-report.json`、`smooth-error-before.png`、`smooth-error-red.log`、`settlement-checkbox-red.log`；最终14图由 `report.json` 列出。320px表单高于一个视口时正常纵向滚动，不把截图底部之外的内容说成固定栏遮挡；提交/重试实际由浏览器滚动到按钮并完成。

## 5. 知识落地

新组件接入时检查其真实选择器是否生效，不因同类组件使用过类名而假设继承正确；可触达尺寸包含标签而非仅按钮。状态层新增维度必须贯穿数据库→服务→API→列表/结果→账户。资金类持久化演练必须有真实非空记录，不能用schema存在替代状态保留。

操作及迁移契约已写入 [paypal-settlements.md](paypal-settlements.md) 和 [backup-restore.md](backup-restore.md)，精确测试结果见 [validation.md](validation.md)。自动资金归属、后继多交易案例、真实商户、全部原工具输出与完整性能仍需继续，不是本阶段已完成。
