"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

export default function CabinetPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
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

      <header className="relative z-10 mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 pt-6 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg shadow-lg shadow-indigo-500/30">
            ✨
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              PR Management
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Личный кабинет</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-balance bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl dark:from-white dark:via-indigo-200 dark:to-violet-200">
            Ваш профиль
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Управление аккаунтом и быстрый доступ к генератору PR-стратегий.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-xl shadow-indigo-500/5 backdrop-blur-md dark:border-white/10 dark:bg-[rgba(22,23,42,0.75)] dark:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.5)] sm:p-8">
          {loading ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">Загрузка…</p>
          ) : user ? (
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                  Email
                </dt>
                <dd className="mt-1 text-base font-medium text-slate-900 dark:text-white">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                  ID
                </dt>
                <dd className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-400">{user.id}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">Сессия не найдена.</p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/"
              className="inline-flex flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-6 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/45 sm:flex-none"
            >
              К генератору PR
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300/80 bg-white/90 px-6 py-3.5 text-base font-semibold text-slate-800 transition hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 sm:flex-none"
            >
              Выйти из аккаунта
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
