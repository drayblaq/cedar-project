"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

type Lang = "en" | "fr";

const t = {
  en: {
    eyebrow: "English Training · Cotonou, Bénin 🇧🇯",
    title1: "Learn", title2: "English", title3: "with Cedar",
    sub: "We support every learner in acquiring English for studies, career and international success. Based in Cotonou — serving all of Bénin.",
    apply: "Apply Now", explore: "Explore Programs",
    whoWeAre: "Who We Are",
    aboutT: "A center", aboutA: "dedicated", aboutT2: "to your success",
    aboutLead: "Cedar Training Center helps learners develop English language skills for studies, career growth and integration in international contexts. Based in Gbédjromédé, Cotonou.",
    v1t: "Mission-driven", v1p: "High-quality English training that helps learners communicate with confidence and efficiency.",
    v2t: "International focus", v2p: "Become a reference center recognized for excellence, innovation and impact across West Africa.",
    v3t: "Real-world methodology", v3p: "Dynamic courses, real-life scenarios, intensive speaking practice and individual support.",
    ourStory: "Our story",
    whatWeOffer: "What We Offer",
    progT: "Programs built for", progA: "real results",
    p1t: "General English", p1p: "Build core skills across reading, writing, speaking and listening — from Beginner to Advanced.", p1tag: "A1 → C2", p1lv: "All levels",
    p2t: "Business English", p2p: "Master professional communication for meetings, emails, presentations and negotiations.", p2tag: "Intermediate → Advanced", p2lv: "Professional",
    p3t: "IELTS · TOEFL · TOEIC", p3p: "Targeted preparation with proven strategies, practice tests and expert feedback.", p3tag: "All certifications", p3lv: "Exam Prep",
    p4t: "Personalized & Intensive", p4p: "Fast-track programs built around your goals, timeline and schedule.", p4tag: "Custom track", p4lv: "Intensive",
    ctaCardT: "Find your perfect program →", ctaCardP: "Take our placement test and start at the exact right level for you.", ctaCardBtn: "Apply Now →",
    whyCedar: "Why Cedar?", whyT: "The training center", whyA: "built different",
    whySub: "We don't just teach English — we engineer confidence. Every element of our program is designed to get you speaking, writing and thinking in English faster than you thought possible.",
    f1t: "Small groups", f1p: "Max 15 students per class for personalized attention and real speaking time.",
    f2t: "Expert teachers", f2p: "Qualified instructors with international experience and local context.",
    f3t: "Placement testing", f3p: "Start at the exact right level with our free placement assessment.",
    f4t: "Flexible schedules", f4p: "Morning, afternoon and evening classes to fit work and school.",
    ctaL1: "Start your journey", ctaL2: "in English.", ctaL3: "Today.",
    ctaApply: "Apply Now →", ctaContact: "Have questions? Contact us →",
    findUs: "Find Us", locT1: "We're in", locA: "Cotonou,", locT2: "Bénin 🇧🇯",
    contactUs: "Contact us",
  },
  fr: {
    eyebrow: "Formation en anglais · Cotonou, Bénin 🇧🇯",
    title1: "Apprendre", title2: "l'Anglais", title3: "avec Cedar",
    sub: "Nous accompagnons chaque apprenant dans l'acquisition de l'anglais pour ses études, sa carrière et son succès international.",
    apply: "Candidater", explore: "Voir les programmes",
    whoWeAre: "Qui sommes-nous",
    aboutT: "Un centre", aboutA: "dédié", aboutT2: "à votre réussite",
    aboutLead: "Cedar Training Center aide les apprenants à développer leurs compétences en anglais pour les études, la carrière et l'intégration dans des contextes internationaux. Situé à Gbédjromédé, Cotonou.",
    v1t: "Mission claire", v1p: "Former à l'anglais de qualité pour que chaque apprenant communique avec confiance.",
    v2t: "Vision internationale", v2p: "Devenir un centre de référence en Afrique de l'Ouest reconnu pour l'excellence.",
    v3t: "Méthodologie concrète", v3p: "Cours dynamiques, situations réelles, pratique orale intensive et suivi individuel.",
    ourStory: "Notre histoire",
    whatWeOffer: "Nos offres",
    progT: "Des programmes pour", progA: "des résultats concrets",
    p1t: "Anglais général", p1p: "Développez les 4 compétences : lecture, écriture, expression et compréhension orale.", p1tag: "A1 → C2", p1lv: "Tous niveaux",
    p2t: "Anglais des affaires", p2p: "Maîtrisez la communication professionnelle pour réunions, e-mails et présentations.", p2tag: "Intermédiaire → Avancé", p2lv: "Professionnel",
    p3t: "IELTS · TOEFL · TOEIC", p3p: "Préparation ciblée avec stratégies éprouvées, tests blancs et feedback d'experts.", p3tag: "Toutes certifications", p3lv: "Certification",
    p4t: "Personnalisé & Intensif", p4p: "Programme sur mesure selon vos objectifs, votre rythme et vos disponibilités.", p4tag: "Parcours personnalisé", p4lv: "Intensif",
    ctaCardT: "Trouvez votre programme →", ctaCardP: "Passez notre test de niveau et commencez exactement là où il faut.", ctaCardBtn: "Candidater →",
    whyCedar: "Pourquoi Cedar ?", whyT: "Le centre de formation", whyA: "qui fait la différence",
    whySub: "Nous ne faisons pas qu'enseigner l'anglais — nous construisons la confiance. Chaque élément de notre programme est conçu pour vous faire progresser plus vite.",
    f1t: "Petits groupes", f1p: "Maximum 15 étudiants par classe pour un suivi personnalisé et du temps de parole réel.",
    f2t: "Enseignants experts", f2p: "Formateurs qualifiés avec expérience internationale et contexte local.",
    f3t: "Test de niveau", f3p: "Commencez exactement au bon niveau avec notre test de placement gratuit.",
    f4t: "Horaires flexibles", f4p: "Cours matin, après-midi et soir pour s'adapter à votre emploi du temps.",
    ctaL1: "Commencez votre parcours", ctaL2: "en anglais.", ctaL3: "Aujourd'hui.",
    ctaApply: "Candidater →", ctaContact: "Des questions ? Contactez-nous →",
    findUs: "Nous trouver", locT1: "Nous sommes à", locA: "Cotonou,", locT2: "Bénin 🇧🇯",
    contactUs: "Nous contacter",
  },
};

