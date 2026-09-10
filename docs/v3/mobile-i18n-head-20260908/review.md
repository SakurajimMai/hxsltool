# 移动端、多语言与 Head 配置升级（2026-09-08）

## 范围与实际修改

- 保留 HX 标识、现有目录式 UI、Next.js 15 / React / TypeScript / pnpm 和文件引擎。没有重建空壳、接入外部转换 API 或修改 DNS。
- 手机首页缩短标题区、副标题降为说明层级；搜索置前；六个分类按钮两行完整显示；增大导航、收藏、表单触控尺寸；修复 320px 搜索区域溢出。桌面保留原布局。
- 语言切换改为原生模态 dialog、可搜索的自称语言列表，支持 Esc、焦点恢复、保留工具路径，更新 document.lang。已有文件时先提醒切换会重置工作区；不承诺保留运行中任务。
- 新增韩语 ko 与意大利语 it，共 10 种语言。覆盖导航、目录、工具名称、参数、FAQ、页面正文、指南、metadata 和专用预览标签。新翻译未标记为母语人工审校。
- 补齐现有语言的参数选项值、页面排序标签、空文件/不支持格式/体积超限预检、结果体积变化标签。修正转换变大时出现负数“larger”的显示。
- Locale Registry 同步路由、后台语言列表、站点配置、缓存刷新、canonical/hreflang 和 sitemap。
- 后台“站点与内容”新增受控 Meta 编辑、广告接入准备字段和布局预览。沿用 SQLite settings/site、草稿、显式发布、审计、备份导入导出及持久卷。
- 发布刷新根布局与 sitemap；页面只有一个 description，使用 Next metadata 输出至初始 head。修复管理请求来源校验把 0.0.0.0 监听地址当成浏览器访问主机的问题；仍保留来源、CSRF、会话、重新认证检查。

redesign-existing-projects 指导了先审查再局部修正的方式；trellis-before-dev / trellis-check 用于规范与跨层检查。仓库无 .trellis 规范且无 Git 元数据，未做 git reset/checkout 或覆盖用户部署配置。

## 管理员使用方法

1. 使用原有管理员进入 /admin → **站点与内容**。
2. 在 **Head / Meta 标签** 添加 name、content。支持 Google、Bing、Yandex、Pinterest、Facebook 的验证名称，application-name、author、copyright、google-adsense-account，以及以 x- 开头的自定义名称。
3. 最多 20 项；每项内容 1–500 字纯文本；重复、HTML、控制字符和非允许字段会被服务器拒绝。这里不接受脚本、iframe、http-equiv、robots、viewport、canonical、OG 或 title/description 覆盖。
4. **保存草稿**不改变公开页面。**发布站点内容**后新请求的原始 HTML 生效。过期编辑版本会被拒绝，需要刷新后重新编辑；高风险发布需要最近认证。
5. title/description 仍通过原有多语言工具内容编辑。正式域名、索引资格和安全策略仍由部署配置控制。
6. 配置导出包含 Meta 与公开广告 ID，不含账号秘密。导入仍进入草稿，发布时重新验证；本轮测试了恢复到此前站点设置。

## 广告边界

当前只是**准备接入**，不是已经接通 AdSense / Google Ads：

- 可保存 AdSense 发布商 ID（ca-pub- + 16 位数字）、首页/分类广告位 ID（10 位数字）。
- 首页和分类页的列表后方是规划位置，后台可看尺寸布局预览。现阶段前台不展示空广告块、不加载广告脚本，也没有启用按钮冒充广告已生效。
- 不在文件处理、预览、结果或后台注入广告。
- 正式启用仍需真实账号/站点审核、同意管理、隐私说明和隔离方案。不会通过 Meta 输入绕过 CSP。
- Google Ads 推广投放与 AdSense 展示广告是不同产品；没有创建广告活动、花费或关联账户。

