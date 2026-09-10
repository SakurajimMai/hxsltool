# 参数重算与多输入结果有效性

2026-09-08。本阶段修复原有网页工具共享工作区，不引入 infinite-canvas，不修改 AI 支付、供应商、数据库 schema 或公网部署。整个 Goal 仍未完成。

## 改动边界与用户路径

- 修改参数、恢复默认值或应用预设后，保留旧输出供查看，但明确标记失效，不再提供该旧文件的单项下载、ZIP 或继续处理入口。点击处理会真正重新处理原始输入。
- 一次处理捕获参数、处理模式和参数版本；处理中可以编辑下一次参数，当前批次所有文件仍用同一快照。晚到结果不会清除新参数的失效状态。
- PDF 合并及多图片转 PDF 是多输入一输出任务。增添有效输入、移除贡献文件或移除输出所有者都会使整组重新等待处理；原始输入仍保留。仅增删预检失败项不损坏有效输出。
- 处理中禁止移除文件，合并处理中还禁止新增输入；这不是取消功能。同步运行锁防止连续点击创建重复处理。
- 损坏图片等引擎失败可重试，成功同批结果不被清空；参数变化可重新尝试之前的引擎失败。空文件/格式/大小预检失败不会因修改参数被错误放行，应移除并选择合格输入。
- 初始参数与重置共用有效工具 schema 的默认值，不再用固定 quality 等字段盖过后台发布默认值。仅在会话内保存整数版本，不对含密码/签名的参数做序列化版本键。

主要文件：`ToolWorkspace.tsx`、`workspace-state.ts` 与八项单元测试、`globals.css`、`scripts/local-recompute-check.mts`。工具 ID、URL、Registry/引擎能力不变，无新增依赖。

## Bug Analysis: 提示变化但输出未更新

### 1. Root Cause Category

C（传播遗漏）＋D（覆盖缺口）＋E（隐含假设）。原状态只用一个 optionsDirty 布尔值显示提醒；处理只选 waiting，下载只判断 output 存在，单个完成还会把全局 dirty 清零。合并错误地把“本次待处理行”当成完整输入集。

### 2. Why Fixes Failed

旧提醒没有约束处理选择、下载和衔接。此次第一版功能回归通过，但实际截图发现失效提示继承约 10px 辅助字号且仍是成功边框；新增最小字号断言在旧构建五处失败，未删除断言。一次 TypeScript 检查发现布尔辅助函数不窄化可选 output，已在 JSX 保留显式存在性检查，没有绕过类型检查。

### 3. Prevention Mechanisms

| 优先级 | 契约 | 实施 |
| --- | --- | --- |
| P0 | 只有 ready＋output＋resultRevision 等于当前版本才能交付 | 单项/ZIP/衔接共用 currentOutput |
| P0 | 每次运行只读取一次参数/模式，结果携带运行版本 | 真实 Chromium 延迟解码、连续双击和晚到结果断言 |
| P0 | 合并结果依赖全体有效输入，不仅新行 | 增加/移除所有者/参数修改/损坏项移除的独立 PDF 页数检查 |
| P1 | 预检失败与引擎失败不同 | 预检失败不自动重试；同批成功保留 |
| P1 | 失效信息可读且不只靠颜色 | 15 语言实际页面；截图最小14px断言与工作区 axe |

### 4. Systematic Expansion

已覆盖简单本地工具和合并输入依赖，不代表完整取消/过期状态机。现有服务器传输取消、多任务取消、排队实际停止、全部预览参数有效性和错误文案完整翻译仍需进一步验收。当前“输出摘要”本身尚不展示全部尺寸/页数，这次用独立解析确认文件，不伪称前台字段已补齐。

### 5. Knowledge Capture

契约和根因保存在本文及同目录进度/验收表。工作区无 `.git` 和 `.trellis`，不虚构模板同步或提交。后续队列变动需同时重跑参数重算、PDF/批量、图片、SVG/图标四组浏览器测试，不能只跑状态单元测试。

## 验证与证据

证据根目录 `evidence/local-recompute/`。

