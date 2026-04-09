"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-xl border border-slate-300/50 bg-white/50 dark:border-white/10 dark:bg-white/5" />
    );
  }

  const cycle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const label =
    theme === "system"
      ? resolvedTheme === "dark"
        ? "Системная (тёмная)"
        : "Системная (светлая)"
      : theme === "dark"
        ? "Тёмная"
        : "Светлая";

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Тема: ${label}. Нажми, чтобы сменить.`}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/80 bg-white/90 text-slate-700 shadow-sm transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
      aria-label={`Текущая тема: ${label}`}
    >
      {theme === "light" && (
        <span className="text-lg" aria-hidden>
          ☀️
        </span>
      )}
      {theme === "dark" && (
        <span className="text-lg" aria-hidden>
          🌙
        </span>
      )}
      {theme === "system" && (
        <span className="text-lg" aria-hidden>
          💻
        </span>
      )}
    </button>
  );
}
