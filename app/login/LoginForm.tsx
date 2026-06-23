"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Icon } from "@/lib/icons";
import { login } from "./actions";
import type { LoginState } from "@/lib/auth";

export function LoginForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    null,
  );

  return (
    <div className="login-wrap">
      <form action={action} className="login-card">
        <div className="login-mark">
          <Icon name="cloud" size={24} stroke={1.7} />
        </div>
        <h1>Sarastya Drive</h1>
        <p className="login-sub">Masuk dengan akun JWT Sarastya Drive</p>

        <input type="hidden" name="from" value={from} />
        <input
          className="input"
          type="email"
          name="email"
          placeholder="Email"
          autoFocus
          required
          autoComplete="email"
        />
        <input
          className="input"
          type="password"
          name="password"
          placeholder="Password"
          required
          autoComplete="current-password"
        />
        {state?.error && <div className="login-err">{state.error}</div>}

        <button className="btn primary" type="submit" disabled={pending}>
          {pending ? (
            <span className="spinner sm" />
          ) : (
            <Icon name="check" size={16} />
          )}
          Sign in
        </button>
        <Link
          className="btn subtle"
          href={`/register?from=${encodeURIComponent(from)}`}
        >
          Create account
        </Link>
      </form>
    </div>
  );
}
