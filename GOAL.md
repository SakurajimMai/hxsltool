# HXSL Tools — 全量聚合工具站开发 Goal

> 这是交给 Codex 的可执行开发需求，不是已完成项目的说明。请在当前仓库实施代码、运行测试并交付部署文件。本文中的默认值是项目设计选择，可通过配置修改。参考站的功能名称只是范围依据，不代表已验证其实现质量，也不构成对其效果或隐私承诺的背书。

## 0. 最终目标与执行契约

在当前仓库从零构建或完善 HXSL Tools：一个英语优先、支持多语言、搜索引擎可抓取、浏览器本地处理优先的 PDF、图片、SVG 与图标工具网站，整合以下参考站的公开工具功能，并提供自己的轻量 API 和 CLI：

- https://pdfuck.com/
- https://svgcreator.com/
- https://pipic.cc/

交付的必须是能实际处理文件、生成正确结果、可以通过 Docker Compose 部署的完整应用，而不是首页、导航目录、iframe 聚合、设计稿、TODO 集合或第三方 API 套壳。

本 Goal 内自行分解任务并持续执行：审计 → 设计 → 实现 → 测试 → 修复 → 构建 → 部署演练 → 对照需求验收。不要在只完成计划、脚手架、首页或某一里程碑后宣布结束；正常的技术选择使用本文默认方案并记录决定，不必反复询问用户。

但必须尊重权限和安全边界：不得擅自修改其他项目、清理宿主机、关闭系统安全机制、暴露密钥、购买服务、提交付费交易、发布 npm 包、推送远端仓库或修改域名 DNS。没有生产权限时，交付可运行构建与精确部署说明，明确“尚未在线部署”，不得冒称已上线。遇到真实权限、环境或预算阻塞，先推进独立任务，再记录证据和恢复步骤；不得伪造测试通过。

完整完成标准：本文要求范围内的功能均有实际实现和测试证据；所有首发语言的公开页面完整；构建、类型检查、测试、SEO 审计与容器演练完成。因阻塞关闭某项功能属于部分交付，不能以关闭功能代替完成要求。

## 1. 产品默认值与明确不做的范围

- 品牌：HXSL Tools；品牌、Logo、域名、联系渠道全部配置化。
- 规范域名：`https://hxsl.org`；默认英语，面向海外创作者、开发者与普通文件处理用户。
- 语言：`en`、`zh-CN`、`zh-TW`、`es`、`pt-BR`、`de`、`fr`、`ja`。架构支持将来增加韩语、阿拉伯语等，并预留 RTL；本期不要求发布未列入首发的语言。
- 四个一级分类：PDF Tools、Image Tools、SVG Tools、Icon Tools。
- 基础网页工具免注册。优先使用本地计算，降低运营成本。
- 不照搬参考站商标、代码、页面文案、图片、用户评价或统计数据。不调用其未获授权的接口，不依赖其在线服务维持本站功能。
- 参考站跳转到其他独立站点的广告、捐赠、联盟链接或第三方产品不属于工具实现范围；在对照表中注明。
- 本期不建设复杂公共用户系统、支付订阅、积分商城、社区、上传文件永久云盘或完整可视化 CMS。PiPic 的付费套餐与登录方式不是本项目必须复制的商业流程；本期实现自主 API、密钥、配额和 CLI 即可。
- 配置与内容先采用仓库中的类型化配置、JSON 和 Markdown/MDX，带校验命令和维护说明；不得为了修改站名、限额、语言、工具开关或 SEO 文案而要求修改组件源代码。
- 不无限制添加与三个参考站无关的工具，避免偏离主线。

## 2. 先做范围审计，并维护单一事实来源

开始时读取当前目录、Git 状态、已有 AGENTS.md 和项目说明，保留用户已有代码。空目录直接初始化项目；已有项目先给出短架构决策记录再适配，不能无故删除重建。

检查上述参考站及其工具目录，建立 `docs/reference-feature-matrix.md`，每行记录：参考站与页面、本站工具 ID、输入输出、处理模式、支持边界、实现路径、测试路径、当前状态。至少覆盖本文第 5—8 节，不得因参考站临时打不开而遗漏本文明确列出的功能。

建立类型化 Tool Registry，作为路由、导航、SEO、能力声明和测试清单的唯一来源。至少包含：

`id, category, slug, adapterId, inputFormats, outputFormats, processingMode, limits, optionSchema, relatedTools, enabled, implementationStatus, supportedLocales, contentStatus, qualityNotes, sourceReferences`

- `processingMode`：`local`、`server` 或 `hybrid`，其中 hybrid 必须明确何时需要上传及同意流程。
- `implementationStatus`：`planned`、`implemented`、`verified`、`blocked`，不能把写了 UI 当作 verified。
- 每个工具按语言单独记录内容完整性和发布资格。
- 同一底层引擎可以服务多个真实任务页面，但不把别名或格式组合的数量冒充不同能力数量。
- 建立 `docs/progress.md` 和 `docs/decisions.md`，每个里程碑更新状态、已执行命令、失败原因和下一步。

## 3. 技术架构：一个代码仓库，两个计算层

默认技术栈：