function useReveal(locale: string) {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    els.forEach((el) => el.classList.remove("visible"));
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } }),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [locale]);
}

export default function HomePage() {
  const locale = useLocale();
  const lang: Lang = locale === "fr" ? "fr" : "en";
  const tr = t[lang];
  useReveal(locale);

  const marqueeItems = [
    lang === "en" ? "General English" : "Anglais général",
    "Business English",
    "IELTS Preparation",
    "TOEFL Training",
    "TOEIC Prep",
    lang === "en" ? "Intensive Programs" : "Programmes intensifs",
    lang === "en" ? "Placement Testing" : "Test de niveau",
    "Cotonou, Bénin 🇧🇯",
  ];

  const programs = [
    { img: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=85&fit=crop&crop=faces", lv: tr.p1lv, t: tr.p1t, p: tr.p1p, tag: tr.p1tag },
    { img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=85&fit=crop", lv: tr.p2lv, t: tr.p2t, p: tr.p2p, tag: tr.p2tag },
    { img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=85&fit=crop&crop=faces", lv: tr.p3lv, t: tr.p3t, p: tr.p3p, tag: tr.p3tag },
    { img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=85&fit=crop&crop=faces", lv: tr.p4lv, t: tr.p4t, p: tr.p4p, tag: tr.p4tag },
  ];

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative grid min-h-0 grid-cols-1 overflow-hidden bg-[var(--mint)] pt-[72px] sm:pt-[76px] lg:min-h-screen lg:grid-cols-2">
        <div aria-hidden="true" className="hero-bg-word hidden sm:block">APPRENDRE<br />L'ANGLAIS</div>
        <div className="relative z-[2] flex flex-col justify-center px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-20 xl:pl-20">
          <p className="animate-slide-up delay-100" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 24 }}>
            <span style={{ display: "block", width: 28, height: 2.5, background: "var(--green)", borderRadius: 2 }} />{tr.eyebrow}
          </p>
          <h1 className="animate-slide-up delay-200" style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(3.2rem, 5.5vw, 6.5rem)", fontWeight: 800, lineHeight: 0.92, letterSpacing: "-0.04em", color: "var(--green-deep)" }}>
            <span style={{ color: "transparent", WebkitTextStroke: "3px var(--green)" }}>{tr.title1}</span><br />
            {tr.title2}<br />
            <span style={{ color: "var(--green)" }}>{tr.title3}</span>
          </h1>
          <p className="animate-slide-up delay-300" style={{ marginTop: 28, fontSize: "1.1rem", lineHeight: 1.7, color: "var(--text-muted)", maxWidth: 420 }}>{tr.sub}</p>
          <div className="animate-slide-up delay-400" style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 44, flexWrap: "wrap" }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.95rem", padding: "16px 32px", borderRadius: 12, textDecoration: "none", boxShadow: "0 8px 32px rgba(46,168,42,0.35)" }}>
              {tr.apply} →
            </Link>
            <Link href="/courses" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--green-dark)", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", padding: "16px 24px", borderRadius: 12, border: "2px solid rgba(46,168,42,0.3)" }}>
              {tr.explore}
            </Link>
          </div>
        </div>
        {/* Hero right photo */}
        <div className="animate-slide-right delay-300r relative order-first min-h-[44vh] w-full overflow-hidden lg:order-none lg:min-h-0 lg:h-full">
          <Image src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=85&fit=crop&crop=faces" alt="Students learning English" fill style={{ objectFit: "cover" }} priority />
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to right, var(--mint) 0%, transparent 20%, transparent 80%, var(--mint) 100%)" }} />
          <div className="animate-float-pill absolute right-4 top-4 z-[5] rounded-full px-3 py-2 text-[0.65rem] font-extrabold uppercase tracking-wide text-white sm:right-8 sm:top-8 sm:px-[18px] sm:py-2.5 sm:text-[0.78rem]" style={{ background: "var(--green)", fontFamily: "var(--font-syne)", boxShadow: "0 8px 24px rgba(46,168,42,0.4)" }}>
            IELTS · TOEFL · TOEIC
          </div>
          <div className="animate-float-pill-2 absolute bottom-6 right-4 z-[5] flex items-center gap-2 rounded-xl border-2 border-[var(--mint-deep)] bg-white px-3 py-2.5 text-[0.7rem] font-extrabold sm:bottom-10 sm:right-10 sm:gap-2.5 sm:px-5 sm:py-3 sm:text-[0.78rem]" style={{ color: "var(--green-dark)", fontFamily: "var(--font-syne)", boxShadow: "0 8px 32px rgba(46,168,42,0.15)" }}>
            <span style={{ fontSize: "1.6rem", color: "var(--green)" }}>98%</span>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--green-dark)", lineHeight: 1.3 }}>Student<br />Satisfaction</div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ background: "var(--green-deep)", overflow: "hidden", padding: "15px 0" }}>
        <div className="animate-marquee" style={{ display: "flex", whiteSpace: "nowrap" }}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 16, fontFamily: "var(--font-syne)", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mint)", padding: "0 40px" }}>
              {item}<span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
            </span>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="bg-[var(--white)] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="reveal-left relative mx-auto h-[340px] w-full max-w-lg sm:h-[440px] lg:mx-0 lg:h-[580px] lg:max-w-none">
            <div style={{ position: "absolute", top: 0, left: 0, width: "65%", height: "76%", borderRadius: 24, overflow: "hidden", boxShadow: "0 32px 80px rgba(46,168,42,0.15)" }}>
              <Image src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700&q=85&fit=crop&crop=faces" alt="Students learning" fill style={{ objectFit: "cover" }} />
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: "54%", height: "56%", borderRadius: 24, overflow: "hidden", border: "5px solid var(--white)", boxShadow: "0 20px 60px rgba(46,168,42,0.18)" }}>
              <Image src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=500&q=85&fit=crop" alt="Student studying" fill style={{ objectFit: "cover" }} />
            </div>
          </div>
          <div className="reveal-right">
            <p style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 18 }}>
              <span style={{ width: 24, height: 2.5, background: "var(--green)", borderRadius: 2 }} />{tr.whoWeAre}
            </p>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(2.4rem, 4vw, 4.2rem)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.035em", color: "var(--green-deep)" }}>
              {tr.aboutT} <span style={{ color: "var(--green)" }}>{tr.aboutA}</span><br />{tr.aboutT2}
            </h2>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.78, color: "var(--text-muted)", marginTop: 18, marginBottom: 32 }}>{tr.aboutLead}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[{ icon: "🎯", t: tr.v1t, p: tr.v1p }, { icon: "🌍", t: tr.v2t, p: tr.v2p }, { icon: "💬", t: tr.v3t, p: tr.v3p }].map(({ icon, t: vt, p }) => (
                <div key={vt} className="value-card" style={{ display: "flex", gap: 18, alignItems: "flex-start", background: "var(--mint)", border: "1.5px solid var(--mint-deep)", borderRadius: 16, padding: "18px 22px" }}>
                  <div style={{ width: 44, height: 44, flexShrink: 0, background: "rgba(46,168,42,0.12)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>{icon}</div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 4 }}>{vt}</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{p}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/about" style={{ marginTop: 36, display: "inline-flex", alignItems: "center", gap: 10, background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.95rem", padding: "16px 32px", borderRadius: 12, textDecoration: "none", boxShadow: "0 8px 32px rgba(46,168,42,0.35)" }}>
              {tr.ourStory} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section className="bg-[var(--green-deep)] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center sm:mb-16">
            <p style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--mint)", marginBottom: 18 }}>
              <span style={{ width: 24, height: 2.5, background: "var(--green)", borderRadius: 2 }} />{tr.whatWeOffer}
            </p>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(2.4rem, 4vw, 4.2rem)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.035em", color: "white" }}>
              {tr.progT}<br /><span style={{ color: "var(--green)" }}>{tr.progA}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {programs.map((prog, i) => (
              <div key={i} className="program-card overflow-hidden rounded-[20px] border-[1.5px] border-white/10 bg-white/[0.06]">
                <div className="relative h-48 overflow-hidden sm:h-52 md:h-[220px]">
                  <Image src={prog.img} alt={prog.t} fill style={{ objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(15,74,13,0.7) 100%)" }} />
                  <span style={{ position: "absolute", top: 14, right: 14, background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.7rem", padding: "5px 12px", borderRadius: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>{prog.lv}</span>
                </div>
                <div style={{ padding: 26 }}>
                  <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.2rem", fontWeight: 800, color: "white", marginBottom: 10, lineHeight: 1.2 }}>{prog.t}</h3>
                  <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.65, marginBottom: 18 }}>{prog.p}</p>
                  <span style={{ display: "inline-block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", padding: "5px 12px", borderRadius: 8, textTransform: "uppercase", background: "rgba(46,168,42,0.2)", color: "var(--mint-deep)" }}>{prog.tag}</span>
                </div>
              </div>
            ))}
            {/* CTA card spanning 2 cols */}
            <div className="program-card col-span-1 flex flex-col items-start justify-center rounded-[20px] border-none bg-[var(--green)] p-8 sm:col-span-2 sm:p-10">
              <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.7rem", fontWeight: 800, color: "white", marginBottom: 14, lineHeight: 1.1 }}>{tr.ctaCardT}</h3>
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.65, marginBottom: 28 }}>{tr.ctaCardP}</p>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "white", color: "var(--green-dark)", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.9rem", padding: "14px 26px", borderRadius: 10, textDecoration: "none" }}>
                {tr.ctaCardBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CEDAR ── */}
      <section className="bg-[var(--mint)] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div>
            <p className="eyebrow-label reveal" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 18 }}>
              <span style={{ width: 24, height: 2.5, background: "var(--green)", borderRadius: 2 }} />{tr.whyCedar}
            </p>
            <h2 className="reveal td-1" style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(2.4rem, 4vw, 4.2rem)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.035em", color: "var(--green-deep)" }}>
              {tr.whyT}<br /><span style={{ color: "var(--green)" }}>{tr.whyA}</span>
            </h2>
            <p className="reveal td-2" style={{ marginTop: 18, fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.8, maxWidth: 480 }}>{tr.whySub}</p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-10">
              {[{ n:"01",t:tr.f1t,p:tr.f1p},{n:"02",t:tr.f2t,p:tr.f2p},{n:"03",t:tr.f3t,p:tr.f3p},{n:"04",t:tr.f4t,p:tr.f4p}].map(({n,t:ft,p},i)=>(
                <div key={i} className={`why-feature reveal td-${i+1}`} style={{ background: "var(--white)", border: "1.5px solid var(--mint-deep)", borderRadius: 18, padding: 26, boxShadow: "0 4px 20px rgba(46,168,42,0.06)" }}>
                  <div style={{ fontFamily: "var(--font-syne)", fontSize: "2rem", fontWeight: 800, color: "var(--green)", opacity: 0.4, lineHeight: 1, marginBottom: 10 }}>{n}</div>
                  <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 6 }}>{ft}</h3>
                  <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{p}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal-right relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
              <Image src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=700&q=85&fit=crop&crop=faces" alt="Students at Cedar" fill style={{ objectFit: "cover" }} />
            </div>
            <div className="absolute -bottom-3 -left-1 rounded-2xl border-4 border-white px-5 py-4 text-white sm:-bottom-6 sm:-left-4 sm:px-7 sm:py-5" style={{ background: "var(--green)", fontFamily: "var(--font-syne)", boxShadow: "0 16px 48px rgba(46,168,42,0.4)" }}>
              <div style={{ fontSize: "2.6rem", fontWeight: 800, lineHeight: 1 }}>98%</div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4, opacity: 0.85 }}>Student satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="relative overflow-hidden bg-[var(--green-deep)] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div aria-hidden="true" className="cta-bg-word hidden md:block">APPLY</div>
        <div className="relative z-[2] mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-14">
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(2.6rem, 4.5vw, 5rem)", fontWeight: 800, color: "white", lineHeight: 1.0, letterSpacing: "-0.04em" }}>
            {tr.ctaL1}<br /><span style={{ color: "var(--green)" }}>{tr.ctaL2}</span><br /><span style={{ opacity: 0.4 }}>{tr.ctaL3}</span>
          </h2>
          <div className="flex w-full shrink-0 flex-col items-stretch gap-3 sm:items-start lg:w-auto lg:items-start">
            <Link href="/register" className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-center text-base font-bold text-white no-underline sm:w-auto sm:whitespace-nowrap" style={{ background: "var(--green)", fontFamily: "var(--font-syne)", boxShadow: "0 8px 32px rgba(46,168,42,0.35)" }}>
              {tr.ctaApply}
            </Link>
            <Link href="/contact" style={{ color: "var(--mint)", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", opacity: 0.65 }}>
              {tr.ctaContact}
            </Link>
          </div>
        </div>
      </section>

      {/* ── LOCATION ── */}
      <section className="bg-[var(--white)] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="reveal-left" style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 16px 64px rgba(46,168,42,0.12)", aspectRatio: "4/3" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.8!2d2.3915!3d6.3645!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x102355b28a37a4cb%3A0x0!2sGb%C3%A9djrom%C3%A9d%C3%A9%2C+Cotonou!5e0!3m2!1sen!2sbj!4v1714825200000"
              width="100%" height="100%" style={{ border: 0, display: "block" }} allowFullScreen loading="lazy" title="Cedar Training Center Map"
            />
          </div>
          <div className="reveal-right">
            <p style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 18 }}>
              <span style={{ width: 24, height: 2.5, background: "var(--green)", borderRadius: 2 }} />{tr.findUs}
            </p>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(2.4rem, 4vw, 4.2rem)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.035em", color: "var(--green-deep)", marginBottom: 28 }}>
              {tr.locT1} <span style={{ color: "var(--green)" }}>{tr.locA}</span><br />{tr.locT2}
            </h2>
            {[
              { icon: "📍", h: "Address", p: "Gbédjromédé, street before Nagueze school, coming from Carrefour 16 ampoules, Ola Fitness buildings, Auto tours entrance." },
              { icon: "📞", h: "Phone & WhatsApp", p: "+229 97 00 00 00", href: "tel:+22997000000" },
              { icon: "✉️", h: "Email", p: "contact@cedartrainingcenter.com", href: "mailto:contact@cedartrainingcenter.com" },
              { icon: "🕐", h: "Hours", p: "Monday – Saturday · 8:00 am – 7:00 pm" },
            ].map(({ icon, h, p, href }) => (
              <div key={h} style={{ display: "flex", gap: 16, padding: "20px 0", borderBottom: "1.5px solid var(--mint-deep)" }}>
                <div style={{ width: 42, height: 42, flexShrink: 0, background: "rgba(46,168,42,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>{icon}</div>
                <div>
                  <h4 style={{ fontFamily: "var(--font-syne)", fontSize: "0.85rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 4 }}>{h}</h4>
                  {href ? <a href={href} style={{ fontSize: "0.875rem", color: "var(--green)", textDecoration: "none", fontWeight: 600 }}>{p}</a>
                        : <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{p}</p>}
                </div>
              </div>
            ))}
            <Link href="/contact" style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 10, background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.95rem", padding: "16px 32px", borderRadius: 12, textDecoration: "none", boxShadow: "0 8px 32px rgba(46,168,42,0.35)" }}>
              {tr.contactUs} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
