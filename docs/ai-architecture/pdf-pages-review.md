# 本地 PDF 页面操作与缩略图参数一致性

后续 15 语言错误与移动排序按钮见[pdf-page-accessibility.md](pdf-page-accessibility.md)。下面记录仍是参数/预览一致性阶段，不覆盖该后续证据。

2026-09-08。建筑 AI 完整 Goal 继续，保留原文件工具、不引入 infinite-canvas。本组不是新 PDF 引擎或完整 AI 外部联调；原技术栈、数据库、支付和部署秘密不变。

## 实际修复与用户路径

用户仍从原 `/[locale]/pdf/<slug>` 选择文件、设置参数、在本地处理并下载。不要求公众账号，不自动上传。

- `duplicate-pages` 现在真正使用重复次数和插入位置；次数为1–10整数，位置为0–原页数整数（0表示最前），保留所有原页。在复制前检查扩展输出不超过当前工具页数上限，不能用重复操作突破上限。
- `rotate-pdf` 在原页面旋转基础上增加所选角度，而非覆盖为固定角度。浏览器和共享处理模块同步；原90°/270°两页再转90°，结果180°/0°，未选页保持。
- 页码解析拒绝多余区间段 `1-2-3`、空尾项、小数/指数/越界等，不默默截断；正常选择仍去重并按原文档页序输出。
- `reorder-pages` 的默认空顺序表示保持原序；显式顺序必须完整、唯一。缩略图只加载前60页，但键盘/拖拽修改的是完整文档顺序，61页输出仍61页。
- 手动字段、预设、重置均成为预览状态的来源；渲染完成不再调用参数修改回调。手动页码选中状态与预览同步，手动排序后键盘移动也不会恢复旧顺序。
- 修复缩略图 `role=list` 缺少listitem的结构错误，保留原生按钮和键盘操作。标题、说明、页号与选中标签≥14px；选中标签不再用8px浮层遮在图片上。
- Registry 的拆分输出改为真实ZIP。没有改稳定ID/路由或抬高implementationStatus。拆分本组只验收所选各页独立PDF组成ZIP，不宣称任意分组或全部格式场景已实现。

## Bug Analysis: 有界预览覆盖完整处理计划

### 1. Root Cause Category

E（隐式假设）/B（跨层契约）/D（覆盖缺口）：把“渲染出的页”误当成完整排序；预览内另存选中状态而不读取新参数；重复次数显示了却未参与处理。旧冒烟只确认文件存在，没有核对非默认参数和源页面。

### 2. Why Fixes Failed

新增脚本首次在启动前因辅助函数名`process`遮蔽Node全局失败，已改为`processFiles`并保留`checks/script-before.log`；不把此诊断算产品失败。

真实旧构建基线12组5通过7失败，分别含旋转角度、复制输出页数、缩略图ARIA结构、字段→选中状态、61页排序、字段→顺序和畸形范围。首版修复13组通过；实际审查发现错误截图滚动位置只显示参数，没有错误卡片。改采集定位后最终13组再通过，实际查看全部4张最终图。断言没有删除，另外加强源文本流、字体大小和输出预算检查。

### 3. Prevention Mechanisms

| 优先级 | 机制 | 状态 |
| --- | --- | --- |
| P0 | 预览加载无参数写入，60页渲染上限不截断完整顺序 | 已实施 |
| P0 | 纯页计划函数负责严格解析、完整排序和有界复制 | 已实施，27项Web单测 |
| P0 | 下载后检查PDF签名、页序/尺寸、旋转、各页源文本流 | 已实施，7工具生产浏览器 |
| P1 | ZIP独立CRC/条目/PDF重解析、错误无下载与参数恢复 | 已实施 |
| P1 | 真实截图定位到待审查状态，而非只有截图文件存在 | 已修正并复跑 |

### 4. Systematic Expansion

原图片→PDF→合并、重名ZIP/部分失败/重试、参数修改/预设/旧结果保护均重新跑实际浏览器。保留15语言已有内容和路由，不把英文页面操作用例扩称全语言交互；PDF参数错误仍存在英语文案，完整15语言错误、拖拽/触摸替代的完整体验、所有范围/表单/安全PDF和资源释放窗口仍待继续。