- Web：Next.js App Router + TypeScript + React；选择执行时仍受维护、互相兼容的稳定版本，锁定版本与 lockfile，不使用未经核对的旧教程 API。
- UI：Tailwind CSS + 可访问的基础组件（可使用 shadcn/ui/Radix）+ Lucide。避免重复引入多套 UI 框架。
- 国际化：next-intl 或经记录后采用同等可靠方案。
- 包管理：pnpm workspace，固定 packageManager 和受支持的 Node LTS 版本。
- 内容：类型化 JSON + Markdown/MDX，仅编译项目内可信内容，不执行用户提供的 MDX。
- 本地处理：Web Workers + 懒加载 WASM/JS 编解码器。PDF、OCR、SVG 引擎不得进入首页公共包。
- 服务端处理：独立 Node worker，优先 Sharp、VTracer、qpdf、LibreOffice 等成熟引擎；必要时由 worker 调用隔离的 Python 脚本。不要为了包装这些脚本额外部署一套 FastAPI 微服务。
- 任务队列：BullMQ + 兼容且经测试的 Redis；重任务不得在 Next.js 请求事件循环直接执行。
- 测试：Vitest、Playwright、必要的 Python 测试、Lighthouse CI、SEO 自检脚本。
- 部署：Docker Compose。`core` 模式只运行 web 并提供经验证的本地工具；完整模式增加 worker 与 redis。完整模式的服务器工具不能只是可选安装说明，必须实际构建与测试。
- 暂不依赖 PostgreSQL、对象存储或外部付费 API。临时文件使用受保护的本机临时卷；任务系统仅保存必要短期元数据。

建议目录（允许合理调整，但保持边界）：

```text
apps/
  web/
  worker/
packages/
  tool-registry/
  processing-local/
  processing-shared/
  cli/
  ui/
content/
  tools/<locale>/
  guides/<locale>/
messages/<locale>.json
config/
  site.ts
  tools.ts
  limits.ts
  locales.ts
scripts/
tests/fixtures/
docs/
Dockerfile.web
Dockerfile.worker
compose.yaml
.env.example
```

SEO 页面层与工具执行层分开：标题、说明、步骤、格式限制、FAQ、内链、metadata 必须通过预渲染或服务端渲染出现在初始 HTML；只有上传、预览、参数面板、处理引擎属于客户端交互。不要把整个工具详情页设置为只在客户端渲染，也不要认为纯静态页面不能包含本地处理工具。

不要将所有引擎塞进 Next.js Edge Runtime 或长时间 HTTP 请求；不要默认使用 Vercel 的专属服务。必须能在普通 Linux Docker 主机自托管。

## 4. 公共 UI、任务体验与工具衔接

设计一个有统一品牌和清晰信息层级的网站，而不是三个参考站样式的拼贴。

- 首页：简洁价值说明、工具搜索、四大分类、精选真实工具、隐私模式说明、常见使用流程。不要用占满首屏的宣传图或虚构数字挤走工具入口。
- 分类页：按任务分组、简短说明与可抓取的普通链接。搜索/筛选功能是辅助，不得让搜索引擎必须点击筛选才能发现工具。
- 工具页：首屏可操作；支持拖拽、文件选择、适用时粘贴图片；明确格式、大小、页数/像素限制和 local/server 标识。
- 任务状态：待处理、加载引擎、处理中、完成、失败、取消、过期。能获取真实进度就显示；不能获取百分比就显示真实阶段，不使用虚假百分比。
- 支持批量、单个重试、移除、取消、结果预览、单个下载和 ZIP 下载。一个失败不应破坏其他成功任务。
- 图片压缩显示原体积、结果体积、真实节省比例、尺寸与格式；向量化显示可用参数与放大预览；PDF 支持页面缩略图和范围选择。
- 移动端、键盘导航、焦点、状态通知、对比度、暗色模式和 `prefers-reduced-motion` 必须可用。语言名称使用对应语言自身名称，不使用国旗代替语言。
- 记住用户偏好的主题、最近工具和收藏时，只保存工具 ID 和非敏感设置；不要把用户文件、PDF 密码或文档内容写入 localStorage。
- 通过会话内 Blob/内存实现“继续用另一个工具”，至少验证：图片压缩→格式转换；图片转 SVG→SVG 优化→图标包；图片转 PDF→合并/压缩。跨入服务端步骤必须重新说明上传并取得同意。
- 文件不自动跨刷新永久保存；会话结束、用户清空或 Blob 不再需要时释放资源。
- 不放置假的下载按钮、弹窗广告、强制登录和遮挡操作区的浮层。可以预留默认关闭的广告与统计配置，但本期不加载广告代码；未来也不应在能访问用户文件的工作区随意注入第三方脚本。

## 5. PDF 工具：必须逐项覆盖 40 个公开任务

### 5.1 页面组织：8 项

1. Merge PDF：多文件合并，拖拽顺序。
2. Split PDF：按页、范围或分组拆分并打包。
3. Rotate PDF：指定页旋转。
4. Reorder Pages：页缩略图排序。
5. Extract Pages：抽取指定页和范围。
6. Delete Pages：删除指定页，校验不能输出零页文件。
7. Reverse PDF：页面倒序。
8. Duplicate Pages：重复指定页并控制位置或次数。

### 5.2 格式转换：16 项

9. PDF → PNG，并支持多页 ZIP 和可控尺寸的长图。
10. PDF → JPG，并支持质量参数、ZIP 和长图。
11. PDF → WebP，并支持质量参数、ZIP 和长图。
12. PNG → PDF。
13. JPG/JPEG → PDF。
14. WebP → PDF。
15. PDF → Text。
16. BMP → PDF。
17. GIF → PDF。
18. SVG → PDF。
19. PDF → Word/DOCX。
20. PDF → Excel/XLSX。
21. PDF → PPTX。
22. Word/DOC/DOCX → PDF。
23. Excel/XLS/XLSX → PDF。
24. PPT/PPTX → PDF。

