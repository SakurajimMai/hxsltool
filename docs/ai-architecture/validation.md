# 建筑 AI 阶段证据（未最终验收）

## 最新：真实图像供应商（2026-09-09）

证据 `evidence/live-image-provider/`，规则见[live-image-provider.md](live-image-provider.md)。

- 首次 report 00:55:17Z：三次 503，无图，已保留。
- report.json 01:36:51.122Z：`success: true`。`generation-0.png` 1024×1024 / 927861 字节；`edit-direct-0.png` 与 `edit-job-0.png` 均为 1024×1024，已实际查看（编辑图含厨房）。生成任务 succeeded / reserved 0 / available 19000；编辑任务 succeeded / reserved 0 / available 18000，`usedEditsUrl: true`。
- 报告与日志不含密钥。Google、支付未测。未改公网。

## 最新：本地PDF标注与版式输出（2026-09-09）

证据目录 `evidence/local-pdf-annotate/`，规则与命令见[pdf-annotate-review.md](pdf-annotate-review.md)。

- before：9 组 3 通过 6 失败。resize/metadata/flatten 已能下载；水印/页码/页眉/裁切/非法范围缺 Page range；排序说明未提按钮。
- after/report.json：2026-09-09T00:37:18.786Z，9 组通过。选中页水印/页码/页眉、裁切框、自定义画布、元数据、flatten 字段 0、非法范围无下载。requests/errors 为空。
- 最终 9 图全部实际查看。手机成功态从工作区顶部拍摄，投放区占上半；桌面图可见页码字段与参数。
- lint/typecheck/Web627/content82×15/SEO1230/隔离 build 通过。未重跑页面 13 组、批量、standalone 或 Docker。
- 累计 51/82。没有更新公网 13080。完整 Goal 未完成。

## 最新：PDF页面多语言错误与移动排序按钮（2026-09-08）

证据目录 `evidence/pdf-page-accessibility/`，规则、根因、命令见[pdf-page-accessibility.md](pdf-page-accessibility.md)。

- before/report.json：14:55:13.497Z，29 组 13 通过 16 失败。原 7 工具输出保持；移动按钮缺失；15 语言错误仍为英语。失败图保留。
- after/report.json：15:07:04.183Z，29 组全部通过。15 语言 range/order/repeats/position/limit/deleteAll 全文匹配；按钮将页序改为 2,3,1 后独立重解析；每种语言另有 2,1,3 下载。requests/errors 为空。
- 最终 12 图全部实际查看：桌面/320 深色排序按钮、选页、英语无效范围错误卡片，以及简中/德/日/土/波/泰插入位置错误。错误可见且带重试、无下载。德语 `Ausgewählt` 在 390px 三列中从单词中间换行，记录为既有标签问题。
- checks/workspace-tests.log：Web 627。lint、typecheck、content 82×15、SEO 1230、隔离生产 build 通过。本组未重跑 PDF 批量、参数重算、standalone HTTPS、Lighthouse 或 Docker。
- 累计仍 44/82（含 2 编码边界）。没有更新公网 13080。完整 Goal 未完成。

## 最新：PDF页面处理、完整顺序与字段驱动预览（2026-09-08）

证据目录 `evidence/local-pdf-pages/`，规则、根因、命令见[pdf-pages-review.md](pdf-pages-review.md)。

- before：旧生产构建12组5通过7失败；启动前脚本命名遮蔽错误单独保存在checks/script-before.log，不算产品失败。
- final/report.json：14:46:05.145Z，13组全部通过；真实7工具下载、ZIP CRC、独立PDF重开/页序/尺寸/原文本内容、原旋转叠加、完整61页、参数错误/恢复和330页扩展预算拒绝。requests/errors为空，无上传/站外请求。
- 最终reorder-desktop、reorder-mobile、selection-mobile、invalid-range四图均实际查看，1440/390/320与深浅主题，4次工作区axe及字体≥14px通过。after旧版错误截图只拍参数，最终明确定位file-queue后查看了错误，未用早期图冒充错误可见性验收。
- pdf-batch-regression：14:46:14.580Z，9组/8图；recompute-regression：14:46:53.887Z，20组/7图。保留实际图片→PDF→合并/ZIP/部分失败/预设/参数冻结/15语言失效与摘要；这15图本次没有人工逐张复看。
- checks/workspace-tests.log：597 Web、6 Registry、8 Worker、13共享处理通过；共享5宿主缺引擎跳过。lint、四包typecheck、新脚本最终严格类型、内容82×15/SEO1230源码配置检查通过。不是全15语言PDF错误或全站HTML抓取证明。
- checks/build.log隔离生产build终态0：普通工具First Load JS411kB、首页173/AI116不变（构建摘要精度），无新Lighthouse/用户p75报告。
- production/standalone-report.json：14:47:32.739Z，10组真实HTTPS生产模式、发布/草稿/重启/回滚/导入/权限/SecureCookie/未配置付款拒绝与产物无秘密检查通过；不是真实Google/供应商/支付或本轮Docker重建。
- 累计44/82身份包含2项既有编码边界；38待浏览器输出，完整Goal仍未完成。没有更新公网13080或DNS/TLS、删除生产卷和实际收费。

## 最新：AI上传异步权限与物理清理（2026-09-08）

证据根目录 `evidence/upload-lifecycle/`，契约与可复跑命令见[upload-lifecycle.md](upload-lifecycle.md)。

- `before.json`：新6项基线1通过5失败；`focused.json`：修复后39通过；后补3项由最终`web-tests.json`验证，570通过/0失败/0跳过，保留原561项。真实PNG解码/磁盘/SQLite与明确的IO调度、EACCES注入，不涉及外部生图。
- `lint.log`保留首次TS18047失败；`lint-after.log`及四包`typecheck.log`终态0，`workspace-tests.log`终态0：Registry5/Worker8/共享12/Web570通过，宿主5缺引擎跳过。原incremental-results质量检查通过的错误表述已更正，原日志没有覆盖。
- `content.log`82工具×15语言基本内容键、`seo.log`1230工具URL源码配置检查通过；不是全站HTML抓取。`build.log`隔离生产build终态0，首页173/工具411/AI工作台116/定价110kB，与上一构建摘要相同；无新Lighthouse或真实用户p75数据。
- `browser/report.json`（14:35:18.695Z）9组通过/11图/零页面错误；5次axe由脚本断言通过。真实开发HTTP、上传/PNG下载独立解码/部分结算/同意/复用/取消/删除/登出，供应商与登录为显式夹具。
- 本次实际查看6图：saving-1440-light、saving-320-dark、workspace-1440-light、workspace-390-light、error-mobile-zh、account-mobile。桌面与320/390手机、深浅主题、焦点、中文错误、未结算删除状态与历史同步保持。图片是合成单色PNG，不是建筑生成质量证明；开发指示器在部分手机截图左下覆盖文本，非生产UI。账户只看当前视口，未人工审查下方账本；其余5图未人工复看。没有本组UI修改或全站WCAG声明。
- `production/standalone-report.json`（14:36:05.664Z）10组通过，命令终态0：真实HTTPS鉴权/SecureCookie、18项路由及heartbeat、后台草稿/发布原始HTML/重启持久化/回滚/导入导出权限、未配置支付拒绝与构建产物排除秘密。不是实际Google/生图/支付，也不是本轮Docker重建。
- 最后13317/13318/13320均无监听，所有本轮终端到达终态；没有更新公网13080、DNS/TLS或生产卷。完整Goal未完成，外部联调、全部财务/清理并发故障、45待输出工具和完整性能等继续保留。

## 最新：AI结果逐项持久化与前台交付（2026-09-08）

- evidence/incremental-results/baseline.json：原14通过、新2产品失败；更早夹具语法/混合模块加载错误单独归档，不冒称产品证据。修复后focused16，全Web561（原556＋新5），零失败/跳过。
- 自建隔离子进程确认进入第二CDN请求才SIGKILL，重新打开SQLite、恢复部分结算、独立解码首份PNG，无供应商重发。存储故障、首项坏图position=1、CDN失败/签名URL不泄漏均通过，显式供应商替身不是实际生图。
- browser-after/report.json：14:25:10.351Z，9组/11截图均实际查看/5axe，真实开发HTTP/SQLite/下载文件。修复保存中删除禁用与历史行轮询同步；before与before-history保留真实问题。英文/简中，不是所有语言/缩放或正式生产截图验收。
- 根测试Registry5/Worker8/共享12，宿主5缺引擎跳过；更正：该阶段lint/四包typecheck实际因TS18047失败；workspace/fixture独立类型、基础content与SEO源检查另有记录。最新上传生命周期阶段已修复并重新验证，不改原失败日志。三次隔离build退出0，AI页面7.41→7.46kB而首载116kB，首页173/普通工具411/定价110/后台137kB不变。没有新Lighthouse/p75、容器或公网发布。

完整契约、精确命令、剩余恢复窗口见[incremental-results.md](incremental-results.md)。完整Goal继续。

- production/standalone-report.json：14:27:00.432Z，10组HTTPS生产模式回归通过；最后13317/13318/13320均无监听，没有本轮遗留后台进程。不是实际Google/生图/收款或Docker部署。

## 最新：AI已生成结果的有界解码调度（2026-09-08）

- evidence/decoder-admission/before.json：原13通过，新4任务并发结果测试1失败。focused31通过，随后再加2项真实图片测试；最终web-tests.json为556通过/零失败/跳过，原548项保留。
- 实际Sharp PNG、4用户4任务、真实私有文件/SQLite重开/单次500毫积分结算；上游为显式合同替身，不是实际供应商。新队列5测试覆盖FIFO、2并行/4等待上限、45秒超时、插队、重复释放和无计时器残留；真实损坏图释放与上传2成功/1繁忙保留。
- lint/typecheck、根测试Registry5/Worker8/共享12（宿主5缺引擎跳过）、content82×15与SEO1230源检查均通过。隔离build退出0，首页173/AI工作台116/定价110/后台137/普通工具411kB保持；不是新Lighthouse/用户p75。无UI改动，无新增截图声明。
- 完整契约、边界和复跑命令见[decoder-admission.md](decoder-admission.md)。数据schema、部署配置与公众工具未变，完整Goal未完成。
- production/standalone-report.json：14:13:22.120Z，10组HTTPS生产模式回归通过，真实发布初始HTML/重启/回滚/权限/安全Cookie、未配置付款拒绝；不是实际供应商/商户或Docker。13317/13320已无监听。

## 最新：参数重算与合并输入依赖（2026-09-08）

- evidence/local-recompute/after/report.json：14:06:14.267Z，20/20，真实PNG尺寸/多页PDF重新解析，15语言失效态；请求/页面错误为空。7张新图全部实际审查，7次工作区axe及失效提示≥14px通过。before两项功能失败，visual-red五项字号失败均保留。
- checks/web-tests.json：548通过，0失败/跳过；workspace-tests.log包含Registry5/Worker8/共享12，宿主共享5缺引擎跳过。lint、四包typecheck、脚本严格类型、82×15基础内容与1230URL源码SEO通过。
- 两次隔离生产build通过，普通工具页410→411kB，首页173/AI116/定价110/后台137kB。最终PDF9组（14:06:25.148Z）与SVG16组（14:06:34.434Z）通过；图片20入口最终回归退出0（18个独立解码输出、2个AVIF边界）。报告在pdf-final/svg-final/image-final。本组无新Lighthouse/用户p75、真实商户/外部生成、全部HTML爬取或容器演练声明。
- 用户路径、状态契约、截图修复、命令和待办见[recompute-review.md](recompute-review.md)。完整Goal继续，不把37身份覆盖写成82全工具验收。

## 最新：SVG/图标输出与共享手机结果回归（2026-09-08）

