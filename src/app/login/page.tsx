"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { AuthCard } from "@/components/AuthCard";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const setAuth = useAuthStore((s) => s.setAuth);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const token = useAuthStore((s) => s.token);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Sudah login -> jangan tampilkan form, langsung ke daftar project.
  useEffect(() => {
    if (hasHydrated && token) router.replace("/projects");
  }, [hasHydrated, token, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const res = await login({ email, password });
      setAuth(res.token, res.user);
      toast.success(`Selamat datang kembali, ${res.user.name}!`);
      router.replace("/projects");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400 && Object.keys(err.fieldErrors).length) {
          setFieldErrors(err.fieldErrors);
        } else {
          setError(err.message); // 401 -> "Email atau password salah"
        }
      } else {
        setError("Terjadi kesalahan. Coba lagi.");
      }
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Masuk"
      subtitle="Masuk ke akun ProjekTask Anda."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-slate-900 underline">
            Daftar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email?.[0]}
          required
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password?.[0]}
          required
        />
        <Button type="submit" loading={loading} className="w-full">
          Masuk
        </Button>
      </form>
    </AuthCard>
  );
}
