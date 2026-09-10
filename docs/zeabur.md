# Zeabur 部署教程

HXSL Tools 必须跑带 qpdf、Poppler、Tesseract、LibreOffice 的 Web 镜像。不要用 Zeabur 的 Node / Next 自动构建，也不要导入 Compose YAML（Zeabur 不支持）。

推荐：**Docker Images** 拉取 GitHub Actions 已经打好的 GHCR 镜像。仓库根目录的 `zbpack.json` 只在你改用 Git 构建时才会用到。

内存建议约 **2 GiB**（LibreOffice 在进程内执行）。

## 1. 创建服务

1. 打开 [Zeabur](https://zeabur.com/)，新建项目。
2. **Add Service** → **Docker Images**（Customize Prebuilt）。
3. Image 填写：

   ```
   ghcr.io/sakurajimmai/hxsltool:latest
   ```

   也可以钉死 `sha-<commit>`。包是公开的，Username / Password 留空。
4. 先不要 Deploy，把 Ports 和环境变量填完。

Git 备选：导入 GitHub 仓库 `SakurajimMai/hxsltool`。必须走 `Dockerfile.web`（见 `zbpack.json`）。第一次构建要装 LibreOffice，很慢；失败就改回 GHCR 镜像。不要设置 `ZBPACK_IGNORE_DOCKERFILE`。

## 2. Ports

Ports 填的是**容器监听端口**，不是浏览器的 443，也不是本机 Compose 的宿主机 `13080`。

| 字段 | 填什么 |
| --- | --- |
| Port Name | `web`（有这一栏才填；`${ZEABUR_WEB_URL}` 按这个名字取） |
| Port Type | `HTTP`（才能绑域名和自动 TLS。不要用 TCP） |
| Port | `3000` |

本机 Compose 是「宿主机 13080 → 容器 3000」。Zeabur 没有 13080 这一层，公网是域名 443，容器默认仍是 3000。

非要把 Port 改成别的数字可以，但必须再加环境变量 `PORT`，和 Ports 里的数字完全一致，否则域名打不开。没有必要改。

只需要 **一个 HTTP 端口**。不要再加 TCP，没有单独的 Worker 端口。

## 3. 环境变量

在 Environment Variables 里添加。不要勾 Shared。密钥不要提交到 Git。

| Key | 必填 | 值 |
| --- | --- | --- |
| `SITE_URL` | 是 | 绑定域名后的完整 origin，必须带 `https://`，不要末尾 `/` |
| `TRUSTED_PROXY` | 建议 | `true`（Zeabur 在容器前终结 HTTPS） |
| `JOB_TOKEN_SECRET` | 建议 | 随机串，例如 `openssl rand -base64 32` |
| `CONTACT_EMAIL` | 否 | 联系页邮箱；留空则显示未配置提示 |
| `ALLOW_INDEXING` | 建议先关 | 域名、TLS、隐私页就绪前用 `false` |
| `ENABLE_SERVER_TOOLS` | 是 | `true` |
| `HXSL_JOB_DIR` | 是 | `/var/lib/hxsl` |

`SITE_URL` 示例格式（把主机名换成你在 Domains 里实际绑定的那个）：

```
https://www.你的域名
```

错误示例（旧镜像会让所有 HTML 变成 500）：

```
www.你的域名
```

没有 `https://` 时，sitemap / robots 里会出现不带协议的地址，根布局的 `new URL(SITE_URL)` 会抛错：`Application error: a server-side exception has occurred`。

绑自定义域名之前，可以先用 Zeabur 展开后的 `${ZEABUR_WEB_URL}`（前提是控制台真的展开成 `https://…`）。占位符如果原样写进容器，不要用。

### `TRUSTED_PROXY` 是什么

浏览器走 `https://域名`，Zeabur 把请求以 HTTP 转给容器。首页 `/` 会 307 到 `/en`。`true` 时相信 `X-Forwarded-Proto`，跳到 https；不设则可能跳成 http。本机直连 IP:端口时应为 `false`。

### `JOB_TOKEN_SECRET` 一定要吗

不是启动所必需。不设也能处理文件。公网建议设置：任务下载令牌用 HMAC 存盘，避免有人改任务目录里的 `job.json` 伪造令牌。以后若给任务目录挂 Volume，密钥不能改，否则旧下载链接全部失效。

可选：`SITE_NAME`、`DEFAULT_LOCALE`、任务限额。广告见下一节，默认关。

## 3.1 Google AdSense

广告默认关闭。只设 publisher id、不设 `ENABLE_ADS=true`，页面不会加载广告脚本，`/ads.txt` 也是 404。

先保证站点已经是 HTTPS、`SITE_URL` 带 `https://`、隐私页能打开。再在 [Google AdSense](https://www.google.com/adsense/) 添加与 `SITE_URL` 一致的站点（`www` 和裸域算两个主机，只绑了 `www` 就添加 `www`）。

Zeabur Variables 增加：

| Key | 必填 | 值 |
| --- | --- | --- |
| `ENABLE_ADS` | 是 | `true` |
| `GOOGLE_ADSENSE_CLIENT` | 是 | AdSense 的 publisher id，格式必须是 `ca-pub-` 加 10～22 位数字，例如 `ca-pub-1234567890123456`。写成 `pub-…` 或任意乱码都不会开启 |
| `GOOGLE_ADSENSE_SLOT` | 否 | 展示广告单元的 slot id（纯数字）。有它才会在页脚上方放一块自动尺寸广告；只有 Auto ads 时可以留空 |
| `GOOGLE_ADSENSE_AUTO_ADS` | 否 | 默认视为 `true`。设为 `false` 可关掉 Auto ads，只保留 slot |

不要勾 Shared。改完重启服务（不必重新构建镜像）。CSP、页脚法律文案、隐私页广告说明会按运行时环境切换。

验收：

```bash
curl -fsS https://你的域名/ads.txt
```

开启成功时应类似：

```
google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```

`pub-` 这一段由 `ca-pub-…` 去掉 `ca-` 得到。若返回 `Not found`，说明开关没开或 client 格式不对。

页面上应能看到 AdSense 脚本 `pagead2.googlesyndication.com`，页脚不再写「没有广告脚本」。AdSense 后台还要完成站点验证和审核，审核通过前可能不出广告，那是 Google 侧状态，不是容器没配上。

关掉：`ENABLE_ADS=false` 或删掉 `GOOGLE_ADSENSE_CLIENT`，再重启。

## 4. Volumes

默认 **不要挂**。任务文件在 `HXSL_JOB_DIR` 下，大约 15 分钟过期；重启丢掉是预期行为。

只有需要「正在跑 / 待下载的任务在重启后还在」时才挂：

| 字段 | 值 |
| --- | --- |
| Volume ID | 例如 `hxsl-jobs`（只是盘的名字） |
| Mount Directory | `/var/lib/hxsl`（必须和 `HXSL_JOB_DIR` 一致） |

注意：挂载会清空该目录；之后没有零宕机重启；按容量计费。不要挂已退役的 `/var/lib/hxsl-admin`。只传配置文件用 Config Editor，不必开 Volume。进程用户是 uid `1001`，若任务报权限错误，先卸 Volume。

## 5. 域名

1. 服务页 **Domains**：Generate Domain（`*.zeabur.app`）或 Custom Domain。
2. 自定义域名按控制台提示加 CNAME。根域（apex）若提供商不支持 CNAME Flattening，需按 Zeabur 文档改 A 记录。
3. `www` 和裸域是两个主机名。只绑了 `www` 时，`SITE_URL` 必须是 `https://www.…`；裸域没有 DNS 就会打不开。
4. TLS 就绪后把 `SITE_URL` 改成该 origin，重启服务。
5. 索引前再把 `ALLOW_INDEXING` 改为 `true`。

## 6. 发布与验收

点 **Deploy**。镜像较大，第一次拉取可能要几分钟。

```bash
curl -fsS https://你的域名/api/health
curl -sS -o /dev/null -w '%{http_code}\n' https://你的域名/zh-CN
curl -sS -o /dev/null -w '%{http_code}\n' https://你的域名/en/ai/studio
curl -sS -o /dev/null -w '%{http_code}\n' https://你的域名/admin
```

期望：health 与语言首页 **200**；`/en/ai/studio` 与 `/admin` **404**。

看 sitemap 是否带协议：

```bash
curl -fsS https://你的域名/sitemap.xml | head
```

`<loc>` 应以 `https://` 开头。若是 `www.主机/en` 这种没有协议的地址，回去改 `SITE_URL`。

## 7. 更新镜像

GitHub `main` 推送后，Actions 会更新 `ghcr.io/sakurajimmai/hxsltool:latest`。Zeabur 预构建服务不会自动跟 tag，需要在服务里重新 Deploy / 拉最新镜像。

本机 Compose 仍然可用，和 Zeabur 互不影响：

```bash
docker compose pull
docker compose up -d
```

## 8. 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| HTML 全站 500，Digest 一串数字；`/api/health` 却是 200 | `SITE_URL` 没有 `https://` | 改成 `https://主机`，重启 |
| `/ads.txt` 404，页面没有广告脚本 | 只填了 client 或格式不是 `ca-pub-`+数字 | 同时设 `ENABLE_ADS=true` 和合法 client，重启 |
| 域名打不开，health 也不通 | Ports 填了 `13080`，进程在听 `3000` | Port 改回 `3000`，或同时设 `PORT=13080` |
| 首页跳到 `http://` | 未设 `TRUSTED_PROXY=true` | 加上并重启 |
| Git 构建超时 / 磁盘不足 | 正在源码安装 LibreOffice | 改用 GHCR 镜像 |
| 任务重启后消失 | 没挂 Volume | 默认如此；要保留再挂 `/var/lib/hxsl` |

更完整的运行时契约见 [deploy.md](./deploy.md)。
