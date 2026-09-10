# 移除阿拉伯语（2026-09-08）

按站点所有者最新要求移除阿拉伯语，其他 15 种语言保留。此增量替代上一轮 16 语言验收中的阿拉伯语发布状态；历史报告与截图不改写。

## 生效规则与范围

- 统一 Registry 不再包含 `ar`，前台语言选择、后台支持语言、搜索数据、静态路由生成、hreflang、结构化数据和 sitemap 均使用其余 15 种语言。
- 根路径仍以有效手动偏好优先，其次浏览器语言，最后英语。旧 `hxsl-locale=ar` 不再有效，浏览器 `ar-EG,th;q=0.8` 选择泰语，只有阿拉伯语时选择英语。
- `/ar` 和 `/ar/...` 返回真实 404，不将退役语言页面全部重定向首页。其他明确语言 URL 不受浏览器偏好影响。
- 阿拉伯语词典不再被运行时导入，移除字体样式引用，不再请求阿拉伯语字体。原词典源文件和未引用字体保留以便恢复，不作为启用语言或后台编辑入口。
- 数据库历史内容、审计和备份不删除、不覆盖。读取已发布内容也会拒绝不支持的语言。普通内容导出仍保留历史版本，导入按已有语言校验忽略不支持语言；完整数据库备份可恢复历史。
- 不修改文件引擎、内部接口、其他语言翻译、域名、TLS、广告或索引配置。

## 可执行检查

```bash
pnpm --filter @hxsl/tool-registry build
pnpm lint
pnpm typecheck
pnpm test
pnpm i18n:check
pnpm seo:check
docker compose build web
E2E_BASE_URL=http://127.0.0.1:13315 pnpm test:e2e:browser
PRESENTATION_BASE_URL=http://127.0.0.1:13315 PRESENTATION_REPORT_DIR=docs/v3/languages-15-20260908 node scripts/localized-html-check.mjs
PRESENTATION_BASE_URL=http://127.0.0.1:13315 node scripts/locale-expansion-capture.mjs
```

## 部署与恢复

仅更新 HXSL 开发 web，保留所有持久卷，不重启 Worker、Redis 或其他项目。升级前数据库一致性备份在受限卷 `/var/lib/hxsl-admin/pre-remove-arabic-20260908.sqlite`，其中包含敏感管理数据，不能作为公开下载提供。更新前确认有 82 条阿拉伯语历史内容记录。

回退镜像 `hxsl-web:pre-remove-arabic-20260908`；恢复镜像会重新启用阿拉伯语，不需要删除或覆盖数据库。

```bash
# 本次开发 web 更新
docker compose up -d --no-build --no-deps web
# 仅需要撤销本次变更时
docker image tag hxsl-web:pre-remove-arabic-20260908 hxsl-web:latest
docker compose up -d --no-build --no-deps web
```

## 验证结果

- `pnpm lint`、`pnpm typecheck`、`pnpm i18n:check`、`pnpm seo:check` 通过：82 工具、15 语言、1,230 个工具语言路由。
- 单元测试：Registry 3、shared 12、web 69 项通过。shared 的 5 项既有宿主机二进制缺失跳过未计入通过；worker 既有占位命令不作为处理验证。新增历史语言测试起初遇到本仓库 SQLite 类型声明差异，已修正并重跑 lint/typecheck 和完整 web 测试通过。
- 隔离生产构建通过，First Load JS 首页 173kB（移除前 177kB）。28 项生产浏览器测试全部通过（1.4 分钟），包括五种新增语言真实 PNG→JPEG、PDF 排序/签名/裁切、SVG/图标等既有代表流程，以及退役语言回退与 404。报告：`languages-15-20260908/playwright-report/index.html`。
- `retirement-check.json`：93 个旧阿拉伯语路由全部真实 404；隔离启用索引的 sitemap 有 1,395 个唯一 URL，仅保留 15 种语言。根路径旧偏好及浏览器后备语言 4 项检查通过。
- `screenshots.json`：16 个桌面/手机、深浅主题、菜单和错误状态场景，无页面异常、水平溢出、外部请求或 axe 违规。实际查看 320px 荷兰语、荷兰语/泰语语言菜单和公网中文菜单，确认 15 语言可用。320px 荷兰语长词仍存在既有单词内折行，此次不扩大范围重做排版。
- `live-check.json`：公网开发站 8 项检查通过，旧阿拉伯语路径 404、旧偏好回退、其他手动选择优先、15 语言菜单及无阿拉伯语字体请求。实际截图 `live-language-picker.png`。
- 2026-09-08 05:22:14 UTC 仅更新开发 web，镜像 `sha256:b4dceef3ba6842e645b1dfb3d71eee49f1a0a7fe7d0882a1beca45b22443ca0e`，健康且继续监听 `0.0.0.0:13080`。持久数据库的 82 条阿拉伯语历史记录与更新前备份逐字段对比完全一致。Worker、Redis 和其他项目未重启。

全站原始 HTML **1,395/1,395 页面通过**，见 `languages-15-20260908/localized-html.json`：15 语言 ×（82 工具 + 11 首页/分类/内容/指南页面），检查状态码、lang、方向、单一 H1、title/description、自引用 canonical 及 15 种语言 + x-default 互链。本次隔离检查容器在完成后停止，测试卷保留；公网开发站继续运行。

此次不作为旧 V3 全范围验收；未重跑 Lighthouse、全部旧后台安全恢复或重型引擎回归，不宣称正式站发布、母语审校或真实流量性能达标。仓库无 Git/.trellis，未创建提交或运行工作流归档。
