"use client";

import { useAuthStore } from "@/store/auth";

export default function ProjectsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Daftar Project</h1>
      <p className="mt-2 text-slate-600">
        Halo{user ? `, ${user.name}` : ""}! Sesi Anda aktif. Daftar project akan
        tampil di sini pada Checkpoint 3.
      </p>
    </div>
  );
}