- evidence/local-svg/after/report.json：13:48:36.713Z，16组全部通过，7张新截图均实际查看/7次工作区axe。六种位图转SVG全像素/比例、alpha、缩小预览、SVG→PNG/WebP、viewBox、脚本拒绝、15语言超限、图标PNG/SVG输入、真实ICO/ZIP/PWA尺寸、清空后URL归零、PNG→SVG→优化→favicon内存链。
- 最终共享图片报告13:48:28.992Z：20入口18输出＋2AVIF编码边界；PDF报告13:48:27.998Z：9组，原真实文件、页序/像素、ZIP部分成功/重名/重试、15语言摘要均保留。两组15张回归图中实际抽查5张，其余只自动检查；合计22次工作区axe通过，无上传/外部/页面错误。
- Web540（新44）/Registry5/Worker8/共享12通过，宿主5项缺引擎跳过，checks/web-tests.json与workspace-tests.log。lint、四包typecheck、脚本严格类型、内容82×15与SEO1230源URL检查退出0。Buffer类型失败留档后修正，无删断言/升级依赖。
- 四次隔离生产build退出0，最后含390px结果单列修复。工具页First Load JS407→410kB，首页173/AI工作台116/账户112/定价110/后台137kB。不是新Lighthouse、全站HTTP或真实用户p75报告。
- 原11/12失败、JPEG夹具比较错误与aria-prohibited-attr、缩小alpha191、390px摘要两项失败均保留。最终13325/13326/13329监听结束；无生产更新、真实收费、外部生图或本轮Docker重建。完整契约与精确命令见[svg-icon-review.md](svg-icon-review.md)。

## 最新：Creem历史付款恢复与乱序回调（2026-09-08）

- evidence/creem-history/web-tests.json：496/496，零失败/跳过，Creem55项（原34＋新21）。旧实现5失败、关联丢失1失败、连续退款再增1失败均保留红色报告；最终失败重试/账本/冻结/重开/幂等/去敏断言通过。额外跨订单夹具和类型命令失败如实记录，不删断言。
- 根pnpm test最终退出0：Web496、Registry4、Worker8、共享12通过，宿主5缺引擎跳过；workspace-tests-final.log。lint/四包typecheck、standalone脚本严格类型、content82×15、SEO1230源检查退出0。
- 隔离生产build退出0：首页173、AI工作台116、账户112、定价110、后台137kB First Load JS。生产HTTPS standalone10组通过，报告13:27:04.449Z，见evidence/creem-history/production/standalone-report.json；实际发布初始HTML/重启/回滚、草稿恢复、安全Cookie和产物排除，13317/13320结束。
- 本轮无UI修改、无新截图/Lighthouse/全站HTML声明；Creem网络为HTTP替身，真实签名Route Handler调用不是实际商户回调到公网。未重建Docker或更新生产；完整财务、外部联调与全82工具验收继续。根因及可复跑命令见[creem-history-recovery.md](creem-history-recovery.md)。

## 最新：无回调Stripe订单核对与生产HTTPS后台（2026-09-08）

- 新stripe-checkout-review.test.ts26项，旧Stripe24项保留；全Web475/475、无跳过，evidence/checkout-review/web-tests.json。完整pnpm test退出0，Registry4、Worker8、宿主共享12通过/5缺引擎跳过。lint/四包typecheck/新浏览器脚本严格tsc通过；content82×15和SEO1230源URL检查通过。
- 生产构建3次，最终build.log包括事务、租约与手机分页；首页173kB/工作台116kB/账户112kB/定价110kB，后台137kB。未新增Lighthouse、真实p75或全站原始HTML报告。
- pnpm test:ai:checkout-review最终退出0，13:09:59.516Z，4组/7截图。生产standalone＋本地HTTPS实际授权/CSRF/来源/fresh/no-store；成功请求明确在检查进程调用真实service＋Stripe SDK HTTP替身，真正route成功合同由单元测试验证，不冒称真实商户E2E。无回调未知订单、查询不到、半额退款、丢响应后重试、实际账户净5000毫积分均验证。
- 全部7张最终图实际查看、7次组件axe、44px按钮/分页同排/焦点断言通过；旧分页断言失败保留layout-red.log/report、before-layout图。初版9项事务失败及HTTP生产Secure Cookie失败保留，不改断言或安全设置取得通过。
- 根因、命令、版本和边界见[checkout-recovery.md](checkout-recovery.md)。13327/13328已无监听，所有owned进程结束；未更新13080、DNS/TLS/生产数据或真实付费账户。三渠道完整财务与外部验收仍未完成。

## 最新：结果归属、整批比例与320px摘要（2026-09-08）

- 新增19项摘要测试；全Web449通过、0失败/跳过，evidence/result-summary/web-tests.json。lint、四包typecheck、两浏览器脚本严格tsc、content82×15、SEO1230源URL检查通过，两次隔离生产build通过。
- 最终PDF/批量9组，12:52:10.261Z；图片20入口，12:52:13.083Z，报告在evidence/result-summary/after及images。15语言分别真实下载并重解析两页PDF，核对整批输入/输出字节及本地化百分比；原有输出、重试、ZIP和像素预算断言保留。
- 最终8＋7张截图已实际查看、15次工作区axe零违规；320px结果按钮下置、数量关系和中日泰长文本正常换行。非GET/站外/页面异常列表为空。旧构建五种PDF摘要断言失败与首次功能修复后窄栏截图均保留；详见[result-summary-review.md](result-summary-review.md)。
- 未重新运行全站原始HTML、Lighthouse、实际外部供应商或支付；没有扩大26/82工具身份覆盖。PNG通用Quality适用性、显式尺寸、分组移除/取消与历史模式文案仍需验收。自有13325/13326监听已退出，未发布公网。

## 最新：图转PDF/ZIP/衔接/像素限制（2026-09-08）

- 代码修复缺limits的伪Tool断言、ZIP重名覆盖、异步读取已清空FileList、图转PDF像素上限未进入有效配置，以及限额说明不显示像素的问题。新FAQ默认值不固化运行预算；不修改已有发布内容或生产数据库。
- `pnpm test:local:pdf-batch --baseline`旧构建实际7组失败，`evidence/local-pdf-batch/before/report.json`。中间衔接失败在chain-investigation/before-filelist，超限仍成功在before-pixel-limit，说明页缺限制在before-pixel-copy保留。初版脚本命名/严格类型检查问题已修正，不把脚本错误当网站错误。
- 最终`pnpm test:local:pdf-batch`退出0，12:40:21.618Z，8组，`evidence/local-pdf-batch/after/report.json`。五种实际输入各2页PDF独立解析、内嵌图像Flate解压/源颜色/尺寸核对；工具衔接结果自动入队后真正合并；3成功3失败批次ZIP含3个独立文件，重试不丢成功，再增加同名图片后4文件CRC/格式/尺寸均正确；5000像素预算拒绝6000，页面和错误一致、无下载。
- `HXSL_IMAGE_EVIDENCE_DIR=docs/ai-architecture/evidence/local-pdf-batch/image-regression pnpm test:local:images`退出0，12:40:49.876Z。20入口18个解码结果（5个原字节保留）＋2个明确缺原生AVIF编码，15语言错误、EXIF回归；没有扩大成全部格式互转成功。
- PDF/批量5图＋图片7图均实际查看；12次工作区axe无违规，两组非GET/站外/页面错误均空。分组结果比例仍按单个输入显示、历史hybrid模式说明等没有被测试隐藏，详列pdf-batch-review.md；不是全站WCAG、完整语言或缩放验收。
- `pnpm test`退出0，Web430、Registry4、Worker8、共享12通过，5项宿主缺引擎跳过保留，日志workspace-tests.log。Web另有web-tests.json，430/430、0跳过。新增8命名＋16文案＋1配置发布测试，Registry新增1条技术限额测试。
- `pnpm lint`、四包`pnpm typecheck`、`content:check`82×15、`seo:check`1230源URL检查、两浏览器脚本独立严格tsc均退出0。命令及构建隔离变量见pdf-batch-review.md。
- 5次隔离生产build均退出0，最终build.log，前4次build-before-*保留。1466路由：首页173kB、AI工作台116kB、定价110kB、账户112kB、后台136kB First Load JS；没有新Lighthouse或真实p75。所有owned进程已确认退出，13325/13326无监听；未部署公网/改卷/DNS/TLS或真实收款。
- 全82累计矩阵tool-output-matrix.md：26个身份有上述证据，含2个编码边界，56个待浏览器输出回归；整个Goal继续，真实Google/图像/三支付渠道、自动资金核对及其他验收仍未完成。

## 最新：图片20真实输出及移动错误卡片（2026-09-08）

- `pnpm --filter @hxsl/web exec vitest run lib/image-format.test.ts`退出0，38项；全web `vitest run --reporter=json --outputFile=../../docs/ai-architecture/evidence/local-images/web-tests.json`退出0，405/405、0跳过。日志/JSON在`evidence/local-images/`。
- `pnpm lint`、`pnpm typecheck`四包、`pnpm content:check`（82工具15语言）、`pnpm seo:check`（1230工具URL源检查）退出0。脚本独立严格检查：`pnpm exec tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --allowImportingTsExtensions --skipLibCheck --esModuleInterop --strict scripts/local-image-output-check.mts`退出0。
- 两次新的隔离生产构建退出0，使用mktemp私有数据库/images，`NEXT_DIST_DIR=.next-ai-build`、dispatcher/payments/indexing=false、遥测关闭。可复制命令见image-output-review.md。最后日志`evidence/local-images/build.log`；1466路由，首页173kB/工作台116kB/定价110kB/账户112kB/后台136kB。未跑新Lighthouse或获得真实用户p75。
- 旧基线`pnpm test:local:images --baseline`退出1，7项真实错误保留在`before/`，不是通过。第一次格式修复后退出0（`before-layout/`）；实际看图发现320px错误文本被按钮挤窄。
- 最终`pnpm test:local:images`退出0，2026-09-08T12:21:24.528Z，`after/report.json`：18份下载Sharp独立解码＋2项明确缺原生AVIF编码且无下载。五个压缩夹具均原字节不变，不称为压缩收益或AVIF重编码。去EXIF以真实orientation=6 JPEG输入，输出52×88无EXIF/方向字段。
- 15语言真实编码错误，无占位符/英语整段回退；7图全部实际查看，桌面1440/移动390/窄屏320深浅色及中日泰错误；宽度≥85%断言及7次工作区axe零违规。非GET请求/站外/页面异常均空。此项不代替全站无障碍、全部格式组合或所有语言主流程。
- `after/tool-output-matrix.md`保留全部82工具，其余62行not-tested；实际产物在`after/outputs/`。根因与待办见image-output-review.md，已记录图转PDF缺limits对象风险及ZIP重名覆盖风险，未冒称验证/修复。
- 本轮所有owned构建/浏览器/测试进程已确认结束，13325无监听，没有停现有服务、删除真实文件或改生产卷。未上线、未执行DNS/TLS、真实Google/供应商/支付或完整verify。整体Goal继续。

此前Worker/真实引擎证据见本文末尾“2026-09-08 Worker隔离引擎补验”，schema7人工核对亦保留在文末。以下保留各旧阶段的真实历史结果，不代表当前版本上限。

## 最新补验：PayPal争议暂挂、后台复查及v6持久化（2026-09-08）