- `before/report.json`：原生产构建两处真实失败，参数变更和新增合并输入后旧下载仍存在；真实初始 PNG/PDF 在 outputs，失败截图保留。
- `before-visual/report.json`：第一版19组通过，截图发现小字/成功边框问题。
- `visual-red/report.json`：14通过、5处最小字号断言失败，证明新断言能检出问题。
- 最终 `after/report.json`（14:06:14.267Z）：20/20通过，无上传/站外请求/页面异常。真实解码尺寸44×26→22×13→重置88×52→预设44×26；处理期间编辑仍按旧快照生成两份44×26并标记失效，重算才产生22×13。PDF两页→新增三页→移除输出所有者恢复两页→改横向两页；损坏成员全组重试仍失败，移除后两页成功，处理中拖入新文件被拒绝。
- 最终7张截图全部实际查看：320深色失效、1440浅色重算、390浅色合并、390深色晚到结果、320浅色失败、390日语深色、320泰语深色。失效提示已由小字/成功边框改为14px文字和警告边框，失败仍保留独立错误框；未见横向溢出或操作覆盖。7次工作区axe与最小字号断言通过，不代表全站WCAG/缩放验收。
- 本次 CSS 调整前的共享回归：PDF9组、SVG16组、图片20入口退出0；报告分别位于 pdf-regression、svg-regression、image-regression。图片包含2个明确 AVIF 编码边界，不能写成20个都生成成功。
- 最终 CSS 构建重跑：pdf-final（14:06:25.148Z）9组、svg-final（14:06:34.434Z）16组、image-final（14:07:12.736Z）20入口全部脚本退出0。图片18个独立解码输出＋2个能力边界；三组无上传/站外请求/页面错误，22次工作区axe通过。22张共享回归截图已采集，未逐张重新人工审查，不混入上面的7张实际审查范围。
- Web548项零失败/跳过；Registry5、Worker8、共享12通过，宿主共享5缺引擎跳过。lint、四包typecheck、脚本严格类型、82×15基础内容和1230工具URL源码SEO检查通过；`checks/` 保留日志。SEO源检查不是本轮全部HTML现场爬取。
- 两次隔离生产构建均退出0（build-before-visual.log、build.log）。最后普通工具页First Load JS约410→411kB，首页173/AI工作台116/定价110/后台137kB保持；未运行新Lighthouse/p75。
- 全部本轮命令已到终态；最终 ss 检查13325/13326/13329/13330均无监听，未留下本轮后台终端任务。完整82行矩阵保留，45行仍明确待浏览器输出；本组没有新增已覆盖工具身份。

## 可复跑命令与隔离方式

先构建私有产物（保留现有 .next、数据和部署配置）：

```bash
hxsl_recompute_build=$(mktemp -d /tmp/hxsl-recompute-build-XXXXXX)
NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build \
HXSL_ADMIN_DB_PATH="$hxsl_recompute_build/admin.sqlite" \
AI_ASSET_DIR="$hxsl_recompute_build/images" AI_DISPATCHER_ENABLED=false \
AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build
pnpm test:local:recompute
HXSL_PDF_EVIDENCE_DIR=docs/ai-architecture/evidence/local-recompute/pdf-regression pnpm test:local:pdf-batch
HXSL_SVG_EVIDENCE_DIR=docs/ai-architecture/evidence/local-recompute/svg-regression pnpm test:local:svg
HXSL_IMAGE_EVIDENCE_DIR=docs/ai-architecture/evidence/local-recompute/image-regression pnpm test:local:images
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm seo:check
pnpm exec tsc --noEmit --strict --skipLibCheck --module ESNext --moduleResolution Bundler --target ES2022 --esModuleInterop --allowImportingTsExtensions --typeRoots apps/web/node_modules/@types --types node scripts/local-recompute-check.mts
```

重算脚本先确认13330空闲，再运行127.0.0.1隔离生产服务，使用临时数据库/任务/图片目录、合成文件，禁用服务器转换/生图/支付/索引；finally关闭自己启动的浏览器与进程。`--baseline` 仍执行功能断言，只跳过新增视觉检查。可用 HXSL_RECOMPUTE_EVIDENCE_DIR 指定独立证据目录。

未执行：真实 Google/图像供应商/支付商户联调、新容器重建/生产发布、DNS/TLS、Lighthouse或用户p75、剩余45工具的完整浏览器输出。旧部署与回滚流程不变，见[部署说明](../deploy.md)及[隔离容器记录](container-rehearsal.md)；本轮没有可以宣称“线上已更新”的证据。
