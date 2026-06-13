"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <div>
      <Link href="/projects" className="text-sm text-slate-500 hover:underline">
        ← Kembali ke daftar project
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">
        Detail Project #{params.id}
      </h1>
      <p className="mt-2 text-slate-600">
        Halaman ini akan dibangun di Checkpoint 4 (daftar task &amp; ubah status).
      </p>
    </div>
  );
}
