"use server";

import type { Kind } from "@/lib/types";
import { apiFetch, splitTags } from "@/lib/apiClient";
import { refresh } from "./_shared";

export async function toggleFavorite(id: number, next: boolean) {
  await apiFetch<void>(`/items/${id}/favorite`, {
    method: "POST",
    body: JSON.stringify({ value: next }),
  });
  refresh();
}

export async function softDelete(id: number) {
  await apiFetch<void>(`/items/${id}`, { method: "DELETE" });
  refresh();
}

export async function restore(id: number) {
  await apiFetch<void>(`/items/${id}/restore`, { method: "POST" });
  refresh();
}

export async function purgeNow(
  id: number,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiFetch<void>(`/items/${id}/purge`, { method: "POST" });
    refresh();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to delete permanently.",
    };
  }
}

export async function updateMetadata(
  id: number,
  input: { title: string; kind: Kind; tags: string },
) {
  const title = input.title.trim();
  if (!title) throw new Error("Title cannot be empty.");
  if (input.kind !== "archive" && input.kind !== "media")
    throw new Error("Invalid kind.");

  await apiFetch(`/items/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      title,
      kind: input.kind,
      tags: splitTags(input.tags),
    }),
  });
  refresh();
}

export async function bulkToggleFavorite(itemIds: number[], starred: boolean) {
  for (const itemId of itemIds) await toggleFavorite(itemId, starred);
  refresh();
}

export async function bulkSoftDelete(itemIds: number[]) {
  for (const itemId of itemIds) await softDelete(itemId);
  refresh();
}

export async function bulkRestore(itemIds: number[]) {
  for (const itemId of itemIds) await restore(itemId);
  refresh();
}

export async function bulkPurgeNow(
  itemIds: number[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    for (const id of itemIds)
      await apiFetch<void>(`/items/${id}/purge`, { method: "POST" });
    refresh();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to delete permanently.",
    };
  }
}
