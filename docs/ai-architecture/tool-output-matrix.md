# 原有全82工具浏览器输出矩阵

2026-09-08。全部82身份保留；当前共享回归、参数重算、PDF页面操作及标注/版式的真实浏览器证据覆盖51个工具身份，31个仍待输出回归。51中包含2个明确编码能力边界，**不代表51个都成功生成、更不是全部82验收完成**。Registry模式列是技术声明，不替代具体场景的实际上传行为验证。

最新PDF页面操作报告：2026-09-08T14:46:05.145Z，7个新增工具身份/13组真实生产浏览器用例、4图全部实际查看；共享PDF批量9组14:46:14.580Z与参数重算20组14:46:53.887Z回归通过。详见[pdf-pages-review.md](pdf-pages-review.md)。2026-09-08T15:07:04.183Z 在同一7个身份上补了15语言错误与移动排序按钮，29组通过，不新增工具计数，见[pdf-page-accessibility.md](pdf-page-accessibility.md)。2026-09-09T00:37:18.786Z 新增7个本地标注/版式身份、9组生产浏览器下载重开，见[pdf-annotate-review.md](pdf-annotate-review.md)。以下旧阶段截图/时间保留为历史证据，不表示本次全部重拍审查。

最新图片报告：2026-09-08T14:07:12.736Z；PDF/批量报告：14:06:25.148Z；SVG/图标报告：14:06:34.434Z。额外参数重算报告14:06:14.267Z：resize-image和png-to-pdf完整重算/预设/合并输入依赖，15语言失效态；不新增工具身份计数，见[重算契约和证据](recompute-review.md)。使用合成文件、隔离生产Chromium、未登录；本次无上传/站外请求。详细限制见[本轮SVG/图标及共享回归](svg-icon-review.md)、[图片回归](image-output-review.md)和[PDF/批量回归](pdf-batch-review.md)。5个压缩夹具原字节不变，不证明压缩收益。此前Worker/引擎代表测试另见[Worker报告](worker-verification.md)，不能替代未测试的浏览器路线。

