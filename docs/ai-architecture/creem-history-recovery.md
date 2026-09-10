# Creem 已入账历史付款的回收

状态：本组代码与隔离验证完成（2026-09-08），建筑AI完整Goal继续。无infinite-canvas、无生产部署或真实商户操作。

## 已核验问题与边界

`creemPaymentEvent`的退款/争议调用`subscription(..., "state")`，该路径要求当前商品、数量、折扣、收款方式仍等于旧套餐。正常已入账之后切换订阅商业条件，会阻断原交易权益回收。不能通过放开新授信来修复。

变更位于Creem适配器与其测试：按完整商户作用域查询已有不可变付款收据；仅该交易已有收据时使用历史回收用途。放宽当前商业条件必须有本地同订单/同商户/同客户订阅绑定；仍核对私有交易和订阅身份、原冻结金额/币种/周期。历史回收只生成退款/争议事实，不重新发放积分。无收据时保留原严格分支，新`subscription.paid`及取消不改变原契约。

退款先于付款通知时，原路径可以有收据而没有订阅绑定。这类历史收据继续使用严格的当前产品/数量/折扣/收款方式检查，而不是直接拒绝后续退款，也不凭空创建订阅绑定。已知收据的关联信息丢失必须报错、保留回调重试，不能当无关事件记为已成功处理。当前订阅状态和日期仍需符合已支持schema；不承诺接受任意未知生命周期。

不新增数据库schema、账户功能、任意交易查询器、真实退款操作或对外API。Creem创建响应丢失且未保存原创建证明、争议关闭结论、未知checkout人工对账及真实商户沙箱仍是单独缺口，不能将本次有限回收冒称全面解决。

## 外部契约核对

2026-09-08读取官方[交易查询](https://docs.creem.io/api-reference/endpoint/get-transaction)、[结账查询](https://docs.creem.io/api-reference/endpoint/get-checkout)和[创建结账](https://docs.creem.io/api-reference/endpoint/create-checkout)。查询返回真实交易/关联，不以当前商品目录当历史交易价格；Checkout查询要求具体checkout_id，没有据此假造按request_id检索的接口。本文不是实际Creem商户联调证明。

## 实际验证

- [原失败报告](evidence/creem-history/before-tests.json)：旧34项通过，新增5项因当前商业条件校验失败。
- [身份保护红色报告](evidence/creem-history/guards-before.json)：51通过、1失败，确证缺metadata仍返回成功；[乱序红色报告](evidence/creem-history/ordering-before.json)：52通过、2失败，追加确证无订阅绑定时重复退款被拒。
- [最终Web报告](evidence/creem-history/web-tests.json)：496通过、0失败/跳过，Creem55项（原34＋新增21）。跨订单/客户/商户环境/交易客户/金额/币种/周期拒绝；无收据不放宽；完整退款保留2000冻结、记录9000待追回，取消排队后待追回降至7000而非可用积分；重启、HMAC真实Route Handler失败→重试→去重、日志去敏均验证。
- `workspace-tests-final.log`：根`pnpm test`退出0，Web496、Registry4、Worker8、共享12通过，宿主5项缺引擎沿用原跳过条件。本轮未重跑隔离引擎，不能把这些跳过计为通过。
- lint、四包typecheck、修改的standalone脚本严格类型检查均退出0；content82工具×15语言、SEO1230工具URL源检查退出0。这不是全站HTTP或全82真实文件输出验收。
- `build.log`：隔离生产构建退出0；首页173kB、AI工作台116kB、账户112kB、定价110kB、后台137kB First Load JS，无新增前台包体变化。不是Lighthouse或真实用户p75数据。
- [本轮standalone生产HTTPS报告](evidence/creem-history/production/standalone-report.json)：13:27:04.449Z，10组通过，含内部18项smoke、真实管理授权/Secure Cookie、发布初始HTML→进程重启→回滚、运营导入草稿/重启/发布、无秘密打包及页面hydration。不是Docker重建或真实Creem回调网络联调。13317/13320自有进程已结束。
- 初次新跨订单夹具错误触发“已有订阅不能重复购买”，修正为另一合成用户的真实订单；对象类型显式使用原CreemObject，未关闭类型检查。失败保存在`fixture-before.json`、`lint-before.log`。根目录脚本类型命令缺Node类型路径，最终显式使用已有web Node类型，不升级依赖；初次输出保存在`script-typecheck-before.log`。

没有UI变更，因此本轮不新增截图或拿旧截图充数；浏览器生产回归不等同于全站视觉/无障碍验收。退款网络数据来自明确的HTTP替身，非真实收款或商户退款。

## 可复跑命令

```bash
pnpm --filter @hxsl/web exec vitest run lib/ai/creem-payments.test.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm seo:check
pnpm exec tsc --noEmit --strict --skipLibCheck --module ESNext --moduleResolution Bundler --target ES2022 --esModuleInterop --allowImportingTsExtensions --typeRoots apps/web/node_modules/@types --types node scripts/ai-standalone-check.mts
hxsl_creem_build=$(mktemp -d /tmp/hxsl-creem-build-XXXXXX)
NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build HXSL_ADMIN_DB_PATH="$hxsl_creem_build/admin.sqlite" AI_ASSET_DIR="$hxsl_creem_build/images" AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build
AI_STANDALONE_EVIDENCE_DIR=docs/ai-architecture/evidence/creem-history/production pnpm test:ai:standalone
```

standalone增加可选证据目录，不覆盖前阶段production报告。运行前确认13317/13320空闲，不停止未知进程。无数据库迁移；继续使用schema7。正式更新前按[备份恢复](backup-restore.md)做一致快照，回退只能使用理解schema7且不会抹去已入账退款的兼容版本，不能拿旧数据库余额替换当前账本。本轮未操作真实部署、卷或密钥。

## Bug Analysis: 历史回收与当前授信条件混用

### 1. Root Cause Category

- E（隐含假设）：假定回收历史付款时订阅商业条件仍等于原购买。
- C/D（传播与覆盖缺口）：新增历史用途后，忽略原有“无关联返回空事实”和“退款先到尚未绑定订阅”两条合法/异常分支。

### 2. Why Fixes Failed

1. 仅跳过当前商业条件能修复5个初始失败，但没有让已知付款关联缺失明确报错，导致空事实被持久去重。
2. 所有已有收据都强制订阅绑定，会拒绝原来可处理的连续退款。新增真实账本顺序测试后，改为无绑定保留原严格校验，不放宽授信或制造绑定。

### 3. Prevention Mechanisms

| 优先级 | 机制 | 状态 |
| --- | --- | --- |
| P0 | 已知收据完整scope/order/amount/currency/period锚定，关联缺失拒绝 | 已实现＋反向测试 |
| P0 | 放宽商业条件仅针对已绑定旧付款，不发新receipt | 已实现＋变更/未知交易测试 |
| P0 | 退款先到、连续退款、保留冻结、释放抵债、重启重试 | 真实SQLite与handler测试通过 |
| P1 | 错误不能先标记成功、日志不得存原始报文/秘密 | 去重/去敏断言通过 |

### 4. Systematic Expansion

三渠道都需要区分当前销售校验、原付款身份与后续恢复；不能把取消、退款、授信视为同一用途。Creem未知创建证明/争议终态、PayPal多交易资金归属以及真实商户验收仍是独立未完成项。

### 5. Knowledge Capture

本契约、失败证据、操作说明同步至creem.md、implement.md、validation.md和acceptance.md。按trellis-check/trellis-break-loop检查并记录；本仓库没有Git/Trellis目录，不虚构提交、模板同步或spec归档。
