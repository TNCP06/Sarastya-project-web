import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stat } from "node:fs/promises";
import { apiFetch } from "@/lib/apiClient";
import { jobDir, stagedFilePath } from "@/lib/staging";
import type { Kind } from "@/lib/types";

// Finalize a resumable upload: verify the staged file is fully received, then ask
// the .NET API to enqueue an upload_job for the watcher (origin='upload',
// cleanup_source=1 → watcher deletes staged files after Telegram upload).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: {
    token?: string;
    name?: string;
    size?: number;
    kind?: Kind;
    title?: string;
    tags?: string;
    partSize?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const token = String(body.token ?? "");
  const name = String(body.name ?? "");
  const kind: Kind = body.kind === "media" ? "media" : "archive";
  const size = Number(body.size ?? 0);
  const partSize = Number(body.partSize ?? 1500) || 1500;

  let file: string;
  let dir: string;
  try {
    file = stagedFilePath(token, name);
    dir = jobDir(token);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  let onDisk: number;
  try {
    onDisk = (await stat(file)).size;
  } catch {
    return NextResponse.json(
      { error: "Staged file not found." },
      { status: 404 },
    );
  }
  if (size > 0 && onDisk !== size) {
    return NextResponse.json(
      {
        error: `Incomplete upload (${onDisk}/${size} bytes).`,
        received: onDisk,
      },
      { status: 409 },
    );
  }

  let title = String(body.title ?? "").trim();
  if (!title) {
    if (kind === "media")
      title = name.replace(/\.[^.]+$/, "").trim() || "media";
    else
      return NextResponse.json(
        { error: "Title is required for archives." },
        { status: 400 },
      );
  }

  try {
    const job = await apiFetch<{ id: number }>("/uploads", {
      method: "POST",
      body: JSON.stringify({
        kind,
        title,
        tags: String(body.tags ?? "").trim(),
        sourcePath: dir,
        partSize,
        totalBytes: onDisk,
        cleanupSource: true,
        origin: "upload",
      }),
    });
    return NextResponse.json({ ok: true, jobId: Number(job.id ?? 0) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to queue upload." },
      { status: 400 },
    );
  }
}