- 新增28项争议合同/适配器/真实Route Handler/SQLite测试。最终全web `evidence/web-tests-paypal-disputes.json`，开始2026-09-08T11:30:11.950Z，351/351、AI282、0失败。覆盖canonical金额而非webhook猜测、先争议后付款、整数比例/合计上限、退款保留、胜诉/买家撤回、赔付/NONE待核对、复议/乱序/同版本矛盾、冻结/已消费积分、v5→6只增迁移、重启/重复事件、私有GET白名单/响应限制/权限失败与租约释放；管理员查询遇到并发较新回调时返回真实当前状态。
- `pnpm lint && pnpm typecheck`最终退出0，四包通过；三个修改脚本的严格类型检查退出0：`pnpm exec tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --allowImportingTsExtensions --allowJs --skipLibCheck --esModuleInterop --strict scripts/ai-disputes-check.mts scripts/ai-backup-check.mts scripts/ai-container-check.mts`。初次更宽范围脚本检查暴露旧备份脚本的JS声明、较旧Node类型与SQLite行类型问题，保留实际readOnly参数并补明示类型/JS推断，未升级依赖或关闭strict。
- `pnpm test:backup`13组退出0，`evidence/backup-restore-report.json`，2026-09-08T11:27:01.278Z，Node22.23.2。v6案例及不可变观察历史在真实WAL快照与离线新路径恢复后逐行一致，恢复后禁止改历史；未来schema7、缺任一新表快照拒绝。该案例在收据到达前，不能冒称真实争议资金灾难恢复。原会话撤销、账本/旧报价/TTL/并发WAL/不覆盖检查保留。
- `pnpm content:check && pnpm seo:check`退出0，原82工具/15语言与1230普通工具URL；不是全部真实输出或本轮所有AI语言HTML复查。没有修改词典/原文件引擎/正式域名。
- 两次隔离生产build退出0，最终包含错误聚焦及复查按钮焦点恢复。命令：`NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build HXSL_ADMIN_DB_PATH=/tmp/hxsl-ai-disputes-build-YZLr6t/admin.sqlite AI_ASSET_DIR=/tmp/hxsl-ai-disputes-build-YZLr6t/images AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build`。目录由mktemp生成，复跑新建，不是上线启动路径。最终日志 `evidence/paypal-disputes/build.log`，首次日志`build-before-focus.log`。1466页，首页173kB/工作台116kB/定价110kB/账户112kB不增，后台133→134kB；不是Lighthouse/p75。
- 新 `pnpm test:ai:disputes`最终退出0，`evidence/paypal-disputes/report.json`，2026-09-08T11:30:55.963Z，4组/8图、errors/external空。真实HTTP初始化/登录/CSRF/来源/近期重认证/未知案例/环境边界/白名单检查；确认查询的浏览器POST明确使用真实复查服务＋注入canonical客户端，不是PayPal互联网请求，Route Handler财务处理另有独立单测。实际SQLite积分暂挂10000→5000、待核对不误释放、胜诉恢复10000，账户实际刷新一致；记录3个不可变版本。
- 8张最终图全部实际查看：1440/390/320后台、320深色待核对、390重认证错误、390浅色释放、390前台深/浅账户。新版不存在新增横向溢出、按钮遮挡或截断，金额长行自然回流；组件axe及按钮≥44px检查通过，不是全站/全部语言/缩放完整WCAG验收。浏览器截图有Next开发指示器，不能冒称生产截图。
- 保留早期后台对比图 `before/admin-billing-1440-light.png`（来自已有payments报告，非本轮新拍现场）和本轮`before/error-outside-screenshot-390-dark.png`。首次4组/8图通过后实际审查发现错误在截图外；新增错误焦点断言在旧UI退出1，红色日志`before/error-focus-red.log`。修复失败聚焦和成功刷新恢复焦点，截图单独锚定真实错误并检查边界框。初次全页alert定位还误匹配Next播报器，改为操作区限定，不删错误/权限断言。复盘见paypal-disputes-review.md。
- 最终构建后的 `pnpm test:ai:standalone`退出0，`evidence/production/standalone-report.json`，2026-09-08T11:32:19.748Z，10组：真正生产HTTPS会话、安全Cookie、配置发布/原始HTML/重启/回滚和运行数据/秘密产物排除。`pnpm test:ai:payments`退出0，`evidence/payments/report.json`，2026-09-08T11:32:53.390Z，6组/12图，共享后台和Stripe界面回归；这12张本轮没有逐张重审，不替代新增争议8图的人工审查。上述检查仍用明确合成用户/财务事实，不是真实外部支付。
- 本轮最终拥有的进程均已退出；13317/13320/13321/13323端口无残留监听。受保护测试DB/报告保留，未删除生产数据或卷；build使用新私有目录。项目无Git/Trellis元数据，阶段检查与复盘记录在本目录，不虚构提交、模板同步或全目标归档。

完整Goal未完成：本阶段risk暂挂不是最终净损失；仍需金额归属/退款重叠/后继多交易的最终财务处理、支付完整对账与未知checkout、真实Google/建筑供应商/三商户、v6容器与财务未知窗口恢复、全部82工具输出、全部语言付款状态/缩放与性能。新容器脚本只同步v6版本检查并通过类型检查，本轮未运行，不套用旧v5容器结果。公网hxsl-web-1仍是原hxsl-web镜像，running/healthy，0.0.0.0:13080；未发布、未改DNS/TLS、未产生真实收款。

## 最新补验：韩语、泰语与全部15种词典（2026-09-08）

- 新增ko/th各203字段，完整语言集合与Registry的15种语言一致，类型由Partial改为完整Record。保留未支持输入的防御回退，不允许已支持语言静默漏词典。完整性、变量、安全/非英语回退测试保留；新增原生文字与意外混入汉字检查。起草时发现并修正一处泰语中的“余额”，未把自动校验等同语言审校。
- 定向`pnpm --filter @hxsl/web exec vitest run lib/ai/copy.test.ts lib/ai/client.test.ts`45/45。全web报告`evidence/web-tests-ko-th.json`，2026-09-08T11:06:27.496Z开始，323/323、AI254、0失败。旧“未翻译集合”的空循环改为15种数字语言×显式英语正文的零/单数/小数断言；ko/th独立断言毫积分精度、不变单位和日期年份，保持USD与ISO存储时间。
- `pnpm lint && pnpm typecheck`两次通过，最后一次在韩语CSS修复后；四包全部退出0。最终脚本独立严格类型检查通过：`pnpm exec tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --allowImportingTsExtensions --skipLibCheck --esModuleInterop --strict scripts/ai-locales-check.mts`。原`pnpm content:check && pnpm seo:check`退出0，82工具/15语言/1230普通URL，不是全工具输出验收。
- 两次隔离生产build均退出0，最后包含韩语断词CSS；`evidence/locales-ko-th/build.log`为最终日志。命令：`NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build HXSL_ADMIN_DB_PATH=/tmp/hxsl-ai-ko-th-build-9PuI6x/admin.sqlite AI_ASSET_DIR=/tmp/hxsl-ai-ko-th-build-9PuI6x/images AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build`。目录为mktemp创建的本轮私有构建目录，复跑另建，不用于生产启动。1466页；首页173kB/工作台116kB/定价110kB/账户112kB/后台133kB First Load JS，不是Lighthouse或真实流量指标。
- `pnpm test:ai:locales --locales=ko,th --baseline`在修改前产物记录4图，均已实际查看。首次新产物7组通过后截图发现韩语短词拆行，保留`before/ko-word-split-1440-light.png`。新增Range逐词断言在旧构建退出1、`actual:['스타일']`，日志`before/word-wrap-red.log`。修复仅韩语AI页keep-all并保留超长换行，不改泰语、字体或原工具。
- 最终`pnpm test:ai:locales --locales=ko,th`退出0，`evidence/locales-ko-th/after/report.json`，2026-09-08T11:11:29.262Z：7组、45HTML、23图、errors/external均空。23张最终图全部实际查看：1440/768/390/360工作台、360上传区及同意框局部、320错误/账户/账本/小数套餐、390结果/定价。韩语词保持完整，泰语自然回流；没有新增截断、遮挡、横向溢出。组件axe、键盘同意、控件尺寸/选中文字宽及真实行框检查通过，不是所有状态/200%或400%缩放/完整WCAG认证。
- 真实浏览器链路：损坏图在本地拒绝、同意前0上传、跨语言保留描述/参考/任务、键盘同意后1上传；内部HTTP→SQLite→worker用显式上游替身产生一份合法PNG和一份损坏结果。下载独立Sharp解码PNG256×256；初始1234567毫积分、冻结2468、仅扣1234、最终可用1233333/冻结0。发布1/2/5/1.234套餐核对两语言单位且钱包不变；灰色合成图不是实际AI建筑作品。
- 45份原始HTML覆盖15语言的工作台/定价/账户，检查本地化正文/FAQ/H1/title/description、lang、self-canonical、同路径双向hreflang/x-default及部署noindex。重启隔离可索引配置后，实际sitemap1425条（原1395+30个AI公开页），无账号/阿语/后台/内部API；不编造lastmod，不修改正式域名或公网索引开关。新增词典未嵌入通用客户端JS；不是完整性能分析或实际搜索收录证明。
- 最终生产`pnpm test:ai:standalone`10组退出0，2026-09-08T11:10:59.079Z：HTTPS鉴权、发布原始HTML/重启/回滚和私有产物排除继续通过。原开发模式`pnpm test:ai:workspace`8组/9图退出0，2026-09-08T11:10:20.831Z；该组未重新逐张审查，不当作新语言生产截图。

公网hxsl-web-1仍为原hxsl-web、healthy、0.0.0.0:13080，没有更新、停止其他项目或改DNS/TLS。未执行完整verify、全部82工具输出、所有语言支付状态与缩放、真实Google/图像/三商户、支付财务剩余闭环或性能完整验收。完整Goal仍进行中，15种源词典齐全不是整体产品完成。

## 最新补验：德语、法语、意大利语与上传标题（2026-09-08）

- 最终全web `evidence/web-tests-de-fr-it.json`：2026-09-08T10:53:20.244Z开始，319/319、AI250、0失败。词典/客户端定向41项通过；完整键、变量、安全与英语回退检查保留，仅四个明确同形术语精确白名单。法语零/1.x单数与德/意单复数、三位小数、负值/百万值有独立断言。
- 最终CSS后 `pnpm lint && pnpm typecheck` 退出0，四包通过；截图定位修正后再次 `pnpm exec tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --allowImportingTsExtensions --skipLibCheck --esModuleInterop --strict scripts/ai-locales-check.mts` 退出0。`pnpm content:check && pnpm seo:check`再次通过82工具/15语言/1230普通URL，不是全部真实输出测试。
- 最终隔离生产build句柄56817确认退出0；日志复制到 `evidence/locales-de-fr/build.log`。使用独立 `/tmp/hxsl-ai-de-fr-it-build-zXM0zg/admin.sqlite`、images、`NEXT_DIST_DIR=.next-ai-build`、`NEXT_TELEMETRY_DISABLED=1`，dispatcher/payments/indexing均false。复跑必须另建隔离目录，不能把这个路径作为线上启动配置。首页173kB、工作台116kB、定价110kB、账户112kB、后台133kB First Load JS；没有新的Lighthouse或真实用户p75结论。
- 不掩盖失败：首次build以143结束且没有standalone/server.js，保留 `evidence/locales-de-fr/build-interrupted.log`；进程表确认结束后重建成功。一次旧的standalone与workspace串联命令虽输出报告但整体143，不算整体通过；最终分别执行，两者均实际退出0。上述143原因未知，不擅自认定OOM或超时。
- 最终CSS后 `pnpm test:ai:standalone`：10组，2026-09-08T10:56:29.110Z；`pnpm test:ai:workspace`：8组/9图，2026-09-08T10:57:28.792Z。前者是真生产HTTPS鉴权、配置发布/重启/回滚与产物排除；后者是原en/zh-CN开发模式真实工作台，不冒称生产浏览器或容器重建。
- 两组新增语言命令 `pnpm test:ai:locales --locales=de,fr` / `--locales=it,fr` 各7组、45HTML、21图；最终CSS首轮分别2026-09-08T10:56:58.801Z、10:57:41.118Z通过。42张实际查看，覆盖1440/768/390/360工作台、320错误/账户/账本/小数套餐、390结果与定价。没有新增遮挡/截断/横向溢出，不以此宣称完整WCAG、所有付款状态或200%/400%缩放通过。
- 审查发现“references”截图只把底部标题纳入视口，未显示同意框；仅修改测试定位为标题滚到顶部并顺序复跑。最新de/fr：2026-09-08T10:59:07.845Z，7组/45HTML/21图；it/fr：2026-09-08T11:01:33.340Z，7组/45HTML/23图，两次命令均退出0。新增的2张是同意区局部截图；意语一张整页中复选框不清晰，再次整页及局部采集均可见，DOM断言可见/启用/未勾选/18×18通过，不能据此认定应用CSS缺陷。补拍的4张上传区及2张局部图实际查看，未再改应用构建。最新after报告覆盖旧报告，首次42张的视觉检查与后续定位补拍分开记录。法语标题真正分行的问题保留 `locales-de-fr/before/fr-reference-heading-separated-360-dark.png` 和 `reference-heading-red.log`，新增断言在旧构建实际失败，修复位于共享CSS，不删图标或缩短译文。
- 实际内部文件链路：两语言损坏图本地拒绝，同意前0上传、键盘同意后1上传，切语言保留描述/参考/任务。两份结果一成功一损坏，授权下载后Sharp独立解析PNG256×256；初始1234567、冻结2468、扣1234、最终可用1233333/冻结0毫积分。真实发布1/2/5/1.234套餐，独立三语言词形期望与旧钱包不变。上游为显式替身，灰色PNG不是建筑作品，未真实收费。
- 45份禁JS初始HTML逐个检查15语言三路由的lang/H1/title/description/正文/FAQ/canonical/双向同路径hreflang/x-default；剩余ko/th明确草稿，账户不入集群。隔离开启索引后的sitemap1421条、其中26个合格AI页面；开发noindex与正式canonical配置不变，实际搜索收录未知。未新增词典字符串到通用客户端JS，不等同完整性能分析。
- 西语/葡语 `pnpm test:ai:locales --locales=es,pt-BR` 退出0：2026-09-08T10:58:21.556Z，7组/45HTML/21图，已包含补拍定位。实际查看两语言360上传区与葡语390参数三图，其余本次回归图不冒称逐张重审。各报告errors/external均为空。

