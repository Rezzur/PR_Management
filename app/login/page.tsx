"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const supabase = createClient();

  const signInWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || !password) {
      setError("Укажите email и пароль.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        router.push("/");
        router.refresh();
        return;
      }
      setInfo("Проверьте почту — мы отправили ссылку для подтверждения.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-100/80 text-slate-900 transition-colors dark:from-[#0c0a14] dark:via-[#12102a] dark:to-[#1a1535] dark:text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.35),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg+xmlns=%22http://www.w3.org/2000/svg%22+width=%2248%22+height=%2248%22+viewBox=%220+0+48+48%22%3E%3Cg+fill=%22none%22+stroke=%22%236366f1%22+stroke-opacity=%220.08%22%3E%3Cpath+d=%22M0+24h48M24+0v48%22/%3E%3C/g%3E%3C/svg%3E')] opacity-60 dark:stroke-opacity-[0.06]"
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex max-w-lg items-center justify-between px-4 pt-6 sm:px-6">
        <div className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg shadow-lg shadow-indigo-500/30 transition group-hover:shadow-indigo-500/50">
            ✨
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              PR Management
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Вход в аккаунт</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto flex max-w-lg flex-col px-4 pb-16 pt-10 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-balance bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl dark:from-white dark:via-indigo-200 dark:to-violet-200">
            Добро пожаловать
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Войдите или создайте аккаунт, чтобы сохранять сценарии и настройки.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-xl shadow-indigo-500/5 backdrop-blur-md dark:border-white/10 dark:bg-[rgba(22,23,42,0.75)] dark:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.5)] sm:p-8">
          <form onSubmit={signInWithPassword} className="flex flex-col gap-5" autoComplete="on">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Пароль
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-300/80 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-200"
              >
                {error}
              </div>
            )}
            {info && (
              <div
                role="status"
                className="rounded-2xl border border-indigo-300/60 bg-indigo-50/90 px-4 py-3 text-sm font-medium text-indigo-900 dark:border-indigo-500/35 dark:bg-indigo-950/40 dark:text-indigo-100"
              >
                {info}
              </div>
            )}

            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/45 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 transition group-hover:opacity-100" />
                {loading ? (
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                ) : null}
                Войти
              </button>
              <button
                type="button"
                onClick={signUp}
                disabled={loading}
                className="flex flex-1 items-center justify-center rounded-2xl border border-indigo-400/50 bg-white/80 py-3.5 text-base font-semibold text-indigo-700 backdrop-blur transition hover:border-indigo-500/60 hover:bg-indigo-50/90 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-indigo-200 dark:hover:bg-white/10"
              >
                Зарегистрироваться
              </button>
            </div>
          </form>
        </section>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-500">
          После входа откроется генератор PR-стратегий.
        </p>
      </main>
    </div>
  );
}
