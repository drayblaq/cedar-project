"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

type Lang = "en" | "fr";

const footerT = {
  en: {
    desc: "English language training in Cotonou, Bénin. Practical, learner-centered programs designed for measurable results.",
    quickLinks: "Quick links",
    location: "Contact",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/courses", label: "Programs" },
      { href: "/contact", label: "Contact" },
      { href: "/register", label: "Apply Now" },
    ],
    rights: "All rights reserved.",
  },
  fr: {
    desc: "Formation en anglais à Cotonou, Bénin. Programmes pratiques centrés sur l'apprenant pour des résultats mesurables.",
    quickLinks: "Liens rapides",
    location: "Contact",
    links: [
      { href: "/", label: "Accueil" },
      { href: "/about", label: "À propos" },
      { href: "/courses", label: "Programmes" },
      { href: "/contact", label: "Contact" },
      { href: "/register", label: "Candidater" },
    ],
    rights: "Tous droits réservés.",
  },
};

export function PublicFooter() {
  const locale = useLocale() as Lang;
  const lang = locale === "fr" ? "fr" : "en";
  const t = footerT[lang];
  return (
    <footer className="bg-[var(--green-deep)] px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-14">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <Image src="/logo.png" alt="Cedar Training Center" width={52} height={52} style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            <span style={{ fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "1.05rem", color: "white", lineHeight: 1.2 }}>
              Cedar <span style={{ color: "var(--green)" }}>Training</span><br />Center
            </span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.8, maxWidth: 300 }}>{t.desc}</p>
        </div>
        <div>
          <h4 style={{ fontFamily: "var(--font-inter)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>
            {t.quickLinks}
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {t.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.9)", textDecoration: "none" }}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontFamily: "var(--font-inter)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>
            {t.location}
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            <li><span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.8 }}>Gbédjromédé, Cotonou, Bénin</span></li>
            <li><a href="mailto:trainingcentercedar@gmail.com" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.9)", textDecoration: "none" }}>trainingcentercedar@gmail.com</a></li>
            <li><a href="tel:+22901961964 40" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.9)", textDecoration: "none" }}>+229 01 96 19 64 40</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl justify-center border-t border-white/10 pt-8">
        <p style={{ fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.01em", color: "rgba(255,255,255,0.9)", textAlign: "center" }}>
          © {new Date().getFullYear()} <span style={{ color: "var(--green)", fontWeight: 700 }}>Cedar Training Center</span>. {t.rights}
        </p>
      </div>
    </footer>
  );
}