公网hxsl-web-1仍为原hxsl-web镜像、healthy、0.0.0.0:13080；没有重启或更新它，DNS/TLS未执行。未执行完整verify、全部82工具真实输出、ko/th新译文、真实Google/供应商/三商户、支付剩余财务闭环或完整性能。完整Goal继续，保留所有未完成项。

## 最新补验：西班牙语、巴西葡语与移动参数布局（2026-09-08）

- `pnpm --filter @hxsl/web exec vitest run lib/ai/copy.test.ts lib/ai/client.test.ts`：32/32。最终全 web `evidence/web-tests-es-pt-BR.json` 开始于2026-09-08T10:39:58.582Z，310/310、AI241，0失败；保留原付款、授权、账本和输出测试。
- `pnpm lint && pnpm typecheck` 最终布局修复后通过，四包均退出0。新增浏览器脚本单独严格检查也通过：`pnpm exec tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --allowImportingTsExtensions --skipLibCheck --esModuleInterop --strict scripts/ai-locales-check.mts`。初次发现 Sharp 模块类型没有 default，已按实际 CommonJS 类型修正，不关闭严格检查。
- `pnpm content:check && pnpm seo:check`：82工具/15语言、1230普通工具URL通过，不等于全工具真实文件输出。新语言分别203字段，完整AI词典共10种，剩余5种仍有草稿说明。
- 最终隔离 `NEXT_DIST_DIR=.next-ai-build ... pnpm build` 退出0，1466页；`evidence/locales-es-pt-BR/build.log` 为最后响应式修复后的真实日志。构建使用独立 `/tmp/hxsl-ai-es-pt-build-szNvor/admin.sqlite` 和 images，不访问源运行库、不打开 dispatcher/payments/indexing，关闭 Next 遥测。首页173kB、工作台116kB、定价110kB、账户112kB、后台133kB First Load JS；没有拿该数字当作 Lighthouse 或真实p75。
- `pnpm test:ai:locales --locales=es,pt-BR`：最终报告2026-09-08T10:40:38.099Z，7组、45份原始HTML、17图；errors/external为空。无JS读取本地化H1/title/description/正文/FAQ、同页自引用和完整双向语言链接；账号不进集群。重启同一隔离生产构建开启索引后，实际sitemap1415URL，其中20个合格AI公开页；无账号、草稿、阿语、后台/内部API，开发noindex与正式域名配置不改。
- 实际浏览器选损坏图先本地拒绝，合法参考图在同意前0次上传、键盘同意后恰好1次；切语言保留描述/本地参考/任务。真实内部 edits 处理与显式上游替身产生1成功/1损坏，下载PNG独立Sharp验证256×256；初始1234567、冻结2468、仅扣1234、最终可用1233333/冻结0毫积分。发布1/2/5/1.234套餐验证独立预期的积分词形，已有钱包不变。不是真实模型建筑作品或付款验收。
- 截图审查：4张英语回退基线、3张实际问题图保留在 before/；最终17图全部实际查看，覆盖1440/768/390/360工作台、320错误/账户/完整账本/小数套餐与390结果/价格。修复标签错位、风格窄列、空轨道；before/alignment-red.log 与 responsive-red.log 保留新增断言在未修复产物的真实失败。中途断言在定价页等待不存在的表单超时已修正为先判存在；工作台断言、原全页面axe没有跳过。最终无新增遮挡/选中项截断/横向溢出，不宣称全部语言/200%或400%缩放/WCAG完整验收。
- 最终生产 `pnpm test:ai:standalone`：10组，报告2026-09-08T10:40:11.244Z，仍验证真实HTTPS鉴权、发布/重启/回滚HTML、配置导入及私有产物排除；不是本轮容器演练。
- 最终 `pnpm test:ai:workspace`：开发模式原en/zh-CN工作台8组/9图，报告2026-09-08T10:41:03.124Z，0页面错误；不冒称生产构建流程。`pnpm test:ai:locales --locales=nl,pl`：同一最终生产构建7组/45页/17图，报告2026-09-08T10:41:17.520Z，errors/external为空，新布局和原独立词形断言均通过。实际重点查看nl/pl各360px深色与768px浅色四图；这组其余13图没有在本轮重新逐张查看，前期审查记录独立保留。

本轮未执行完整verify、全部82工具真实输出、所有语言付款状态E2E、真实Google/生图/三商户、Lighthouse或生产发布。核心文件工具与公网原容器未停止，DNS/TLS未变更；整体Goal保持进行中。

## 最新补验：实际 Docker 重建与隔离恢复（2026-09-08）

- `pnpm test:docker-context` 两次通过；实际 Docker BuildKit scratch COPY/export 验证 23 个排除路径和 8 个保留输入，报告 `evidence/container/context-report.json`。只生成合成文件，没有将真实环境文件或运行 DB 作为 canary。
- 完整容器脚本先因 Docker29 internal 网络返回 null 端口映射失败；修改为无任何容器端口发布、宿主回环 HTTPS 代理访问独立内网 IP，保留 internal 隔离。失败仅涉及新建演练容器，已关闭，不改公网网络。
- 首次成功：`AI_CONTAINER_IMAGE_A=hxsl-ai-rehearsal:20260908-1016-a pnpm test:ai:container`，`evidence/container/09eb0c1b/report.json`，2026-09-08T10:22:10.892Z，6 组。第一镜像此前用真实 Dockerfile.web 构建；脚本再用 `--no-cache-filter build` 重编第二镜像并通过所有持久化/回退/恢复检查。
- 最终复跑：`AI_CONTAINER_IMAGE_A=hxsl-ai-rehearsal:09eb0c1b-b pnpm test:ai:container`，`evidence/container/acbcbccb/report.json`，2026-09-08T10:25:02.115Z，6 组、4 张截图、4 个不同应用容器 ID，`cleanupCompleted: true`。脚本在代理/容器/网络都关闭且原始运行日志无测试秘密后才更新 latest.json。运行 Docker29.5.2 / 镜像 Node22.23.2；未启动替代技术栈。
- 最终两镜像：A `hxsl-ai-rehearsal:09eb0c1b-b` / `sha256:c9692a29e87fce9827b81a20ee0a3a69010ed4ff8c85bc1bcd53304e8a5cd249`，B `hxsl-ai-rehearsal:acbcbccb-b` / `sha256:50b1072dff205367664ac0b1196ccc4e7f84ba7d4ba84f6069336b1d9cf90a8a`。最终 B 的真实构建日志保存在同目录 build-b.log，包含重新编译和1466页生成；没有用 retag 或 docker commit 伪称重建。两次为当前应用/schema5，不声称旧 schema 升级测试。
- 新目录 `/tmp/hxsl-ai-check-acbcbccb-ChsXUf/persistent` 保留供审查；非 root/只读根/internal 网络/no published ports/1CPU/768MiB 与 Secure Cookie 真实执行。没有使用或删除现有命名卷。测试镜像、合成DB和私有备份保留，不是线上数据。
- 验证实际后台草稿→发布初始HTML、HTTP调分、显式合成付款账本、partial PNG、未知任务冻结；重建后配置/草稿 ID、密钥实际解密、订单重放防重、原报价/TTL 与 PNG 哈希均保持。更新后余额14532/冻结1234毫积分，回退旧镜像仍是该值；恢复快照才回到12532/冻结1234，特意证明恢复不包含备份后2000毫积分。未知任务不自动重发或释放。
- 容器内 Node 维护脚本完成 snapshot-verified；无网络维护容器恢复到新的 restored/admin.sqlite，原库/快照不覆盖。恢复报告 aiSchema5、5431296字节、撤销1管理员会话/2用户会话；新容器拒绝旧会话、新登录可读取快照配置和账本。保留原单独图片目录；人工把一个合成结果设为过期后 HTTP410、后台实际清理字节、账本仍一致。不是图片备份或真实灾难窗口对账。
- 首次和最终各4张390px深色截图均已实际查看：更新前账户、重建后定价/后台、恢复后账户。无新增溢出；最终页面异常/外部浏览器请求均空，runtime.log 仅正常启动及 Node SQLite experimental warning，无 EROFS/EACCES。此轮不新增 UI、不声称桌面/全部主题/语言/a11y全验收。
- `pnpm lint && pnpm typecheck` 通过；单独新脚本严格类型检查 `pnpm exec tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --skipLibCheck --esModuleInterop --strict scripts/ai-container-check.mts` 通过。初次 Sharp 类型在根包无法解析，改用已有脚本一致的 web 依赖路径，不增依赖或跳过类型检查。两个维护/上下文脚本 `node --check` 通过。
- 全 web `evidence/web-tests-container.json`：304/304，开始2026-09-08T10:19:03.811Z。`pnpm test:backup`：12组，报告2026-09-08T10:19:04.411Z。没有运行完整 verify/全部82工具真实输出；Docker专项保持显式命令，不强迫非Docker开发机以假成功跳过。
- 最终 Docker 过滤检查无本轮残留容器或网络；公网 hxsl-web-1 仍使用原 hxsl-web 镜像、13080端口且 healthy。未发布公网、改DNS/TLS、调用真实Google/模型/商户或删除卷。继续剩余七语言、支付争议与完整对账、全工具回归、性能及正式外部验收。

## 最新补验：Creem 已验证创建与取消归属（2026-09-08）

- 恢复时通过进程表确认旧测试已结束，未把丢失输出当成通过。重新运行 Creem 33 + Stripe 24 项得到 57/57；再新增实际签名迟到付款 handler 重试/重启/去敏断言。最终 `evidence/web-tests-creem-bound.json`：2026-09-08T10:07:10.809Z，304/304、0 失败，AI 235、Creem 34。
- `pnpm lint && pnpm typecheck` 两次退出 0，第二次在后台 CSS 修复后；四包均通过。`pnpm content:check && pnpm seo:check` 退出 0，82 工具/15 语言和 1230 普通工具语言 URL；不是全部真实输出验收。
- 修复前逻辑已由最初四个失败回归定位；当前新增 11 项覆盖绑定创建/冻结旧配置/真实交易关联/仅 ID 不可豁免/金额币种数量折扣否定例、取消前后客户变更、丢失响应和重启重试。外部 HTTPS 为显式注入替身，SQLite/签名 handler/账本是实际代码，没有调用真实商户。
- `AI_CHECK_PAYMENT_PROVIDER=creem pnpm test:ai:payments` 初次及顶部修复后各 6 组/12 张截图，最新 `evidence/creem/report.json` 时间 2026-09-08T10:10:23.874Z；页面错误和外部浏览器请求均空。初次 12 张均实际查看；最终重新查看 admin-billing-320-dark、admin-billing-390-light、orders-320-dark，修复前图在 `evidence/creem/before-bound-fix/admin-billing-320-dark.png`。其余最终图未逐张重审，不假称全语言/全视口 WCAG 验收。
- 实测问题：320px 顶部不换行、icon-button 被共享 34px 与 flex-shrink 挤窄。仅后台顶部固定 44×44/允许换行；最终脚本检查两个顶部按钮宽高≥44、边界在视口内，并保留原组件 axe/溢出/授权/账本/未知结账断言。截图禁用有限动画以结束主题过渡，生产动画策略未变。
- 两次隔离生产构建均退出 0，第二次包含最终 CSS：`NEXT_DIST_DIR=.next-ai-build HXSL_ADMIN_DB_PATH=/tmp/hxsl-ai-creem-bound-build-730vk7/admin.sqlite AI_ASSET_DIR=/tmp/hxsl-ai-creem-bound-build-730vk7/images AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build`。目录由 mktemp 创建，仅为本轮测试路径，复跑另建私有临时目录。1466 路径；首页 173 kB、工作台 116 kB、定价 110 kB、账户 112 kB、后台 133 kB First Load JS，不等同于 Lighthouse 或真实用户性能。
- 最终 CSS 后 `pnpm test:ai:standalone` 10 组通过，`evidence/production/standalone-report.json` 时间 2026-09-08T10:11:44.907Z；真实 HTTPS 管理鉴权、草稿隔离、发布原始 HTML、同库重启/回滚、资产与秘密排除继续通过。修正脚本中过时的“13 种语言未完成”固定文案，改为明确此冒烟不认证全部语言、需看独立语言报告；没有修改语言资格或关闭语言。
- 最终 `pnpm test:ai:payments`（Stripe 模式）6 组/12 图通过，`evidence/payments/report.json` 时间 2026-09-08T10:11:49.754Z，页面错误/外部请求均空，包含相同顶部触控目标检查。该组最终图未逐张人工审查，不能等同于 Creem 已查看的图。没有对真实商户发送取消或付款。
- 所有本轮构建/浏览器/单测句柄已正常结束，进程表亦无残留测试。未更新公网 13080、未改 DNS/TLS、未真实收费。没有执行完整 verify、全工具真实输出、剩余七语言、真实 OAuth/模型/三商户、容器重建/灾难恢复或完整性能验收。详细安全边界见 creem.md 和 payment-contract-review.md。

