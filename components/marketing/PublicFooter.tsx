"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

type Lang = "en" | "fr";

const footerT = {
  en: {
    desc: "English language training in Cotonou, Bénin — practical, learner-centered programs designed for measurable results.",
    quickLinks: "Quick links",
    location: "Location",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/courses", label: "Programs" },
      { href: "/contact", label: "Contact" },
      { href: "/register", label: "Apply Now" },
    ],
    rights: "All rights reserved.",
    madeIn: "Made with ♥ in",
  },
  fr: {
    desc: "Formation en anglais à Cotonou, Bénin — programmes pratiques centrés sur l'apprenant pour des résultats mesurables.",
    quickLinks: "Liens rapides",
    location: "Localisation",
    links: [
      { href: "/", label: "Accueil" },
      { href: "/about", label: "À propos" },
      { href: "/courses", label: "Programmes" },
      { href: "/contact", label: "Contact" },
      { href: "/register", label: "Candidater" },
    ],
    rights: "Tous droits réservés.",
    madeIn: "Fait avec ♥ à",
  },
};

export function PublicFooter() {
  const locale = useLocale() as Lang;
  const lang = locale === "fr" ? "fr" : "en";
  const t = footerT[lang];
  return (
    <footer style={{ background: "var(--green-deep)", padding: "80px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 60 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <Image src="/logo.png" alt="Cedar Training Center" width={52} height={52} style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.05rem", color: "white", lineHeight: 1.2 }}>
              Cedar <span style={{ color: "var(--green)" }}>Training</span><br />Center
            </span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.8, maxWidth: 300 }}>{t.desc}</p>
        </div>
        <div>
          <h4 style={{ fontFamily: "var(--font-syne)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
            {t.quickLinks}
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {t.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} style={{ fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontFamily: "var(--font-syne)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
            {t.location}
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            <li><span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>Gbédjromédé, Cotonou<br />Bénin 🇧🇯</span></li>
            <li><a href="mailto:contact@cedartrainingcenter.com" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>contact@cedartrainingcenter.com</a></li>
            <li><a href="tel:+22997000000" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>+229 97 00 00 00</a></li>
          </ul>
        </div>
      </div>
      <div style={{ maxWidth: 1280, margin: "56px auto 0", paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}>
          © {new Date().getFullYear()} <span style={{ color: "var(--green)" }}>Cedar Training Center</span>. {t.rights}
        </p>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}>
          {t.madeIn} <span style={{ color: "var(--green)" }}>Cotonou, Bénin</span>
        </p>
      </div>
    </footer>
  );
}
