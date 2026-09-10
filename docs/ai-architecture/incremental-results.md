# AI 多图逐项保存与真实 Worker 中断恢复

2026-09-08。继续完整建筑 AI Goal，不引入 infinite-canvas。此阶段处理现有 Images 协议返回后的本机结果交付，不是新供应商协议、实时流式生图或GPU推理。

## 改动与边界

原 `invokeImageProvider` 会先获取整个批次的所有图片并累积成 Buffer 数组，再把请求ID和图片交给 Worker 保存。第二个CDN请求挂起时，第一份合法图片虽然已经返回，却没有文件或数据库记录；这时进程退出，原有恢复逻辑没有可结算的成果。

现在采用有背压的异步迭代交接：

1. 验证供应商响应 envelope 后返回请求ID，Worker立即记录，不等待全部CDN请求。
2. 每次只获取/解码交接一份图片，并保留原始位置。
3. Worker等待完整校验、私有文件fsync和资产记录提交后，才向迭代器请求下一份。
4. 格式损坏仍是单项失败，不清空已验证的其他图片；本机持久化异常向上传播，停止读取后续URL。
5. 已保存结果在现有授权视图中提前可见。整批未结算时，前台删除按钮与后端规则一致地禁用；结算后恢复正常删除。使用既有15语言状态文案作为禁用原因，没有新增英语占位。
6. 当前任务的自动轮询同时更新历史列表中的对应行，避免主面板“保存中”而该行仍“等待开始”。不重排其他历史或干扰分页。

不改变：schema7、报价快照/实际输出计费、临时文件保留期、秘密加密、CDN白名单/不转发凭据、网络超时和上一阶段2个解码槽/4等待上限。不会重发供应商POST。原始JSON响应仍是有64MB上限的完整响应，不虚称HTTP流式处理或给出未实测的内存节省数字。

尚未解决：未获取或未落盘的后续图片不能在重启后自动重新下载；没有新增持久化供应商响应/带授权URL的暂存层。CDN失败和存储故障按现有partial/unknown处理。此次真实进程kill验证，不是断电、完整供应商灾难恢复或实际商户联调。

## Bug Analysis: 整批返回阻挡已完成结果持久化

### 1. Root Cause Category

B（适配器与Worker交接契约）＋D（缺少跨网络请求中断测试）。既有恢复依据真实 `ai_assets` 记录，而适配器在全部下载完成前不产生任何记录，形成不必要的丢失窗口。

### 2. Why Fixes Failed

- 初始子进程测试夹具缺闭合语句，随后遇到项目混合模块根的ESM加载差异；分别保留before/before-fixture/before-valid-fixture诊断。修正为现有脚本使用的createRequire加载方式后才形成有效baseline，不把夹具失败当产品证据。
- baseline.json：原14通过、新2失败，分别为下一CDN读取时outputs=0/provider=null，以及真实被kill后provider ID丢失。新断言未删减。
- 逐项保存后，真实浏览器发现前台未结算图片“删除”仍启用。后端一直拒绝；本轮增加前台禁用和调用守卫，不放宽后端保护。browser-before.log和截图保留该失败。
- 第一版浏览器9组通过后，实际截图又发现历史行状态滞后；browser-before-history保留此图，补当前轮询的历史同步和断言。严格脚本检查发现旧Sharp类型写作不存在的.default，已修正类型声明，未改实际图像库行为。

### 3. Prevention Mechanisms

| 优先级 | 不变量 | 验证 |
| --- | --- | --- |
| P0 | 第二次CDN读取前，第一份文件和请求ID已持久化，积分仍冻结 | 真实SQLite资产计数/请求ID/1000冻结断言 |
| P0 | 进程中断不抹掉已fsync并提交的结果，不重发生成 | 自建测试子进程确认IPC下载边界后SIGKILL；重开DB＋过期执行窗口核对，保留256×256 PNG，扣500/释放500、可用9500/冻结0 |
| P0 | 消费者存储失败不能被适配器吞成格式错误 | 本机无效存储目录，unknown保留冻结，供应商仅POST一次，后续CDN不请求 |
| P1 | 单项损坏不改变其他输出的位置和计费 | 首图坏/第二图好保留position=1，CDN后续失败保留首图、partial只收500 |
| P1 | 不泄漏带签名的CDN地址，不转发API密钥 | 用户视图/审计不含授权URL，GET没有secret |
| P1 | 未结算结果的动作与服务器保护一致 | 浏览器保存中可预览/下载，但删除禁用；partial后启用并完成真实删除 |