## 最新补验：荷兰语、波兰语与完整积分单位（2026-09-08）

- 最终全 web `evidence/web-tests-nl-pl.json`：293 通过、0 失败（AI 224），开始时间 2026-09-08T09:56:39.400Z。`copy.test.ts` 19 项 + `client.test.ts` 7 项；完整键/变量/危险内容、203 字段、语法语言、nl/pl 数词词形、旧中日韩/土越单位、英语套餐单数及所有未完成语言回退均检查。新增回退断言先复现 18 通过/1 失败（pt-BR 的 0 credit），修复后保留断言通过。
- `pnpm lint`、四包 `pnpm typecheck` 通过，最后源代码布局修改后复验；`pnpm content:check`：82 工具/15 语言，`pnpm seo:check`：1230 普通工具语言 URL，通过。不等于全部真实文件输出。
- 四次隔离生产构建，最后一次包含完整自适应字段布局：`NEXT_DIST_DIR=.next-ai-build HXSL_ADMIN_DB_PATH=/tmp/hxsl-ai-nl-pl-build-ALp3s4/admin.sqlite AI_ASSET_DIR=/tmp/hxsl-ai-nl-pl-build-ALp3s4/images AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build`。1466 路径；首页 173 kB、工作台 116 kB、定价 110 kB、账户 112 kB、后台 133 kB First Load JS。此路径仅为本次隔离目录，复跑先另建临时目录，不用于正式启动。
- `pnpm test:ai:locales --locales=nl,pl --baseline` 在改前构建保留 4 图；新版初次 7 组通过后截图发现质量选择器文字截断，另存 `before/nl-quality-clipped-390-dark.png`、`before/pl-quality-clipped-390-dark.png`。修复控件宽度后最终 `pnpm test:ai:locales --locales=nl,pl` 7 组/45 页/13 图，报告 2026-09-08T09:56:48.692Z，`evidence/locales-nl-pl/after/report.json`。
- 全部 13 张最终新语言截图已实际查看：1440/390/320、深浅色、工作台、错误、结果、定价、账户、完整账本及小数套餐。模型与质量整行、其余字段空间不足时单列；不缩短译文或删除选项。选中项 Canvas 字宽检查、控件间距边界、页面水平溢出和组件 axe 通过，errors/external 均为空。不是全站所有视口/缩放的 WCAG 认证。
- 真实内部链路：参考图同意前不上传，跨语言保留草稿/参考图；键盘同意后仅上传一次。两份生成中一份合法 PNG、一份损坏结果，下载后 Sharp 独立解析 256×256；初始 1234567 毫积分，冻结 2468，实际扣费 1234，最终可用 1233333/冻结 0。供应商为明确替身，灰色 PNG 不是建筑 AI 作品。
- 额外发布套餐额度 1000/2000/5000/1234 毫积分，每次读取实际 nl/pl 定价页，独立预期校验 1/2/5/1.234 单位词形与占位符替换，并确认既有钱包不变。套餐仍 USD19.90，仅显示语言格式，无币种替换/汇率/真实购买。
- 45 份禁 JS 原始 HTML 核对所有 15 语言的三路由：title/description/H1/lang/正文/步骤/FAQ/canonical/双向同路径 hreflang/x-default。8 种完整 AI 译文，其余 7 种明确英语草稿。重启隔离可索引环境后 sitemap 实际 1411 条，含 16 个合格 AI URL；账户/草稿/阿拉伯语/后台/API 排除。源代码页面未伪造 lastmod；实际搜索收录未知。
- 最终 CSS 后 `pnpm test:ai:standalone` 10 组通过，2026-09-08T09:56:54.471Z；`pnpm test:ai:workspace` 8 组/9 图通过，2026-09-08T09:57:32.438Z。沿用各自 report.json。原功能实际操作、HTTPS 管理授权、发布/重启/回滚及产物排除再次检查；不是容器重建，本次未逐张重审这组旧语言截图。
- 最终构建另顺序执行 `pnpm test:ai:locales --locales=ja,zh-TW` 与 `pnpm test:ai:locales --locales=tr,vi`，各 6 组/45 页/11 图、errors/external 均空；报告分别为 `evidence/locales-ja-zh-TW/after/report.json`（2026-09-08T09:57:43.063Z）、`evidence/locales-tr-vi/after/report.json`（2026-09-08T09:58:09.988Z）。包括新选择器字宽检查，但本次不声称逐张重审这两组截图。所有本轮拥有的构建/测试句柄已正常结束，未停止常驻开发站。
- 没有执行完整 verify、82 工具完整文件输出、全部 AI 语言/支付截图、真实外部登录/生成/三商户、容器重建或新 Lighthouse/现场流量测试。公网开发站未更新，DNS/TLS 与正式收款未执行。

## 最新补验：土耳其语、越南语与数值显示（2026-09-08）

- 全 web Vitest 报告 `evidence/web-tests-tr-vi.json`：285 通过、0 失败，其中 AI 216，开始时间 2026-09-08T09:35:02.005Z。`copy.test.ts` 11 项覆盖六语言资格、新译文键/占位符/安全与小数、负数、极小积分显示；原客户端断言保留。最终 `pnpm lint && pnpm typecheck` 已观察到退出 0。
- `pnpm content:check`、`pnpm seo:check` 通过，覆盖原 82 工具、15 语言、1230 工具语言 URL；不等于所有真实文件输出测试。
- 隔离生产构建命令：`NEXT_DIST_DIR=.next-ai-build HXSL_ADMIN_DB_PATH=/tmp/hxsl-ai-tr-vi-build-7yBLUP/admin.sqlite AI_ASSET_DIR=/tmp/hxsl-ai-tr-vi-build-7yBLUP/images AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build`。1466 路径生成；首页 173 kB、工作台 116 kB、定价 110 kB、账户 112 kB、后台 133 kB First Load JS。临时路径是本次测试目录，复跑需另建隔离目录；不是部署命令。
- `pnpm test:ai:locales --locales=tr,vi --baseline`：旧构建 4 张基线；最终 `pnpm test:ai:locales --locales=tr,vi`：6 组/45 份 HTML/11 张截图，报告 `evidence/locales-tr-vi/after/report.json`，2026-09-08T09:38:50.257Z。截图逐张实际查看，包含桌面、390/320、深浅色、预检错误、部分结果、定价和完整账本；无新增遮挡/溢出，axe、页面错误及外部浏览器请求检查通过。没有把管理员输入的套餐/模型名称冒称词典翻译。
- 有效参考图先留本地，语言切换保留，键盘勾选同意后仅上传一次；采用 edits 适配器的明确替身。两张请求中一张成功，下载后 Sharp 重新解码 PNG 256×256。实际整数账本：初始 1234567，冻结 2468，最终可用 1233333、冻结 0；tr/vi 显示逗号小数，USD 套餐仍为真实配置币种，未换汇或改计费精度。
- `pnpm test:ai:locales --locales=ja,zh-TW` 完成报告时间 2026-09-08T09:40:47.821Z，`evidence/locales-ja-zh-TW/after/report.json`：6 组/45 页/11 张、errors/external 均空。该次终端最终输出未保留，以脚本全部断言后生成的报告为证；未重新逐张审查这组截图，不覆盖先前日语按钮修复截图的审查记录。
- 两组原始 HTML 均检查全部 15 语言 × 三路由；完整 AI 文案 6/15，另外 9 种明确回退草稿。隔离可索引 sitemap 1407 条，含 12 个合格 AI 页面；账号、草稿、阿拉伯语、后台和接口不包含。canonical 域和公网索引配置未变。静态 JS 未匹配新增词典标记，不等于完整性能分析。
- `pnpm test:ai:standalone`：10 组，报告时间 2026-09-08T09:36:36.101Z；`pnpm test:ai:workspace`：8 组/9 张，2026-09-08T09:37:14.023Z。原英语/简中工作台、生产 HTTPS 授权、配置发布/同库重启/回滚仍通过；不是容器重建或真实供应商测试。
- 初次新脚本错误为 isLocale 导出位置及 MP 定位器误匹配 example.com，已修正导入与精确词边界并重跑，没有删除断言。数字显示根因与维护约定见 `localization-review.md`。
- 本阶段没有完整 verify、全工具真实输出、真实 Google/供应商/支付、容器重建、Lighthouse 或现场流量数据；未生产发布或改 DNS/TLS。所有相关临时测试进程已结束，现有开发网站未停止。

## 最新补验：日语、繁体中文及语言发布资格（2026-09-08）

- 新 `copy.test.ts` 7 项，全 web `evidence/web-tests-locales.json` 281/281（AI 212）、0 失败，startTime 1788859268191；`pnpm lint`、四包 `pnpm typecheck` 通过。原 client 文案测试也覆盖新语言，未删减断言。
- 两次 `NEXT_DIST_DIR=.next-ai-build HXSL_ADMIN_DB_PATH=/tmp/hxsl-ai-locales-build-8TGvbb/admin.sqlite AI_ASSET_DIR=/tmp/hxsl-ai-locales-build-8TGvbb/images AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build` 通过。最终包含手机按钮修复，1466 路径生成；首页 173 kB、工作台 116 kB、定价 110 kB、账户 112 kB、后台 133 kB First Load JS。未测本阶段 Lighthouse/真实用户指标。
- `pnpm test:ai:locales --baseline` 在上一版构建采集 4 张生产基线；`pnpm test:ai:locales` 最终 6 组、45 份原始 HTML、10 张截图，报告 `evidence/locales/after/report.json`，2026-09-08T09:25:52.245Z。另保留日语结果按钮修复前图，共 5 张 before 图。
- 45 个原始 HTML 页面在禁用 JS 的上下文独立检查：15 种语言 × 3 路由，H1/title/description/正文与 FAQ、main 与 html lang、self-canonical、双向完整合格语言集和同路径 x-default。4 种完整译文，其余 11 种显式英语草稿，不把 45 页存在冒称 15 语言翻译完成。
- 测试配置 noindex；同一隔离生产进程重启为可索引配置后，sitemap 实际 1403 条，其中 8 个 AI 工作台/定价 URL，账户/草稿/阿拉伯语/管理与接口不包含。保留正式域配置，未将回环地址或裸 IP 写入 canonical，实际搜索收录未知。
- 两种新语言损坏图片预检无上传；切换语言保留当前用户草稿/任务，键盘勾选同意并提交；2 张中 1 张成功，PNG 独立解码 256×256，余额 50→49、冻结清零。外部供应商为显式测试替身，灰色栅格不是 AI 建筑示例。
- 已查看最终桌面/手机/深浅/错误/结果/价格/账户 10 张截图；修复日语长下载按钮拥挤，增加 320/390px 操作边界断言。当前组件 axe 0 违规，浏览器页面错误及外部请求均 0；不等于全站全语言 WCAG 认证。
- `pnpm test:ai:standalone` 最终 10 组，2026-09-08T09:25:37.113Z。生产授权、草稿/发布/实际 HTML/同库重启/回滚、资产秘密排除与 PayPal HTTP 防护仍通过。不是容器重建。
- 原 `pnpm test:ai:workspace` 在最终 CSS 后 8 组/9 张再次通过（更正脚本过时语言说明后最终复测 2026-09-08T09:27:33.970Z，`evidence/workspace/report.json`）。未把旧工作台场景当作其余语言的验证。
- `pnpm content:check`：82 工具/15 语言；`pnpm seo:check`：1230 普通工具语言 URL，通过。此二者不涵盖全部真实文件输出。
- 本阶段没有完整 `verify`、全工具真实输出、全部 AI 语言/支付状态截图、真实 Google/生图/三商户联调或容器重建。公共开发站未更新，DNS/TLS/正式收款未执行。详细接入与复盘见 `localization.md`、`localization-review.md`。

