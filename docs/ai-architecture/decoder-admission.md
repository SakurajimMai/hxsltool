# 已生成图片的有界解码调度

2026-09-08。此阶段是建筑 AI 结果正确性修复，不引入无限画布，不增加生成并发或服务器推理。没有真实供应商调用、收款或公网发布。

## 核验发现与实际改变

原 Worker 允许配置1–4个并发任务，但 `verifyAiImage` 在进程内已有2个解码时立即报 `IMAGE_VALIDATOR_BUSY`，不区分未付费上传与供应商已返回的结果。4个任务同时返回时，后两份合法结果可能无法持久化，进入 unknown 并继续冻结积分；“限制资源”不应等同于“丢弃已返回结果”。

新增 `image-decode-admission.ts`，由 `assets.ts` 的实际校验入口共用：

- 实际并行解码仍最多2个，保留现有像素、字节、尺寸、格式、完整解码和15秒处理约束。
- 普通上传没有空闲槽时仍立即返回既有503繁忙，不把用户上传请求放进无界内存队列。
- 已生成结果可FIFO等待，最多4个等待者（覆盖4个Worker同时被2个上传占用的情况），等待最长45秒；不提高实际解码并发。
- 释放槽时同步移交给已排队结果，防止新上传抢占。成功、解码错误均释放；重复释放无效；排队超时只移除等待者，不能释放仍在运行的解码槽。
- 计费仍只依据实际验证且落盘的输出记录；没有再次发送供应商POST、虚构输出或人为释放未知任务积分。

这一队列只协调当前进程的解码，不是持久任务队列、磁盘结果暂存或分布式资源上限。进程死亡、CDN失败、磁盘失败等窗口仍需独立恢复方案；现有 unknown/管理员核对保留，不能把这次修复宣传为完整供应商故障恢复。

## Bug Analysis: 并发预算不一致

### 1. Root Cause Category

B（跨层契约）＋D（覆盖缺口）＋E（隐含假设）。任务并发上限4与校验并发上限2可以共存，但缺少背压策略，默认把每一次超限都当作可以让调用者重试的上传。

### 2. Why Fixes Failed

此前生成测试主要验证单任务、部分损坏与拒绝/未知上游。新4用户/4任务同时返回的真实PNG测试在旧代码失败（原13通过＋新1失败），证明不是供应商行为或错误测试按钮；本次不通过把并发降为2、提高解码上限或重发上游来规避问题。

### 3. Prevention Mechanisms

| 优先级 | 契约 | 证据 |
| --- | --- | --- |
| P0 | 支持的4任务并发必须全部持久化有效结果且仅结算一次 | 四用户各2000毫积分→实际输出各500→重开SQLite后各1500可用/0冻结、四次上游替身调用，无第五次 |
| P0 | 有界队列不能突破2个解码槽或4个等待者 | 新调度单元测试：硬上限、FIFO、无插队、队列超限 |
| P0 | 超时/错误/重复释放不泄漏或错误增加容量 | 45秒虚拟时钟、无残留计时器、重复释放测试；6份真实图片含损坏PNG，5份正确独立解码 |
| P1 | 上传繁忙策略保持 | 三个真实并发上传验证2成功/1繁忙，后续生成验证仍可使用 |

### 4. Systematic Expansion

结果获取与结果校验的拥塞必须区分；不能将可安全重试的本地计算与可能收费的供应商请求放入同一重试循环。下一步仍需补供应商结果暂存/断点、CDN与磁盘故障、完整取消/过期及真实外部联调，不以本组通过缩减完整Goal。

### 5. Knowledge Capture

契约保存在本文与进度/验收表。本工作区无 `.git` / `.trellis`，不虚构提交或模板同步。本次按 trellis-check 检查跨层预算与结果结算，按 trellis-break-loop 记录根因，而非仅增加一次重试。

## 证据与复跑

证据根目录 `evidence/decoder-admission/`：

- before.json / before.log：13通过、1失败；上游是显式合同替身，结果为Sharp真实PNG，SQLite和文件持久化是真实的。
- focused.json：第一批31项通过；随后增加的2项真实解码/上传回归包含在全Web报告。
- web-tests.json：556通过、零失败/跳过。原548项全部保留，新增8项。
- lint.log / typecheck.log：原命令通过。根测试Web556/Registry5/Worker8/共享12通过，宿主共享5缺引擎跳过；content82×15基础键、SEO1230工具URL源码检查通过。
- build.log：隔离生产构建退出0，首页173/AI工作台116/定价110/后台137/普通工具411kB First Load JS保持。没有新增客户端模块，也没有新的Lighthouse/p75指标。
- production/standalone-report.json（14:13:22.120Z）：10组真实HTTPS生产模式通过，含管理员授权、草稿隔离/发布原始HTML、重启持久化、回滚、运营档案导入、PayPal未配置拒绝、dispatcher心跳及产物无运行数据库/环境秘密。此脚本没有调用实际供应商，也不证明新4任务测试已在真实供应商环境运行。
- 全部本轮命令已到终态；最后13317/13320均无监听，无本轮遗留后台终端。无容器重建/新截图/生产改动。

```bash
pnpm --filter @hxsl/web exec vitest run lib/ai/generation-worker.test.ts lib/ai/image-decode-admission.test.ts lib/ai/assets.test.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm seo:check
hxsl_decode_build=$(mktemp -d /tmp/hxsl-decode-build-XXXXXX)
NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build \
HXSL_ADMIN_DB_PATH="$hxsl_decode_build/admin.sqlite" \
AI_ASSET_DIR="$hxsl_decode_build/images" AI_DISPATCHER_ENABLED=false \
AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build
AI_STANDALONE_EVIDENCE_DIR=docs/ai-architecture/evidence/decoder-admission/production pnpm test:ai:standalone
```

没有前台/后台视觉改动，不新增或复用旧截图冒充本轮截图审查。不是实际生图质量、Google登录或支付商户验收，也不是新的容器/生产发布演练。schema7、部署密钥、正式数据卷和82工具保持不变。
