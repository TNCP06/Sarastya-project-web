import { apiFetch } from "@/lib/api";
import type { AuthResponse, User } from "@/types/api";

export function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: input,
  });
}

export function login(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: input,
  });
}

export function getMe(): Promise<User> {
  return apiFetch<User>("/api/auth/me");
}
