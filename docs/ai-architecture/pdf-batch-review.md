# 图片转PDF、批量ZIP与文件衔接回归

本轮属于建筑AI完整Goal的原工具不倒退验收。保留现有Next/React/pdf-lib/JSZip、免登录网页、本地处理和稳定URL；没有引入infinite-canvas、公共转换API/CLI或付费服务。

## 根因与修复

1. **接口契约被类型断言绕过**：图片转PDF给`canvasImage`传递缺少limits的对象，再断言为完整Tool。真实PNG/JPG/WebP/BMP/GIF均报读取maxPixels失败。改为明确的Pick类型，图片预处理使用当前工具的有效limits，不再制造假的完整Tool。
2. **ZIP键唯一性假设错误**：直接以文件名写ZIP导致重复名字覆盖；页面3个成功，真实ZIP只有2项。新增纯函数分配平面条目名，处理路径、控制字符、Windows保留名、大小写和Unicode规范化碰撞，预留原本就有的`(2)`文件名；按UTF-8限制长度并保留扩展名，不改变单文件下载名或原File对象。
3. **可变FileList与延迟更新**：原addFiles在React状态更新器中才展开FileList，输入事件随后清空选择器。衔接到合并工具后新增文件两次实际失败；加强“选择后队列必须有两项”的断言仍失败，排除仅处理等待不足。改为在事件调用时立即复制FileList，然后在更新器中按当前队列容量接纳快照。
4. **技术限额声明缺口**：五种图片转PDF入口未声明maxPixels，导致有效配置层忽略部署/运营像素上限。测试中5000像素上限仍允许6000像素输入。Registry补充4000万技术上限，通过已有配置服务向下约束；管理员草稿不影响发布值、发布生效与数据库重开保留均有测试。
5. **显示缺失与内容快照**：原限制说明不显示maxPixels，即使处理层拒绝，页面也看不到预算。补15语言、按语言格式化数值的动态像素说明。新生成的可编辑FAQ不再嵌入运行限额快照，避免技术默认4000万与实际5000并列；数字限额由有效配置区显示。没有覆盖已有管理员内容，历史FAQ中手工/旧种子写入的固定数值仍需在后台审阅。

同格式图片处理及PDF纸张、方向、边距、背景、分组顺序均保留。没有引入新的压缩/转换引擎，也没有修改持久库schema或生产部署值。

## 契约与测试

| 契约 | 实际检查 |
| --- | --- |
| 每个图片转PDF入口生成正确输出 | PNG/JPG/WebP/BMP/GIF真实浏览器两图输入；重新解析PDF页数、88×52/44×30页序与尺寸；解压内嵌图像像素校验来源颜色，不接受空白页 |
| 会话内工具衔接 | PNG结果通过普通“继续处理”链接进入Merge PDF，内存File自动入队；再选择一份99×77 PDF，解析合并输出为88×52、99×77两页 |
| 批量部分失败不丢成功 | 三个有效重名PNG＋损坏PNG＋空PNG＋不支持文件，3成功/3失败；ZIP CRC校验、三条目独立解码及尺寸核对 |
| 重试/增加文件 | 损坏项重试仍失败且原3成功不丢；另选第四个重名有效PNG后ZIP有4条目，逐个解码 |
| 路径和重名安全 | 8项单元测试，含重复、预占后缀、大小写、路径、控制字符、Unicode、长多字节扩展名与空批次 |
| 配置与本地处理一致 | 测试进程MAX_DECODED_PIXELS=5000，100×60输入被拒绝；页面限制和错误显示5000，无结果下载；后台配置服务测试覆盖5个入口的草稿/发布/重开 |
| 隐私与隔离 | 新临时数据库/文件目录、loopback13326；拦截所有非GET/HEAD及站外请求，必须为零；无用户数据或真实供应商 |
| 页面可用性 | 1440桌面、320深色、390批量/衔接截图及工作区axe；不是全站无障碍或所有语言验收 |

## 复跑

```bash
hxsl_pdf_check=$(mktemp -d /tmp/hxsl-pdf-check-XXXXXX)
NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build \
HXSL_ADMIN_DB_PATH="$hxsl_pdf_check/admin.sqlite" AI_ASSET_DIR="$hxsl_pdf_check/images" \
AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build
pnpm test:local:pdf-batch
HXSL_IMAGE_EVIDENCE_DIR=docs/ai-architecture/evidence/local-pdf-batch/image-regression pnpm test:local:images
```