## 最新补验：AI 配置档案完整内部流程（2026-09-08）

- `pnpm --filter @hxsl/web exec vitest run lib/ai/config-archive.test.ts`：17/17。最新全 web 274/274（AI 205），0 失败；lint、四包 typecheck 通过。没有删除/跳过断言，测试中 SQLite 旧类型声明的 unknown 行通过明确行类型处理。
- `pnpm test:ai:archive`：6 组真实 HTTP/浏览器/SQLite 流程、9 张最终截图；报告 `evidence/config-archive/report.json`，2026-09-08T09:06:53.400Z。下载文件独立解析；预检/导入/发布/回滚、权限/近期验证、错误、并发冲突及提交后丢响应均实际检查，无假成功替身。
- 9 张最终截图均实际查看：1440/390/320、浅深主题、双列→单列差异、已导入草稿、恶意配置、并发冲突、未知响应。错误后旧确认操作清除；通知为 14px，焦点与键盘可操作，组件 axe 无违规、页面错误 0、外部浏览器请求 0。截图不是全站/全部语言 WCAG 认证；Next 开发标识不是生产页面元素。
- `pnpm test:ai:operations`：原 7 组/6 张回归通过，报告时间 2026-09-08T09:05:43.118Z；实际调分、任务核对/取消/清理和套餐草稿仍可用。`pnpm test:backup`：12 组再次通过。
- 两次隔离 build；最终构建包含最后 UI 修复。1466 预生成页面，新增管理 archive 动态路由；First Load JS 首页 173 kB、工作台 116 kB、定价 110 kB、账户 112 kB 保持，后台 133 kB（此前 131）。没有以 bundle 体积冒称 Lighthouse 或真实用户体验达标。
- `pnpm test:ai:standalone`：10 组通过，`evidence/production/standalone-report.json`，2026-09-08T09:08:19.469Z。新增真实生产接口匿名拒绝、HTTPS 管理导出/预检/导入、重启保留草稿、显式发布更新原始 HTML 与回滚；保留原 9 组范围。运行库与秘密仍不打入产物。
- 最后一次 lint/四包 typecheck/全 web 复验通过；Vitest 报告 startTime 对应 2026-09-08T09:10:00.086Z，274 通过、0 失败。所有本轮持有的测试/构建进程句柄已正常完成，未停止长期运行的开发网站。
- 未执行完整 verify / 全工具真实输出/新 AI 全语言 SEO/容器重建；未进行真实 Google、模型出图、支付或生产发布。操作细则、失败恢复与边界见 `config-archive.md`。

## 最新补验：SQLite WAL 备份恢复（2026-09-08）

- `pnpm test:backup`：12 组通过，真实开放 WAL 与独立并发写连接；先复现主文件复制漏掉已提交数据，再核对新快照/实际 CLI 恢复/配置版本/草稿/不可变账本/会话撤销。最后一次复验 `evidence/backup-restore-report.json` 时间 2026-09-08T08:53:14.855Z，Node 22.23.2。
- `node --check scripts/sqlite-maintenance.mjs`、`pnpm lint`、四包 `pnpm typecheck` 通过；全 web 257/257 通过，0 失败。维护测试的 12 组不是额外 12 个 Vitest 用例，不与 257 混算。
- 另执行 `pnpm --filter @hxsl/processing-shared test`：12 通过、5 个既有条件跳过；`pnpm --filter @hxsl/tool-registry test`：3 通过。未改动这些断言/跳过条件，不称全引擎通过。发现既有 worker `test` 仅 console 输出提示而无断言，记录为全工具回归必须补齐的原有缺口，没有将它计为成功测试。
- 唯一最初新测试失败是 Node SQLite 返回 null-prototype 行，而 assert.deepStrictEqual 的字面量比较含原型；归一化该两字段对象后仍完整验证 available/reserved 精确值，没有删除断言。真正旧脚本缺陷由保留的开放 WAL/raw copy 对照断言持续复现。
- 本阶段改维护脚本/测试/文档，不改 Next 运行代码、引擎、依赖、UI 或部署配置；上一阶段 production build/standalone/截图仍是旧时间证据，没有伪称本阶段重采。
- 完整 DB 副本是敏感维护数据，未复制图片文件；只在合成临时目录执行，未读正式库。恢复是 `prepared-offline`，不是容器重建、流量切换或支付灾难恢复；限制及精确命令见 `backup-restore.md`。

## 最新补验：Creem 历史退款/取消（2026-09-08）

- 先新增 4 项回归，原实现产生 4 失败/16 通过，错误为 PAYMENT_PRODUCT_MISMATCH / PAYMENT_STATUS_UNKNOWN；显式区分新授信与状态读取后 20 项通过。
- 再新增 3 项：新授信当前价不符仍拒绝、历史回收不放松金额/币种/环境/关联校验、真实签名回调首次失败后重发成功解除异常且再重放不重复授信。
- 最新 `evidence/web-tests.json`：全 web 257/257，AI 188、Creem 23。`pnpm lint`、四包 `pnpm typecheck` 通过。外部 HTTP 为明确替身，未进行真实退款/取消/付款。
- 此次没有改用户界面，前一阶段截图/浏览器报告不计为本轮新采集。最新代码已通过隔离生产构建与 standalone 9 组；原始 HTML 发布/回滚、同库重启、权限、无自动付款和产物排除复验通过。构建体积与前一阶段相同；没有新增 Lighthouse 或真实用户性能数据。
- 真实 PayPal 争议尚未实现；`paypal-disputes-design.md` 是官方接口与现有数据模型差距证据，不是完成报告。

日期：2026-09-08。没有引入 infinite-canvas。基础文件工具保持现有处理架构；建筑生图需要外部图像供应商，本站不做 GPU 推理。

## 已执行

上一阶段新增 PayPal 用户返回交互，当时全 web 250 项通过（AI 181；PayPal 51）。最新 257 项覆盖该阶段全部用例，不与历史计数累加。

- `pnpm test:ai:paypal-ui`：5 组真实页面/认证读接口/SQLite 与显式支付响应替身检查，9 张截图，0 页面错误、0 外部浏览器请求、scoped axe 无违规。报告 `evidence/paypal-ui/report.json`。
- 桌面 1440、手机 390/320、深浅主题实际查看：定价/确认金额/复选框/unknown/付款验证/订阅/不存在订单。unknown 截图发现“继续结账”误导入口，修复后已重跑断言与截图；付款恢复必须先核对同一订单。长 UUID 和按钮未横向溢出，取消语义清楚。测试开发指示器不当作生产 UI。
- 实际 handler 的 PayPal once/monthly 分派、review/capture 无 GET、匿名/CSRF/越权/恶意额外参数、读状态不发 capture、订阅不授信、返回登录白名单、跨查询归属矛盾均覆盖。HTTP transport 和浏览器金融事实均是明确替身，不是商户付款证据。
- 原 `pnpm test:ai:payments` 的 Stripe 浏览器 6 组/12 张截图再次通过；`AI_CHECK_PAYMENT_PROVIDER=creem pnpm test:ai:payments` 同样 6 组/12 张通过，保留原期末停续费路径。16 项 Creem 服务端测试被全 web 覆盖。
- `pnpm lint`、四包 `pnpm typecheck`、隔离 build 已通过；构建首页 173 kB、工作台 116 kB、定价 110 kB、账户 112 kB、后台 131 kB First Load JS。账户原 111 kB → 112 kB；不是 Lighthouse 或真实用户指标。
- 最后一次界面修复后已重建并通过 standalone 9 组：review POST 401/no-store、GET 405，原 18 项 HTTP 子检查与发布/重启/回滚；新增真实生产账户返回页加载本站订单 UUID、不自动 POST、缺配置时核对明确失败且不出现捕获按钮。最终报告 `evidence/production/standalone-report.json`。

未执行真实商户/OAuth/生图联调、生产部署、DNS/正式 TLS。其余全语言/SEO、支付财务缺口、可靠备份容器演练与全工具真实输出仍未完成。

| 命令 / 检查 | 实测结果 | 证据 |
| --- | --- | --- |
| `pnpm lint` | 通过（现有命令使用 TypeScript 检查，非新增独立 ESLint） | 终端执行记录 |
| `pnpm typecheck` | 四个 workspace 包通过 | 终端执行记录 |
| `pnpm test:ai` | 早期定向执行 89 项；最新全 web 报告覆盖 AI 188 项通过 | `evidence/web-tests.json` 包含所有 AI 用例 |
| `pnpm --filter @hxsl/web exec vitest run --reporter=json --outputFile=../../docs/ai-architecture/evidence/web-tests.json` | 本轮全 web 257 项通过、0 失败，含旧功能与 AI | `evidence/web-tests.json` |
| `pnpm --filter @hxsl/web exec vitest run lib/ai/paypal-subscriptions.test.ts lib/ai/paypal-budget.test.ts lib/ai/paypal-orders.test.ts` | 早期定向 43 项；最新全 web 执行覆盖 51 项 PayPal 用例（26 一次性/返回 + 20 订阅 + 5 预算/迁移） | 同上，外部 API/验签响应均为显式替身 |
| `pnpm --filter @hxsl/web exec vitest run lib/ai/paypal-orders.test.ts` | 21 项订单/捕获/原文验签透传/退款/私有接口/限流检查通过；真实 SQLite，外部 fetch 与验签服务响应为替身 | 同上，PayPal 测试文件；细节见 `paypal.md` |
| `pnpm --filter @hxsl/web exec vitest run lib/ai/creem-payments.test.ts lib/ai/payments.test.ts` | 初次定向 38 项；后续新增用例由最新全 web 覆盖，两文件合计 47 项 | 同上，Creem 23 + Stripe 24 |
| `AI_CHECK_PAYMENT_PROVIDER=creem pnpm test:ai:payments` | 6 组浏览器断言、12 张截图、0 控制台异常/外部请求，组件范围 axe 违规 0 | `evidence/creem/report.json` |
| `pnpm --filter @hxsl/web exec vitest run lib/ai/payments.test.ts` | 24 项支付/退款/续费/原始验签/SDK/后台事件核对测试通过 | 同上，显式支付 HTTP 替身 |
| `pnpm test:ai:payments` | 6 组浏览器断言、12 张截图、AI/后台组件范围 axe 违规 0；无外部请求 | `evidence/payments/report.json` |
| `pnpm test:ai:workspace` | 8 组真实浏览器流程断言，9 张截图；1440/390/320px 面板 axe 违规 0 | `evidence/workspace/report.json` 与截图 |
| `pnpm test:ai:operations` | 7 组真实后台流程断言，6 张截图，1440/390/320px 运营面板 axe 违规 0 | `evidence/operations/report.json` 与截图 |
| `pnpm content:check` | 82 工具、15 语言，通过现有检查 | 终端执行记录；不是 AI UI 翻译完成证据 |
| `pnpm seo:check` | 1230 个现有工具语言 URL 配置检查通过 | 终端执行记录；不是全站现场抓取 |
| `AI_CHECK_INIT_TOKEN=<隔离初始化值> AI_CHECK_PASSWORD=<隔离测试密码> pnpm test:ai:admin` | 10 个 HTTP/UI 断言组；3 个视口/主题组合 axe 违规 0 | `evidence/foundation/report.json`、13 张截图 |
| `NEXT_DIST_DIR=.next-ai-build HXSL_ADMIN_DB_PATH=<隔离数据库> AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build` | 本轮隔离生产构建通过，生成阶段遍历 1466 路径；首页 First Load JS 173 kB，AI 工作台 116 kB，定价 110 kB、账户 111 kB、管理员 131 kB | 构建终端输出，构建目录 `.next-ai-build` |
| `AI_CHECK_BASE_URL=http://127.0.0.1:13317 AI_SMOKE_DB=<隔离数据库> node scripts/ai-production-smoke.mjs` | 18 个生产 HTTP/实际 dispatcher 心跳检查通过（由 standalone 脚本调用） | `evidence/production/report.json` 和原始 HTML |
| `pnpm test:ai:standalone` | 9 组检查：含 PayPal 实际 HTTP 登录/禁止 GET/无配置拒绝/账户返回无自动付款；保留原始 HTML 发布/回滚、重启保留、工作台交互、Secure Cookie、本地 HTTPS 代理和产物排除 | `evidence/production/standalone-report.json` |

