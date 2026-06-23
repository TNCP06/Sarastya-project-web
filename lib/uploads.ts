import "server-only";

import { apiFetch } from "./apiClient";
import { sqliteToMs } from "./format";
import type { Kind, UploadJob, UploadStatus } from "./types";

interface ApiUploadJob {
  id: number;
  kind: Kind;
  title: string;
  tags: string | null;
  sourcePath?: string | null;
  partSize?: number | null;
  origin?: "local" | "upload" | null;
  partsDone: number;
  totalBytes: number;
  status: UploadStatus;
  progress: number;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getUploadJobs(): Promise<UploadJob[]> {
  try {
    const jobs = await apiFetch<ApiUploadJob[]>("/uploads");
    return jobs.map((j) => ({
      id: Number(j.id),
      kind: String(j.kind) as Kind,
      title: String(j.title),
      tags: String(j.tags ?? ""),
      sourcePath: String(j.sourcePath ?? ""),
      partSize: Number(j.partSize ?? 1500),
      origin: String(j.origin ?? "upload") as "local" | "upload",
      partsDone: Number(j.partsDone ?? 0),
      totalBytes: Number(j.totalBytes ?? 0),
      status: String(j.status) as UploadStatus,
      progress: Number(j.progress),
      message: j.message != null ? String(j.message) : null,
      createdAt: sqliteToMs(String(j.createdAt)),
      updatedAt: sqliteToMs(String(j.updatedAt)),
    }));
  } catch {
    // Momentary API/DB connection drop → return empty so /upload still renders.
    return [];
  }
}