13326及13325必须空闲，不要停止未知占用者。脚本只关闭自己创建的进程；合成产物保留。`--baseline`只是输出到before目录，不放宽断言，不将失败冒称成功；复跑会更新该目录中的报告，须先保留需要的历史证据。该检查是内部维护脚本，不是恢复面向用户的CLI产品。

## 本轮实际结果

最新真实结果（2026-09-08）：

- [旧构建基线](evidence/local-pdf-batch/before/report.json)7组失败；PNG程序错误和3成功却ZIP只有2项的截图/产物保留。脚本最初因函数名覆盖Node process而启动失败，修正命名后才获得这份实际浏览器基线，不把启动失败当网站问题。
- `chain-investigation/`及`before-filelist/`保留继续处理后新增文件丢失；`before-pixel-limit/`保留超像素仍成功；`before-pixel-copy/`保留处理拒绝但页面未显示限制的失败证据。没有删除必要断言或扩大等待时间来掩盖问题。
- 最终[PDF/批量报告](evidence/local-pdf-batch/after/report.json)：2026-09-08T12:40:21.618Z，8/8；5种两页PDF、内嵌图像解压验证、内存衔接合并、3→4个ZIP条目/CRC/尺寸、失败重试保留成功及5000像素限额一致性均通过。
- 最终[图片回归](evidence/local-pdf-batch/image-regression/report.json)：2026-09-08T12:40:49.876Z，20入口全部执行；18份独立解码（其中5份原字节保留）、2项明确缺原生AVIF编码，没有假出图。15语言编码错误与原EXIF回归保留。
- 5张PDF/批量截图＋7张图片截图均实际查看，12次工作区axe无违规，所有上传/站外/页面异常列表为空。观察到的分组结果比例和历史模式文案问题仍列于下方，不能因为axe通过就称UI全部完成。
- Web430/430（新增8命名＋16像素文案＋1发布配置）、Registry4、Worker8、宿主共享12通过；宿主共享5项缺二进制而跳过，不能当本轮真实运行。全根日志[workspace-tests.log](evidence/local-pdf-batch/workspace-tests.log)，Web独立[JSON](evidence/local-pdf-batch/web-tests.json)。lint/四包typecheck/两脚本严格tsc/content82×15/SEO1230源检查均退出0。
- 五次隔离生产build均退出0，最终[build.log](evidence/local-pdf-batch/build.log)，中间四份build-before日志保留。1466路由；首页173kB、AI工作台116kB、定价110kB、账户112kB、后台136kB，不是Lighthouse或p75。13325/13326已无监听，未部署公网。
- [全82累计矩阵](tool-output-matrix.md)覆盖26个工具身份（含2个编码边界），56个仍待浏览器输出回归，不隐藏未测项。

## 仍未完成/未覆盖

- 其他PDF/SVG/图标的完整浏览器输出、所有工具链、取消、过期及全语言主流程继续属于总Goal；不以本组检查替代。
- 当时发现的首条卡片按单个输入计算比例及贡献行归属不清，已由后续[result-summary-review.md](result-summary-review.md)修复并通过15语言真实下载核对；运行中移除、输出所有者删除及分组取消仍需完整状态机验收。
- 图片转PDF的历史hybrid模式说明/已发布隐私FAQ仍可能笼统声称服务器处理；本次实际网页网络验证无上传，但全部历史多语言能力文案的纠正仍未完成，不擅自覆盖管理员已发布内容。
- 本次GIF只验证首帧，不宣称动画全帧；SVG→PDF仍为独立服务器路径，未以栅格图冒充矢量结果。
- 像素拒绝在浏览器解码得到尺寸后执行，不是对极端压缩图的解码前内存防护证明；损坏/限额等全部错误的完整15语言覆盖仍待补。
- 未完成真实Google、图像供应商、三家支付沙箱及剩余自动资金核对；没有公网发布、DNS/TLS变更、实际收款或生成费用。

按照trellis-check/trellis-break-loop保留失败证据并补跨层契约检查。本目录没有Git/Trellis规范模板，根因记录在此，不声称已提交或同步不存在的模板。
