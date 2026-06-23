# Sarastya Cloud Drive — Web frontend repo plan

> This repo (`Sarastya-project-web`) is the **Next.js dashboard** for **Sarastya Drive**, a
> Telegram-backed cloud drive. Part of a 4-repo system (see umbrella `Sarastya-project`). Work on
> branch **`feat/cloud-drive`**; `main` keeps the old ProjekTask web.
>
> **Cross-agent source of truth** — no agent-specific memory is used. Status: ☐ todo · ◐ wip · ☑ done

## Strategy: ADAPT the rich dashboard (not a rebuild)

> **Branch is a clean slate** (ProjekTask removed). Copy the source `web/` in fresh.

Bring in the source project's **full-featured Next.js 15 drive dashboard** (grid/browse/search/edit/trash/private space, video streaming with Service-Worker +
IndexedDB cache, dialogs). Then **swap its data layer**: today it uses server actions hitting
Postgres directly; change those to **Fetch + JWT against the .NET API** (`Sarastya-project-api`).

The brief requires "Fetch API to backend" + register/login JWT + responsive — satisfied by routing
all auth and CRUD through the .NET API.

## Keep vs change
- **Keep as Next routes** (binary/streaming/realtime, pragmatic): `/api/stream/*`, `/api/thumb/*`,
  `/api/subtitles/*`, `/api/events` (SSE), and the resumable `/api/upload` staging endpoint the
  watcher consumes. These proxy to the streamer / read PG as today.
- **Keep** `lib/driveView.ts` (pure view-model: grouping/sort/optimistic reducers) and the UI
  components (`DriveApp.tsx`, `DriveDialogs.tsx`, etc.).
- **Change**: metadata server actions/pages → typed Fetch calls to the .NET API via `lib/apiClient.ts`
  (server-side `API_BASE_URL`, public `/papi/*` rewrite).
- **Add**: login/register pages → `/api/auth/*` through the backend client; store JWT in an
  httpOnly cookie and forward it as `Authorization: Bearer`; middleware guard replaces the old
  shared-password cookie check.
- **Add**: Next rewrite `/papi/:path*` → `${API_BASE_URL}/api/:path*` (default
  `http://scd-api:8080`; also how the Flutter app reaches the API via `drive.tncp.web.id/papi/*`).

## Tasks
- 3A ☑ Replace scaffold with the source `web/` dashboard.
- 3B ☑ Auth: login/register pages, JWT cookie + header, middleware; `APP_PASSWORD` gate removed.
- 3C ☑ Data layer: drive/items/folders/tags/uploads actions → Fetch API via `lib/apiClient.ts`;
     `driveView.ts` kept.
- 3D ☑ `next.config` rewrite `/papi/*` → `${API_BASE_URL}/api/*`; stream/thumb/subtitles/events
     routes kept as Next routes.
- 3E ☑ Upload: host-path and browser-finalize flows enqueue through `POST /api/uploads`; resumable
     `/api/upload` staging kept for watcher handoff.
- 3F ☑ Responsive dashboard preserved from source; `npx tsc --noEmit` and `npx next build` pass;
     README added.

## Deploy
- Container `scd-web`, port 3000 (host 3100) → **drive.tncp.web.id**. Env: `STREAMER_URL`
  (`http://scd-streamer:8080`), `API_BASE_URL` (`http://scd-api:8080`), `DATABASE_URL` (only for
  kept PG-reading routes like `/api/thumb`/`/api/events` and thumbnail tooling). See umbrella repo
  `.env.example`.
