"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Icon } from "@/lib/icons";
import type { RegisterState } from "@/lib/auth";
import { register } from "@/app/login/actions";

export function RegisterForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(register, null);

  return (
    <div className="login-wrap">
      <form action={action} className="login-card">
        <div className="login-mark">
          <Icon name="cloud" size={24} stroke={1.7} />
        </div>
        <h1>Create account</h1>
        <p className="login-sub">Daftar akun untuk mengakses Sarastya Drive</p>

        <input type="hidden" name="from" value={from} />
        <input className="input" name="name" placeholder="Name" required autoFocus autoComplete="name" />
        <input className="input" type="email" name="email" placeholder="Email" required autoComplete="email" />
        <input
          className="input"
          type="password"
          name="password"
          placeholder="Password (min. 8 karakter)"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {state?.error && <div className="login-err">{state.error}</div>}

        <button className="btn primary" type="submit" disabled={pending}>
          {pending ? <span className="spinner sm" /> : <Icon name="check" size={16} />}
          Register
        </button>
        <Link className="btn subtle" href={`/login?from=${encodeURIComponent(from)}`}>
          Back to login
        </Link>
      </form>
    </div>
  );
}