图片转 PDF 支持纸张、方向、边距、适应方式、图片顺序与背景颜色。GIF 必须明确首帧还是全部帧；超长图必须检查最大像素/画布限制，必要时分片，不能崩溃或无提示截断。

### 5.3 编辑与优化：8 项

25. Compress PDF：区分结构优化和有损图像压缩。
26. Add Watermark：文字水印，位置、大小、旋转、透明度与页范围。
27. Add Page Numbers：位置、格式、起始编号与适用页。
28. Edit Metadata：标题、作者、主题、关键词等。
29. Crop PDF：预览并调整页面可见区域。
30. Flatten PDF：表单/批注扁平化。
31. Header & Footer：页眉页脚内容与样式。
32. Resize PDF：A4、Letter 等预设和自定义尺寸，清晰区分缩放内容与调整画布。

### 5.4 签名、安全及分析：8 项

33. Sign PDF：绘制、输入或图片形式的外观签名。
34. Unlock PDF：用户有权处理且提供必要密码后的解密。
35. Protect PDF：真正的 PDF 密码加密。
36. Compare PDF：文本差异和可选页面视觉差异，说明能力边界。
37. Redact PDF：真正不可通过删除覆盖层恢复的内容移除。
38. PDF OCR：扫描件 OCR，导出文本及带可搜索文字层的 PDF。
39. Sanitize PDF：清除明确列出的隐藏/活动内容。
40. Verify PDF：结构、加密和数字签名的分项检测。

### 5.5 引擎选择与不可妥协的真实性要求

- 普通页面处理优先 pdf-lib；渲染和文本读取优先 PDF.js。查阅当前官方能力，不能使用不存在的 API。
- 不得将 `ignoreEncryption` 当作解密方案。密码工具使用经验证的 qpdf/WASM 或服务器 qpdf；正确处理用户密码、owner 密码及加密状态，不提供密码暴力破解功能。
- 压缩结果可能不比原文件小。显示真实结果；相同格式/约束下结果更大时，默认保留原文件并说明“无进一步收益”。不要承诺固定压缩率或把有损重编码称为无损。
- PDF→DOCX 至少提供真实可编辑的文字/基础段落重建模式，并告知复杂排版和扫描件的限制。不能把每页截图塞进 DOCX 后宣称文字可编辑。
- PDF→XLSX 必须输出真实表格单元格；无可识别表格时给出明确结果或失败原因，不能把整页内容或整张图片随意塞入一个单元格冒充表格识别。
- PDF→PPTX 可以提供明确标注的“每页作为图片幻灯片”模式；不要把这种结果描述成所有文字和图表可编辑。
- Office→PDF 使用 LibreOffice headless 等可靠引擎；独立用户配置目录、禁用宏与外部资源、提供授权字体，验证中英日文和分页。不得用 HTML 的简陋预览冒充高保真 Office 转换。
- SVG→PDF 优先保留可支持的矢量路径；不支持的特性应拒绝或提供用户明确选择的栅格化模式，不能宣称栅格结果仍保留矢量。
- 签名图片仅是外观签名，不等于基于证书的密码学数字签名，也不宣称普遍法律效力。
- Verify PDF 必须区分：存在签名、文档完整性验证、证书信任链、时间戳与撤销状态；信息不足显示 unknown/无法确认。不能因为存在签名字典、能打开 PDF 或结构检查通过就显示“可信签名/安全文件”。可使用 pyHanko 等经审查引擎；默认禁止解析用户文档时任意联网。
- 修改已签名 PDF 可能影响签名状态，处理前提示并对输出重新检查。
- Redaction 不能只添加黑色矩形。可使用可靠内容删除引擎；也可采用明确说明会损失可搜索性/交互性的安全重建模式：先将页面渲染成像素、在像素中移除敏感区，再只用处理后的像素创建全新 PDF，不保留原始页面对象、文本、缩略图或附件。验证不能抽取原敏感文本或原始图片。若后续添加 OCR 层，必须只识别已经处理后的像素。
- Crop 只是裁切可见区域，不当作 redaction。
- Sanitize 明确清除范围；可提供干净重建模式，不将“删除 metadata”伪称为清除了所有脚本、附件、隐藏图层和敏感信息。不能宣称检测后文件绝对安全。
- Flatten 明确 AcroForm、批注和 XFA 的支持范围；必要的栅格化模式须标注损失。
- OCR 的界面语言与识别语言是两套配置；用户选择实际识别语言。语言数据懒加载，验证旋转、中文与英文、文字层坐标；不承诺 100% 准确率。

## 6. SVG 工具：真实矢量化与辅助处理

必须实现以下任务并写入对照表：

