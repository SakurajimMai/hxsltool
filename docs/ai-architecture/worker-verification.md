# 既有文件 Worker 与真实引擎隔离验证

2026-09-08。本阶段属于建筑AI升级的“原82工具不倒退”回归，不新增开放转换API/用户CLI，不把本地工具迁至服务器，也不改变AI生图供应商模型。

## 代码边界

- `apps/worker/src/processor.ts` 从原启动文件提取已有解密/文件处理/输出函数；HTTP、BullMQ队列、内部路径和原引擎适配保持原有分派。导入处理函数不启动监听或连接生产Redis。
- Worker `test` 不再只打印compose提示，现运行8项真实处理测试：JPEG独立解码/尺寸、0600权限、AES-GCM参数/篡改拒绝、输入/输出越界、输出上限、损坏文件、PDF页序及几何。
- 共享引擎测试的Poppler探测使用实际支持的 `-v`，qpdf/Tesseract使用`--version`。宿主缺引擎时保留旧条件；严格隔离模式 `HXSL_REQUIRE_ENGINES=true` 缺引擎直接失败，报告断言零跳过，不伪造通过。
- Dockerfile增加显式 `verification` 阶段；最后默认阶段继承原runtime，仍是nextjs/UID1001和原Worker启动命令。生产镜像没有新增测试入口或编译后的Worker单测，验收镜像单独携带测试代码。

## 可执行命令

```sh
pnpm --filter @hxsl/worker test
pnpm --filter @hxsl/worker build
pnpm test:worker:isolated
pnpm lint
pnpm typecheck
pnpm exec tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --allowImportingTsExtensions --skipLibCheck --esModuleInterop --strict scripts/worker-runtime-check.mts
```

隔离命令需要本机rootful Docker/Buildx、本地Unix socket和足够构建空间；不支持远程Docker bind盘。只对mkdtemp新目录和新增证据目录设置测试UID；不更改生产目录权限，不读取现站`.env`或用户文件。

每次以随机标签创建两个镜像（verification/default runtime）、一个internal网络、新Redis和Worker。运行容器无宿主端口映射、只读根、drop ALL/no-new-privileges、1GiB/2CPU/256PID及临时盘限额。Redis直接以`redis`用户启动，禁用持久化；合成共享文件盘与现有持久卷无关。真实Worker使用默认生产镜像，测试请求由独立验收容器发出。

普通文件工具仍通过网页认证/授权接口；Worker这里的HTTP是隔离内部依赖，不是对外API。测试不开放公网监听，不调整生产防火墙或服务。

## 证明内容

1. 17项共享引擎及8项Worker测试，在实际qpdf/Poppler/Tesseract等安装环境中全部执行、零跳过。
2. 真实HTTP→Redis→Worker→引擎→文件：JPEG格式/尺寸，PDF合并顺序；AES-GCM参数保护和qpdf加/解密，Poppler提取预期文字。
3. 多页PNG ZIP逐项解码、页尺寸；OCR ZIP的识别文本与可解析搜索PDF；涂黑输出重新提取不含目标词；基础文字DOCX解包内容和LibreOffice转回PDF。
4. 错误输入不发布输出，不删除此前成功文件；内部路径越界拒绝；明文密码在入队前拒绝。
5. 实际暂停队列→移除待处理作业，无输出；真实运行的PDF渲染收到取消信号，失败结束且无结果；从生产Worker进程命名空间检查没有残留pdftoppm/qpdf/tesseract/soffice子进程。
6. 真实日志包括stdout/stderr检查，不记录合成加密秘密或密码哨兵。最终报告只能在本轮容器和网络关闭后发布；数据、图像和报告保留供审查，不删生产卷。

最终报告由 `evidence/worker/latest.json` 指向。失败运行有独立目录和failure.json，不计为通过。确切时间/计数和实际图像审查追加到[validation.md](validation.md)。

## 限制与下一步

- 这是代表性服务器引擎路径，不是82个公开工具/15语言/所有浏览器本地输出验收，也不是实际建筑AI供应商生成、Google登录或商户Sandbox。
- 排队取消当前移除真实作业，但原等待请求到超时才返回失败，不是即时取消状态体验。需后续改善终态反馈；运行取消本轮验证的是Poppler，不能泛称所有图片/Office引擎都可立即停止。
- 安全涂黑有文本提取及真实渲染证据，但不冒称所有字体、扫描件、不可见对象、多语言或任意PDF的安全认证。Office路径只保持已有基础文本能力，不承诺复杂版式保真。
- 不压测生产、不进行大规模压力验收。不改变公开页面、品牌、语言或UI，旧截图不作为本次新界面验收。

## Bug Analysis：空测试、错误探测与隔离启动

### 1. Root Cause Category

D覆盖缺口：旧Worker test打印文字即退出0，不能证明执行了处理。E隐式假设：所有命令都接受`--version`，使已安装Poppler也可能被当作缺失；容器移除权限后仍沿用Redis root入口的chown。

### 2. Why Fixes Failed

最初新镜像25项真实引擎测试通过，但Redis容器已退出1，日志为`chown: .: Operation not permitted`，Worker等待Redis。不能把后续DNS异常误判为生产网络问题，不能开放网络或加回权限绕过。首轮健康探测单次fetch未设超时，外层轮询时间上限不能中断它。

### 3. Prevention Mechanisms

提取可测处理边界，实际输出独立解码；严格引擎模式与报告零跳过；Redis直接非root启动并在启动Worker前真实ping；健康请求有单次超时；运行日志包含stderr且检查秘密哨兵；默认生产镜像与验收镜像分别核查。

### 4. Systematic Expansion

不能用console.log、容器存在、health200或截图替代处理结果；每个依赖的存在探测应适配实际命令。暂停/取消也需区分请求收到、作业移除、进程停止、无晚到输出与用户终态反馈。

### 5. Knowledge Capture

本契约、8项Worker测试、严格引擎检查和可运行隔离脚本已落地。失败目录`ae67384b`保留：引擎25项通过但整体失败；确认Redis终态后仅停止带同一标签的合成runner，原脚本清理自有Worker/Redis/网络。没有停止其他项目。按trellis-check/trellis-break-loop留下证据；无Git/Trellis元数据，不虚构提交、模板同步或Goal归档。
