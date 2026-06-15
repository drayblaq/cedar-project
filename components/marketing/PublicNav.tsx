"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { setLocale } from "@/app/actions/locale";

type Lang = "en" | "fr";

const navLabels: Record<Lang, { home: string; about: string; programs: string; contact: string; apply: string }> = {
  en: { home: "Home", about: "About", programs: "Programs", contact: "Contact", apply: "Apply Now →" },
  fr: { home: "Accueil", about: "À propos", programs: "Programmes", contact: "Contact", apply: "Candidater →" },
};

export function PublicNav() {
  const locale = useLocale() as Lang;
  const lang = locale === "fr" ? "fr" : "en";
  const [pending, startTransition] = useTransition();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = navLabels[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t.home },
    { href: "/about", label: t.about },
    { href: "/courses", label: t.programs },
    { href: "/contact", label: t.contact },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex h-[72px] items-center justify-between px-4 transition-all duration-300 sm:h-[76px] sm:px-6 lg:px-10 xl:px-12 glass-nav${scrolled ? " glass-nav-scrolled" : ""}`}
      >
        {/* Logo */}
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 no-underline sm:gap-3">
          <Image src="/logo.png" alt="Cedar Training Center" width={44} height={44} className="object-contain sm:h-[52px] sm:w-[52px]" priority />
          <span
            className="hidden min-[400px]:block"
            style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.95rem", color: "var(--green-dark)", lineHeight: 1.15 }}
          >
            Cedar <span style={{ color: "var(--green)" }}>Training</span>
            <br />Center
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors no-underline"
              style={{
                color: pathname === link.href ? "var(--green)" : "#111827",
                background: pathname === link.href ? "rgba(46,168,42,0.08)" : "transparent",
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Language toggle */}
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await setLocale(lang === "en" ? "fr" : "en");
                window.location.reload();
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-[1.5px] cursor-pointer transition-colors ml-2 disabled:opacity-60"
            style={{ background: "var(--mint)", borderColor: "var(--mint-deep)" }}
          >
            <span
              style={{
                fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.78rem",
                letterSpacing: "0.08em", color: lang === "en" ? "var(--green)" : "#374151",
              }}
            >
              EN
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--mint-deep)" }}>|</span>
            <span
              style={{
                fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.78rem",
                letterSpacing: "0.08em", color: lang === "fr" ? "var(--green)" : "#374151",
              }}
            >
              FR
            </span>
          </button>

          {/* Login link */}
          <a
            href={`${process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.cedartrainingcenter.com"}/auth/login`}
            className="ml-2 px-4 py-2 rounded-xl font-semibold text-sm no-underline transition-colors"
            style={{ color: "var(--green-dark)", border: "1.5px solid rgba(46,168,42,0.3)", fontFamily: "var(--font-syne)" }}
          >
            {lang === "en" ? "Login" : "Connexion"}
          </a>

          <Link
            href="/register"
            className="ml-2 px-5 py-2 rounded-xl font-bold text-sm text-white transition-all no-underline"
            style={{ background: "var(--green)", boxShadow: "0 4px 20px rgba(46,168,42,0.3)", fontFamily: "var(--font-syne)" }}
          >
            {t.apply}
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="lg:hidden flex flex-col gap-1.5 cursor-pointer p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 rounded transition-all" style={{ background: "var(--green-dark)" }} />
          <span className="block w-6 h-0.5 rounded transition-all" style={{ background: "var(--green-dark)" }} />
          <span className="block w-6 h-0.5 rounded transition-all" style={{ background: "var(--green-dark)" }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="fixed top-[72px] sm:top-[76px] left-0 right-0 z-40 flex flex-col gap-1 px-6 pb-8 pt-4"
          style={{ background: "var(--white)", borderBottom: "2px solid rgba(46,168,42,0.15)", boxShadow: "0 8px 32px rgba(46,168,42,0.12)" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 font-semibold text-base no-underline border-b transition-colors"
              style={{ color: "#111827", borderColor: "rgba(46,168,42,0.1)" }}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await setLocale(lang === "en" ? "fr" : "en");
                window.location.reload();
              })
            }
            className="flex items-center gap-2 py-3 font-bold text-sm cursor-pointer disabled:opacity-60"
            style={{ color: "var(--green)", background: "none", border: "none" }}
          >
            {lang === "en" ? "Passer en Français" : "Switch to English"}
          </button>
          <a
            href={`${process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.cedartrainingcenter.com"}/auth/login`}
            onClick={() => setMenuOpen(false)}
            className="py-3 font-semibold text-sm no-underline border-b"
            style={{ color: "var(--green)", borderColor: "rgba(46,168,42,0.1)", display: "block" }}
          >
            {lang === "en" ? "Login" : "Connexion"}
          </a>
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="mt-2 text-center py-3 rounded-xl font-bold text-white no-underline"
            style={{ background: "var(--green)", fontFamily: "var(--font-syne)" }}
          >
            {t.apply}
          </Link>
        </div>
      )}
    </>
  );
}
