"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { AppHeader } from "@/components/AppHeader";
import { FullPageSpinner } from "@/components/ui/Spinner";

/**
 * Guard sisi klien untuk seluruh halaman terproteksi.
 * Token disimpan di localStorage, jadi keputusan dibuat setelah rehydrate
 * (hasHydrated) untuk menghindari flicker/redirect prematur.
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (hasHydrated && !token) router.replace("/login");
  }, [hasHydrated, token, router]);

  // Menunggu hydrate, atau sedang dialihkan karena tak punya token.
  if (!hasHydrated || !token) {
    return <FullPageSpinner />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
