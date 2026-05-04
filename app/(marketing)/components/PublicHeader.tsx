"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function PublicHeader() {
  const t = useTranslations("marketing");
  const [isOpen, setIsOpen] = useState(false);
  const nav = [
    { href: "/", label: t("nav.home") },
    { href: "/about", label: t("nav.about") },
    { href: "/courses", label: t("nav.courses") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/register", label: t("nav.register") },
  ];

  return (
    <header className="sticky top-0 z-50 glass-header transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 sm:gap-3 font-bold tracking-tight text-slate-900"
        >
          <Logo size="sm" link={false} className="shrink-0" />
          <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent text-[15px] sm:text-xl leading-tight">
            {t("brand")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-end gap-1">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-600"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="ml-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 hover:shadow-emerald-500/40 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
              {t("nav.signin")}
          </Link>
          <div className="ml-3">
            <LanguageSwitcher />
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden ml-auto flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xl px-4 py-4 space-y-2 animate-fade-in-up origin-top">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-4 py-3 text-base font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="pt-2">
            <div className="mb-3">
              <LanguageSwitcher />
            </div>
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="block text-center w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              {t("nav.signin")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
