# V3 全工具迁移与兼容矩阵

生成来源：`packages/tool-registry`（当前 82 个稳定工具）与统一 `ToolShell`。技术能力只读；运营覆盖、内容版本、限制下调和维护状态由 SQLite 发布配置管理。

全量验证：656 个工具语言路由通过 `scripts/e2e-smoke.mjs`；代表性真实输出由 `tests/browser/workflow.spec.ts` 覆盖。

| ID | 路由 | 分类 | 处理方式 | 适配器 | 输入 → 输出 | 实现状态 |
| --- | --- | --- | --- | --- | --- | --- |
| pdf.merge-pdf | /pdf/merge-pdf | pdf | local | merge-pdf | PDF → PDF | verified |
| pdf.split-pdf | /pdf/split-pdf | pdf | local | split-pdf | PDF → PDF | verified |
| pdf.rotate-pdf | /pdf/rotate-pdf | pdf | local | rotate-pdf | PDF → PDF | implemented |
| pdf.reorder-pages | /pdf/reorder-pages | pdf | local | reorder-pages | PDF → PDF | verified |
| pdf.extract-pages | /pdf/extract-pages | pdf | local | extract-pages | PDF → PDF | verified |
| pdf.delete-pages | /pdf/delete-pages | pdf | local | delete-pages | PDF → PDF | implemented |
| pdf.reverse-pdf | /pdf/reverse-pdf | pdf | local | reverse-pdf | PDF → PDF | verified |
| pdf.duplicate-pages | /pdf/duplicate-pages | pdf | local | duplicate-pages | PDF → PDF | implemented |
| pdf.pdf-to-png | /pdf/pdf-to-png | pdf | hybrid | pdf-to-png | PDF → PNG / ZIP | implemented |
| pdf.pdf-to-jpg | /pdf/pdf-to-jpg | pdf | hybrid | pdf-to-jpg | PDF → JPG / ZIP | implemented |
| pdf.pdf-to-webp | /pdf/pdf-to-webp | pdf | hybrid | pdf-to-webp | PDF → WebP / ZIP | implemented |
| pdf.png-to-pdf | /pdf/png-to-pdf | pdf | hybrid | png-to-pdf | PNG → PDF | implemented |
| pdf.jpg-to-pdf | /pdf/jpg-to-pdf | pdf | hybrid | jpg-to-pdf | JPG → PDF | implemented |
| pdf.webp-to-pdf | /pdf/webp-to-pdf | pdf | hybrid | webp-to-pdf | WebP → PDF | implemented |
| pdf.pdf-to-text | /pdf/pdf-to-text | pdf | hybrid | pdf-to-text | PDF → TXT | implemented |
| pdf.bmp-to-pdf | /pdf/bmp-to-pdf | pdf | hybrid | bmp-to-pdf | BMP → PDF | implemented |
| pdf.gif-to-pdf | /pdf/gif-to-pdf | pdf | hybrid | gif-to-pdf | GIF → PDF | implemented |
| pdf.svg-to-pdf | /pdf/svg-to-pdf | pdf | hybrid | svg-to-pdf | SVG → PDF | verified |
| pdf.pdf-to-docx | /pdf/pdf-to-docx | pdf | hybrid | pdf-to-docx | PDF → DOCX | implemented |
| pdf.pdf-to-xlsx | /pdf/pdf-to-xlsx | pdf | hybrid | pdf-to-xlsx | PDF → XLSX | implemented |
| pdf.pdf-to-pptx | /pdf/pdf-to-pptx | pdf | hybrid | pdf-to-pptx | PDF → PPTX | implemented |
| pdf.docx-to-pdf | /pdf/docx-to-pdf | pdf | server | docx-to-pdf | DOCX → PDF | implemented |
| pdf.xlsx-to-pdf | /pdf/xlsx-to-pdf | pdf | server | xlsx-to-pdf | XLSX → PDF | implemented |
| pdf.pptx-to-pdf | /pdf/pptx-to-pdf | pdf | server | pptx-to-pdf | PPTX → PDF | implemented |
| pdf.compress-pdf | /pdf/compress-pdf | pdf | hybrid | compress-pdf | PDF → PDF | implemented |
| pdf.watermark-pdf | /pdf/watermark-pdf | pdf | local | watermark-pdf | PDF → PDF | implemented |
| pdf.page-numbers-pdf | /pdf/page-numbers-pdf | pdf | local | page-numbers-pdf | PDF → PDF | implemented |
| pdf.metadata-pdf | /pdf/metadata-pdf | pdf | local | metadata-pdf | PDF → PDF | implemented |
| pdf.crop-pdf | /pdf/crop-pdf | pdf | local | crop-pdf | PDF → PDF | verified |
| pdf.flatten-pdf | /pdf/flatten-pdf | pdf | local | flatten-pdf | PDF → PDF | implemented |
| pdf.header-footer-pdf | /pdf/header-footer-pdf | pdf | local | header-footer-pdf | PDF → PDF | implemented |
| pdf.resize-pdf | /pdf/resize-pdf | pdf | local | resize-pdf | PDF → PDF | implemented |
| pdf.sign-pdf | /pdf/sign-pdf | pdf | hybrid | sign-pdf | PDF → PDF | verified |
| pdf.unlock-pdf | /pdf/unlock-pdf | pdf | server | unlock-pdf | PDF → PDF | implemented |
| pdf.protect-pdf | /pdf/protect-pdf | pdf | server | protect-pdf | PDF → PDF | implemented |
| pdf.compare-pdf | /pdf/compare-pdf | pdf | hybrid | compare-pdf | PDF → TXT | implemented |
| pdf.redact-pdf | /pdf/redact-pdf | pdf | hybrid | redact-pdf | PDF → PDF | implemented |
| pdf.pdf-ocr | /pdf/pdf-ocr | pdf | server | pdf-ocr | PDF → ZIP | implemented |
| pdf.sanitize-pdf | /pdf/sanitize-pdf | pdf | hybrid | sanitize-pdf | PDF → PDF | implemented |
| pdf.verify-pdf | /pdf/verify-pdf | pdf | server | verify-pdf | PDF → TXT | implemented |
| svg.png-to-svg | /svg/png-to-svg | svg | hybrid | png-to-svg | PNG → SVG | implemented |
| svg.jpg-to-svg | /svg/jpg-to-svg | svg | hybrid | jpg-to-svg | JPG → SVG | implemented |
| svg.webp-to-svg | /svg/webp-to-svg | svg | hybrid | webp-to-svg | WEBP → SVG | implemented |
| svg.gif-to-svg | /svg/gif-to-svg | svg | hybrid | gif-to-svg | GIF → SVG | implemented |
| svg.avif-to-svg | /svg/avif-to-svg | svg | hybrid | avif-to-svg | AVIF → SVG | implemented |
| svg.tiff-to-svg | /svg/tiff-to-svg | svg | server | tiff-to-svg | TIFF → SVG | verified |
| svg.bmp-to-svg | /svg/bmp-to-svg | svg | hybrid | bmp-to-svg | BMP → SVG | implemented |
| svg.svg-color-editor | /svg/svg-color-editor | svg | hybrid | svg-color-editor | SVG → SVG | implemented |
| svg.svg-palette-swapper | /svg/svg-palette-swapper | svg | hybrid | svg-palette-swapper | SVG → SVG | implemented |
| svg.svg-optimizer | /svg/svg-optimizer | svg | hybrid | svg-optimizer | SVG → SVG | implemented |
| svg.svg-to-png | /svg/svg-to-png | svg | local | svg-to-png | SVG → PNG | implemented |
| svg.svg-to-webp | /svg/svg-to-webp | svg | local | svg-to-webp | SVG → WebP | implemented |
| svg.svg-to-dxf | /svg/svg-to-dxf | svg | hybrid | svg-to-dxf | SVG → DXF | implemented |
| svg.png-to-dxf | /svg/png-to-dxf | svg | hybrid | png-to-dxf | PNG → DXF | verified |
| svg.jpg-to-dxf | /svg/jpg-to-dxf | svg | hybrid | jpg-to-dxf | JPG → DXF | implemented |
| svg.svg-to-react | /svg/svg-to-react | svg | hybrid | svg-to-react | SVG → TSX | implemented |
| svg.svg-to-base64 | /svg/svg-to-base64 | svg | hybrid | svg-to-base64 | SVG → TXT | implemented |
| svg.svg-to-favicon | /svg/svg-to-favicon | svg | hybrid | svg-to-favicon | SVG → SVG | implemented |
| svg.svg-to-dst | /svg/svg-to-dst | svg | hybrid | svg-to-dst | SVG → DST | implemented |
| svg.svg-pattern-maker | /svg/svg-pattern-maker | svg | hybrid | svg-pattern-maker | Text → SVG | implemented |
| svg.svg-qr-code | /svg/svg-qr-code | svg | hybrid | svg-qr-code | Text → SVG | implemented |
| image.compress-png | /image/compress-png | image | local | compress-png | PNG / JPG / WebP / AVIF → PNG | implemented |
| image.compress-jpeg | /image/compress-jpeg | image | local | compress-jpeg | JPG → JPEG | implemented |
| image.compress-webp | /image/compress-webp | image | local | compress-webp | WebP → WEBP | implemented |
| image.compress-avif | /image/compress-avif | image | local | compress-avif | AVIF → AVIF | implemented |
| image.image-compressor | /image/image-compressor | image | local | image-compressor | PNG / JPG / WebP / AVIF → PNG / JPG / WebP / AVIF | implemented |
| image.png-to-jpg | /image/png-to-jpg | image | local | png-to-jpg | JPG → PNG / JPG / WebP / AVIF | implemented |
| image.jpg-to-png | /image/jpg-to-png | image | local | jpg-to-png | JPG → PNG / JPG / WebP / AVIF | implemented |
| image.png-to-webp | /image/png-to-webp | image | local | png-to-webp | WebP → PNG / JPG / WebP / AVIF | implemented |
| image.jpg-to-webp | /image/jpg-to-webp | image | local | jpg-to-webp | JPG → PNG / JPG / WebP / AVIF | implemented |
| image.webp-to-png | /image/webp-to-png | image | local | webp-to-png | WebP → PNG / JPG / WebP / AVIF | implemented |
| image.webp-to-jpg | /image/webp-to-jpg | image | local | webp-to-jpg | JPG → PNG / JPG / WebP / AVIF | implemented |
| image.png-to-avif | /image/png-to-avif | image | local | png-to-avif | AVIF → PNG / JPG / WebP / AVIF | implemented |
| image.jpg-to-avif | /image/jpg-to-avif | image | local | jpg-to-avif | JPG → PNG / JPG / WebP / AVIF | implemented |
| image.avif-to-png | /image/avif-to-png | image | local | avif-to-png | AVIF → PNG / JPG / WebP / AVIF | implemented |
| image.avif-to-jpg | /image/avif-to-jpg | image | local | avif-to-jpg | JPG → PNG / JPG / WebP / AVIF | implemented |
| image.resize-image | /image/resize-image | image | local | resize-image | PNG / JPG / WebP / AVIF → PNG / JPG / WebP / AVIF | implemented |
| image.crop-image | /image/crop-image | image | local | crop-image | PNG / JPG / WebP / AVIF → PNG / JPG / WebP / AVIF | implemented |
| image.rotate-image | /image/rotate-image | image | local | rotate-image | PNG / JPG / WebP / AVIF → PNG / JPG / WebP / AVIF | implemented |
| image.image-background | /image/image-background | image | local | image-background | PNG / JPG / WebP / AVIF → PNG / JPG / WebP / AVIF | implemented |
| image.strip-exif | /image/strip-exif | image | local | strip-exif | PNG / JPG / WebP / AVIF → PNG / JPG / WebP / AVIF | implemented |
| icons.icon-pack | /icons/icon-pack | icons | local | icon-pack | PNG / JPG / SVG → ICO / PNG / ZIP | verified |

## 兼容结论

- 每个工具都保留稳定 ID、分类、slug、真实输入输出和处理方式；没有用后台字段创建虚构工具。
- 每个工具页面使用同一套面包屑、能力/限制、文件选择、预检、参数、结果和下一工具链接结构；PDF 页面编辑、签名、裁剪、缩略图排序等专用 adapter 保留。
- 本地工具不会自动回退上传；服务端/混合工具在 `/api/v1/jobs` 创建前仍需要网页会话中的明确同意。
- 后台维护状态会在服务端拒绝新任务；已开始任务不因运营配置变化而静默改写。
- 该矩阵不表示每个引擎的每一种输入输出都在本轮重新实现；历史缺口以注册表实现状态和各工具页限制为准。

启用语言：en, zh-CN, zh-TW, es, pt-BR, de, fr, ja。
