"use client";

import React, { useMemo, useState } from "react";

type GenerateResponse = { result?: string; error?: string; details?: string };

export default function Page() {
  const [brand, setBrand] = useState("");
  const [occasion, setOccasion] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const composedOccasion = useMemo(() => {
    const a = audience.trim();
    return `${occasion.trim()}${a ? `, аудитория: ${a}` : ""}`.trim();
  }, [occasion, audience]);

  const canSubmit = brand.trim().length > 0 && occasion.trim().length > 0 && !loading;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: brand.trim(),
          occasion: composedOccasion,
          audience: audience.trim(),
        }),
      });

      const data = (await res.json()) as GenerateResponse;

      if (res.ok && data?.result) {
        setResult(data.result);
      } else {
        setError(data?.error || "Произошла ошибка. Попробуй ещё раз.");
      }
    } catch {
      setError("Произошла ошибка. Попробуй ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <header className="mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Генератор PR-идей
          </div>
          <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            AI PR-Ассистент
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm text-slate-600 sm:text-base">
            Заполни поля — и я предложу несколько PR-идей под твой бренд и инфоповод.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-xl shadow-slate-200/40 backdrop-blur sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="text-sm font-medium text-slate-700">Бренд</label>
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Например: Яндекс, Sber, Ozon"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-0 transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  required
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-sm font-medium text-slate-700">Аудитория</label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Например: студенты, b2b, родители"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-0 transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Инфоповод</label>
              <textarea
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="Запуск продукта, акция, партнёрство, исследование, событие…"
                className="mt-2 min-h-[110px] w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none ring-0 transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                required
              />
              <div className="mt-2 text-xs text-slate-500">
                В запрос отправим: <span className="font-medium text-slate-700">{composedOccasion || "—"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-200/60 transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? (
                  <>
                    <span className="inline-flex h-5 w-5 items-center justify-center">
                      <svg
                        className="h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    </span>
                    Создаю…
                  </>
                ) : (
                  "Создать магию"
                )}
              </button>

              <div className="hidden text-sm text-slate-500 sm:block">
                {loading ? "Генерирую идеи" : "Готово за несколько секунд"}
              </div>
            </div>
          </form>
        </div>

        {(result || error) && (
          <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-xl shadow-slate-200/40 backdrop-blur sm:p-8">
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            ) : null}

            {result ? (
              <div>
                <div className="mb-3 text-sm font-semibold text-slate-900">Идеи:</div>
                <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">
                  {result}
                </pre>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