| 工具ID | Adapter | Registry模式 | 已有浏览器输出证据 | 报告 |
| --- | --- | --- | --- | --- |
| pdf.merge-pdf | merge-pdf | local | 衔接双PDF合并页序/尺寸通过（非全部用例） | [衔接报告](evidence/local-recompute/pdf-final/report.json) |
| pdf.split-pdf | split-pdf | local | ZIP CRC、两份独立PDF页尺寸重解析通过 | [页面操作报告](evidence/local-pdf-pages/final/report.json) |
| pdf.rotate-pdf | rotate-pdf | local | 原90°/270°叠加旋转、未选页保持、页面源文本通过 | [页面操作报告](evidence/local-pdf-pages/final/report.json) |
| pdf.reorder-pages | reorder-pages | local | 键盘与字段排序、源页内容/顺序、完整61页输出通过 | [页面操作报告](evidence/local-pdf-pages/final/report.json) |
| pdf.extract-pages | extract-pages | local | 选页与缩略图同步、源文本、畸形范围拒绝/恢复通过 | [页面操作报告](evidence/local-pdf-pages/final/report.json) |
| pdf.delete-pages | delete-pages | local | 指定页删除、其余页内容保留、删除全部明确拒绝 | [页面操作报告](evidence/local-pdf-pages/final/report.json) |
| pdf.reverse-pdf | reverse-pdf | local | 三页反序、每页尺寸与源文本对应通过 | [页面操作报告](evidence/local-pdf-pages/final/report.json) |
| pdf.duplicate-pages | duplicate-pages | local | 重复次数/插入位置、原页保留、整数及输出页预算通过 | [页面操作报告](evidence/local-pdf-pages/final/report.json) |
| pdf.pdf-to-png | pdf-to-png | hybrid | 待浏览器输出回归 | — |
| pdf.pdf-to-jpg | pdf-to-jpg | hybrid | 待浏览器输出回归 | — |
| pdf.pdf-to-webp | pdf-to-webp | hybrid | 待浏览器输出回归 | — |
| pdf.png-to-pdf | png-to-pdf | hybrid | 两页PDF/内嵌图像像素通过 | [PDF报告](evidence/local-recompute/pdf-final/report.json) |
| pdf.jpg-to-pdf | jpg-to-pdf | hybrid | 两页PDF/内嵌图像像素通过 | [PDF报告](evidence/local-recompute/pdf-final/report.json) |
| pdf.webp-to-pdf | webp-to-pdf | hybrid | 两页PDF/内嵌图像像素通过 | [PDF报告](evidence/local-recompute/pdf-final/report.json) |
| pdf.pdf-to-text | pdf-to-text | hybrid | 待浏览器输出回归 | — |
| pdf.bmp-to-pdf | bmp-to-pdf | hybrid | 两页PDF/内嵌图像像素通过 | [PDF报告](evidence/local-recompute/pdf-final/report.json) |
| pdf.gif-to-pdf | gif-to-pdf | hybrid | 两页PDF/内嵌图像像素通过 | [PDF报告](evidence/local-recompute/pdf-final/report.json) |
| pdf.svg-to-pdf | svg-to-pdf | hybrid | 待浏览器输出回归 | — |
| pdf.pdf-to-docx | pdf-to-docx | hybrid | 待浏览器输出回归 | — |
| pdf.pdf-to-xlsx | pdf-to-xlsx | hybrid | 待浏览器输出回归 | — |
| pdf.pdf-to-pptx | pdf-to-pptx | hybrid | 待浏览器输出回归 | — |
| pdf.docx-to-pdf | docx-to-pdf | server | 待浏览器输出回归 | — |
| pdf.xlsx-to-pdf | xlsx-to-pdf | server | 待浏览器输出回归 | — |
| pdf.pptx-to-pdf | pptx-to-pdf | server | 待浏览器输出回归 | — |
| pdf.compress-pdf | compress-pdf | hybrid | 待浏览器输出回归 | — |
| pdf.watermark-pdf | watermark-pdf | local | 仅第1页含水印文本，其余页源标记保留 | [标注/版式报告](evidence/local-pdf-annotate/after/report.json) |
| pdf.page-numbers-pdf | page-numbers-pdf | local | 起始7写入 P7 仅第1页 | [标注/版式报告](evidence/local-pdf-annotate/after/report.json) |
| pdf.metadata-pdf | metadata-pdf | local | title/author/subject/keywords 重开核对 | [标注/版式报告](evidence/local-pdf-annotate/after/report.json) |
| pdf.crop-pdf | crop-pdf | local | 第1页裁切框 170×261，未选页宽度不变 | [标注/版式报告](evidence/local-pdf-annotate/after/report.json) |
| pdf.flatten-pdf | flatten-pdf | local | 有字段则字段数为0；无表单仍有效 PDF | [标注/版式报告](evidence/local-pdf-annotate/after/report.json) |
| pdf.header-footer-pdf | header-footer-pdf | local | 仅第2页含 H2/F2 | [标注/版式报告](evidence/local-pdf-annotate/after/report.json) |
| pdf.resize-pdf | resize-pdf | local | 三页画布 320×240，源页面标记未缩放丢失 | [标注/版式报告](evidence/local-pdf-annotate/after/report.json) |
| pdf.sign-pdf | sign-pdf | hybrid | 待浏览器输出回归 | — |
| pdf.unlock-pdf | unlock-pdf | server | 待浏览器输出回归 | — |
| pdf.protect-pdf | protect-pdf | server | 待浏览器输出回归 | — |
| pdf.compare-pdf | compare-pdf | hybrid | 待浏览器输出回归 | — |
| pdf.redact-pdf | redact-pdf | hybrid | 待浏览器输出回归 | — |
| pdf.pdf-ocr | pdf-ocr | server | 待浏览器输出回归 | — |
| pdf.sanitize-pdf | sanitize-pdf | hybrid | 待浏览器输出回归 | — |
| pdf.verify-pdf | verify-pdf | server | 待浏览器输出回归 | — |
| svg.png-to-svg | png-to-svg | hybrid | PNG首帧→原比例真实区域几何，下载独立解码/全像素对照通过 | [SVG/图标报告](evidence/local-recompute/svg-final/report.json) |
| svg.jpg-to-svg | jpg-to-svg | hybrid | JPG首帧→原比例真实区域几何，下载独立解码/全像素对照通过 | [SVG/图标报告](evidence/local-recompute/svg-final/report.json) |
| svg.webp-to-svg | webp-to-svg | hybrid | WEBP首帧→原比例真实区域几何，下载独立解码/全像素对照通过 | [SVG/图标报告](evidence/local-recompute/svg-final/report.json) |
| svg.gif-to-svg | gif-to-svg | hybrid | GIF首帧→原比例真实区域几何，下载独立解码/全像素对照通过 | [SVG/图标报告](evidence/local-recompute/svg-final/report.json) |
| svg.avif-to-svg | avif-to-svg | hybrid | AVIF首帧→原比例真实区域几何，下载独立解码/全像素对照通过 | [SVG/图标报告](evidence/local-recompute/svg-final/report.json) |
| svg.tiff-to-svg | tiff-to-svg | server | 待浏览器输出回归 | — |
| svg.bmp-to-svg | bmp-to-svg | hybrid | BMP首帧→原比例真实区域几何，下载独立解码/全像素对照通过 | [SVG/图标报告](evidence/local-recompute/svg-final/report.json) |
| svg.svg-color-editor | svg-color-editor | hybrid | 待浏览器输出回归 | — |
| svg.svg-palette-swapper | svg-palette-swapper | hybrid | 待浏览器输出回归 | — |
| svg.svg-optimizer | svg-optimizer | hybrid | 直接SVG及会话链优化，几何重解析通过 | [SVG/图标报告](evidence/local-recompute/svg-final/report.json) |
| svg.svg-to-png | svg-to-png | local | 真实352×208 PNG、viewBox-only、15语言超限拒绝 | [SVG/图标报告](evidence/local-recompute/svg-final/report.json) |
| svg.svg-to-webp | svg-to-webp | local | 真实352×208 WebP，格式及尺寸重解析 | [SVG/图标报告](evidence/local-recompute/svg-final/report.json) |
| svg.svg-to-dxf | svg-to-dxf | hybrid | 待浏览器输出回归 | — |
| svg.png-to-dxf | png-to-dxf | hybrid | 待浏览器输出回归 | — |
| svg.jpg-to-dxf | jpg-to-dxf | hybrid | 待浏览器输出回归 | — |
| svg.svg-to-react | svg-to-react | hybrid | 待浏览器输出回归 | — |
| svg.svg-to-base64 | svg-to-base64 | hybrid | 待浏览器输出回归 | — |
| svg.svg-to-favicon | svg-to-favicon | hybrid | 经会话SVG生成真实ZIP、ICO7条目/网页/PWA/Android PNG尺寸 | [SVG/图标报告](evidence/local-recompute/svg-final/report.json) |
| svg.svg-to-dst | svg-to-dst | hybrid | 待浏览器输出回归 | — |
| svg.svg-pattern-maker | svg-pattern-maker | hybrid | 待浏览器输出回归 | — |
| svg.svg-qr-code | svg-qr-code | hybrid | 待浏览器输出回归 | — |
| image.compress-png | compress-png | local | 原字节保留，未压小 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.compress-jpeg | compress-jpeg | local | 原字节保留，未压小 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.compress-webp | compress-webp | local | 原字节保留，未压小 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.compress-avif | compress-avif | local | 原字节保留，未压小 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.image-compressor | image-compressor | local | 原字节保留，未压小 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.png-to-jpg | png-to-jpg | local | 下载独立解码通过 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.jpg-to-png | jpg-to-png | local | 下载独立解码通过 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.png-to-webp | png-to-webp | local | 下载独立解码通过 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.jpg-to-webp | jpg-to-webp | local | 下载独立解码通过 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.webp-to-png | webp-to-png | local | 下载独立解码通过 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.webp-to-jpg | webp-to-jpg | local | 下载独立解码通过 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.png-to-avif | png-to-avif | local | 缺原生AVIF编码：明确失败，无输出 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.jpg-to-avif | jpg-to-avif | local | 缺原生AVIF编码：明确失败，无输出 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.avif-to-png | avif-to-png | local | 下载独立解码通过 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.avif-to-jpg | avif-to-jpg | local | 下载独立解码通过 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.resize-image | resize-image | local | 下载独立解码通过；重名ZIP/部分失败/重试/新增通过 | [图片报告](evidence/local-recompute/image-final/report.json)、[批量报告](evidence/local-recompute/pdf-final/report.json) |
| image.crop-image | crop-image | local | 下载独立解码通过 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.rotate-image | rotate-image | local | 下载独立解码通过 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.image-background | image-background | local | 下载独立解码通过 | [图片报告](evidence/local-recompute/image-final/report.json) |
| image.strip-exif | strip-exif | local | 下载独立解码通过 | [图片报告](evidence/local-recompute/image-final/report.json) |
| icons.icon-pack | icon-pack | local | PNG/SVG两种源的ZIP CRC、ICO7条目、9项PNG尺寸与URL释放 | [SVG/图标报告](evidence/local-recompute/svg-final/report.json) |

剩余状态包括全部场景/格式组合/语言/批量取消/三条链等要求，不因本表某一冒烟通过而自动完成。没有修改implementationStatus为全量verified、隐藏工具或关闭语言。
