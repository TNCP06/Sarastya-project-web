# Sarastya Drive Web

Next.js 15 dashboard for **Sarastya Drive**, a Telegram-backed cloud drive.

This repo is the web client in the 4-repo Sarastya Drive system:

- `Sarastya-project` — umbrella infra + Python Telegram engine
- `Sarastya-project-api` — ASP.NET Core REST/JWT metadata API
- `Sarastya-project-web` — this dashboard
- `Sarastya-project-mobile` — Flutter client

## Features

- JWT login/register against the backend API.
- Rich responsive drive UI: folders, tags, favorites, trash, private space, previews, and uploads.
- Metadata CRUD through the .NET API using `Authorization: Bearer <token>`.
- Binary/realtime Next routes kept locally for pragmatic integration:
  - `/api/stream/*` proxies Python streamer
  - `/api/subtitles/*` proxies Python streamer
  - `/api/thumb/*` reads cached thumbnails from Postgres
  - `/api/events` forwards Postgres `LISTEN/NOTIFY` as SSE
  - `/api/upload` stages browser uploads before enqueueing watcher jobs through the API
- Public API proxy: `/papi/*` rewrites to `${API_BASE_URL}/api/*` for browser/mobile access.

## Environment

```env
API_BASE_URL=http://scd-api:8080
STREAMER_URL=http://scd-streamer:8080
STREAMER_SECRET=
DATABASE_URL=postgresql://scd:password@scd-postgres:5432/scd
PIN=123456
NEXT_PUBLIC_BOT_USERNAME=
```

`DATABASE_URL` is still required for the kept binary/realtime routes that read Postgres directly.
Metadata reads/writes for the dashboard go through `Sarastya-project-api`.

## Development

```bash
npm ci
npx tsc --noEmit
npx next build
npm run dev
```

For local API testing, run the backend separately and set `API_BASE_URL`, for example:

```bash
API_BASE_URL=http://localhost:8090 npm run dev
```

## Deployment

The umbrella compose file builds this repo as `scd-web` and exposes it on container port `3000`
(host port `3100`). The public domain `drive.tncp.web.id` points to this service; mobile clients
call the backend through `https://drive.tncp.web.id/papi/*`.