- PNG、JPG/JPEG、WebP、GIF、AVIF、TIFF、BMP → SVG：共 7 类输入任务，可复用同一向量化引擎。
- SVG Color Editor：识别可支持的 fill/stroke 等颜色并修改。
- SVG Palette Swapper：至少 10 套原创、配置化配色，支持预览和撤销。
- SVG Optimizer：显示真实体积变化，保留必要 viewBox、渐变、蒙版与引用。
- SVG → PNG：自定义尺寸与 1x/2x/3x/4x。
- SVG → WebP。
- SVG → DXF。
- PNG → DXF。
- JPG → DXF。
- SVG → React：输出可用 JSX/TSX 组件，不使用执行用户代码的方式转换。
- SVG → Base64 / Data URI：输出与复制。
- SVG → Favicon：与图标模块复用，但有适当任务入口。
- SVG → DST：受限的轮廓 running-stitch 导出与预览。
- SVG Pattern Maker：原创基础图案、重复布局与 SVG 导出。
- SVG QR Code：生成可扫描二维码，支持基础纠错级别与 SVG 导出。

向量化要求：

- 优先核验 VTracer 的 WASM/本地编译或原生服务端方案；不能编译可用本地模块时，可走已明确同意的服务器路径。
- 黑白、灰度和彩色模式；噪点过滤、颜色数量/精度、路径平滑与简化等参数以引擎实际支持为准。
- 输出应包含真实可解析的 path/shape，不得仅用 `<image href="data:image/...">` 包裹位图冒充矢量化。
- 清晰说明矢量化是近似重建；照片、渐变和纹理不会自动变为和原图完全一致且极小的矢量。
- GIF/多页 TIFF 明确首帧/指定帧选择，不能静默丢弃信息。
- DXF 处理单位、缩放、闭合路径与曲线离散误差；说明支持几何范围，提供可解析文件，不输出仅改扩展名的 SVG。
- DST 只承诺已实现的轮廓走针，不冒充专业填充针、针序优化或布料补偿系统；必须包含尺寸与针迹预览，提示实际使用前验证，不保证适用于所有设备。
- SVG 转 React 要处理保留字、属性名、ID 冲突和引用，不能只全局字符串替换。
- SVG 作为不可信输入：解析、清理、禁止脚本、事件、危险外部引用、DTD/实体等；预览不将原始 SVG 通过 dangerouslySetInnerHTML 注入主页面。SVGO 是优化器，不能当作安全清洗器。
- 对滤镜、foreignObject、CSS、渐变和外部字体等不支持特性给出明确处理规则。支持限制要同步显示在说明和测试中。

## 7. 图片工具：覆盖 PiPic 的核心体验，并增加必要转换

必须实现：

- PNG、JPEG、WebP、AVIF 同格式压缩，分别有任务入口。
- 通用图片压缩器，桌面默认最多 100 张、每张 8 MB；这是本项目可配置初值，不代表任何引擎无限制。
- 批量队列、单文件状态、压缩前后预览、体积/节省率、单个下载和 ZIP 下载。
- 明确的有损/无损选项，仅在实际编解码器支持时显示。
- PNG/JPEG/WebP/AVIF 常用格式互转；至少提供 JPG↔PNG、PNG/JPG→WebP、WebP→PNG/JPG、PNG/JPG→AVIF、AVIF→PNG/JPG 的任务入口。
- 调整尺寸、裁剪、旋转、翻转、背景处理与 EXIF 清除，为工具衔接提供基础能力；不额外扩展成复杂图片编辑器。

实现与质量要求：

- 本地使用经实际编译验证的浏览器编解码器，服务端使用 Sharp 等成熟引擎；逐项验证编码能力，不认为浏览器能显示 AVIF 就等于能通过 Canvas 导出 AVIF。
- 通过真实文件头、MIME、重新解码后的格式和尺寸验证输出，不能只修改文件后缀。
- 正确应用 EXIF orientation，再按隐私设置删除位置等元数据；默认给出明确隐私策略。避免图片旋转错误、透明底变黑或色彩明显异常。
- PNG 无损不等于有损调色板量化；JPEG/AVIF/WebP 的质量刻度也不互相等价。
- 同格式、同尺寸场景结果更大时保留原文件并报告；格式转换仍交付用户请求格式，诚实显示体积增加。
- 使用队列限制并发，不能同时解码 100 张大图。默认本地并发 2，移动端可降至 1；服务器重任务默认并发 1，皆可配置。
- 限制解码后像素、页面/帧数、输出像素和估算内存，而不只是文件字节数。超限时可指导降低尺寸或经用户选择进入服务器模式，不得偷偷上传。
- 每个阶段及时释放 ArrayBuffer、ImageBitmap、Canvas、Object URL 和 worker 资源。

## 8. 图标工具：覆盖多尺寸 ICO 与 Android 资源包需求

实现 PNG/JPG/SVG → 多尺寸图标资源包，能预览留白、缩放、背景色、contain/cover 与裁切效果。

必须输出：

- 合法的多尺寸 ICO，默认 16、24、32、48、64、128、256 像素；解析 ICO 目录逐项验证，不能将 PNG 改名为 .ico。
- Favicon PNG，Apple touch icon、PWA 192/512 图标与 manifest.webmanifest 示例。
- 源文件确为可用矢量或用户明确选择向量化时，可输出安全 SVG；不得从位图直接伪造“无损矢量 favicon”。
- favicon 的 HTML 接入片段和解压后文件说明。
- Android legacy launcher 图标各密度目录，以及 adaptive icon 的前景、背景、XML 与 monochrome 资源（在实际支持范围内）。
- Google Play 提交用图标素材可以作为独立导出选项，但不得将其与启动器资源混为一谈。
- Android 部分按执行时官方规范核验画布、安全区域、密度映射与目录组织，提供不同 mask 的预览。不是把一张 512px PNG 随机复制进几个目录。
- ZIP 包清楚区分 web、pwa、android 与说明文件；不生成虚假的可安装 APK，本功能是生成应用图标资源，不是 APK 打包器。

