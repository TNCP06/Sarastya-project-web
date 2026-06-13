"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { FullPageSpinner } from "@/components/ui/Spinner";

export default function Home() {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!hasHydrated) return;
    router.replace(token ? "/projects" : "/login");
  }, [hasHydrated, token, router]);

  return <FullPageSpinner />;
}
