# 浏览器语言优先级与六种新语言

## 行为规则

访问不带语言前缀的 `/`：手动语言 Cookie → 浏览器 Accept-Language（按 q 权重）→ 英语。支持地区代码回退，例如 tr-TR→tr、ar-EG→ar、nl-BE→nl、en-GB→en、pt-PT→pt-BR，以及繁简中文地区/脚本匹配。不使用 IP、定位服务或第三方语言检测。

- 仅首页入口协商语言，307 临时跳转，保留查询参数；响应包含 `Cache-Control: private, no-store` 与 `Vary: Accept-Language, Cookie`。
- `/en/...` 等明确语言链接不被 Cookie 或浏览器语言改写，避免共享链接、搜索页面和正在运行的工具被自动跳走。后台、内部接口、资源、sitemap 和未知路径不参与协商。
- 用户在语言选择器中确认选择后保存 `hxsl-locale`，最长一年，Path=/、SameSite=Lax，HTTPS 下加 Secure。只保存语言代码，不保存文件信息；自动识别不会写 Cookie。
- 取消有文件时的切换提示不会改变语言偏好。切换语言会保留当前工具路径；不能无损保留的文件状态仍会明确提醒。清除本站 Cookie 可恢复浏览器自动匹配。隐私页已补充全部 16 种语言的说明。

## 六种新语言

土耳其语 tr / Türkçe、越南语 vi / Tiếng Việt、荷兰语 nl / Nederlands、波兰语 pl / Polski、泰语 th / ไทย、阿拉伯语 ar / العربية。原有十种语言保留。

新增词典覆盖导航、首页、分类、82 工具名称与介绍、参数与选项值、基础错误和状态、隐私与法务页、FAQ、两篇指南、SEO metadata、专用预览标签、主题与语言选择的辅助标签。统一 Registry 驱动 16 语言路由、后台语言列表、canonical/hreflang 和 sitemap 资格。

字典采用有明确字段名的分组源文本，严格检查数量、空值和占位符，不以英语 fallback 冒充新增语言。内容可以通过原有后台继续编辑；幂等 seed 只补缺失记录。新增内容 `humanReviewed=false`，未经母语人工审校。

## RTL 与字体

- 阿拉伯语初始 HTML 与客户端切换均设置 `dir=rtl`，离开阿拉伯语恢复 ltr；后台保持中文/ltr。
- 镜像文字布局、收藏位置和逻辑间距，不镜像文档、绘图画布、PDF 页面排序或数字输入。
- 语言弹层固定保留标题和搜索，16 项列表独立滚动；320px 下键盘可到达最后一项并恢复焦点。
- 实际截图发现宿主机回退 FreeMono 导致阿拉伯语字形分散，改用本地 Noto Sans Arabic 变体子集（165,960 字节，SIL OFL，许可证随文件提供）。仅阿拉伯语文本需要它；没有浏览器端 Google Fonts 请求。

## 现场发现与修复

1. 原站在浏览器 tr-TR 下仍跳转 /en，只有 10 项语言。证据 `before.json`、`before-languages.png`。
2. 首版中间件相对 Location 被 Next 拒绝为 Invalid URL。改用访问 Host 构造绝对地址，可信代理协议只在 TRUSTED_PROXY=true 时使用；没有把 0.0.0.0 监听地址发给浏览器。
3. 工作台已经收到本地化工具名称，重复翻译导致新语言工具页报错。移除重复转换，沿用 ToolShell 的单次翻译边界。失败 trace 保留供复核。
4. 真实 PNG→JPG 文件测试暴露既有 Registry 用整个 slug 是否含 jpg/webp 来推断输入，错误地只接受 JPG。修正图片转换的输入前缀/输出后缀以及单格式压缩的输入声明，并添加所有图片转换方向断言。引擎、稳定 URL 和实际转换实现未重写。