## 9. 多语言与 SEO：发布资格属于产品的一部分

### 9.1 URL 与语言策略

采用同一主域名的语言子目录，例：

```text
/en/pdf/merge-pdf
/zh-CN/pdf/merge-pdf
/ja/pdf/merge-pdf
/en/image/compress-png
/de/svg/png-to-svg
/en/icons/favicon-generator
/en/guides/prepare-images-for-web
```

- 默认工具 slug 使用稳定英语标识，页面内容完整本地化；不以翻译 slug 作为首发必须条件。
- `/` 使用固定重定向到 `/en`；不能按 IP 对搜索引擎或用户强制跳转不同内容。
- 语言切换保留当前工具身份，切换到对应语言页面，而不是总跳首页；缺失翻译不能伪装成已翻译页面。
- 规范域名、HTTPS、尾斜杠规范一致，www/裸域名等非规范版本永久重定向并保留路径与合理查询参数。
- 未知语言、未知工具和真正不存在页面返回正确 404，而不是全都 200 返回首页。

### 9.2 真实本地化

首发 8 种语言必须覆盖：导航、按钮、参数、错误、任务状态、帮助、title、description、H1、步骤、FAQ、格式限制、隐私提示、分享文案和基本站点页面。

按工具/语言维护内容状态，做 key 对齐、占位符、ICU message、HTML、链接和遗漏检查。核心页面不能回退成一整页英语但仍标注其他语言。可以记录待人工润色项，但不得声称已人工母语审校；严重缺失的页面不发布，不加入 sitemap/hreflang。

不要仅把一个按钮列表自动翻译后批量生成空壳页面。每个任务要说明其真实输入输出、使用步骤、选项含义、限制、隐私模式与常见错误；不同任务的内容必须有实质差异。

### 9.3 技术 SEO

- 页面初始 HTML 存在本地化 title、description、唯一主要 H1、介绍、帮助、普通链接和正文；不开 JavaScript 仍可理解页面用途，处理控件可提示启用 JavaScript。
- 已发布语言页面 canonical 指向自身，而不是所有语言 canonical 回英文。
- hreflang 只列出真实存在、可索引且内容对应的版本；包含自身、互相回指，并为每个工具指向该工具默认英语页的 x-default。
- 选用 HTML head 作为 hreflang 唯一生成出口，普通 sitemap 列出所有合格 URL；不必重复在 HTTP 头和 sitemap 再维护一套语言关系。
- sitemap 从同一个 registry/content 状态生成，量大按语言或类型拆分；只包含规范、可索引且实际存在的公开 URL。
- lastmod 反映内容真实修改，不在每次请求时伪造最新日期。
- robots.txt 不得误封公开页面或必要资源。搜索结果页、任意筛选组合、未验证功能页使用恰当 noindex/路由处理，避免无限 URL。
- 不把 robots.txt 当作保密或可靠移除索引的手段；需要爬虫看到 noindex 的公开页面，不能同时阻止爬取。
- 用户上传、结果文件、临时任务、鉴权页面不得公开进入索引；首先依靠访问控制，再用 noindex/X-Robots-Tag 和 no-store 辅助。
- 参数不改变页面实质内容时 canonical 指向规范工具页；确有不同任务价值的落地页才单独建设，不能枚举无限格式×大小×关键词页面。
- 使用适当的 WebSite、Organization（只含真实配置）、BreadcrumbList、WebApplication/SoftwareApplication 等 JSON-LD。结构化数据只描述真实可见信息，不伪造评分、评论、下载量和价格。
- FAQ 对用户可见且真实有用即可，不承诺 FAQ/HowTo 或软件应用富结果，也不要为追求富结果编造 required 字段。
- 配置 Open Graph、Twitter Card、站点图标和可读分享内容；按语言生成对应文案。
- 分类→工具、工具→相关工具、指南→工具之间有主题相关内链。不得自动跨语言乱链。
- 草稿、禁用功能和不完整翻译不出现在正式导航、sitemap 和 hreflang；临时引擎故障与“功能从未实现”要区别处理，避免每次短暂故障都改写收录状态。

### 9.4 内容与上线收录

生成基础 About、Privacy、Terms、Contact 页面及少量有实际帮助的原创指南。联系邮箱和运营者信息来自配置，不捏造地址、公司或认证；缺少必要真实信息时在交付报告中指出。

配置 `ALLOW_INDEXING=false` 作为开发/预发布默认值。正式发布前检查域名、联系信息、能力声明和隐私政策，再由运营者显式开启。提供 Google Search Console 与 Bing Webmaster Tools 的验证、sitemap 提交和 URL 检查步骤；没有账号权限不能宣称已提交或已收录。

不要承诺提交 sitemap 就保证收录、排名、流量或收入。

## 10. 服务器任务、安全与隐私

服务端功能使用异步任务流程，至少实现：

