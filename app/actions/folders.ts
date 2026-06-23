"use server";

import { apiFetch } from "@/lib/apiClient";
import { refresh } from "./_shared";

export async function createFolder(
  name: string,
  parentId: number | null,
  isPrivate = false,
) {
  const n = name.trim();
  if (!n) throw new Error("Folder name cannot be empty.");

  await apiFetch("/folders", {
    method: "POST",
    body: JSON.stringify({ name: n, parentId, isPrivate }),
  });
  refresh();
}

export async function renameFolder(id: number, name: string) {
  const n = name.trim();
  if (!n) throw new Error("Folder name cannot be empty.");

  await apiFetch(`/folders/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name: n }),
  });
  refresh();
}

export async function deleteFolder(id: number) {
  await apiFetch<void>(`/folders/${id}`, { method: "DELETE" });
  refresh();
}

export async function moveItemsToFolder(
  itemIds: number[],
  folderId: number | null,
) {
  for (const itemId of itemIds) {
    await apiFetch<void>(`/items/${itemId}/move`, {
      method: "POST",
      body: JSON.stringify({ folderId }),
    });
  }
  refresh();
}

export async function moveFolderToFolder(
  folderId: number,
  targetParentId: number | null,
) {
  await apiFetch<void>(`/folders/${folderId}/move`, {
    method: "POST",
    body: JSON.stringify({ targetParentId }),
  });
  refresh();
}
