"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, type LoginState, type RegisterState } from "@/lib/auth";
import { apiFetchPublic } from "@/lib/apiClient";

interface AuthResponse {
  token: string;
  user: { id: number; name: string; email: string };
}

function safeFrom(formData: FormData): string {
  const from = String(formData.get("from") || "/");
  return from.startsWith("/") && !from.startsWith("//") ? from : "/";
}

async function setSession(token: string) {
  (await cookies()).set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24, // API token lifetime is 24h.
  });
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email dan password wajib diisi." };

  try {
    const auth = await apiFetchPublic<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await setSession(auth.token);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Login gagal." };
  }

  redirect(safeFrom(formData));
}

export async function register(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password)
    return { error: "Nama, email, dan password wajib diisi." };
  if (password.length < 8) return { error: "Password minimal 8 karakter." };

  try {
    const auth = await apiFetchPublic<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    await setSession(auth.token);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Registrasi gagal." };
  }

  redirect(safeFrom(formData));
}

export async function logout() {
  (await cookies()).delete(AUTH_COOKIE);
  redirect("/login");
}
