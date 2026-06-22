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
- **Change**: `web/app/actions/*` server actions → typed Fetch calls to `/papi/*`.
- **Add**: login/register pages → `/papi/auth/*`; store JWT (httpOnly cookie + send as
  `Authorization: Bearer`); middleware guard replaces the old shared-password cookie check.
- **Add**: Next rewrite `/papi/:path*` → `http://api:8080/api/:path*` (server-side; also how the
  Flutter app reaches the API via `drive.tncp.web.id/papi/*`).

## Tasks
- 3A ☐ Replace scaffold with the source `web/` dashboard.
- 3B ☐ Auth: login/register pages, JWT cookie + header, middleware; drop `APP_PASSWORD` gate
       (or keep as transitional fallback).
- 3C ☐ Data layer: server actions → Fetch `/papi/*` (a thin `lib/apiClient.ts`); keep `driveView.ts`.
- 3D ☐ `next.config` rewrite `/papi/*` → `scd-api:8080/api/*`; keep stream/thumb/subtitles/events routes.
- 3E ☐ Upload: form → `POST /papi/uploads`; keep resumable `/api/upload` staging for the watcher.
- 3F ☐ Responsive (desktop+tablet) pass; `npx tsc --noEmit && npx next build`; README + screenshots.

## Deploy
- Container `scd-web`, port 3000 (host 3100) → **drive.tncp.web.id**. Env: `STREAMER_URL`
  (`http://streamer:8080`), `BACKEND_URL` (`http://api:8080`), `DATABASE_URL` (only for the kept
  PG-reading routes like `/api/thumb`/`/api/events`). See umbrella repo `.env.example`.