- 创建任务和安全上传，返回不可预测 job ID 与独立授权机制；单有一个容易获取的 job ID 不能读取他人结果。
- 查询状态、获取结果、取消任务、主动删除与过期处理；浏览器可使用同源 HttpOnly 会话或受控 bearer token。
- 输入输出置于服务器生成的独立临时目录，禁止用户决定任意文件路径。下载名称与内部路径分离，处理 ZIP Slip、路径穿越、重复文件名、空字节和符号链接风险。
- 用户显式确认后才上传。文件在任务结束后有可配置下载保留期；默认结果保留 15 分钟，取消/主动删除立即清理，另设兜底定时清理和启动恢复清理。UI 与隐私页必须与实际行为一致。
- 不把文件放入公开静态目录、CDN 缓存、永久备份或错误追踪附件。清理文件是逻辑删除与存储生命周期管理，不宣传成对 SSD 的可证明物理擦除。
- API、状态与下载使用恰当 `Cache-Control: no-store`、鉴权和 `X-Robots-Tag: noindex`。反代/CDN 显式排除这些路由缓存。
- 同时验证扩展名、MIME、魔数和实际解码，限制压缩后/解码后体积、帧/页数、输出大小、任务时长、队列长度、CPU、内存、进程数和临时磁盘。
- 对处理引擎采用非 root 独立 worker 容器、最小文件权限、只读根文件系统和受限临时目录；处理子进程不能访问宿主机密钥、其他应用或 Docker socket。禁用不需要的外网访问、宏、远程引用和主动内容。
- 如果进一步的逐任务沙箱依赖宿主机能力，提供受支持配置并实际验证；不能用 privileged 或挂载宿主机根目录作为“解决方案”。不能因运行在 worker 线程就宣称获得操作系统级安全隔离。
- 系统调用使用参数数组，不拼接 shell 命令。超时/取消要终止对应进程树，不只把 UI 状态改成取消。
- 密码、API token 和文件内容不记录到日志。若 PDF 密码必须随队列传递，使用独立密钥加密的短期载荷，不能明文放 Redis、URL 或长期任务记录。
- 队列任务具有幂等输出策略、有限重试、僵尸恢复和失败清理。输入损坏不反复无限重试。
- 限流同时考虑服务器总并发、匿名会话与 API key，可信代理地址只从受信任反代读取。基本滥用防护不得依赖前端验证。
- SVG/XML 禁止 XXE 与不安全外链；Office 压缩容器防解压炸弹。默认不支持输入远程 URL，避免引入 SSRF。
- 本地工具需要自动化网络测试证明未上传用户文件；允许加载自托管引擎资源不等于允许发送用户内容。不得在失败时自动转服务器。
- 默认不启用分析或错误上报 SDK。可配置的匿名聚合指标不包含文件名、正文、图片内容、密码或 token；隐私文案不能在启用统计后还声称绝不收集任何数据。
- CSP、安全响应头与依赖自托管要与 Next.js 和 workers/WASM 兼容；不要为了方便全站开放危险策略。使用 SharedArrayBuffer 时评估跨源隔离需求与兼容性，也提供可行的单线程降级。

## 11. 自主 API 和 CLI

参考的是 PiPic 的自动化使用体验，不是转发其接口。

- 自己的版本化 API，至少提供压缩图片、创建转换任务、查询、下载、取消、删除和能力查询；生成对应 OpenAPI 文档。
- `/api/v1/compress/image` 可以采用单图上传→队列处理→结果的明确协议，或提供适当小文件同步便利层，但不得无界占用 Web 进程。文档必须与真实状态码/响应一致。
- 公共 API 默认关闭。管理员通过本地安全命令生成、撤销 API key 和配置配额；明文只显示一次，服务端仅保存哈希或受保护配置，不把 key 放客户端包。
- 不要求先接通 Google/GitHub OAuth 才能完成 API/CLI；自助账号和付费升级留作后续产品工作，不伪造套餐按钮。
- CLI 至少支持输入文件/目录、递归可选、输出目录、显式 `--replace`、并发控制、超时、`--json`、`--dry-run`、帮助和稳定退出码。
- 默认写新目录，不覆盖源文件。`--replace` 要先在同目录安全写临时文件并验证结果，再原子替换；失败保留原文件。目录扫描明确符号链接处理，不进入用户未指定目录。
- 支持离线本地图片压缩优先模式；需要服务器时用户显式选择服务器 URL 并使用环境变量/安全本地配置提供 key。不可默默把本地模式切成上传。
- 交付可构建的 CLI 包与调用示例，并在本地生成包做安装/执行测试；未经授权不发布到 npm。

## 12. 配置与维护

通过配置维护站名、规范域名、默认语言、启用语言、工具开关、发布状态、大小/页数/像素上限、并发、超时、TTL、联系信息、SEO 和外部统计开关。

建立内容 schema 与 `content:check`：检查必填字段、语言缺失、链接有效性、FAQ 数据、metadata 和工具能力描述是否一致。提供新增工具、增加语言、修改文章、更新限额、启用 API 的操作说明。

运行时配置和构建时配置明确分开：哪些改动需要重建、哪些只需重启写清楚；不要让管理员改了配置却仍显示旧的限制/SEO 页面。

提供结构化且去敏的日志、Web 健康检查、worker 就绪检查、引擎版本信息、队列深度与临时空间监控。健康端点不泄露密钥或文件路径。

## 13. 性能与资源预算

