# AI 前台语言接入与验证

本 Goal 仍在进行中，未更新公网开发站。2026-09-08 最后一批新增 `ko`、`th`，新 AI 应用词典覆盖全部15种已支持语言：`en`、`zh-CN`、`zh-TW`、`ja`、`tr`、`vi`、`nl`、`pl`、`es`、`pt-BR`、`de`、`fr`、`it`、`ko`、`th`。源词典完整不等于人工母语审校或所有交互/外部支付验证完成；原有82个文件工具语言不变，没有重新启用阿拉伯语。

## 代码与发布规则

- `apps/web/lib/ai/copy.ts` 保留英语/简中及统一词典映射；新增词典位于 `locales/` 下对应语言文件。每种词典有 202 条文案及 `creditLocale` 语法语言字段，共 203 字段，不以英语扩展对象补缺项；原 198 条基础文案仍完整保留。
- 涵盖工作台、参数、预检、上传同意、状态、结果、历史、账户、订单、付款未知状态、订阅取消、帮助与 metadata 来源文案。模型/套餐名称是管理员保存的名称，不擅自翻译产品 ID、请求 ID、错误码、供应商域名或用户输入。
- `AiCopy` 编译期检查字段；单测检查完整键集合、非空、占位符、危险标记、未替换英语以及支付状态区别。自动检查与本次 AI 翻译不等于人工母语审校。
- `AI_CONTENT_LOCALES` 从已接入词典生成。页面与 sitemap 使用同一集合；账户始终 noindex、无 hreflang 集群、不进 sitemap。未完成语言的 AI 页仍明确提示英语草稿，不关掉普通工具语言。
- `ALLOW_INDEXING` 仍由部署控制。开发环境禁止索引，不会因增加译文打开。合格公开页保留 self-canonical、完整双向语言集合与对应路径的英语 x-default。
- sitemap 增加合格 AI 工作台/定价页，保留原有条目。不编造修改日期；源代码编写的 AI 页面目前省略 `lastmod`，后续接内容发布时间时应记录真实正文/套餐变更。
- 格式化/安全错误映射移至 `copy-format.ts`，客户端组件仅引用这些函数及擦除后的类型；实际词典由服务端按当前语言传入。生产静态 JS 中检查新增词典标记，避免因翻译增加通用客户端包。
- 金额仍是套餐实际币种（当前 USD），只采用语言对应的显示格式；不把美元金额改标日元，也不编造汇率或本地价格。
- `displayCredits(units, locale)` 接受显示语言；不传时保留原 en-US 格式，后台可编辑数字仍使用原小数点。前台余额、预估、结算、方案点数、订单与流水全部传入当前语言；保留最多三位小数及原有不分组的紧凑显示。`formatAi` 只对数字占位值应用语言格式，不改日期字符串、域名、URL、ID 或未提供的变量。
- 格式化采用运行时 [ECMA-402 Intl.NumberFormat](https://tc39.es/ecma402/#numberformat-objects)。测试直接核对土耳其语/越南语逗号小数、最小 0,001 点数、负值、实际余额与原整数账本；显示格式不是汇率换算，也不能拿本地化字符串回填计费请求。
- 积分单位采用 Intl.PluralRules，依据词典的 `creditLocale` 与同样的三位小数精度选择 `creditOne`、`creditFew`、`creditMany`、`creditOther`。例如荷兰语 1 punt / 2 punten，波兰语 1 punkt / 2 punkty / 5 punktów / 1,234 punktu；西语 0 créditos / 1 crédito / 1,234 créditos，巴西葡语 0 crédito / 1,234 crédito / 2 créditos。URL 数值格式与实际正文语法分开：尚未翻译的页面保持英语语法，不能使用 URL 对应语言的复数规则。所有套餐的 `cycleCredits` 都必须传入 `{credits}` 和 `{unit}`，不可只拼固定复数。详见复盘及 [Unicode CLDR 48](https://www.unicode.org/cldr/charts/48/supplemental/language_plural_rules.html)。

语言链接依据 Google 的[本地化版本文档](https://developers.google.com/search/docs/specialty/international/localized-versions)：使用完整 URL、双向对应及同页自引用；语言标签不是正文完成度或搜索引擎实际收录的证明。本次没有新增 FAQ 富结果承诺、统计数字或认证声明。

## 可运行检查

沿用 Node 22.23.2 / pnpm，先构建隔离生产产物。不要把源运行数据库用于测试：

```bash
pnpm lint
pnpm typecheck
pnpm --filter @hxsl/web exec vitest run lib/ai/copy.test.ts lib/ai/client.test.ts
pnpm content:check
pnpm seo:check

# 先创建专用于此次构建的目录，再使用工具返回的确切路径：
mktemp -d /tmp/hxsl-ai-build-XXXXXX
NEXT_DIST_DIR=.next-ai-build HXSL_ADMIN_DB_PATH=/tmp/<实际目录>/admin.sqlite AI_ASSET_DIR=/tmp/<实际目录>/images AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build
pnpm test:ai:locales
pnpm test:ai:locales --locales=tr,vi
pnpm test:ai:locales --locales=nl,pl
pnpm test:ai:locales --locales=es,pt-BR
pnpm test:ai:locales --locales=de,fr
pnpm test:ai:locales --locales=it,fr
pnpm test:ai:locales --locales=ko,th
pnpm test:ai:standalone
```

`test:ai:locales` 使用 13324/13325 回环端口、临时 HTTPS 证书、独立随机 SQLite、合成账号和图片；不使用真实 Google 或商户。脚本依赖上述 `.next-ai-build`，不会悄悄测试另一份普通 `.next`。默认交互组合为 ja/zh-TW；`--locales=nl,pl` 等参数指定两个不同的已支持语言，结果写入独立 `locales-nl-pl/`，不会覆盖其他组合的证据。不同组合须顺序运行，避免固定端口冲突。`--baseline` 只针对改动前已有生产构建采样，不是新版通过验收的模式。不要在新版构建上覆盖原基线。

测试包含 45 个原始 HTML 页面、元数据/正文/语言链接、明确草稿、开发 noindex、重启为隔离可索引配置后 sitemap、两种新语言损坏图片本地拒绝、键盘同意与生成、部分成功账本、实际 PNG 下载解码、客户端切换语言保留草稿/结果、价格币种、真实账户明细、axe、无外部浏览器请求和词典包检查。原 `seo:check` 仍仅覆盖普通工具的 1230 个 URL，不将其当作 AI 页面证据。

`root verify` 的单测已包含新词典测试；完整 AI 浏览器命令仍需以上隔离 build 后单独执行，尚未将所有 AI 门禁整合到一次 verify。没有以未经运行的完整 verify 宣称通过。

## 证据与截图

以下分批数字是各阶段当时的测量；同组合复跑会更新after报告，最新值以validation.md及report.json为准，不把旧时间对应到新截图。

- `evidence/locales-ko-th/`：第六批，4张旧版基线、1张韩语断词问题图与红色断言日志；最终7组/45HTML/23图全部实际审查，报告2026-09-08T11:11:29.262Z。源词典达到15种；sitemap1425条/30个AI公开页，账户仍排除。`evidence/web-tests-ko-th.json`323项、AI254。韩语礼貌说明、泰语中性文案/佛历显示、非变形积分单位；不是人工母语审校或实际付款/生成验收。
- `evidence/locales-de-fr/`、`evidence/locales-it-fr/`：第五批，各4张旧版基线，三语言各203字段；法语360px上传标题问题图及红色断言日志在前者before目录。最终CSS后首次各7组/45HTML/21图、42张图已实际查看；随后仅修正测试截图定位和补充同意框检查。最新de/fr仍21图，it/fr23图（多2张同意区局部图），上传区与新局部图均实际查看。普通图中的灰色PNG与英文模型/账户名称为明确合成夹具，不是实际作品或漏译。
- `evidence/web-tests-de-fr-it.json`：319项、AI250；法语零/1.x单数、德/意单数/复数及三语言逗号小数均有独立预期。隔离可索引sitemap共1421条，其中26个合格AI页；账户、剩余ko/th草稿不进入。原本的日期段落不是新增语言已人工审核的证明。
- `evidence/locales/before/`：上一版生产构建的 4 张日语/繁中桌面、手机截图，以及本轮发现的日语手机结果按钮改版前截图。
- `evidence/locales/after/`：新版截图、45 份原始 HTML、隔离可索引 sitemap、最终 `report.json`。结果图是合成的灰色测试 PNG，不是外部模型生成的建筑示例。
- `evidence/web-tests-locales.json`：完整 web 单测独立报告。
- `evidence/locales-tr-vi/`：第二批 4 张 before、新语言工作台/结果/错误/价格/账户/完整账本截图与 45 份原始 HTML，另有 `evidence/web-tests-tr-vi.json`。测试新增小数报价、先冻结两份/只收成功一份、真实授权参考图上传与语言切换、余额/流水/日期精度断言；公开可索引 sitemap 当前增加至 12 个合格 AI URL。
- `evidence/locales-nl-pl/`：第三批 4 张旧版基线、2 张选择器修复前图、13 张已实际审查的最终图；最终 7 组检查及命令结果见 `validation.md`。原生成/账本/下载检查保留，另发布 1、2、5、1.234 积分套餐验证实际词形及已有余额不变。实际 sitemap 共 1411 条，包含 16 个合格 AI URL。
- `evidence/production/standalone-report.json`：同版本部署检查（不会将同库进程重启称为容器重建）。
- `evidence/locales-es-pt-BR/`：第四批，4张旧版英语回退基线、3张实际布局问题图和两次红色断言日志；最终17张已实际审查的图、45份原始HTML、7组生产浏览器检查。修复390px标签错位、360px风格窄列及768px空轨道，详情见复盘。最终sitemap1415条、20个合格AI页面；全web310项，精确时间与限制见validation.md。测试源保留nl/pl独立词形期望，并扩充es/pt-BR，不用同一个格式化函数计算期望。

## 继续完成

全部15种词典已接入；仍要补全所有语言的支付交互状态截图、200%/400%缩放及性能测量。人工母语审校、真实Google/生图/支付联调、财务剩余缺口及所有82工具真实输出仍未完成。隔离容器重建/离线恢复已有独立证据，见container-rehearsal.md；不等于真实支付故障窗口财务恢复完成。
