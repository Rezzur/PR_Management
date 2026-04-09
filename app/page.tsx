"use client";

import React, { useState } from "react";
import { PrMarkdown } from "@/components/pr-markdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";

export default function HomePage() {
  const [brand, setBrand] = useState("");
  const [occasion, setOccasion] = useState("");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: brand.trim(),
          occasion: occasion.trim(),
          audience: audience.trim(),
        }),
      });

      if (res.status === 401) {
        setError("Требуется вход. Обновите страницу или войдите снова.");
        return;
      }

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Произошла ошибка.");
      } else {
        setResult(typeof data.result === "string" ? data.result : "");
      }
    } catch {
      setError("Сетевая ошибка. Попробуйте еще раз.");
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
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg+xmlns=%22http://www.w3.org/2000/svg%22+width=%2248%22+height=%2248%22+viewBox=%220+0+48+48%22%3E%3Cg+fill=%22none%22+stroke=%22%236366f1%22+stroke-opacity=%220.08%22%3E%3Cpath+d=%22M0+24h48M24+0v48%22/%3E%3C/g%3E%3C/svg%3E')] opacity-60 dark:stroke-opacity-[0.06]" />

      <header className="relative z-10 mx-auto flex max-w-4xl items-center justify-between px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg shadow-lg shadow-indigo-500/30">
            ✨
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              PR Management
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Идеи под бренд и инфоповод</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <UserNav />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6">
        <div className="mb-10 text-center sm:mb-12">
          <h1 className="text-balance bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl md:text-5xl dark:from-white dark:via-indigo-200 dark:to-violet-200">
            Генератор PR-стратегий
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-slate-600 dark:text-slate-400">
            Заполни поля — нейросеть предложит креативные PR-идеи с заголовками, сутью и медиа-крючками.
            Форматирование ответа сохраняется: заголовки, жирный текст и списки.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)] lg:gap-10">
          <section className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-xl shadow-indigo-500/5 backdrop-blur-md dark:border-white/10 dark:bg-[rgba(22,23,42,0.75)] dark:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.5)] sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" autoComplete="off">
              <div className="space-y-2">
                <label htmlFor="brand" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Бренд
                </label>
                <input
                  id="brand"
                  type="text"
                  required
                  placeholder="Например: Яндекс, Ozon"
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 shadow-inner outline-none ring-indigo-500/0 transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="occasion" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Инфоповод
                </label>
                <input
                  id="occasion"
                  type="text"
                  required
                  placeholder="Например: старт учебного года, запуск сервиса"
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="audience" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Целевая аудитория
                </label>
                <input
                  id="audience"
                  type="text"
                  required
                  placeholder="Например: школьники, b2b, родители"
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/45 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 transition group-hover:opacity-100" />
                {loading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Генерируем…
                  </>
                ) : (
                  "Сгенерировать PR-стратегию"
                )}
              </button>
            </form>
          </section>

          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-300/80 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-800 dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-200"
            >
              {error}
            </div>
          )}

          {result && (
            <section className="opacity-100 transition-opacity duration-500">
              <div className="overflow-hidden rounded-3xl border border-indigo-200/60 bg-white/80 shadow-2xl shadow-indigo-500/10 backdrop-blur dark:border-indigo-500/40 dark:bg-gradient-to-br dark:from-[#1e1b4b]/90 dark:to-[#0f0a1f]/80">
                <div className="border-b border-indigo-100/80 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 px-6 py-4 dark:border-indigo-500/30 dark:from-indigo-500/15 dark:to-violet-500/10">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ваша PR-стратегия</h2>
                </div>
                <div className="max-h-[min(70vh,720px)] overflow-y-auto px-6 py-6 sm:px-8">
                  <PrMarkdown content={result} />
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