- 公共首页和工具说明先完成渲染，再按需加载处理引擎。
- 不因鼠标经过工具链接就下载整套 OCR、Office 或编解码器；合理控制预取。
- 批量处理使用可取消的队列，避免内存同时持有多份大文件。
- 采用明确文件限额与可配置并发；首发建议本地并发 2、移动端 1、服务器重任务 1。按实际部署资源压测调整，不能宣称适用于任意小内存主机。
- 为首页、分类页和代表性工具页建立 JS/CSS/图片体积与 Lighthouse 基线，记录实际结果；不隐瞒失败，不为追分删除关键功能。
- 性能目标：核心页面在约定移动测试环境争取 Lighthouse Performance ≥90、Accessibility ≥95、SEO ≥95；这些是项目验收目标，不是已测结论。
- 上线后关注真实用户第 75 百分位的 LCP ≤2.5 秒、INP ≤200 毫秒、CLS ≤0.1；不能把一次实验室测试当作实际全站 Core Web Vitals 已达标。

## 14. 测试：对输出内容负责，而非只测按钮

准备自己生成或授权的测试夹具，不使用真实用户隐私文件。测试必须在 CI 可重复，并记录引擎版本。

至少覆盖：

1. 工具 registry 与矩阵：40 项 PDF 和 SVG/图片/图标任务逐项关联实现、测试与说明；重复入口不得伪造新增能力。
2. 图片：每种输入/输出格式实际解码，尺寸、透明度、方向正确；损坏文件、超大像素、批量部分失败、无压缩收益、取消与 ZIP 结构。
3. SVG：向量化结果含真实几何并可渲染，无内嵌位图冒充；颜色/渐变/ID 引用保真；恶意脚本、事件、外链/XXE 被阻止；二维码实际可解码；React 输出能编译；DXF/DST 能被对应解析器读取。
4. PDF：页数、顺序、旋转、范围、纸张、文本和可视输出。结果由另一条检查路径重新打开；对复杂输出进行渲染和视觉比较。
5. PDF 密码：正确密码、错误密码、无密码、加密/解密往返与结果检查；敏感密码不出现在日志和队列明文。
6. Redaction：底层抽取、附件/原图检查与重新渲染均不能恢复被删除内容；禁止只检查画面上有黑块。
7. OCR：可控中英文扫描样例；输出存在可选择文字层，位置合理，说明识别误差；不为追求通过把期望文本硬编码进实现。
8. Office 与反向转换：DOCX/XLSX/PPTX 和支持的旧格式夹具；中英日文字体、分页、可编辑文本/表格单元格与输出包结构。
9. 签名验证：自签名未知信任、受信任测试根、被篡改、无签名，以及状态不完整的样例；不能一律 valid。
10. 图标：ICO 多条目结构、PNG 尺寸、manifest 引用、Android 目录/XML 与 safe-area 预览。
11. 本地隐私：拦截网络请求，确认用户文件字节与内容不离开设备；服务器 fallback 需要明确同意。
12. 服务器安全：越权下载、过期、删除、取消、任务超时、重启恢复、路径穿越、队列过载和临时目录清理。
13. 多语言：所有首发语言的 UI key 与正文字段，语言切换保持工具、错误翻译、404、字符编码与溢出。
14. SEO：对全部合格页面抓取原始 HTML，校验 status、title、description、H1、自引用 canonical、hreflang 双向一致性、x-default、sitemap URL 与 noindex 状态；检查公开链接和站点地图无死链。
15. UI：桌面与移动端端到端上传→配置→处理→下载→再次解析结果；执行截图审查，修复遮挡、溢出、空白区域和无法点击的控件。
16. API/CLI：真实请求、授权、限流、JSON 输出、退出码、失败保留原文件、dry-run 不上传不改文件。

