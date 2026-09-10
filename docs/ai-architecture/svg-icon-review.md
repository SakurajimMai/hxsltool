# 本地SVG与图标输出回归

2026-09-08，本组实现与隔离回归完成，完整建筑AI Goal继续。上一阶段Creem修复/测试是progress；保留原82工具，未引入infinite-canvas。

## 本轮边界

已有ToolWorkspace将所有位图向量采样缩为正方形，SVG直接createImageBitmap可能无法解码，图标ZIP使用错误PNG索引填充32/180/192/512尺寸。先在已有生产构建通过浏览器下载、独立Sharp/ICO/ZIP解析核验。

修复范围：共享SVG尺寸/浏览器解码、真实比例几何、图标尺寸和必要Registry输出事实；保持专用处理、稳定路由、现有用户配置/数据库/引擎。新增可复跑脚本与数学/输出约束测试；生产浏览器跑六个位图转SVG、优化、两种SVG栅格化、favicon和PNG/SVG图标输入，验证内存链和截图。

不以本轮代替全部SVG/DXF/DST/安全清理器审计、全部矢量质量、Android应用编译、付费AI联调或未覆盖工具。现有低分辨率像素几何不是CAD/轮廓曲线重建。没有公网部署/生产卷/密钥变更。

## 已实施契约

- `svg-dimensions.ts`：原始宽高/viewBox、px/pt/in等长度、单边尺寸推导、1–4倍缩放、正整数输出与有效像素预算；采样最长边96、短边按比例，不放大。原尺寸viewBox、真实矩形区域、相邻同色合并、保留alpha，没有image/base64包装。
- `svg-canvas.ts`：先接收已有清理器的输出，在独立Blob图片中解码，不把SVG插入主DOM；viewBox-only补明确图像尺寸；10秒真实超时；成功和异常都释放URL/图片引用，Canvas/Bitmap也在finally释放。依据[HTMLImageElement.decode](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode)和[SVG图片上下文](https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_as_an_image)，不是声称已完成清理器全攻击面审计。
- iconPack按实际尺寸缓存、同一输出任务只解码一次输入；ICO16/24/32/48/64/128/256、网页32与180、PWA192与512、Android48/72/96/144/192分别生成。ZIP不是APK。Android adaptive/monochrome仍是原示例资源，不冒称已编译/完整设计合格。
- Registry将SVG favicon真实输出纠正为ZIP；后台运营内容不覆盖。服务器只下发相关工具输入格式，客户端按实际结果后缀筛选“继续处理”；普通相关工具SEO链接保留，不再把ZIP交给图片工具。跨入服务器仍沿用其同意流程。
- 位图输入/向量输出、SVG输入/栅格输出分别可预览，辅助标签复用当前语言；新增无效尺寸/超限/超时45条提示覆盖15语言（非母语人工审校）。

## Bug Analysis: 真文件与截图揭示的输出缺陷

### 1. Root Cause Category

E（隐含假设）：假定所有输入都是正方形、SVG可直接createImageBitmap、数组某索引就是文件名标注的尺寸。B/D（跨层与覆盖缺口）：Registry声明与真实ZIP不符、没有把下载独立解析或缩小预览纳入验证。

### 2. Why Fixes Failed

原生产构建12组仅1通过；失败证据在`evidence/local-svg/before`。首轮修复后，JPEG检查错误地与编码前颜色比较；独立Sharp解码证明输入和输出首像素均36/90/66（原画21/94/82），改为所有像素与实际压缩输入解码比较、每通道误差不超过4，并非删除颜色断言。

首轮图标尺寸已修正，但axe报`aria-prohibited-attr`，给遮罩容器补`role=group`。之后14/15通过，实际看图发现SVG预览偏暗；新增浏览器Canvas断言测得不透明区域缩小后alpha最低191而非255，区域边缘抗锯齿出现缝隙。仅对像素区域输出加crispEdges，保留原透明度，不改用户输入SVG的绘制策略。

再看390px图标截图发现摘要被按钮挤窄；新增摘要宽度≥卡片85%断言，在原布局失败，扩展原320px成功卡片单列规则至640px。保留原有桌面布局，不全站重设计。

### 3. Prevention Mechanisms

| 优先级 | 可执行规则 |
| --- | --- |
| P0 | SVG几何独立解码、原比例、实际输入全像素；低分辨率预览alpha不能新增透明缝 |
| P0 | ICO目录偏移/长度/尺寸及7个PNG全部重解析；ZIP CRC、真实PNG尺寸与manifest一致 |
| P0 | PNG→SVG→优化→favicon真实会话文件链，输出不兼容时无继续入口；无上传/站外请求 |
| P1 | 15语言实际超限错误；清空队列后对象URL归零；前后台源回归与截图/axe |

### 4. Systematic Expansion

DXF/DST中原简化几何/默认方框、SVG清理器、全部语言参数/状态、运行取消、现有hybrid隐私说明和完整预设依然需要独立验收。不能把本组矩形几何/ZIP解析扩称全部工具正确。

### 5. Knowledge Capture

按trellis-before-dev/trellis-check/trellis-break-loop记录范围、断言与根因；项目无Git/Trellis，不虚构提交或spec模板同步。最终报告和全82矩阵继续写入本目录。

