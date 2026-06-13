"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { getMe } from "@/lib/auth";

/**
 * Dipasang di root layout. Bertugas:
 *  1. Rehydrate token+user dari localStorage di klien (store pakai skipHydration).
 *  2. Memvalidasi sesi sekali saat app dibuka via GET /api/auth/me.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!useAuthStore.getState().token) return;
    getMe()
      .then((user) => useAuthStore.getState().setUser(user))
      .catch(() => {
        // 401 sudah ditangani apiFetch (clear sesi + redirect ke /login).
        // Error lain (mis. jaringan) sengaja diabaikan agar tidak mengganggu.
      });
  }, [hasHydrated]);

  return <>{children}</>;
}
