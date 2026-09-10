# 建筑 AI 隔离容器更新与恢复演练

本流程只使用现有 Dockerfile.web、Next/Node/SQLite 和真实持久文件，不启动额外推理服务，不使用 infinite-canvas。公网 Compose 项目与其命名卷不参与测试。结果以 `evidence/container/latest.json` 指向的成功报告为准；没有成功报告时不能按脚本存在认定验收通过。

## 最新schema7演练（2026-09-08）

成功报告 `evidence/container/5be9b1f8/report.json`，2026-09-08T11:55:15.130Z，7组、4张生产容器手机深色截图，均已实际查看。保留原发布/草稿/凭据/冻结报价/PNG输出/恢复检查，另加入真实非空PayPal人工权益审批：两镜像更新、兼容镜像回退和离线恢复后，审批/证据/幂等字段完整一致，第二账户仍4000毫积分，真实容器HTTP返回current且不泄漏私有查找字段，update/delete触发器仍生效。

首轮 `536d5a5c` 构建A成功，但测试对SQLite null-prototype行直接严格比较普通对象失败；原报告/日志保留，不能计为成功。修正测试只展开对象原型、保留全部数值与账本断言后，执行 `AI_CONTAINER_IMAGE_A=hxsl-ai-rehearsal:536d5a5c-a pnpm test:ai:container`：复用本轮刚建且标签校验的A，B用 `--no-cache-filter build`真实重编。两次构建日志分别在 `536d5a5c/build-a.log`、`5be9b1f8/build-b.log`。A/B应用源码同为schema7，不是从旧schema自动降级的证明。

独立镜像 `hxsl-ai-rehearsal:536d5a5c-a` 与 `hxsl-ai-rehearsal:5be9b1f8-b` 的SHA256和4个不同容器ID记录于报告。合成数据留在 `/tmp/hxsl-ai-check-5be9b1f8-owwt1V/persistent`，没有复用生产卷。仅测试合成过期PNG被实际删除，不能从当前图片目录恢复；数据库备份不含图像。其余合成配置/数据库/快照/镜像保留。所有本轮容器与internal网络已关闭移除，`cleanupCompleted=true`，公网服务未变更。

## 执行条件和命令

- 本机 Linux、rootful Docker/Buildx、本地 Unix socket；脚本需要调整**新建合成目录**到镜像 UID/GID 1001。不是对生产目录执行 chown 的教程，也不支持把远端 Docker 冒充本地绑定盘。
- 沿用仓库锁定 pnpm/Node，先正常安装依赖；需要 Playwright 已有浏览器和本机 openssl。至少为两次源码构建准备空间。构建会下载公开依赖，运行容器使用无外网默认路由的独立 internal 网络。
- 不读取源目录 `.env`，不复用管理员/Google/模型/支付真实秘密。临时管理员、会话、加密主密钥仅为合成测试，写入新的 0600 env 文件；测试报告不记录它们。

```bash
pnpm test:docker-context
pnpm test:ai:container
```

`test:docker-context` 使用实际 Docker BuildKit 对合成目录 COPY/export，检查 23 个拒绝路径和 8 个必要输入，而非自写一份可能与 Docker 不同的 glob 解析器。

