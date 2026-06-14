"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { AuthCard } from "@/components/AuthCard";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/components/ui/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const setAuth = useAuthStore((s) => s.setAuth);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const token = useAuthStore((s) => s.token);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (hasHydrated && token) router.replace("/projects");
  }, [hasHydrated, token, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const res = await register({ name, email, password });
      setAuth(res.token, res.user); // register -> otomatis login
      toast.success(`Akun dibuat. Selamat datang, ${res.user.name}!`);
      router.replace("/projects");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setFieldErrors({ email: [err.message] }); // "Email sudah terdaftar"
        } else if (err.status === 400 && Object.keys(err.fieldErrors).length) {
          setFieldErrors(err.fieldErrors);
        } else {
          setError(err.message);
        }
      } else {
        setError("Terjadi kesalahan. Coba lagi.");
      }
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Daftar"
      subtitle="Buat akun ProjekTask baru."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-slate-900 underline">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        <TextField
          id="name"
          label="Nama"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name?.[0]}
          required
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password?.[0]}
          hint="Minimal 8 karakter"
          required
        />
        <Button type="submit" loading={loading} className="w-full">
          Daftar
        </Button>
      </form>
    </AuthCard>
  );
}
