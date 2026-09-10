# 浏览器图片输出回归与格式契约

本项属于建筑 AI Goal 中的「保留原有文件工具」验收，不是新建转换产品。没有引入 infinite-canvas、开放 API/CLI、外部上传或付费编码服务。完整 Goal 仍未完成。

## 根因与修复边界

- **跨层契约、隐含假设及测试缺口**：原 `canvasImage` 用工具 slug 中是否包含 `jpg`、`webp`、`avif` 推测目标格式，输入格式也会命中；因此 JPG→PNG、WebP→PNG/JPG、AVIF→PNG/JPG 选择错误。浏览器 `toBlob` 返回了 Blob 并不证明其格式与请求一致。
- 原生产构建的真实 Chromium 下载基线检出 **7 项失败**。其中 PNG/JPG→AVIF 在本机缺原生编码器时仍显示成功；AVIF→PNG/JPG 返回 PNG 字节却命名为 `.avif`。不是仅凭静态代码推测。
- 格式转换与专用压缩读取 Registry 的真实 outputFormats；尺寸/裁切/旋转/背景/去元数据和通用压缩继续保留输入格式；内部预处理仍可显式选择 PNG。
- 在交付下载之前检查 Blob 的实际 MIME，空编码结果及回退格式均抛出类型化编码错误。此错误在 15 种现有语言中明确「不支持编码、未上传、可改用 PNG/WebP」，不让本地失败自动转服务器。
- 保留原有同格式压缩无收益时返回原文件的行为。本次小图夹具的五个压缩入口都是原字节不变，不能称为成功压小，也不证明 AVIF 原生重编码已实现。
- 手机错误卡片原为文字/按钮双列，320px 下说明仅约116px宽；改为失败卡片单列、操作按钮下置、错误字体14px。桌面与正常结果布局不重做。

## 可执行回归

先以新的私有临时目录完成隔离生产构建，不使用线上数据库或现有卷：

```bash
hxsl_image_check=$(mktemp -d /tmp/hxsl-image-check-XXXXXX)
NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build \
HXSL_ADMIN_DB_PATH="$hxsl_image_check/admin.sqlite" \
AI_ASSET_DIR="$hxsl_image_check/images" \
AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build
pnpm test:local:images
```

浏览器脚本使用127.0.0.1:13325独立服务和另外新建的临时数据库/文件目录，不读取真实用户文件，不占用13080，不启动供应商或支付。端口必须空闲；不得停止未知占用者。结束关闭自己的进程，合成夹具/证据保留。此次仅构建和隔离运行；上线仍按 `docs/deploy.md` 的备份/更新/回滚流程另行授权。

- 20个图片工具来自完整Registry，未从列表中隐藏不支持的工具；全82矩阵保留PDF40/SVG21/Icons1的未测行。
- 逐工具真实选择文件、处理、下载，再用Sharp独立解码检查格式、扩展名、尺寸及原始/结果字节数。不以按钮或MIME本身代替解码。
- 去除EXIF采用确有EXIF orientation=6的JPEG；验证方向应用后的52×88尺寸、EXIF及orientation字段消失，不再只处理无元数据夹具。
- 所有非GET/HEAD请求和站外请求被记录并阻断，必须均为零；页面异常必须为零。此断言仅证明本次浏览器流程，不代替全站隐私审计。
- 若浏览器确实缺AVIF编码，PNG/JPG→AVIF必须失败且无下载；标记为capability-boundary，不计入生成输出。需要原生/WASM AVIF编码的完整能力仍是缺口。
- 15语言逐页处理同一不支持编码情形；实际错误不能回退英语、不能泄露占位符，且无下载。
- 保存1440桌面、390移动、320深浅主题及中/日/泰错误状态截图。失败卡片错误文本必须占卡片至少85%宽度；指定工作区运行axe WCAG A/AA规则，不声称全站WCAG认证。

## 防复发约束

| 优先级 | 约束 | 当前机制 |
| --- | --- | --- |
| P0 | 输入名称不能决定转换目标 | Registry目标格式函数＋20工具固定预期矩阵 |
| P0 | 编码器回退不能成为伪格式下载 | MIME检查＋生产下载独立解码 |
| P0 | 缺原生编码不上传、不假成功 | 实际Canvas能力探测＋失败状态/无下载/网络断言 |
| P1 | 无压缩收益不能虚报 | 原字节对比、报告unchangedOriginal |
| P1 | 多语言长错误不能挤成窄栏 | 320px截图与宽度断言、工作区axe |
| P1 | 去元数据测试必须有真实元数据 | JPEG带EXIF方向夹具与输出方向/元数据检查 |

未做框架迁移、新图像引擎或公共接口变更。本目录没有Git/Trellis规范或模板，因此契约记录在此，不伪称已提交规范或代码。

## 本轮实际结果（2026-09-08）

- [旧生产构建基线](evidence/local-images/before/report.json)：13项通过、7项真实失败；错误格式的下载文件也保存于outputs。旧测试按预期退出1，不计为通过。
- [格式修复后、布局修复前](evidence/local-images/before-layout/report.json)：18个独立解码结果、2个明确编码边界、15语言错误验证通过；保留狭窄错误栏截图。
- [最终生产浏览器报告](evidence/local-images/after/report.json)：2026-09-08T12:21:24.528Z，20项均符合各自断言；18份有效输出中5份压缩结果原字节不变，另2项缺原生AVIF编码而明确失败。15语言错误、7次工作区axe、零非GET请求/站外请求/页面异常均通过。不能把2项边界写成AVIF成功出图。
- 已实际查看最终7图：JPG→PNG桌面/手机、resize手机、320px英语深色及中/日/泰错误。错误说明现在占满卡片可用宽度，操作按钮下置；未见本截图区域横向溢出、按钮遮挡或窄栏问题。成功卡片仍以原文件名作为主标签，显式结果格式/尺寸摘要可继续完善。
- [全82输出矩阵](evidence/local-images/after/tool-output-matrix.md)保留其余62项not-tested，不假称全工具已验收。
- 新38项格式测试、全Web405/405（0跳过）通过，见[JSON报告](evidence/local-images/web-tests.json)。lint、四包typecheck、脚本独立严格tsc、content:check（82/15）和seo:check（1230工具URL源检查）退出0；后者不是本轮全站HTTP抓取。
- 两次隔离生产build退出0，最终日志[build.log](evidence/local-images/build.log)，首次[build-before-layout.log](evidence/local-images/build-before-layout.log)。生成1466路由；AI工作台116kB、定价110kB、账户112kB、后台136kB First Load JS，不是Lighthouse或真实p75指标。
- 没有改真实数据库、配置、商户或公网容器。隔离监听13325已关闭；没有执行生产部署、DNS/TLS、真实收款/生图或完整verify。

## 仍须跟进

- 全82浏览器输出及完整三条工具链不是本20项检查能证明的；未测项见全工具矩阵。
- 当时发现的 `imagesToPdf` 部分Tool对象缺limits已由下一阶段复现并修复；五种图转PDF及内存合并输出通过，见[pdf-batch-review.md](pdf-batch-review.md)。更广泛的PDF参数与输出回归仍未完成。
- 当时发现的 `downloadZip` 重名覆盖已修复并完成真实部分失败/重名解包/重试/新增验证，见同报告；取消、参数变更和所有批次类型尚未全面验收。
- 本次不是全部格式组合、透明度/ICC/方向完整保真、大像素压力、所有语言完整流程、完整键盘/缩放或Lighthouse/p75验收。
- Google、图像供应商和三家支付真实沙箱及剩余自动资金核对继续属于完整Goal，不能拿本地图片回归替代。
