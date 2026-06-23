import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { mkdir, stat, appendFile } from "node:fs/promises";
import { jobDir, stagedFilePath } from "@/lib/staging";
import { AUTH_COOKIE, hasAuthCookieValue } from "@/lib/auth";

// Resumable upload endpoint (chunked). The browser sends a big file in sequential
// chunks; if the connection drops, it asks GET for the current offset and resumes
// from there instead of restarting. Must run on a Node server (next start) — NOT a
// Vercel serverless function, whose small body limit would break large uploads.
//
// This route is excluded from middleware (to bypass body-size limits), so it performs
// its own JWT-cookie presence check below. The backend validates the token when the
// staged file is finalized through /api/upload/complete → /api/uploads.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UNAUTHORIZED = () =>
  NextResponse.json({ error: "Unauthorized." }, { status: 401 });

async function checkAuth(): Promise<boolean> {
  return hasAuthCookieValue((await cookies()).get(AUTH_COOKIE)?.value);
}

async function sizeOf(p: string): Promise<number> {
  try {
    return (await stat(p)).size;
  } catch {
    return 0;
  }
}

export async function GET(req: NextRequest) {
  if (!(await checkAuth())) return UNAUTHORIZED();
  const sp = req.nextUrl.searchParams;
  const token = sp.get("token") ?? "";
  const name = sp.get("name") ?? "";
  let file: string;
  try {
    file = stagedFilePath(token, name);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  return NextResponse.json({ received: await sizeOf(file) });
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) return UNAUTHORIZED();
  const sp = req.nextUrl.searchParams;
  const token = sp.get("token") ?? "";
  const name = sp.get("name") ?? "";
  const offset = Number(sp.get("offset") ?? "0");

  let file: string;
  try {
    file = stagedFilePath(token, name);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  if (!Number.isInteger(offset) || offset < 0) {
    return NextResponse.json({ error: "Bad offset." }, { status: 400 });
  }

  await mkdir(jobDir(token), { recursive: true });

  const current = await sizeOf(file);
  if (offset !== current)
    return NextResponse.json({ received: current }, { status: 409 });

  const body = Buffer.from(await req.arrayBuffer());
  if (body.length === 0) return NextResponse.json({ received: current });
  await appendFile(file, body);
  return NextResponse.json({ received: current + body.length });
}
