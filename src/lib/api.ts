import { useAuthStore } from "@/store/auth";
import type { ApiErrorBody } from "@/types/api";

/** Error terstruktur dari API; membawa status dan body asli. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(status: number, message: string, body: ApiErrorBody | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  /**
   * Error per-field untuk validasi (status 400). Key dinormalkan ke lowercase
   * supaya cocok dengan nama field form ("Name" -> "name") apa pun bentuk
   * backend (ProblemDetails PascalCase atau lowercase).
   */
  get fieldErrors(): Record<string, string[]> {
    const raw = this.body?.errors;
    if (!raw) return {};
    const out: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(raw)) {
      out[key.toLowerCase()] = value;
    }
    return out;
  }
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  /** Akan otomatis di-JSON.stringify dan diberi header Content-Type. */
  body?: unknown;
}

/**
 * Pembungkus Fetch API tunggal untuk seluruh aplikasi.
 * - Selalu memakai path relatif (/api/...) -> diteruskan proxy Next ke backend.
 * - Otomatis menempel Authorization: Bearer <token> bila ada.
 * - Menangani 401: bila kita memang sedang punya token (sesi kedaluwarsa),
 *   hapus sesi dan arahkan ke /login. 401 dari login/register (tanpa token)
 *   dilempar ke pemanggil untuk ditampilkan di form.
 */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const token = useAuthStore.getState().token;

  const finalHeaders = new Headers(headers);
  if (body !== undefined) finalHeaders.set("Content-Type", "application/json");
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(path, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Tidak dapat terhubung ke server. Periksa koneksi Anda.");
  }

  if (res.status === 401 && token) {
    useAuthStore.getState().clear();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
    throw new ApiError(401, "Sesi berakhir. Silakan login kembali.");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const data = (await res.json().catch(() => null)) as unknown;

  if (!res.ok) {
    const errBody = (data ?? null) as ApiErrorBody | null;
    const message =
      errBody?.message || errBody?.title || "Terjadi kesalahan pada server.";
    throw new ApiError(res.status, message, errBody);
  }

  return data as T;
}