参考：[Next metadata 官方说明](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)、[Google 发布商同意管理要求](https://support.google.com/adsense/answer/13554116?hl=en)。这些是接入边界，不代表已经取得审核或合规认证。

## 验证与证据

- pnpm lint、pnpm typecheck、pnpm i18n:check、pnpm seo:check：通过；82 工具、10 语言、820 工具 URL。
- pnpm test：Registry 2、shared 12、web 21 项通过。shared 有 5 项既有测试因宿主机缺少 qpdf/poppler/tesseract 程序自动跳过；本轮没有新增 skip。worker 的既有 test 命令只打印说明，不能视为真实 worker 引擎验收。
- 浏览器回归 19 项通过，覆盖真实下载/解析的 PDF、SVG、DXF、DST、图标 ZIP、图片与会话内衔接，以及新语言、手机重排和焦点检查。
- scripts/presentation-admin-check.mjs：在隔离 HTTPS 环境验证初始化/登录、未登录拒绝、CSRF、跨站拒绝、乐观锁、草稿隔离、发布后 head、秘密排除导出与恢复。结果见 admin-check.json。
- scripts/mobile-presentation-capture.mjs：12 组生产构建截图，320/360/390/768/1440px、深浅主题、语言弹层、错误状态；自动检查 0 溢出、0 pageerror、0 第三方请求、0 axe 违规。见 screenshots.json。
- 实际查看 mobile.png、mobile-dark.png、languages.png、tool-mobile.png 及后台三张截图；根据截图再修正标题末行孤字及语言列表过长。修正后的截图覆盖同名文件，原基线保留为 before-mobile.png。
- 初次浏览器运行暴露 320px 溢出和 client navigation 后 html lang 不变，修复后复测通过。一次开发冷编译导致搜索跳转超时，预热后原断言通过；未放宽断言。
- 初次管理检查因错误来源校验失败；随后生产 HTTP 因 Secure Cookie 不发送而失败。修复来源判断后使用隔离自签名 TLS 代理完成验证，没有降低生产 Cookie 安全性。

全语言 HTML 报告、最终容器重建和开发站状态见下方补充结果。

## 尚未完成／不作承诺

- 新增语言未经母语人工审校；高级底层引擎的一些原始诊断仍可能是英语，没有宣称每一条引擎错误都已翻译。
- 不覆盖管理员已经发布的旧内容。旧记录中既有的通用模板正文和英文参数帮助不会在启动时被 seed 强行覆盖。
- 没有正式接入广告、CMP、统计平台、DNS/TLS 公网发布或站长提交；不承诺广告收益或收录。
- 没有重新验收所有服务器重型引擎、生产数据恢复、真实移动硬件或真实用户 p75 指标。
- 本轮性能及质量结果只代表报告中的具体环境和场景。

## 构建、更新与回退

~~~bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm i18n:check
pnpm seo:check
docker compose build web
docker compose up -d --no-build --no-deps web
~~~

原有 /var/lib/hxsl-admin 管理数据库卷和用户临时任务卷必须保留，普通更新不执行 down -v。本轮只是给 settings/site JSON 增加可选字段，新语言内容通过既有幂等 seed 补缺，不覆盖现有记录。部署前按 docs/deploy.md 的受限流程备份数据库。

开发镜像回退点：hxsl-web:pre-mobile-i18n-head-20260908。仅回退本项目 web：

~~~bash
docker image tag hxsl-web:pre-mobile-i18n-head-20260908 hxsl-web:latest
docker compose up -d --no-build --no-deps web
~~~

回退不删除卷；旧版本只显示原先 8 种语言，但数据库新增语言记录仍保留。旧版本不理解新 Meta 字段，若决定长期回退，应恢复升级前受限数据库备份，而不是让旧版本编辑并丢弃新增字段。

## 最终实测与开发部署

- 最终隔离生产构建：952 个生成页面；首页 First Load JS 148 kB（前次 134 kB），分类页 123 kB、工具页 380 kB、后台 121 kB。增加语言和交互有体积成本，未宣称构建体积下降。
- 最终生产浏览器回归：19/19 通过，25.4 秒。可打开本目录 `playwright-report/index.html`；开发环境同样 19/19 通过。
- `localized-html.json`：930 个公开页面（10 语言，82 工具、首页、4 分类、4 法务页、2 指南），状态码、lang、唯一 description、H1、title、自引用 canonical 和 10 语言 + x-default 链接通过。不是搜索引擎实际收录报告。
- `persistence.json`：在持久卷 `hxsl-mobile-meta-admin-20260908` 发布 Meta 后重建隔离容器，标记仍能从原始 HTML 读取。隔离管理员和测试标记没有写入开发站数据库。
- 更新前数据库备份已在原有受限管理卷创建：`/var/lib/hxsl-admin/pre-mobile-i18n-head-20260908.sqlite`（2,777,088 字节）。它含账号数据，不在公开报告目录，不应作为普通内容导出分享。
- 执行 `docker compose up -d --no-build --no-deps web`，只重建本项目 web；Worker、Redis、数据卷未重启或删除。新镜像 config digest：`sha256:548e767d8cbb0a0e3445a29f70804944c72f5c91a590f03d4c37938a239587fa`。
- 开发地址 `http://188.68.56.198:13080/` 已更新。`live-check.json` 核验中文/韩语/意大利语首页与韩语 PDF 工具：200、390px 无溢出、正确语言、唯一 description、11 个语言关系、无广告脚本、无隔离测试标记。`live-mobile.png`、`live-languages.png` 为实际开发站截图，已人工查看。
- canonical 继续采用原有 `https://hxsl.org` 配置，未写死裸 IP；开发环境禁止索引保持不变。DNS、正式 TLS、站长提交、广告接入均未执行。
- 验收后关闭本轮临时开发服务（13302）、隔离 TLS 代理（13304）和隔离容器（13303）；保留隔离数据卷及停止的容器供复核，没有删除数据。本项目开发站 13080 继续运行。

### 性能对比（实验室，非真实用户 p75）

同宿主机、隔离生产容器、Lighthouse 12.3.0；运行时刻不同，不是受控统计实验。原始报告：`performance*.lighthouse.json`，汇总：`performance.json`。

| 页面 | 前次 Performance | 本次 Performance / Accessibility / SEO | 本次 LCP | 本次 CLS |
| --- | --- | --- | --- | --- |
| 英语首页 | 95 | 95 / 100 / 66 | 2715 ms | 0.000034 |
| 合并 PDF | 96 | 96 / 100 / 66 | 2527 ms | 0.001038 |
| 图片压缩 | 98 | 96 / 100 / 66 | 2561 ms | 0.001038 |

SEO 未满分项为 `is-crawlable`：隔离环境 ALLOW_INDEXING=false；没有为测试改为允许收录。首页前次 LCP 约 2542 ms，本次 2715 ms，未达到 2.5 秒目标；后续需继续压缩语言/交互启动负担。没有真实用户 INP、LCP/CLS p75 数据，也没有移动真机实验。

### 复跑本轮专项检查

~~~bash
# 先以持久的隔离数据库在 127.0.0.1:13303 启动生产容器。
E2E_BASE_URL=http://127.0.0.1:13303 pnpm test:e2e:browser
PRESENTATION_BASE_URL=http://127.0.0.1:13303 node scripts/mobile-presentation-capture.mjs
PRESENTATION_BASE_URL=http://127.0.0.1:13303 node scripts/localized-html-check.mjs
LH_BASE_URL=http://127.0.0.1:13303 LH_REPORT_PATH=docs/v3/mobile-i18n-head-20260908/performance.json node scripts/lighthouse.mjs
~~~

管理专项使用 `scripts/presentation-admin-check.mjs`，必须是新隔离数据库、loopback 地址和显式 `PRESENTATION_INIT_TOKEN`；生产 Cookie 测试需 HTTPS。可通过 `scripts/isolated-tls-proxy.mjs` 配合仅用于测试的证书，设 TEST_TLS_DIRECTORY、PRESENTATION_BASE_URL=https://127.0.0.1:13304。不要对用户数据库运行初始化/发布测试，或把测试凭据用于正式部署。
