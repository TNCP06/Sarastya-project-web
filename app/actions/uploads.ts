"use server";

import { revalidatePath } from "next/cache";
import type { Kind } from "@/lib/types";
import { apiFetch } from "@/lib/apiClient";

export async function enqueueUpload(input: {
  kind: Kind;
  title: string;
  tags: string;
  sourcePath: string;
  partSize: number;
}) {
  const sourcePath = input.sourcePath.trim();
  if (!sourcePath) throw new Error("File path on the host is required.");

  let title = input.title.trim();
  if (!title) {
    if (input.kind === "media") {
      const base =
        sourcePath
          .replace(/[\\/]+$/, "")
          .split(/[\\/]/)
          .pop() || "";
      title = base.replace(/\.[^.]+$/, "").trim() || "media";
    } else {
      throw new Error("Title is required for archives.");
    }
  }

  await apiFetch("/uploads", {
    method: "POST",
    body: JSON.stringify({
      kind: input.kind,
      title,
      tags: input.tags.trim(),
      sourcePath,
      partSize: input.partSize || 1500,
      totalBytes: 0,
      cleanupSource: false,
      origin: "local",
    }),
  });
  revalidatePath("/upload");
}

export async function updateUploadJob(
  id: number,
  input: { title: string; tags: string; partSize?: number },
) {
  const title = input.title.trim();
  if (!title) throw new Error("Title cannot be empty.");
  await apiFetch<void>(`/uploads/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      title,
      tags: input.tags.trim(),
      partSize: input.partSize,
    }),
  });
  revalidatePath("/upload");
}

export async function cancelUpload(id: number) {
  await apiFetch<void>(`/uploads/${id}/cancel`, { method: "POST" });
  revalidatePath("/upload");
}

export async function startUpload(id: number) {
  await apiFetch<void>(`/uploads/${id}/start`, { method: "POST" });
  revalidatePath("/upload");
}

export async function retryUpload(id: number) {
  await apiFetch<void>(`/uploads/${id}/retry`, { method: "POST" });
  revalidatePath("/upload");
}

export async function startAllUploads() {
  await apiFetch<void>("/uploads/start-all", { method: "POST" });
  revalidatePath("/upload");
}

export async function clearFinishedUploads() {
  await apiFetch<void>("/uploads/finished", { method: "DELETE" });
  revalidatePath("/upload");
}
