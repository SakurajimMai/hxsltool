# 真实图像供应商接入

2026-09-09。文生图与参考图编辑均走站点所有者提供的 OpenAI Images 兼容网关，独立解码落盘。不引入 infinite-canvas。密钥不入库。

## 实际配置

- 主机 `ai.aimuxa.com`，路径 `/v1`，模型 `gpt-image-2`，适配器 `openai-images`。
- 密钥只在仓库外 `/root/.grok/secrets/hxsl-live-image.env`（600）。
- `AI_PROVIDER_HOSTS=ai.aimuxa.com`。

## 现场结果

首次 00:55:17Z 三次 503，报告已保留。

重测 01:15:01Z 文生图成功。完整带编辑的检查 01:36:51.122Z：

- `GET /v1/models` 200，含 `gpt-image-2`。
- 直连 `/images/generations` 200。`invokeImageProvider` 一次成功。PNG `generation-0.png` 1024×1024 / 927861 字节。
- 生成任务 `5077567f-4be6-408a-9d82-b2af9e304b8b` succeeded，成功 1 张，reserved 0，available 19000（从 20000 扣 1000）。
- 编辑：`buildImageRequest` 指向 `/images/edits`。直连 multipart 200，PNG `edit-direct-0.png` 1024×1024 / 994611 字节（户型中增加厨房）。
- Worker 编辑任务 `0e2b59b6-103a-410f-a039-0e8357732549` succeeded，`usedEditsUrl: true`，PNG `edit-job-0.png` 1024×1024 / 1266837 字节，reserved 0，available 18000。
- 报告与日志不含密钥。未测 Google 登录与三家支付。未部署公网。

## 复跑

```bash
set -a
. /root/.grok/secrets/hxsl-live-image.env
set +a
AI_LIVE_EVIDENCE_DIR=docs/ai-architecture/evidence/live-image-provider pnpm test:ai:live-provider
```
