# PDF 页面错误多语言与移动排序按钮

2026-09-08。建筑 AI 完整 Goal 继续；不引入 infinite-canvas。本组不是新 PDF 引擎、不是 38 个待测工具、也不是真实生图/登录/支付联调。

## 实际修复与用户路径

用户仍从原 `/[locale]/pdf/<slug>` 选择文件、本地处理并下载。不要求公众账号。

- 页码范围、完整排序、重复次数、插入位置、页数上限和“不能删除全部页”改为 `PdfPageError` 错误码，经 `imageProcessingError` 输出当前语言提示，覆盖现有 15 种语言。
- 排序缩略图增加独立的前移／后移按钮；首尾不能移动的方向禁用；触控区域至少 44px。保留原拖拽和 ← → 键盘操作。
- 页序改变后焦点回到被移动的页面按钮，避免触控后焦点丢失。
- 按钮名称按语言本地化（例如英语 `Move page 2 earlier`，简体中文 `将第 2 页前移`）。未改稳定 ID/路由、计费或处理引擎。

## Bug Analysis

### 1. Root Cause Category

D（覆盖缺口）/B（跨层契约）：处理层抛出英语 `Error` 文本，工作区原样显示；手机排序只依赖拖拽或手工长页序，没有可见的逐步移动控件。

### 2. Why Fixes Failed

旧生产构建基线 29 组中原 13 组功能保持通过，新增 16 组失败：移动按钮不存在；非英语错误仍是英语范围提示。失败截图与 `before/report.json` 已保留。未删除断言。

### 3. Prevention Mechanisms

| 优先级 | 机制 | 状态 |
| --- | --- | --- |
| P0 | 统一 `PdfPageError` + 15 语言文案，工作区经 `imageProcessingError` 映射 | 已实施，30 项文案单测 |
| P0 | 生产浏览器核对 15 语言错误全文、非英语不得回退英语、错误无下载 | 已实施 |
| P0 | 可见前移／后移、44px 触控、点击后实际 PDF 页序与焦点恢复 | 已实施 |
| P1 | 原 13 组页面输出、61 页排序、复制预算在同一次生产运行中回归 | 已实施 |

### 4. Systematic Expansion

这是原 7 个页面工具身份上的交互与文案补齐，不新增工具计数。累计仍 44/82（含 2 个 AVIF 编码边界），38 个待浏览器输出。缩略图说明仍只写拖拽和方向键，没有提到新按钮。德语 `Ausgewählt` 在 390px 三列缩略图中会从单词中间换行，本组未改选中标签文案。

### 5. Knowledge Capture

契约保存在本文、implement、validation。没有 Git。未伪造提交或公网发布。

## 证据与实际审查

根目录 `evidence/pdf-page-accessibility/`：

- `before/report.json`：2026-09-08T14:55:13.497Z，29 组 13 通过 16 失败。原功能保持；`reorder.visible-move-controls` 找不到英语移动按钮；15 个 `page-errors.*` 非英语仍显示英语范围错误。失败图已保留，不作为修复证据。
- `after/report.json`：2026-09-08T15:07:04.183Z，29 组全部通过。requests/errors 为空。移动按钮点击后下载 PDF 页序为 2,3,1；15 语言均验证 range/order/repeats/position/limit/deleteAll，并在每种语言下用按钮把 1,2,3 调成 2,1,3 后独立重解析 PDF。
- 最终 12 张图全部实际查看：`reorder-desktop`、`reorder-mobile`、`selection-mobile`、`invalid-range`、`move-controls-mobile`、`move-controls-desktop`、`error-zh-CN`、`error-de`、`error-ja`、`error-tr`、`error-pl`、`error-th`。错误卡片可见，含重试、无下载按钮；320 深色移动排序与 1440 浅色桌面均有独立上下按钮；简中/德/日/土/波/泰插入位置错误不是英语。未发现横向溢出或遮挡。德语选中标签在 390px 三列中从单词中间换行，记录为既有缩略图标签问题，不是本组引入的溢出。
- `checks/workspace-tests.log`：Web 627 通过（含 `pdf-page-copy` 30 项与 `pdf-page-plan` 27 项）。`lint.log`、`typecheck.log`、空的 `script-types.log`、`content.log`（82×15）、`seo.log`（1230 URL）通过。`build.log` 隔离生产 build 终态列出完整路由。本组没有重跑 PDF 批量、参数重算、standalone HTTPS、Lighthouse 或 Docker。

## 精确复跑

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm seo:check
pnpm exec tsc --noEmit --strict --skipLibCheck --module ESNext --moduleResolution Bundler --target ES2022 --esModuleInterop --allowImportingTsExtensions --typeRoots apps/web/node_modules/@types --types node scripts/local-pdf-pages-check.mts
hxsl_pages_build=$(mktemp -d /tmp/hxsl-pages-build-XXXXXX)
NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build \
HXSL_ADMIN_DB_PATH="$hxsl_pages_build/admin.sqlite" \
AI_ASSET_DIR="$hxsl_pages_build/images" AI_DISPATCHER_ENABLED=false \
AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build
HXSL_PAGES_EVIDENCE_DIR=docs/ai-architecture/evidence/pdf-page-accessibility/after \
HXSL_PAGES_LOCALES=true pnpm test:local:pdf-pages
```

脚本只监听 127.0.0.1:13331，使用临时 SQLite/合成 PDF，finally 关闭自启浏览器和 Node。构建没有部署到公网 13080。不涉及真实 AI、Google、支付、DNS/TLS、Docker 或外部费用。

本组完成后仍不能宣称全部 82 个工具、完整 AI Goal 或全站 WCAG 完成。