## 最终证据与截图审查

- [SVG/图标最终报告](evidence/local-svg/after/report.json)：2026-09-08T13:48:36.713Z，16组通过，7次工作区axe无违规，无页面错误/上传/站外请求。新增11个工具身份：六个位图转SVG、优化、PNG/WebP栅格化、favicon、icon-pack（后者PNG和SVG均验）。不代表全部输入或全部浏览器。
- 六种输入几何保留88×52比例，下载后Sharp独立解码对照输入全像素；PNG半透明128/透明0实际保留；SVG→PNG/WebP单边176＋2倍输出实际352×208，viewBox-only实际88×52。缩小预览不再有191/255透明缝。图标ZIP重解CRC、实际PNG尺寸、manifest与七条ICO目录/偏移/图像；清空PNG/SVG图标队列后对象URL均归零。
- PNG→SVG→优化→favicon通过真实页面和会话文件衔接，不重新选择源文件。ICO包含在真实ZIP中；ZIP结果没有不兼容的继续入口，普通相关链接仍存在。15语言真实尺寸超限均失败且没有下载；超时/无效尺寸其余文案有源测试，未声称所有错误均浏览器验收。
- [图片回归](evidence/local-svg/image-regression/report.json)：13:48:28.992Z，20入口，18份输出独立解码，2项AVIF编码能力边界明确失败，15语言编码错误、EXIF及零上传检查保留。
- [PDF/批量回归](evidence/local-svg/pdf-regression/report.json)：13:48:27.998Z，9组通过，五种图转PDF真实页数/像素、内存合并、部分成功/ZIP重名/重试、像素限制、15语言摘要和实际下载均保留。
- `checks/web-tests.json`：540通过、零失败/跳过，新增38项SVG尺寸/语言/几何和6项衔接判断。`checks/workspace-tests.log`：Registry5、Worker8、Web540、共享12通过，宿主5缺引擎仍跳过，未重跑隔离引擎。lint、四包typecheck、脚本严格类型、内容82×15、SEO1230工具URL源检查通过；不是所有初始HTML、完整verify或真实付费服务验收。
- 四次隔离生产build通过，最后一次包括手机640px样式。`checks/build-before-a11y.log`、`build-before-seams.log`、`build-before-mobile.log`和`build.log`保留。相对上一阶段工具页First Load JS407→410kB；首页173kB、AI工作台116kB、账户112kB、定价110kB、后台137kB。未测新Lighthouse或真实用户p75，不能称性能目标已达标。

实际看过旧基线3图、首轮2图，并新增像素与布局断言。最终`after/`7张全部实际查看：vector-mobile、svg-raster-desktop、icons-png-mobile、icons-svg-mobile、chain-mobile、limit-zh-CN、limit-th。原尺寸正确、输出预览色彩恢复，390px摘要改完整宽度，320px中文/泰语错误不被按钮挤压。

共享回归额外实际查看5图：image-regression的jpg-to-png、png-to-avif-th；pdf-regression的partial-batch、chain-merged、summary-zh-CN。其余10张回归图已采集并完成自动工作区检查，本轮未逐张人工看图，不冒称全站视觉审查。三组共22次工作区axe通过，不等于完整WCAG/键盘/200%与400%缩放验收。

保留失败记录：before原11/12失败；first-fix的JPEG夹具错误和icon aria违规；before-preview-seams的alpha191失败；before-mobile的两项390px宽度失败。测试脚本Buffer泛型初次严格检查失败也保留`checks/script-types-before.log`，显式参数类型修正后通过，不关闭strict。

## 可复跑与部署边界

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm seo:check
pnpm exec tsc --noEmit --strict --skipLibCheck --module ESNext --moduleResolution Bundler --target ES2022 --esModuleInterop --allowImportingTsExtensions --typeRoots apps/web/node_modules/@types --types node scripts/local-svg-icon-check.mts
hxsl_svg_build=$(mktemp -d /tmp/hxsl-svg-build-XXXXXX)
NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build HXSL_ADMIN_DB_PATH="$hxsl_svg_build/admin.sqlite" AI_ASSET_DIR="$hxsl_svg_build/images" AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build
pnpm test:local:svg
HXSL_IMAGE_EVIDENCE_DIR=docs/ai-architecture/evidence/local-svg/image-regression pnpm test:local:images
HXSL_PDF_EVIDENCE_DIR=docs/ai-architecture/evidence/local-svg/pdf-regression pnpm test:local:pdf-batch
```

脚本使用私有SQLite/合成文件/生产standalone，监听127.0.0.1:13329；先确认空闲，不停止别人的进程。回归另用13325/13326；最终全部关闭。无schema迁移、依赖升级、真实Google/生图/支付调用或公网更新，未做本轮Docker重建。正式更新仍按[备份与回退说明](backup-restore.md)使用schema7兼容版本和持久盘，不能把旧数据库覆盖当前账本。

全82矩阵累计37个身份有浏览器证据（含2编码边界），45仍待输出回归。完整版AI外部联调、支付资金核对、其他工具/参数状态/清理器/性能均未完成，见[完整验收](acceptance.md)。
