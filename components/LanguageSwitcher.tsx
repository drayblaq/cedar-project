"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/app/actions/locale";

type Locale = "en" | "fr";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  function onSwitch(nextLocale: Locale) {
    if (nextLocale === locale) return;
    startTransition(async () => {
      await setLocale(nextLocale);
      window.location.reload();
    });
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 text-xs font-semibold">
      <button
        type="button"
        onClick={() => onSwitch("en")}
        disabled={isPending}
        className={`rounded-md px-2.5 py-1 transition ${
          locale === "en"
            ? "bg-emerald-500 text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onSwitch("fr")}
        disabled={isPending}
        className={`rounded-md px-2.5 py-1 transition ${
          locale === "fr"
            ? "bg-emerald-500 text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        FR
      </button>
    </div>
  );
}
