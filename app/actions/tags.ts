"use server";

import type { Tag } from "@/lib/types";
import { apiFetch } from "@/lib/apiClient";
import { tagColorKey } from "@/lib/kinds";
import { refresh } from "./_shared";

interface ApiTag {
  id: number;
  name: string;
  color: string;
}

function mapTag(t: ApiTag): Tag {
  const stored = String(t.color ?? "").trim();
  return {
    id: Number(t.id),
    name: String(t.name),
    color: stored || tagColorKey(String(t.name)),
  };
}

export async function listTags(): Promise<Tag[]> {
  const tags = await apiFetch<ApiTag[]>("/tags");
  return tags.map(mapTag);
}

export async function createTag(name: string, color = "") {
  const n = name.trim();
  if (!n) throw new Error("Category name cannot be empty.");
  try {
    await apiFetch("/tags", {
      method: "POST",
      body: JSON.stringify({ name: n, color: color || tagColorKey(n) }),
    });
  } catch (e) {
    if (!(e instanceof Error) || !/sudah ada|already|conflict/i.test(e.message))
      throw e;
  }
  refresh();
}

export async function recolorTag(id: number, color: string) {
  const cur = (await listTags()).find((t) => t.id === id);
  if (!cur) throw new Error("Category not found.");
  await apiFetch(`/tags/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name: cur.name, color }),
  });
  refresh();
}

export async function renameTag(id: number, name: string) {
  const n = name.trim();
  if (!n) throw new Error("Category name cannot be empty.");
  const cur = (await listTags()).find((t) => t.id === id);
  if (!cur) throw new Error("Category not found.");
  await apiFetch(`/tags/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name: n, color: cur.color }),
  });
  refresh();
}

export async function deleteTag(id: number) {
  await apiFetch<void>(`/tags/${id}`, { method: "DELETE" });
  refresh();
}
