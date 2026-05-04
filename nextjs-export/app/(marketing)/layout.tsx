"use client";
import { useState } from "react";
import { PublicNav } from "@/components/marketing/PublicNav";
import { PublicFooter } from "@/components/marketing/PublicFooter";

type Lang = "en" | "fr";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  return (
    <>
      <PublicNav lang={lang} onLangChange={setLang} />
      <main>{children}</main>
      <PublicFooter lang={lang} />
    </>
  );
}
