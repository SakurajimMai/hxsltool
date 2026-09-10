# AI 上传异步权限与文件生命周期

2026-09-08。完整建筑 AI Goal 继续，不引入 infinite-canvas，不变更部署、schema7、计费或普通文件工具。此阶段是内部上传生命周期修复，不是实际 Google/供应商/商户认证。

## 行为契约

- 原始图片仍经过签名、字节、像素、完整 Sharp 解码与 PNG 再编码；解码并发与磁盘配额不提高。
- 解码完成后，在预留配额事务内重新检查账户状态。账户已停用时不创建上传行或文件。
- 文件写入/fsync/关闭完成后，重新检查账户、资产归属、删除标记与实际过期时间；不向前台返回已失效的上传成功信息。
- 后置检查失败时先写撤销标记，再尝试删除此次成功创建的文件。清理程序若曾在创建文件前把行标记为 `removed:<id>`，恢复的只是文件清理路径，不恢复下载权限。
- 删除失败不伪造物理清理成功。保留原文件路径和撤销标记，由既有有界清理程序重试；重新开启账户也不能下载该次撤销上传。
- 只有本次独占创建并成功写入的文件才进入后置回滚删除。独占创建失败保留原有存储错误行为，不盲目 unlink 预先存在的路径。
- 已受理生成任务仍可完成写盘与结算，账户停用只阻断下载等用户操作，不隐式取消已受理任务或释放其费用。

文件系统与 SQLite 不是同一事务。崩溃、部分写入错误以及多个清理程序和写入程序任意交错仍依靠现有墓碑/孤儿恢复，不把本组几个精确调度窗口宣称为所有故障的原子性证明。请求会话的每一个 await 后即时撤销不在本组新验收范围；本组明确验证账户状态与上传资产有效性。

## Bug Analysis: 异步边界后的旧授权快照

### 1. Root Cause Category

- E（隐式假设）与 D（测试覆盖缺口）：入口鉴权被当成整个解码/写盘阶段持续有效，原测试只在返回后再删除或过期。
- 证据：新增六项测试在原实现中有五项返回成功而失败，普通上传对照通过。实际 SQLite 和 PNG 文件参与测试；只有 mkdir、fsync 的调度暂停及 EACCES 为明确注入。

### 2. Why Fixes Failed

首版修复通过针对性 39 项。新增路径恢复/删除失败及原任务完成等三项加强回归后，全 Web 570 项通过。没有删除原断言。

另外发现此前 `incremental-results/lint.log` 和 `typecheck.log` 实际包含 TS18047，并非之前文档所称通过。`spawn` 的通用返回类型允许 stderr 为空，测试中的 stderr 日志监听现改为可选访问；实际 IPC/存活/kill/结果/结算断言不变。原失败日志不改，最终通过记录独立保存在本阶段目录。

### 3. Prevention Mechanisms

| 优先级 | 机制 | 状态 |
| --- | --- | --- |
| P0 | 跨 await 的权限与有效性重新读取，先撤销再清理 | 已实施 |
| P0 | 解码停用、fsync停用/删除、创建前过期清理的真实文件回归 | 已实施 |
| P0 | 清理失败、重开数据库后重试、恢复账户不恢复资产权限 | 已实施 |
| P1 | 成功上传独立解码、既有任务结算与独占创建冲突对照 | 已实施 |
| P0 | 检查每条命令的终态和实际日志，不能用最后一条成功推定前面均成功 | 本次更正并重新验证 |

### 4. Systematic Expansion

`readAiAsset` 已在读取后重查授权，`storeAiOutput` 已在写盘后事务内重查任务终态/期限；本次保留这些不同生命周期的规则，没有把上传账户检查机械复制到旧任务结算。全部请求撤销和任意并发清理的系统故障验收仍需继续。

### 5. Knowledge Capture

按 trellis-before-dev/check/break-loop 记录契约、边界、红绿证据和历史报告更正。仓库无 `.trellis` 或 Git，不伪造模板同步或提交。

## 可复跑与证据

证据根目录：`evidence/upload-lifecycle/`。

- `before.json`：1通过、5失败，旧代码真实返回错误成功。
- `focused.json`：上传/资产/Worker共39通过，尚未加入后补三项。
- `web-tests.json`：最终570通过、0失败/跳过，比原561新增9项。
- `lint.log`：首轮失败；`lint-after.log` 和 `typecheck.log`：修复后通过。根 `workspace-tests.log`：Registry5、Worker8、共享12、Web570通过；共享5项宿主缺引擎跳过，没有改跳过条件。
- 构建和浏览器最终状态、截图审查范围见 `validation.md`；文件存在本身不是运行成功证明。

```bash
pnpm --filter @hxsl/web exec vitest run lib/ai/upload-lifecycle.test.ts lib/ai/assets.test.ts lib/ai/generation-worker.test.ts
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm seo:check
hxsl_upload_build=$(mktemp -d /tmp/hxsl-upload-build-XXXXXX)
NEXT_TELEMETRY_DISABLED=1 NEXT_DIST_DIR=.next-ai-build \
HXSL_ADMIN_DB_PATH="$hxsl_upload_build/admin.sqlite" \
AI_ASSET_DIR="$hxsl_upload_build/images" AI_DISPATCHER_ENABLED=false \
AI_PAYMENTS_ENABLED=false ALLOW_INDEXING=false pnpm build
AI_WORKSPACE_EVIDENCE_DIR=docs/ai-architecture/evidence/upload-lifecycle/browser pnpm test:ai:workspace
AI_STANDALONE_EVIDENCE_DIR=docs/ai-architecture/evidence/upload-lifecycle/production pnpm test:ai:standalone
```

没有部署公网13080、改DNS/TLS、停止其他项目、删除持久卷或调用真实付费服务。本组不是新UI设计、全15语言交互、全82工具输出、性能或完整支付验收；45个待浏览器输出工具、真实外部联调及既有财务缺口保持未完成。