提供统一命令，名称可根据项目组织映射，但 README 必须准确：

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm content:check
pnpm seo:check
pnpm build
pnpm verify
```

`pnpm verify` 应执行可重复的发布检查。需要已启动服务的测试，应能自动启动/关闭测试服务或明确提供脚本；禁止给出实际上不存在的命令。必须运行可用检查。被环境阻塞的项目记录为 blocked，而不是把测试跳过后标记全通过。

## 15. Docker、运行与生产上线

交付真实可用的多阶段 Dockerfile、Compose、环境变量示例、初始化脚本、健康检查、日志说明、更新与回滚说明。

- 容器不使用开发服务器跑生产；使用 Next.js 合适的 production/standalone 构建。
- Web 对宿主机默认绑定 `127.0.0.1:13080`，端口可配置；通过宿主机现有反代接入 HTTPS，避免影响用户其他服务。
- redis 和 worker 不对公网开放。worker 所需二进制、字体、语言数据、许可证和字体授权在镜像中或通过受控自托管资源提供。
- Linux amd64 必须构建与演练；arm64 提供可构建方案并在具备环境时测试。未实际验证的架构必须标注，不得伪造双架构认证。
- `docker compose up -d --build` 应能在配置完成后启动完整模式；另提供明确的 core-only 命令/Compose 配置，不能让 core 模式误启动所有依赖。
- `.env.example` 提供安全默认值与解释，生产密钥为空或清晰标记为必须生成，不能使用众所周知默认密码。
- 提供幂等 `setup:secrets` 或等价脚本，只填入缺失配置，不覆盖已有生产密钥，不输出到公共日志。
- 上传大小限制、反代超时、异步任务接口、缓存策略和临时文件限额要相互一致。
- 提供 Caddy 或 Nginx 的一种正式反代示例；不要求另部署第二个反代才能运行。
- CDN 只缓存适宜公开页面/静态资源，不缓存鉴权 API 和文件；多语言 URL 不受 Accept-Language/cookie 缓存串扰。
- 提供健康检查后更新、失败回滚、日志排查和临时文件清理操作；不得通过删除数据卷解决普通更新问题。
- 在 docs/deploy.md 中明确 DNS、TLS、规范域重定向、联系信息、ALLOW_INDEXING、站长平台验证这些需要真实环境配置的事项。

建议环境变量契约，最终实现可以合理扩展但必须逐项解释：

```dotenv
SITE_NAME=HXSL Tools
SITE_URL=https://hxsl.org
DEFAULT_LOCALE=en
APP_PORT=13080
ALLOW_INDEXING=false
ENABLE_SERVER_TOOLS=true
ENABLE_PUBLIC_API=false
ENABLE_ANALYTICS=false
MAX_FILES_PER_BATCH=100
MAX_IMAGE_MB=8
MAX_PDF_MB=50
SERVER_JOB_CONCURRENCY=1
RESULT_TTL_SECONDS=900
CONTACT_EMAIL=
```

页数、像素、并发和超时还必须有独立配置，不得认为仅限制 MB 已足够。生产变更域名或语言等构建时变量后要按说明重建。

## 16. 依赖与许可证

优先成熟、维护中的引擎和与项目目标相容的许可证，记录来源、版本、许可证和替代方案。生成 `docs/third-party-licenses.md` 与必要的 notices/SBOM。

必须核验具体 npm/Python/WASM/系统二进制版本、可部署性、CPU 架构和传递依赖。对有传播/开源或商业授权义务的组件进行明确评估；不得为了赶进度忽略许可证，也不得笼统声称所有“开源”库都能无条件闭源分发。没有核实授权的字体不打包。

若某个候选引擎存在许可或兼容阻塞，优先换成可验证的替代引擎，记录能力差异；无法解决时报告真实阻塞，不装作已有完整能力。

## 17. 在同一个 Goal 内按里程碑推进

M0：仓库与参考功能审计，确定 registry、能力矩阵、架构、许可证候选和输出测试策略。

M1：站点骨架、设计系统、8 语言路由与内容架构、初始 HTML/metadata/sitemap 骨架和开发 CI。

M2：完成图片压缩/转换、SVG 核心向量化和优化、图标包、PDF 页面操作与基础转换；每个工具同时写输出测试，完成三条工具衔接流程。

M3：完成 PDF/Office 高级转换、密码、OCR、redaction、sanitize、签名验证、DXF/DST 等剩余能力，跑完整服务器 worker、权限和清理测试。

M4：完成自主 API/CLI、全部首发语言的真实内容、分类/指南内链、配置与 SEO 全量检查。

M5：回归测试、浏览器截图、性能测量、恶意输入与资源测试、Docker 完整模式和 core 模式演练、部署/回滚文档、最终验收对照。

子任务可并行，但要有清楚文件边界并统一集成；不能多名 agent 同时随意改 registry 和 lockfile。每一阶段失败先定位和修复，不通过减少必需功能或删除断言取得虚假通过。

不要把 M0/M1/M2 自动当成整个 Goal 的完成点。只在全部验收通过，或达到真实阻塞/权限/预算边界并如实交付部分成果时停止。

## 18. 最终交付格式

最终回复必须包括：

1. 实际实现的功能与公开可用语言，链接到完整能力矩阵；明确完整覆盖还是部分覆盖。
2. 每项关键检查的实际执行命令、结果、报告路径与代表性输出文件。
3. 仓库结构、启动/构建/测试/完整部署/core 部署的准确命令。
4. 需要运营者填写的配置项与是否重建，不泄露已经配置的 secret。
5. DNS/TLS/收录提交等真实外部事项是否执行，未执行就明确列出。
6. 输出质量与支持边界，特别是 Office 排版、OCR、数字签名、DXF/DST 和浏览器格式支持。
7. 尚未完成、未测试或被阻塞项及原因、证据和恢复方式。
8. 低维护操作说明、更新回滚与临时文件清理策略。

不得只回复“开发完成”。一个能显示成功 toast 的工具不等于完成；只有真实结果与证据才算完成。

## 附录：实施时应查阅的一手资料

以下为撰写需求时核对过的公开资料入口，实施时仍需按锁定版本复核。参考站功能说明并不是对质量的独立验证。

```text
https://pdfuck.com/
https://svgcreator.com/
https://svgcreator.com/svg-to-embroidery/
https://pipic.cc/
https://pipic.cc/cli
https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
https://nextjs.org/docs/app/guides/internationalization
https://nextjs.org/docs/app/api-reference/functions/generate-metadata
https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
https://next-intl.dev/docs/environments/actions-metadata-route-handlers
https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
https://developers.google.com/search/docs/specialty/international/localized-versions
https://developers.google.com/search/docs/essentials/spam-policies
https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
https://developers.google.com/search/docs/crawling-indexing/block-indexing
https://developers.google.com/search/docs/appearance/structured-data/software-app
https://developers.google.com/search/docs/appearance/core-web-vitals
https://pdf-lib.js.org/
https://qpdf.readthedocs.io/en/stable/encryption.html
https://www.visioncortex.org/vtracer-docs/
https://svgo.dev/docs/usage/browser/
https://sharp.pixelplumbing.com/api-output/
https://tesseract.projectnaptha.com/
https://help.libreoffice.org/latest/en-US/text/shared/guide/start_parameters.html
https://docs.pyhanko.eu/en/latest/cli-guide/validation.html
https://docs.bullmq.io/
https://developer.android.com/develop/ui/compose/system/icon_design_adaptive
```