早期生产 HTTP 冒烟使用过 `next start`，现已改为实际 standalone server.js。追加验证使用临时数据库和本地 HTTPS 代理；Secure Cookie 未放宽，自签名证书只由测试客户端信任。隔离端口 13317/13318/13319/13320 的测试进程结束后关闭，未停止现有公网项目。进程重启证据**不替代容器重建与完整备份恢复演练**。构建摘要中 SSG 标签并非 AI 页面缓存证明，实际预渲染清单没有 AI 页面，生产原始 HTML 已验证响应运营发布。

## 浏览器与截图审查

已实际查看 `admin-1440-dark.png`、`admin-390-light.png`、`admin-320-light.png`、`admin-error.png`，并查看移动套餐、320px 发布操作、深色凭据模块截图。所有文件位于 `evidence/foundation/`。

首次截图暴露：新 AI 表单使用浏览器原生窄输入框、全局 H2 过大、暗色主按钮对比度不够。已增加 AI 局部表单样式和对比度，修正 textarea 标签关联并重新截图。当前宽度断言和面板 axe 检查通过，发布按钮在 320px 可换行点击。首次失败截图在复测时被覆盖，没有保留独立“前”文件；不把后来截图伪称改造前证据。这里描述的是早期配置后台；后续工作台和运营模块的真实截图见下方追加记录。

真实 UI 验证草稿写入、发布公开值变化、回滚、密钥字段清空且接口不回显、错误版本冲突、无效小数不落库和无模型启用失败；未制造示例统计或假生成结果。

## 真实文件测试与供应商替身边界

`assets.test.ts`、`generation-worker.test.ts` 会用 Sharp 生成隔离测试图片，经过实际图片解码、写入私有文件、下载读取、独立 raw 像素解码与删除，核对 PNG 格式、宽高、EXIF 去除、部分成功收费、过期、并发租约和孤儿清理。

供应商返回使用显式测试替身，测试不向外部发送文件。`provider-http.test.ts` 模拟 DNS/HTTPS 响应，校验地址固定、私网阻断、无重定向、无重试及响应上限；不是互联网 TLS 或真实供应商兼容认证。Google 测试使用合成签名令牌/公钥，不是实际 Google 用户登录。Stripe 已有内部实现，支付测试也使用显式替身，未完成真实商户沙箱。

## 配置与启动规则

- `.env.example` 列出新增环境变量，`compose.yaml` 仅透传可选 AI 配置并复用 `hxsl-admin` 持久卷，默认 `AI_DISPATCHER_ENABLED=false`。没有改现有卷名或清空卷。
- `AI_CONFIG_ENCRYPTION_KEY` 是独立 32 字节 base64 主密钥，可用 `openssl rand -base64 32` 在受限维护环境生成。保存在部署秘密中；不要输出到日志、前端或普通配置导出。更换主密钥前必须设计旧版本解密迁移，不能直接丢弃旧密钥。
- 后台供应商 API Key 写入加密数据库，仅显示槽名和版本。配置发布要求 `AI_PROVIDER_HOSTS` 精确域名允许列表；结果 URL CDN 还要 `AI_IMAGE_HOSTS`。第一版传输只使用公共 IPv4，禁用重定向，TLS 验证未关闭。
- `AI_PUBLIC_ORIGIN` 是公开 HTTPS origin，Google 控制台回调为 `<origin>/api/ai/auth/google/callback`。仅隔离 localhost 允许 HTTP。普通文件工具仍不要求公众登录。
- 长驻 Next Node 进程通过 instrumentation 启动轻量异步 dispatcher，无独立 GPU 推理服务。SQLite 原子 claim 协调并发；没有心跳时新生成请求 503，不能先扣积分后无限等待。
- `AI_GENERATION_CONCURRENCY` 默认 1、最多 4；全局待处理阈值默认 12。上传每用户同时 2 个、全局 8 个 body 租约，最多 20 张/100 MiB 待清理上传，全站上传默认 2 GiB 硬上限。单输入 10 MiB，解码像素 16,777,216，输出 PNG 最多 20 MiB。上传 1 小时，生成结果按接受任务时冻结的 1–30 天保留期。
- 取消只针对尚未发送的队列任务。同步供应商没有已验证的真实停止接口时，已发送任务返回不可取消；未知请求不重发。人工核对需近期管理员验证、确认、记录编号及最长执行窗口结束，按实际输出结算或在确认无输出时释放积分；并不代表供应商已退款。
- 资产存储在管理员持久卷的私有子目录，不进入公开静态目录或 sitemap。任务到期删除 brief/reference JSON，保留非内容财务字段。清理有去敏记录；数据库运维备份的隐私/保留策略和容器恢复尚未完成。

## 参考接口依据