边界依据：[Docker 构建上下文与 dockerignore](https://docs.docker.com/build/concepts/context/#dockerignore-files)、[Docker bind mount](https://docs.docker.com/engine/storage/bind-mounts/)。构建上下文、最终镜像与运行绑定盘是不同阶段，分别提供测试证据。

`test:ai:container` 默认建立两个随机命名的 `hxsl-ai-rehearsal:*` 镜像；第二次使用 `--no-cache-filter build` 真正重编源码。需要复用自己已构建的第一镜像时，可显式设置 `AI_CONTAINER_IMAGE_A`，仅接受此命名空间并要求 `com.hxsl.ai-rehearsal=true` 标签。脚本不接受或重标记公网 `hxsl-web:latest`。

## 隔离与验收关系

1. 新建私有目录的 persistent 子目录绑定到 `/var/lib/hxsl-admin`，数据库及 AI 图片分开子路径；不挂载宿主根目录、Docker socket 或现有命名卷。
2. 镜像按 nextjs/UID1001 运行，只读根、drop ALL capabilities、no-new-privileges、768 MiB 内存、1 CPU、256 PID 和限额 tmpfs。容器不发布端口，宿主仅通过绑定 127.0.0.1 的临时 HTTPS 代理访问独立 internal 网络 IP。
3. 真实管理员初始化/登录/权限/CSRF → 保存草稿不影响 HTML → 发布配置与积分参数 → HTTP 调分。生成结果和收款事实明确采用合成夹具，分别经过实际账本和图像验证服务，不声称发生了 Google 登录、模型生成或商户付款。
4. 生成两份中一份合法 PNG，按 1234 毫积分收费；另一未知任务冻结 1234 毫积分。下载后重新用 Sharp 解析；跨用户访问拒绝。普通配置导出不含秘密。
5. 在第一容器内以非 root 维护脚本备份开放 WAL 数据，再发布新配置、保留未发布草稿、增加 2000 毫积分。第二源码镜像替换第一容器，原目录继续挂载；配置版本、草稿、余额、已验证订单防重、加密槽位、原报价/过期日、未知状态和 PNG 哈希保持。
6. 回退到第一镜像时继续使用**当前数据库**，保留备份之后的配置和积分，不能通过恢复旧快照假装普通更新没有丢数据。后台内容回滚保留版本历史。
7. 停止本轮容器后，使用无网络、只读根的同版维护容器把备份准备到新 `restored/admin.sqlite`。新容器切换到恢复副本，旧会话被拒绝，新登录可用，余额回到快照时刻，未知任务保留冻结；原数据库和备份均不覆盖。
8. 图片不在数据库快照中，测试继续挂载先前的单独图片目录。对一个合成结果推进到过期，确认 HTTP410，再用后台真实清理删除字节，账本保持一致。

正常结束只停止/移除脚本记录的容器 ID 和所属标签一致的新建网络。数据目录、测试备份和镜像保留供审查；**不删除任何数据卷**。中断时先根据本轮报告/终端的随机标识核对孤立资源，不使用全局 prune、compose down -v 或批量通配删除。

## 维护脚本现在随 runtime 镜像提供

Dockerfile.web 只携带既有 `scripts/sqlite-maintenance.mjs`、`scripts/admin-backup.mjs`、`scripts/admin-restore.mjs`，不新增 shell/SQL 网页控制台或公众 CLI。维护命令可通过已授权的宿主 Docker 操作执行，不需要镜像内安装 pnpm。示意命令中的容器 ID 和路径必须由操作者确认，使用全新备份文件：

```bash
docker exec <已核验的容器ID> node scripts/admin-backup.mjs /var/lib/hxsl-admin/backups/<新的文件名>.sqlite
```

真实恢复必须先按 [备份恢复规则](backup-restore.md) 隔离流量/回调/worker，并准备新路径。仅设置 `AI_PAYMENTS_ENABLED=false` 不会禁用历史 webhook；本演练依靠 internal 网络和不公开入口隔离。不可把测试 env 文件复用到正式站。

## 尚不证明的事项

- 最新为当前schema7的相同应用源码重构建及兼容镜像回退；早期schema5报告只是历史证据，均不是所有旧schema升级/降级兼容证明。
- 这是新持久 bind 目录，不是迁移或恢复公网命名卷；普通应用数据确实跨实际容器替换保留。
- 数据库恢复不包括图片备份、公开素材备份、异地加密与保留制度；恢复副本里旧账户密码/MFA 仍需运营复查及轮换。
- 快照之后的真实付款、退款、争议或供应商请求必须外部对账。本例特意保留未知冻结，并展示快照不含后来的 2000 毫积分；没有自动补回丢失事实、自动恢复收款或自动重发任务。
- 公网部署、DNS/TLS、真实三支付/Google/模型、剩余语言、全部工具输出及性能仍单独验收。

## Bug Analysis：standalone 排除不等于构建上下文排除

### 1. Root Cause Category

B（跨层契约）、D（覆盖缺口）。之前 `outputFileTracingExcludes` 只保护 runner 的 standalone 产物；Docker 的 `COPY . .` 仍能接收没有被 `.dockerignore` 排除的嵌套 `.data`、SQLite sidecar、测试证据和私有图像。没有证据表明这些数据已被推到远端，本轮也未读取历史镜像秘密或删除构建缓存。

### 2. Why Fixes Failed

此前非容器 standalone 测试并不覆盖 Docker context。新增原生 BuildKit 合成路径检查，在正确层级排除文件。首轮容器脚本另遇 Docker29 internal 网络的端口绑定为 null；改为无发布端口、宿主回环代理访问内部 IP，没有开放公网或取消 internal 隔离。

### 3. Prevention Mechanisms

- `.dockerignore` 排除嵌套依赖、运行目录、DB/sidecar、环境文件、私有图片、备份、证据目录；显式保留 `.env.example`。
- 原生上下文测试与 runner 文件扫描分别检查，不互相冒充；自定义部署秘密仍应放在源码目录之外。
- 持久化测试必须区分 build、container identity、DB 版本、当前余额、快照余额和未知任务，不只看首页200。
- 测试脚本需要单独类型检查；根任务脚本的 Sharp 类型沿用项目里 web 包的依赖路径，不为类型解析另加一份运行依赖。

### 4. Systematic Expansion / 5. Knowledge Capture

以上规则已进入本文件、构建忽略规则及可运行脚本。构建阶段也关闭 Next 遥测；生产运行秘密仍部署注入。其他项目、既有卷、DNS 和运行服务不变。当前目录无 Git 元数据或 `.trellis`，不伪造模板同步、归档或提交。
