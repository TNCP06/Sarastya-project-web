import "server-only";

import { cookies } from "next/headers";
import { AUTH_COOKIE } from "./auth";

export interface ApiErrorBody {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

function apiBase(): string {
  return (
    process.env.API_BASE_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8090"
  ).replace(/\/+$/, "");
}

function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${apiBase()}/api${clean}`;
}

export async function getAuthToken(): Promise<string | null> {
  return (await cookies()).get(AUTH_COOKIE)?.value ?? null;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  if (!token) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");

  return apiFetchPublic<T>(path, init, token);
}

export async function apiFetchPublic<T>(
  path: string,
  init: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body != null && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(apiUrl(path), {
    ...init,
    headers,
    cache: "no-store",
  });

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? ((await res.json().catch(() => null)) as ApiErrorBody | T | null)
    : ((await res.text().catch(() => "")) as unknown as T | string);

  if (!res.ok) {
    const message =
      typeof body === "object" && body && ("message" in body || "error" in body)
        ? ((body as ApiErrorBody).message ?? (body as ApiErrorBody).error)
        : typeof body === "string" && body
          ? body
          : `HTTP ${res.status}`;
    throw new Error(message || `HTTP ${res.status}`);
  }

  return body as T;
}

export function splitTags(tags: string): string[] {
  return Array.from(
    new Set(
      tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );
}