### 5. Knowledge Capture

按 trellis-before-dev/check/break-loop 将契约保存在本文、implement、validation与全82矩阵。没有Git或`.trellis`，没有伪造提交或模板同步。

## 证据与实际审查

根目录 `evidence/local-pdf-pages/`：

- `before/report.json`：12组5通过7失败；本次实际查看reorder-desktop、selection.field-to-thumbnails-failed两张基线图，其余失败图仅保留。
- `after/report.json`：首版13组通过、4图均查看，其中invalid-range未拍到错误，不能作为错误可见性证据。
- `final/report.json`（14:46:05.145Z）：最终13组通过、4图全部实际查看，4次工作区axe及字号断言通过；1440浅色、320深色排序，390浅色选页，320深色错误。只有当前工作区视口，不是全站WCAG或200%/400%缩放证明。
- PDF重开：3页尺寸及源文本标记区分每页；复制3→5、旋转原角度叠加、删除/反转/选页/完整61页排序。split ZIP两份PDF独立解析；没有上传、站外请求或页面异常。
- `pdf-batch-regression/report.json`（14:46:14.580Z）：9组/8图，五图片格式→PDF、内嵌像素、链式合并、重名ZIP/部分失败/重试、真实像素上限、15语言摘要通过。本次8图未逐张人工复看，不冒称截图审查。
- `recompute-regression/report.json`：20组/7图，15语言失效态及图片/合并参数冻结、预设、重试通过；本次7图仅采集与自动检查，准确时间见报告。
- `checks/workspace-tests.log`：Web597（原570+新27）、Registry6（新拆分ZIP声明1）、Worker8、共享13通过（新增实际旋转1）；共享5项宿主缺引擎跳过，未修改条件。`lint.log`、`typecheck.log`、最终`script-types.log`均通过。
- `checks/build.log`：隔离生产build通过，工具页First Load JS411kB、首页173kB、AI工作台116kB，摘要精度下与前阶段相同；没有新Lighthouse/p75实测。content82×15、SEO1230工具URL源码配置检查通过，不是完整HTTP爬取。
- 生产HTTPS standalone回归最终状态见validation和对应报告；不能用脚本存在推定通过。

## 精确复跑

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm seo:check
pnpm exec tsc --noEmit --strict --skipLibCheck --module ESNext --moduleResolution Bundler --target ES2022 --esModuleInterop --allowImportingTsExtensions --typeRoots apps/web/node_modules/@types --types node scripts/local-pdf-pages-check.mts
hxsl_pages_build=$(mktemp -d /tmp/hxsl-pages-build-XXXXXX)
NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build \
HXSL_ADMIN_DB_PATH="$hxsl_pages_build/admin.sqlite" \
AI_ASSET_DIR="$hxsl_pages_build/images" AI_DISPATCHER_ENABLED=false \
AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build
HXSL_PAGES_EVIDENCE_DIR=docs/ai-architecture/evidence/local-pdf-pages/final pnpm test:local:pdf-pages
HXSL_PDF_EVIDENCE_DIR=docs/ai-architecture/evidence/local-pdf-pages/pdf-batch-regression pnpm test:local:pdf-batch
HXSL_RECOMPUTE_EVIDENCE_DIR=docs/ai-architecture/evidence/local-pdf-pages/recompute-regression pnpm test:local:recompute
AI_STANDALONE_EVIDENCE_DIR=docs/ai-architecture/evidence/local-pdf-pages/production pnpm test:ai:standalone
```

新脚本只监听127.0.0.1:13331，使用自己新建的临时SQLite/合成文件，并在finally关闭自己启动的浏览器和Node进程。截图/下载证据保留；不删除生产数据或停止其他项目。构建没有部署到公网13080，不涉及真实AI、Google、支付、DNS/TLS、Docker重建或外部费用。

本组完成7个新工具身份的浏览器回归，累计44/82（其中原2个为AVIF编码能力边界），38个身份仍待输出验证；完整财务、实际供应商/Google/三商户、全语言状态及性能仍未完成。不是整个Goal验收完成。