- 图片解码与安全选项：[Sharp constructor](https://sharp.pixelplumbing.com/api-constructor/)、[output](https://sharp.pixelplumbing.com/api-output/)。保留仓库 Sharp 0.34.3，未升级。
- 按 OpenAI Docs 技能核对：[Images generation](https://developers.openai.com/api/reference/resources/images/methods/generate)、[image edits](https://developers.openai.com/api/reference/resources/images/methods/edit)。实现 JSON generations、multipart `image[]` edits 与受限结果解析，具体供应商必须另外实测。
- Google SDK 保持现有 Node 范围，使用 `google-auth-library` 10.9.1；流程参考 [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect)。

## 未完成 / 未测试

AI 工作台/账户/套餐、后台 AI 用户账本与调分、任务人工核对、去敏操作记录，以及 Stripe/Creem 结账/订单/订阅/退款核验已内部实现。PayPal、Creem 争议恢复/完整后台对账、未知结账完整核对、完整运营导入导出与备份恢复、新页面其余 13 语言及完整 SEO、容器重建数据保留、真实 OAuth/图片供应商/三家支付沙箱联调、全工具输出和完整浏览器回归仍未完成。无现场用户流量性能数据。没有执行生产发布、DNS、正式域名 TLS、支付收款或站长提交；本地自签名 HTTPS 仅供隔离测试。

### Creem 阶段证据追加

新增 `creem-api.ts`、`creem-payments.ts`、真实内部 webhook 路由、Schema 4 累计退款、渠道按钮及账户停续费接入。198 项全 web 测试通过，lint/四包 typecheck 通过，隔离生产构建通过。基础工具引擎没有修改；本轮未将网页测试等同于全部 82 工具输出验收。

`evidence/creem/` 已实际查看桌面双渠道购买、320px 深色未知状态（两渠道同时不可重复提交）、390px 真实账本订单、后台桌面和320px异常截图。新增 Creem 重发说明真实可见，没有用“刷新”伪装渠道核对成功。6 组浏览器测试、12 张截图；真实内部 HTTP/SQLite 与明确外部替身分离。当前未真实请求 Creem，不把签名测试或金融夹具冒称实际收款。

API 契约、商户作用域验证限制、未知结账本地期限与渠道期限区别、争议恢复未完成项均记录于 `creem.md`。没有增加无限画布、外部转换 API、用户 CLI 或服务器 GPU 推理。

最终代码复核修复了签名后事件名称校验遗漏下划线的问题；`scheduled_cancel` / `past_due` 原始 HMAC 回归已纳入 198 项报告，未移除安全校验或现有断言。复盘与后续检查清单见 `payment-contract-review.md`。Stripe 模式的 6 组浏览器/12 张截图回归与 7 组 standalone 也重新通过。最后一处正则修复后再次完成生产构建；没有把它说成真实 Creem 外部验收。

### 支付阶段截图与失败修正记录

本轮新增 `evidence/payments/`：主代理实际查看修复前后的桌面定价页、320px 深色定价/结账未知错误、390px 订单、桌面账户与后台、320px 后台异常和退款追偿状态。12 张当前截图及 2 张 `before-pricing-*` 对照。确认框原先仅有 `.ai-controls` 样式，导致套餐确认文字与购买按钮粘连；现覆盖 `.ai-plan`，按钮单独一行，标签间距与换行修复。未发生横向溢出，axe 限定 AI/支付运营组件范围检查为 0 违规，不代表全站人工 WCAG 认证。截图中 Next 开发指示器不是生产 UI。

第一次脚本运行被真实 schema 拒绝（测试套餐缺少 `currency`），补齐 USD 后重跑；第二次因 Next 路由播报器也有 `role=alert` 导致严格定位失败，改为限定 `.ai-page` 的错误提示，没有删除断言。修复后完整支付浏览器脚本重复通过。`pnpm --filter @hxsl/web test --reporter=json …` 被 pnpm 自身 reporter 参数拒绝，改为现有 `exec vitest run --reporter=json …` 正确运行并保存 182 项报告。

支付浏览器只验证真实应用内部 HTTP/SQLite/UI 和隔离金融事实，未知结账 HTTP 为明确替身；`payments.test.ts` 的真实 Stripe SDK 使用显式注入的 HTTP 测试传输，原始报文验签实际执行。后台重核处理测试单独提供已认证上下文，真实逐请求授权、CSRF、近期验证由浏览器 HTTP 检查证明。没有把这两种证据混称实际商户沙箱。

本轮重跑 `pnpm lint`、四包 `pnpm typecheck`、182 项全 web 测试、82 工具/15 语言内容检查、1230 工具 URL 检查、隔离生产 build、7 组 standalone（内含 18 项生产 HTTP 检查）和 8 组工作台浏览器/实际 PNG 下载解析，均通过。测试结束后已检查本轮 127.0.0.1 测试进程全部退出。现有公网开发站未发布本阶段修改。

支付部署与剩余边界参见 `payments.md`。旧后台备份脚本复制主 SQLite 文件存在 WAL 一致性风险，后续备份阶段必须实现一致快照并恢复演练；不将现有复制脚本作为 AI 财务恢复通过证据。

### 用户工作台截图审查追加

`evidence/workspace/` 包含真实工作台的浅色桌面、390px 手机、320px 深色、结果区、双图预览、账户流水与中文错误状态截图，主代理实际查看。显示的纯色 PNG 是明确的测试供应商栅格样本，用于验证文件链路，不是模型实际生成的建筑概念图。

浏览器断言包括：同意前上传数为 0；两张输出一张损坏时只扣 1 积分；下载 PNG 后独立解码为 256×256；复用结果不重传；截断已受理的 HTTP 响应后重试沿用同一请求 ID；取消只释放一次；删除不抹掉已收取费用；切换英语→简体中文保留内存描述；账户真实流水、退出后接口 401。新增图片解码器释放、内存 TTL、CSRF 和文案变量单测。

### 运营与部署截图 / 安全追加

`evidence/operations/` 的 6 张截图已实际查看，覆盖桌面/390px/320px、深浅色、调分失败、任务人工核对及真实审计。修复模块导航间距、错误提示占宽，并在手机下拉框外显示完整核对结论。Native select 的长选项可截断，但关键结论不再只依赖选项显示。测试中的账户、积分和任务是显式合成夹具，不是真实运营统计。

HTTP/UI 验证：匿名与普通用户不能读取后台；CSRF、跨来源、过旧验证拒绝；真实调分响应中断后同 ID 重试只增加一次积分；不能透支；排队取消与未知状态核对改变账本；到期 PNG 确实从磁盘删除；套餐新增/移除只改草稿。新增账本一致性查询使用同一 SQLite 读取快照，避免 Worker 并发结算被误报为不一致。

发现旧 standalone 跟踪包含 `.data/admin.sqlite`，已在 Next 配置排除运行数据库、环境秘密和默认私有图片目录，重建并扫描产物验证排除。没有读取/公开实际数据库内容，没有删除原文件。隔离 HTTPS 生产检查最初因 Secure Cookie 不能通过 HTTP 发送而失败，现用真正的测试反向代理解决，没有降低生产安全规则。

### PayPal 一次性订单服务端阶段

2026-09-08 新增 21 项 PayPal 测试，最新全 web 219 项（AI 150），lint / 四包 typecheck / 隔离生产 build / standalone 8 组通过。没有新增 UI 或截图，前期截图不作为 PayPal 前端验收。最新 standalone 新增实际监听端口的 HTTP 验证：匿名 capture POST 401 且 no-store、GET 405、无配置 webhook 503；未进行真实 PayPal 请求。

测试使用真实私有 HTTP 客户端和 Route Handler、SQLite 事务与重启文件，PayPal OAuth / 验签 SUCCESS / 交易响应均为显式外部替身。覆盖同客户端 token 合并、URL/方法/金额/响应限制、订单/商户/用户归属、同幂等键恢复、原文透传、退款先到/累计重叠/待追回及跨重启捕获限流。不得将替身验签解释成真实签名验证通过。

实现和剩余范围见 `paypal.md`。PayPal 前台购买仍关闭，订阅、返回交互、争议、验签入口全局资源预算、完整对账和真实沙箱仍未完成；未缩减其他两渠道、全语言/SEO、备份容器与旧工具完整回归目标。

### PayPal 订阅与预算阶段（历史记录）

新增月/年订阅创建、实际交易查询/按交易入账、退款/取消、原文已验证事件分派。18 项订阅测试、5 项资源预算/迁移测试；全 web 242 项通过（AI 173），四包 typecheck/lint 通过，隔离生产 build 和 standalone 8 组再次通过。构建生成 1466 路径，首页/AI/后台 First Load JS 与上一阶段相同；不是新的 Lighthouse 分数。

预算回归使用两个真实 SQLite 连接竞争最多 2 个回调租约，测试 finally/异常释放、60 次/分钟限制、120 秒过期与重启。新增的旧 schema-4 迁移用例只在测试创建的临时数据库移除新空租约表与版本标记以复现旧结构，重新打开自动迁移至 5 后审计/原限流数据不变；没有删除任何生产或用户数据。整个恢复/容器目标仍未完成，这不是完整数据库备份恢复证据。

本阶段没有用户界面修改或截图新增。PayPal 前台购买仍关闭，返回/取消文案、争议与 reversal、全部异常事件/后台对账、真实商户沙箱及其余整体目标未完成。`paypal.md` 已明确旧 v1 Sale/Refund 文档弃用标记、实际订阅 API 缺少直接商户 ID 字段与交易幂等键不等于日历周期编号；不隐瞒这些协议验证边界。
# 2026-09-08 付款级人工核对补验（本阶段）

- `pnpm --filter @hxsl/web exec vitest run --reporter=json --outputFile=../../docs/ai-architecture/evidence/web-tests-paypal-settlements.json` 退出0，367/367，2026-09-08T11:49:39.861Z开始；新结算16项，保留此前争议28项和其他完整Web测试。
- `pnpm test:backup`退出0，`evidence/backup-restore-report.json`，2026-09-08T11:47:16.405Z，14组。实际非空schema7审批、完整指纹/幂等、第二账户8000毫积分、不可变update/delete约束在WAL快照和受限恢复后保留；future8/缺表/外键/余额损坏仍拒绝。最初双账户使旧损坏夹具UNIQUE失败，已精确定位单个账户后保留原外键断言通过。
- `pnpm test:ai:disputes`退出0，`evidence/paypal-disputes/report.json`，2026-09-08T11:50:37.643Z，6组/14图，errors/external空。已逐张查看14图；新增后台金额范围、同意框、键盘确认、丢失响应重试、当前/失效状态与真实账户核算。新320/390/1440深浅截图、axe、控件尺寸；Next开发标志仍在，不能称为生产截图。
- 原付款1990美分/10000毫积分，原暂挂5000，确认199美分后余额9000；同一响应丢失重试保持1条审批/1次fixtureGET，无重复回收；新退款398后旧审批失效，保守暂挂后余额3000、前台再次提示财务核对。确认请求由真实结算服务加显式canonical替身处理；未登录/CSRF/来源/近期认证/额外字段/旧版本走实际HTTP拒绝，单测另覆盖真实Route Handler成功路径。不是真实PayPal验收。
- `pnpm lint && pnpm typecheck`与三个脚本严格检查均退出0：`pnpm exec tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --allowImportingTsExtensions --allowJs --skipLibCheck --esModuleInterop --strict scripts/ai-disputes-check.mts scripts/ai-backup-check.mts scripts/ai-container-check.mts`。`pnpm content:check && pnpm seo:check`退出0，原82工具/15语言/1230工具URL；不是全部真实输出证明。
- 隔离构建退出0：`hxsl_settlement_build=$(mktemp -d /tmp/hxsl-ai-settlement-build-XXXXXX)`，再用`NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build HXSL_ADMIN_DB_PATH="$hxsl_settlement_build/admin.sqlite" AI_ASSET_DIR="$hxsl_settlement_build/images" AI_DISPATCHER_ENABLED=false AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build`。日志`evidence/paypal-disputes/settlement-build.log`；1466页，首页173kB、工作台116kB、定价110kB、账户112kB不增，后台134→136kB。不等于Lighthouse或真实用户p75。
- 错误滚动与同意框红色日志/前后图在`evidence/paypal-disputes/`，复盘见paypal-settlements-review.md。金额越界的具体上下限和辅助标签已补充；没有删除断言。

此处不宣称整体完成。完整三渠道自动财务/未知checkout、Google/建筑供应商/三商户实际联调、全部82工具输出、全部语言付款状态/缩放/性能仍未验收。容器与生产追加结果将在下方记录，不能用历史v5报告证明当前v7。

## 同阶段最终生产与容器追加

- 最新构建的 `pnpm test:ai:standalone`退出0，2026-09-08T11:52:07.186Z，10组，`evidence/production/standalone-report.json`。实际HTTPS/安全Cookie、原始HTML发布/重启/回滚、秘密/运行库产物排除及工作台hydration保留。`pnpm test:ai:payments`退出0，2026-09-08T11:52:41.549Z，6组/12图；本轮未逐张重审该12图，不用它替代新增14图的实际视觉审查。
- `pnpm test:docker-context`退出0，23拒绝/8允许路径。容器首轮536d5a5c的A源码构建成功，后因SQLite行null prototype与普通对象比较失败，`failure.json`保留，不计通过。改为展开行原型后严格比较数值，不删财务断言。随后 `AI_CONTAINER_IMAGE_A=hxsl-ai-rehearsal:536d5a5c-a pnpm test:ai:container`退出0，2026-09-08T11:55:15.130Z，`evidence/container/5be9b1f8/report.json`，7组/4图，4图均实际查看，errors/external空、cleanupCompleted=true。
- A镜像sha256 `0974a4d500f6e55367c7e0b1f67d196d72fdb998e985c356314e42c1c6c49ab0`，B `202d9f2dceadc532ee19349b228aed4e88a95017d83e1b29aca93a37a19ed6ba`；A本轮第一次源码构建日志`536d5a5c/build-a.log`，B用no-cache-filter build强制构建，日志`5be9b1f8/build-b.log`。4个不同容器ID与新持久目录记录于报告，非公网Compose/既有卷。
- 容器内真实HTTP后台配置发布→WAL备份→新配置/草稿/新增余额→替换镜像→回退兼容A→无网络恢复新路径→新登录→过期实际清理均通过。schema7非空人工审批/证据/幂等完全保留，第二账户4000毫积分及不可变触发器/真实管理员HTTP current状态一致；主账户12532+冻结1234、更新后14532+冻结1234、恢复快照回12532+冻结1234。不是任意旧schema降级或外部财务缺口自动恢复。
- 最终根 `pnpm test`退出0，日志`evidence/paypal-disputes/settlement-workspace-tests.log`，Web367、Registry3、共享处理12通过。共享处理原有5项条件跳过：PDF差异、OCR包、安全涂黑、qpdf加解密、PDF渲染；宿主command -v未找到qpdf/pdftoppm/pdftotext/tesseract。未新增跳过或删断言。另发现原worker test只打印“由compose测试”的提示，不是真实测试；仍须改成可执行隔离验证。因此工作区退出0不能作为全引擎回归证明。
- 容器脚本修正后严格独立tsc再退出0。应用源文件没有在最后构建后修改；文档/测试追加不改变运行产物。最终owned会话均终止，13317/13320/13321/13323无监听，5be9b1f8容器及网络无残留。合成数据/镜像保留；仅演练中的合成过期PNG被真实清理。公网hxsl-web-1仍hxsl-web running/healthy，未更新或停其他服务。

完整Goal保持进行中；没有执行生产部署、DNS/TLS、真实Google/图像/支付请求或完整verify。下一步保留支付剩余财务契约，同时补隔离引擎/真实Worker测试及全部工具输出，外部联调需受保护配置和正式验收。

## 2026-09-08 Worker隔离引擎补验

- `pnpm --filter @hxsl/worker test`不再打印成功提示，8项真实处理测试通过。提取processor模块避免测试导入即连接Redis/监听；JPEG解码12×8、AES-GCM参数/篡改、0600输出、路径/体积/损坏拒绝和PDF页序几何均有独立断言。Worker build退出0，测试文件不编译到生产dist。
- `pnpm test:worker:isolated`最终退出0，`evidence/worker/6704d299/report.json`，2026-09-08T12:06:48.993Z。共享17＋Worker8=25项、0跳过/0失败，报告`engine-tests.json`；missing binary在严格模式下不是skip。真实pdftoppm容器命令-v已核验旧--version探测假设错误，宿主确实缺引擎不能冒称在宿主执行了它们。
- 构建verification镜像sha256 `36fcdfa6a9f5fc8fe4c8e3f17174709c326f419e3b4e1d30de8e9bef3114f1e1` 与默认生产Worker镜像 `d1330103d7aff8584fa01e19b74f05eeb93790bb12feba46d7a5449da5595a5e`。实际检查默认CMD/UID1001、无新增测试入口或processor.test.js；真实服务使用runtime镜像，非仅用测试镜像启动服务。构建日志和镜像检查分别在最终目录。
- 真实internal Redis/Worker HTTP共7组：JPEG40×30、PDF宽420/300页序、加密PDF拒绝无密码解析/解密后文字正确、PNG ZIP两页解码、Tesseract识别文本及搜索PDF、基础DOCX解包文字/LibreOffice生成PDF、损坏文件失败但保留此前成功。所有测试输入合成，不上传第三方、不访问现站用户文件。
- 取消实际验证：暂停队列后删除等待作业，未运行/未输出；活动80页合成PDF渲染调用取消，原请求失败且无输出，队列标failed。生产Worker进程命名空间检查无pdftoppm/qpdf/tesseract/soffice子进程残留，`children-check.log`。排队取消原等待请求仍在超时后才返回失败，未冒称即时终态体验；非所有引擎取消验证。
- 实际打开并查看`original-preview.png`和`redacted-preview.png`：原图文字HXSL OCR sample secret，处理后目标secret消失，其余文字清晰保留。PDF结果另由Poppler提取确认无该词，不是只覆盖文字层；此合成样例不证明所有PDF的涂黑安全/字体/OCR/隐藏对象处理。
- 首轮ae67384b的引擎25项通过，但Redis退出1（chown权限），整体失败。确认证据后只停止同标签runner，原脚本结束并清理自有资源。修复直接使用redis用户，不增加capabilities，启动前ping与单次fetch超时。中间d977da1a代表真实队列首次通过，最终6704d299增加默认生产镜像及渲染图后再次通过。失败日志未删除；复盘worker-verification.md。
- 最终根`pnpm test`退出0，`evidence/worker/6704d299/workspace-tests.log`：Web367、Worker8、Registry3、共享12通过；共享5项仍按宿主缺依赖条件跳过，但它们在同源码隔离17项中已实际执行。`pnpm lint && pnpm typecheck`四包退出0；runtime脚本严格tsc退出0，`pnpm content:check && pnpm seo:check`82工具/15语言/1230URL通过。没有改公开UI，本轮不以旧截图宣称新界面审查。
- 额外反向检查 `HXSL_REQUIRE_ENGINES=true pnpm --filter @hxsl/processing-shared test`在缺Poppler的宿主按预期退出1，`missing-engine-negative.log`明确`Required engine unavailable: pdftotext`，未执行任何测试、未报skip或success。这是严格验收缺依赖必须失败的证明，不计入通过数量；同套源码的容器正向25项仍全执行通过。`node --check scripts/worker-engine-check.mjs`退出0。
- 所有本轮会话与最终容器/网络已结束，`cleanupCompleted=true`且只发布此后成功报告；新合成盘`/tmp/hxsl-worker-check-6704d299-ddISty/data`及镜像/输出保留。公网hxsl-web-1/hxsl-worker-1仍原镜像running，未部署、未改DNS/TLS或卷。

完整Goal继续：全部82本地浏览器工具输出、余下支付自动财务/未知checkout、真实Google/图像API/三商户、全部语言交互及性能仍未验收。仅代表引擎真实运行通过，不缩减总目标。
