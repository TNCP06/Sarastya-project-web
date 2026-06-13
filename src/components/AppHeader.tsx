"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/Button";

export function AppHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  function handleLogout() {
    clear();
    router.replace("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/projects"
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          ProjekTask
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <span
              className="hidden text-sm text-slate-600 sm:inline"
              title={user.email}
            >
              {user.name}
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Keluar
          </Button>
        </div>
      </div>
    </header>
  );
}
