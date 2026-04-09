"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (!ready) {
    return (
      <div
        className="h-10 w-28 animate-pulse rounded-xl border border-slate-200/80 bg-slate-100/80 dark:border-white/10 dark:bg-white/10"
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-xl border border-slate-300/80 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
      >
        Войти
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      <span className="hidden max-w-[200px] truncate text-xs text-slate-600 dark:text-slate-400 sm:inline" title={user.email ?? ""}>
        {user.email}
      </span>
      <Link
        href="/cabinet"
        className="rounded-xl border border-indigo-400/40 bg-white/80 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50 dark:border-white/15 dark:bg-white/5 dark:text-indigo-200 dark:hover:bg-white/10"
      >
        Кабинет
      </Link>
      <button
        type="button"
        onClick={() => void signOut()}
        className="rounded-xl border border-slate-300/80 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
      >
        Выйти
      </button>
    </div>
  );
}
