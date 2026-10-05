"use client";

import { FormEvent, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: form.get("login"),
        password: form.get("password"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Ошибка входа");
      setPending(false);
      return;
    }
    window.location.href = params.get("next") || data.next || "/cabinet";
  }

  return (
    <form onSubmit={onSubmit} className="panel w-full max-w-sm space-y-3 p-5">
      <h1 className="text-2xl font-semibold">Вход</h1>
      <input name="login" type="text" required placeholder="Логин" className="field" autoComplete="username" />
      <input name="password" type="password" required placeholder="Пароль" className="field" autoComplete="current-password" />
      {error ? <p className="text-sm text-[var(--bad)]">{error}</p> : null}
      <button disabled={pending} className="btn w-full">{pending ? "…" : "Войти"}</button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