## 检查命令

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm i18n:check
pnpm seo:check
docker compose build web
# 在隔离生产容器 13313 上：
E2E_BASE_URL=http://127.0.0.1:13313 pnpm test:e2e:browser
PRESENTATION_BASE_URL=http://127.0.0.1:13313 PRESENTATION_REPORT_DIR=docs/v3/languages-16-20260908 node scripts/localized-html-check.mjs
PRESENTATION_BASE_URL=http://127.0.0.1:13313 node scripts/locale-expansion-capture.mjs
LH_BASE_URL=http://127.0.0.1:13313 LH_PATHS=/en,/ar LH_REPORT_PATH=docs/v3/languages-16-20260908/performance.json node scripts/lighthouse.mjs
```

## 已知边界

底层引擎的一些原始诊断仍可能是英语。已有管理员内容不被重写；历史自动生成的图片工具介绍/FAQ 可能仍包含旧格式文字，应在后台对照只读技术能力审核并发布。没有修改 OCR 引擎语言包或声称新增六种 OCR 识别能力。未重新验收所有重型服务器引擎、真实用户 p75、原生移动硬件或全部旧后台安全恢复流程。

仓库没有 Git 元数据、AGENTS 或 .trellis 工作流；遵循现有代码和 pnpm 工具链，未创建提交。trellis-before-dev 明确改动边界，seo-hreflang 用于保持明确语言 URL 和互链，trellis-check 用于跨层回归。

## 部署与回退

只更新本项目开发 web，不改 Worker、Redis、DNS、TLS、广告或索引开关。保留数据库卷，不执行 down -v。回退镜像 `hxsl-web:pre-locale-expansion-20260908`。

```bash
docker compose up -d --no-build --no-deps web
# 如需回退：
docker image tag hxsl-web:pre-locale-expansion-20260908 hxsl-web:latest
docker compose up -d --no-build --no-deps web
```

新语言使用既有内容版本表补缺，无破坏性 schema 迁移。回退会恢复十种语言的代码，但不删除新增内容记录；明确的新语言 URL 在旧代码中不可用，语言 Cookie 不会影响旧代码。

参考：[Next.js 国际化](https://nextjs.org/docs/app/guides/internationalization)、[Google 多语言页面指南](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)、[Noto Sans Arabic](https://fonts.google.com/noto/specimen/Noto+Sans+Arabic)。显式语言链接与 hreflang 用于提供可抓取替代版本，不声称搜索引擎已收录。

## 最终结果

2026-09-08 完成此语言增量，未将其作为旧 V3 全范围重新验收。

- lint、typecheck、i18n:check、seo:check 均通过；Registry 3、shared 12、web 68 项单元测试通过。shared 另有 5 项既有宿主机二进制缺失跳过；worker 的既有占位命令不算引擎测试证据。
- 最终隔离生产镜像浏览器测试 28/28 通过（44.0 秒），包括六种语言 PNG→JPEG 下载后独立解析尺寸/格式、无上传、偏好保存、明确 URL、RTL 切换及 320px 键盘流程。报告：`playwright-report/index.html`。
- `localized-html.json`：全部 1,488 个公开语言页面检查通过。此后仅调整荷兰语分类短标签和 RTL 数字方向；最终镜像额外检查全部 93 个荷兰语页面，见 `final-nl/localized-html.json`。没有把这次定向复测描述为又一次全量扫描。
- `sitemap-check.json`：隔离可索引配置有 1,488 个唯一规范 URL，包含 16 种语言和全部 82 个工具，排除后台与退役产品；开发环境仍禁止索引。`http-check.json` 验证语言跳转、管理授权拒绝、未知页 404 和退役页 410。
- `screenshots.json`：最终 18 个桌面/手机、深浅主题、语言弹层及错误状态场景均为 200，无水平溢出、页面异常、外部请求或 axe 违规。实际查看并修复了阿拉伯语字体连接、RTL 文件计数方向，以及荷兰语分类按钮长词折行。保留对应 before 截图，不仅依赖自动断言。
- `font-check.json`：阿拉伯语实际使用本地 Noto Sans Arabic；英语首页不加载阿拉伯语字体。首页 First Load JS 从之前十语言构建约 148kB 增至 177kB，未新增处理引擎或后台入口包。
- `performance.json`：同一隔离生产环境 Lighthouse 英语首页 Performance 94 / Accessibility 100 / SEO 66，阿拉伯语首页 89 / 100 / 66；LCP 分别约 2.90s / 3.37s，CLS 约 0.00003 / 0.00505。开发环境 noindex 保留，SEO 分数不代表正式站已收录。阿拉伯语 Performance 未达旧目标 90；未宣称全面性能达标。真实用户 p75 LCP/INP/CLS 未采集。
- 新增后台单元测试验证六语言补缺、草稿隔离、发布及数据库重开持久化；未重跑旧后台全部 HTTP 安全/恢复流程，未运行完整 `pnpm verify` 或 `scripts/e2e-smoke.mjs`。真实文件回归为上述代表流程，不声称重新验证所有引擎输出。

开发 web 在 2026-09-08 03:49:34 UTC 更新并健康，公网监听仍为 `0.0.0.0:13080`，访问地址 `http://188.68.56.198:13080/`。镜像摘要 `sha256:028981047998e2878629fb38bc176c142ffc288c5a5b5079153a6272649a1e6a`。Worker、Redis 和其他项目未重启，未修改 DNS、TLS 或执行正式发布。

升级前数据库备份位于受限持久卷 `/var/lib/hxsl-admin/pre-locale-expansion-20260908.sqlite`（3,457,024 字节），含管理数据，不放入公共报告或普通内容导出。更新保留数据库卷，新增语言通过幂等补缺导入；旧管理员编辑不覆盖。隔离测试卷保留，未删除数据卷。

公网开发地址最终 17 项检查通过，见 `live-check.json`：浏览器地区映射、手动 Cookie 优先、查询参数、实际公网 Location、六语言首页与工具页的 HTML/互链，以及真实浏览器手动切换后再次访问根路径。已实际查看 `live-ar-mobile.png` 与 `live-language-picker.png`，文字连接、RTL、HX 标志和全部 16 项语言列表可用。自建 13312 开发进程及 13313 隔离检查容器已停止；开发站保持运行，其他项目未改动。