### 4. Systematic Expansion

异步迭代必须把“取下一项”放在持久化完成之后，不能用Promise.all重新恢复整批缓冲。迭代器停止后不得偷偷预取其他URL。下一步仍需持久化响应/结果恢复策略、未知结算外部核对和真实供应商验证。

### 5. Knowledge Capture

使用trellis-check核验跨层数据与错误传播，trellis-break-loop把交接契约保存于本文、进度和验收表。工作区无Git/Trellis配置，不伪造提交或模板同步。

## 测试与证据

根目录：`evidence/incremental-results/`。

- baseline.json：14通过、2真实失败；早期夹具诊断另行保留。
- focused.json：修复后16通过；再增3项存储/CDN/位置测试，完整Web报告561通过、零失败/跳过，原556项全部保留。
- 根测试Registry5、Worker8、共享12通过；宿主5项缺引擎跳过，不算通过。lint/typecheck、严格fixture类型检查、content82×15基本键和SEO1230工具URL源码检查已执行；这不是全HTML现场爬取。
- browser-before：旧删除按钮启用的真实失败与截图；browser-before-history：第一版9组通过但历史行仍滞后的截图。最终browser-after/report.json（14:25:10.351Z）9组通过，11截图全部实际查看，新增保存中2次结果区＋既有3次页面axe通过，零页面异常。仅覆盖英文/简中主流程，不扩称全部15语言状态验证。
- 11张审查包括1440浅色/320深色保存中完整结果区、桌面比较弹窗、1440/390/320工作台与结果视口、简中手机错误、手机账户。图片是明确合成的单色PNG；保存中删除禁用、历史行与任务状态一致，长状态在320px换行，无产品控件溢出。截图有Next开发指示器，非正式站UI；账户和部分结果截图是视口范围，不宣称已人工审查其下方全部内容。
- 三次隔离生产build均退出0，日志build-before-ui/build-before-history/build.log。AI工作台页面本身7.41→7.46kB，First Load JS仍116kB；首页173/普通工具411/定价110/后台137kB。没有新Lighthouse/p75实测。更正：当时lint/四包typecheck日志实际因generation-worker.test.ts的TS18047失败，不能认定通过；workspace与fixture独立类型检查另有日志。已在[上传生命周期阶段](upload-lifecycle.md)修复并重新通过，原失败日志保留。
- production/standalone-report.json（14:27:00.432Z）：10组真实HTTPS生产模式回归通过，包括授权、草稿/发布原始HTML、重启/回滚、档案导入、安全Cookie、未配置支付拒绝与产物排除秘密。与上述开发模式生图夹具流程分开，不拼接成真实供应商验收。
- 所有本轮命令已到终态，最后13317/13318/13320均无监听；中断测试只终止自己创建的Worker。无本轮遗留后台终端、容器或公网改动。

## 可复跑

```bash
pnpm --filter @hxsl/web exec vitest run lib/ai/generation-worker.test.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm exec tsc --noEmit --strict --skipLibCheck --module ESNext --moduleResolution Bundler --target ES2022 --esModuleInterop --allowImportingTsExtensions --typeRoots apps/web/node_modules/@types --types node scripts/ai-workspace-check.mts apps/web/lib/ai/fixtures/output-interruption.mts
AI_WORKSPACE_EVIDENCE_DIR=docs/ai-architecture/evidence/incremental-results/browser-after pnpm test:ai:workspace
hxsl_incremental_build=$(mktemp -d /tmp/hxsl-incremental-build-XXXXXX)
NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build \
HXSL_ADMIN_DB_PATH="$hxsl_incremental_build/admin.sqlite" \
AI_ASSET_DIR="$hxsl_incremental_build/images" AI_DISPATCHER_ENABLED=false \
AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build
AI_STANDALONE_EVIDENCE_DIR=docs/ai-architecture/evidence/incremental-results/production pnpm test:ai:standalone
```

workspace脚本是127.0.0.1:13318的隔离开发模式浏览器闭环，真实内部HTTP/SQLite/PNG，只有供应商和登录会话为显式夹具。standalone另验证生产构建与HTTPS会话/发布/重启；不能把前者写成生产供应商认证。真实进程中断仅针对本测试启动、已确认存活的子进程，不停止其他项目。

未执行正式部署/DNS/TLS、真实Google、生图、商户扣款、容器重建、Lighthouse/p75。原82工具继续保留，45个尚待浏览器输出的身份没有因本组AI测试被标成完成。
