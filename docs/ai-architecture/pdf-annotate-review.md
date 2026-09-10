# 本地 PDF 标注与版式输出

2026-09-09。建筑 AI 完整 Goal 继续；不引入 infinite-canvas。本组不是新引擎、不是 sign-pdf、也不是真实生图/登录/支付联调。

## 实际修复与用户路径

用户仍从原 `/[locale]/pdf/<slug>` 选择文件、本地处理并下载。

- `watermark-pdf`、`page-numbers-pdf`、`header-footer-pdf`、`crop-pdf` 增加可见页码范围字段；未选页保持未标注/未裁切。
- 水印、页码、页眉页脚按所选页写入文本；`{page}` 与起始编号参与输出。
- `resize-pdf` 把所有页画布改为 A4/Letter/自定义尺寸，源页面文字标记仍在，不缩放内容。
- `metadata-pdf` 写入 title/author/subject/keywords。
- `flatten-pdf` 去掉支持的 AcroForm 字段；无表单 PDF 仍下载有效文件。
- 非法范围 `1-2-3` 走现有 `PdfPageError`，当前语言错误卡片，无下载。
- 排序缩略图说明在 15 种语言中提到前移／后移按钮。未改稳定 ID/路由。

## Bug Analysis

### 1. Root Cause Category

D（覆盖缺口）/B（跨层契约）：七个本地编辑工具已有实现，但没有生产浏览器下载重开证据；四个按页操作的工具 schema 没有页码字段，用户只能靠缩略图隐式改 `pages`。

### 2. Why Fixes Failed

旧生产构建 9 组 3 通过 6 失败：水印/页码/页眉/裁切/非法范围找不到 Page range；排序说明仍是 “drag or arrow keys”。resize、metadata、flatten 在旧构建已能下载并重开。失败图保留。

### 3. Prevention Mechanisms

| 优先级 | 机制 | 状态 |
| --- | --- | --- |
| P0 | 生产浏览器下载后重开 PDF：页数、裁切框、画布、内容流标记、元数据、表单字段 | 已实施，9 组 |
| P0 | 选中页才打水印/页码/页眉，共享层同步单测 | 已实施 |
| P1 | 可见 Page range + 非法范围本地化错误 | 已实施 |

### 4. Systematic Expansion

累计 51/82（含 2 个 AVIF 编码边界），31 个仍待浏览器输出。sign-pdf、压缩、sanitize、服务器引擎不在本组。德语 `Ausgewählt` 换行仍未改。

### 5. Knowledge Capture

契约见本文、implement、validation 与矩阵。没有 Git。未公网发布。

## 证据与实际审查

根目录 `evidence/local-pdf-annotate/`：

- `before/report.json`：9 组 3 通过 6 失败。resize/metadata/flatten 已通过；其余缺页码字段或旧说明。
- `after/report.json`：2026-09-09T00:37:18.786Z，9 组全部通过。requests/errors 为空。水印仅第 1 页含 Mark；页码 P7 仅第 1 页；页眉 H2/F2 仅第 2 页；裁切第 1 页 170×261、第 2 页宽度仍 220；自定义 320×240 三页均改、源标记保留；元数据 Updated/HXSL/QA/one two；flatten 字段数为 0。
- 最终 9 张图全部实际查看：watermark 桌面/手机、numbers、crop、resize、metadata、flatten、invalid-range、helper-mobile。错误卡片可见且带重试；排序说明含 move buttons，上下按钮仍在。手机成功态截图从工作区顶部拍摄，投放区占上半，选项在下方；桌面图能看到页码字段和参数。未发现横向溢出。
- `checks/`：lint、四包 typecheck、Web 627、content 82×15、SEO 1230、隔离生产 build 通过。Registry 现 7 项（含页码字段声明）、共享处理新增选中页/flatten 单测。本组未重跑 PDF 页面 13 组、批量、standalone、Lighthouse 或 Docker。

## 精确复跑

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm seo:check
hxsl_annotate_build=$(mktemp -d /tmp/hxsl-annotate-build-XXXXXX)
NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build \
HXSL_ADMIN_DB_PATH="$hxsl_annotate_build/admin.sqlite" \
AI_ASSET_DIR="$hxsl_annotate_build/images" AI_DISPATCHER_ENABLED=false \
AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build
HXSL_ANNOTATE_EVIDENCE_DIR=docs/ai-architecture/evidence/local-pdf-annotate/after pnpm test:local:pdf-annotate
```

脚本只监听 127.0.0.1:13332。没有部署到公网 13080。
