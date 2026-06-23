"use server";

import { cookies } from "next/headers";
import { sha256Hex } from "@/lib/auth";
import { apiFetch } from "@/lib/apiClient";
import { refresh } from "./_shared";

// PIN-gated Private space. JWT gates the whole dashboard; this extra PIN keeps the
// Private space hidden after login until explicitly unlocked.

const PRIV_COOKIE = "scd_priv";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isPrivateUnlocked(): Promise<boolean> {
  const pin = process.env.PIN;
  if (!pin) return false;
  const token = (await cookies()).get(PRIV_COOKIE)?.value;
  if (!token) return false;
  return timingSafeEqual(token, await sha256Hex(`priv:${pin}`));
}

export async function unlockPrivate(pin: string): Promise<{ ok: boolean }> {
  const real = process.env.PIN;
  if (!real) return { ok: false };
  if (!timingSafeEqual(String(pin), real)) return { ok: false };
  (await cookies()).set(PRIV_COOKIE, await sha256Hex(`priv:${real}`), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return { ok: true };
}

export async function lockPrivate(): Promise<void> {
  (await cookies()).delete(PRIV_COOKIE);
}

export async function moveItemsPrivacy(
  itemIds: number[],
  makePrivate: boolean,
) {
  for (const id of itemIds) {
    await apiFetch<void>(`/items/${id}/private`, {
      method: "POST",
      body: JSON.stringify({ value: makePrivate }),
    });
  }
  refresh();
}

export async function moveFolderPrivacy(
  folderId: number,
  makePrivate: boolean,
) {
  await apiFetch<void>(`/folders/${folderId}/private`, {
    method: "POST",
    body: JSON.stringify({ value: makePrivate }),
  });
  refresh();
}
