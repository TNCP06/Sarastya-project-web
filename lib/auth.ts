// JWT auth shared by middleware, server actions, and binary route handlers.
// The token is stored in an httpOnly cookie; server-side API calls forward it as Bearer.

export const AUTH_COOKIE = "scd_auth";

export type LoginState = { error?: string } | null;
export type RegisterState = { error?: string } | null;

export function hasAuthCookieValue(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

// Kept for the Private-space PIN cookie hashing flow.
export async function sha256Hex(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
