"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

type Lang = "en" | "fr";

const t = {
  en: {
    eyebrow: "English Training · Cotonou, Bénin",
    title1: "Learn English at", title3: "CTC",
    sub: "Supporting every learner in acquiring English to succeed in their studies, career and international environment.",
    apply: "Apply Now", explore: "Explore Programs",
    whoWeAre: "Who We Are",
    aboutT: "A centre", aboutA: "dedicated", aboutT2: "to your success",
    aboutLead: "Cedar Training Center is dedicated to English language teaching. We help learners develop their language skills to succeed in their studies, career and integration in an international environment.",
    v1t: "Mission", v1p: "Offer quality English training that allows learners to communicate with confidence and effectiveness in professional and academic environments.",
    v2t: "Vision", v2p: "Become a reference centre in language training, recognized for excellence, innovation and impact.",
    v3t: "Our methodology", v3p: "Dynamic courses, real-life scenarios, intensive speaking practice and individual support to guarantee measurable progress at every level.",
    ourStory: "Our story",
    whatWeOffer: "What We Offer",
    progT: "Programs built for", progA: "real results",
    p1t: "General English", p1p: "Build core skills across reading, writing, speaking and listening — from Beginner to Advanced.", p1tag: "A1 → C2", p1lv: "All levels",
    p2t: "Business English", p2p: "Master professional communication for meetings, emails, presentations and negotiations.", p2tag: "Intermediate → Advanced", p2lv: "Professional",
    p3t: "International test preparation: TOEIC, TOEFL, IELTS", p3p: "Targeted preparation with proven strategies, practice tests and expert feedback.", p3tag: "All certifications", p3lv: "Exam Prep",
    p4t: "Communication and conversation workshops", p4p: "Interactive sessions focused on improving speaking fluency and active listening.", p4tag: "Speaking", p4lv: "Workshops",
    p5t: "Personalised courses and intensive programs", p5p: "Fast-track programs built around your goals, timeline and schedule.", p5tag: "Custom track", p5lv: "Intensive",
    ctaCardT: "Pricing & Registration", ctaCardP: "Take our placement test and start at the exact right level for you.", ctaCardBtn: "Apply Now →",
    priceMonthly: "50,000 CFA", priceMonthlySub: "per month",
    priceSemi: "250,000 CFA", priceSemiSub: "for 6 months",
    whyCedar: "Why Cedar?", whyT: "The training centre", whyA: "built for you",
    whySub: "Every element of our program is designed to help you speak, write and think in English with confidence.",
    f1t: "Qualified and experienced trainers", f1p: "Our instructors bring international expertise and in-depth knowledge of learner needs.",
    f2t: "Interactive, learner-centred method", f2p: "Lessons built around real communication — not just theory.",
    f3t: "Flexible schedules adapted to your needs", f3p: "Morning, afternoon and evening classes to fit work and school.",
    f4t: "Personalised support and modern resources", f4p: "Individual coaching, practice materials and ongoing feedback to track your progress.",
    ctaL1: "Start your journey", ctaL2: "in English.", ctaL3: "Today.",
    ctaApply: "Apply Now →", ctaContact: "Have questions? Contact us →",
    findUs: "Find Us", locT1: "We are in", locA: "Cotonou,", locT2: "Bénin",
    contactUs: "Contact us",
    address: "Gbédjromédé, Rue avant l'école Nagueze en venant du carrefour 16 ampoules, Immeubles Ola Fitness, Entrée Auto tours.",
    phone: "+229 01 96 19 64 40",
    email: "trainingcentercedar@gmail.com",
    addressLabel: "Address", phoneLabel: "Phone & WhatsApp", emailLabel: "Email",
  },
  fr: {
    eyebrow: "Formation en anglais · Cotonou, Bénin",
    title1: "Apprendre l'anglais", title3: " au CTC",
    sub: "Accompagner chaque apprenant dans l'acquisition de l'anglais afin de favoriser son intégration et sa réussite dans un environnement international.",
    apply: "Candidater", explore: "Voir les programmes",
    whoWeAre: "Qui sommes-nous",
    aboutT: "Un centre", aboutA: "dédié", aboutT2: "à votre réussite",
    aboutLead: "Le Centre de Formation est dédié à l'enseignement de l'anglais. Nous accompagnons les apprenants à développer leurs compétences linguistiques pour réussir leurs études, leur carrière et leur intégration dans un environnement international.",
    v1t: "Mission", v1p: "Offrir une formation en anglais de qualité qui permet aux apprenants de communiquer avec confiance et efficacité.",
    v2t: "Vision", v2p: "Devenir un centre de référence en formation linguistique, reconnu pour son excellence, son innovation et son impact.",
    v3t: "Notre méthodologie", v3p: "Cours dynamiques, mises en situation réelles, pratique orale intensive et accompagnement individuel pour garantir des progrès mesurables.",
    ourStory: "Notre histoire",
    whatWeOffer: "Nos offres",
    progT: "Des programmes pour", progA: "des résultats concrets",
    p1t: "Anglais général", p1p: "Développez les 4 compétences : lecture, écriture, expression et compréhension orale.", p1tag: "A1 → C2", p1lv: "Tous niveaux",
    p2t: "Anglais professionnel (Business English)", p2p: "Maîtrisez la communication professionnelle pour réunions, e-mails et présentations.", p2tag: "Intermédiaire → Avancé", p2lv: "Professionnel",
    p3t: "Préparation aux tests internationaux : TOEIC, TOEFL, IELTS", p3p: "Préparation ciblée avec stratégies éprouvées et tests blancs.", p3tag: "Toutes certifications", p3lv: "Certification",
    p4t: "Ateliers de communication et de conversation", p4p: "Sessions interactives pour améliorer la fluidité et la compréhension orale.", p4tag: "Oral", p4lv: "Ateliers",
    p5t: "Cours personnalisés et programmes intensifs", p5p: "Programme sur mesure selon vos objectifs, votre rythme et vos disponibilités.", p5tag: "Parcours personnalisé", p5lv: "Intensif",
    ctaCardT: "Tarifs & Inscription", ctaCardP: "Passez notre test de niveau et rejoignez le programme idéal pour vous.", ctaCardBtn: "Candidater →",
    priceMonthly: "50 000 CFA", priceMonthlySub: "par mois",
    priceSemi: "250 000 CFA", priceSemiSub: "pour 6 mois",
    whyCedar: "Pourquoi Cedar ?", whyT: "Le centre de formation", whyA: "fait pour vous",
    whySub: "Chaque élément de notre programme est conçu pour vous aider à parler, écrire et penser en anglais avec confiance.",
    f1t: "Formateurs qualifiés et expérimentés", f1p: "Nos formateurs apportent une expertise internationale et une connaissance approfondie des besoins des apprenants.",
    f2t: "Méthode interactive et centrée sur l'apprenant", f2p: "Des cours axés sur la communication réelle — pas seulement la théorie.",
    f3t: "Horaires flexibles et adaptés aux besoins", f3p: "Cours matin, après-midi et soir pour s'adapter à votre emploi du temps.",
    f4t: "Suivi personnalisé et ressources modernes", f4p: "Coaching individuel, supports pédagogiques et retours réguliers pour suivre vos progrès.",
    ctaL1: "Commencez votre parcours", ctaL2: "en anglais.", ctaL3: "Aujourd'hui.",
    ctaApply: "Candidater →", ctaContact: "Des questions ? Contactez-nous →",
    findUs: "Nous trouver", locT1: "Nous sommes à", locA: "Cotonou,", locT2: "Bénin",
    contactUs: "Nous contacter",
    address: "Gbédjromédé, Rue avant l'école Nagueze, Immeubles Ola Fitness, Entrée Auto tours, Cotonou, Bénin.",
    phone: "+229 01 96 19 64 40",
    email: "trainingcentercedar@gmail.com",
    addressLabel: "Adresse", phoneLabel: "Téléphone & WhatsApp", emailLabel: "Email",
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

function PinIcon() { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx={12} cy={10} r={3}/></svg>; }
function PhoneIcon() { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg>; }
function MailIcon() { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/></svg>; }

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
    "Cotonou, Bénin",
  ];

  const programs = [
    { img: "/college-students-studying-in-library-computer-lab.webp", lv: tr.p1lv, t: tr.p1t, p: tr.p1p, tag: tr.p1tag },
    { img: "/young-black-man-writing-in-notebook.webp", lv: tr.p2lv, t: tr.p2t, p: tr.p2p, tag: tr.p2tag },
    { img: "/student-writing-in-notebook-while-sitting-with-tablet-pc-in-college-library.webp", lv: tr.p3lv, t: tr.p3t, p: tr.p3p, tag: tr.p3tag },
    { img: "/shot-of-a-teacher-assisting-a-struggling-student-with-schoolwork-in-a-classroom.webp", lv: tr.p4lv, t: tr.p4t, p: tr.p4p, tag: tr.p4tag },
    { img: "/black-ethnicity-student-writing-while-studying-in-classroom.webp", lv: tr.p5lv, t: tr.p5t, p: tr.p5p, tag: tr.p5tag },
  ];

  const contactItems = [
    { Icon: PinIcon,   h: tr.addressLabel, p: tr.address },
    { Icon: PhoneIcon, h: tr.phoneLabel,   p: tr.phone,  href: "tel:+22901961964 40" },
    { Icon: MailIcon,  h: tr.emailLabel,   p: tr.email,  href: `mailto:${tr.email}` },
  ];

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative grid min-h-0 grid-cols-1 overflow-hidden bg-[var(--mint)] pt-[72px] sm:pt-[76px] lg:min-h-screen lg:grid-cols-2">
        <div aria-hidden="true" className="hero-bg-word hidden sm:block">CEDAR</div>
        <div className="relative z-[2] flex flex-col justify-center px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-20 xl:pl-20">
          <p className="animate-slide-up delay-100" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 24 }}>
            {tr.eyebrow}
          </p>
          <h1 className="animate-slide-up delay-200" style={{ fontFamily: "var(--font-inter)", fontSize: "clamp(2.4rem, 4vw, 3.75rem)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.01em", color: "var(--green-deep)" }}>
            <span style={{ color: "var(--green-deep)" }}>{tr.title1}</span><br />
            <span style={{ color: "var(--green)" }}>{tr.title3}</span>
          </h1>
          <p className="animate-slide-up delay-300" style={{ marginTop: 24, fontSize: "1.1rem", lineHeight: 1.75, color: "#1a3a1a", fontWeight: 500, maxWidth: 440 }}>{tr.sub}</p>
          <div className="animate-slide-up delay-400" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <Link href="/register" className="w-full xs:w-auto" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, background: "var(--green)", color: "white", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "0.95rem", padding: "15px 28px", borderRadius: 12, textDecoration: "none", boxShadow: "0 8px 32px rgba(46,168,42,0.35)" }}>
              {tr.apply} →
            </Link>
            <Link href="/courses" className="w-full xs:w-auto" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--green-dark)", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", padding: "15px 22px", borderRadius: 12, border: "2px solid rgba(46,168,42,0.3)" }}>
              {tr.explore}
            </Link>
          </div>
        </div>
        {/* Hero right photo */}
        <div className="animate-slide-right delay-300r relative order-first min-h-[44vh] w-full overflow-hidden lg:order-none lg:min-h-0 lg:h-full">
          <Image src="/homepage.webp" alt="Students learning English at Cedar Training Center" fill style={{ objectFit: "cover" }} priority />
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to right, var(--mint) 0%, transparent 20%, transparent 80%, var(--mint) 100%)" }} />
          <div className="animate-float-pill absolute right-4 top-4 z-[5] rounded-full px-3 py-2 text-[0.65rem] font-extrabold uppercase tracking-wide text-white sm:right-8 sm:top-8 sm:px-[18px] sm:py-2.5 sm:text-[0.78rem]" style={{ background: "var(--green)", fontFamily: "var(--font-inter)", boxShadow: "0 8px 24px rgba(46,168,42,0.4)" }}>
            IELTS · TOEFL · TOEIC
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ background: "var(--green-deep)", overflow: "hidden", padding: "15px 0" }}>
        <div className="animate-marquee" style={{ display: "flex", whiteSpace: "nowrap" }}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 16, fontFamily: "var(--font-inter)", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mint)", padding: "0 40px" }}>
              {item}<span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
            </span>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="bg-[var(--white)] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="reveal-left relative mx-auto h-[260px] w-full max-w-lg sm:h-[380px] md:h-[440px] lg:mx-0 lg:h-[540px] lg:max-w-none">
            <div style={{ position: "absolute", top: 0, left: 0, width: "65%", height: "76%", borderRadius: 24, overflow: "hidden", boxShadow: "0 32px 80px rgba(46,168,42,0.15)" }}>
              <Image src="/happy-black-females-student-during-a-class-in-lecture-hall-looking-at-camera.webp" alt="Students learning at Cedar" fill style={{ objectFit: "cover" }} />
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: "54%", height: "56%", borderRadius: 24, overflow: "hidden", border: "5px solid var(--white)", boxShadow: "0 20px 60px rgba(46,168,42,0.18)" }}>
              <Image src="/confident-male-high-school-student-smiles-during-class.webp" alt="Classroom at Cedar Training Center" fill style={{ objectFit: "cover" }} />
            </div>
          </div>
          <div className="reveal-right">
            <p style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 18 }}>
              {tr.whoWeAre}
            </p>
            <h2 style={{ fontFamily: "var(--font-inter)", fontSize: "clamp(2.4rem, 4vw, 4.2rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--green-deep)" }}>
              {tr.aboutT} <span style={{ color: "var(--green)" }}>{tr.aboutA}</span><br />{tr.aboutT2}
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: 1.78, color: "#1f2d1e", fontWeight: 500, marginTop: 18, marginBottom: 32 }}>{tr.aboutLead}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>, t: tr.v1t, p: tr.v1p },
                { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>, t: tr.v2t, p: tr.v2p },
                { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, t: tr.v3t, p: tr.v3p }
              ].map(({ icon, t: vt, p }) => (
                <div key={vt} className="value-card" style={{ display: "flex", gap: 18, alignItems: "flex-start", background: "var(--mint)", border: "1.5px solid var(--mint-deep)", borderRadius: 16, padding: "18px 22px" }}>
                  <div style={{ width: 44, height: 44, flexShrink: 0, background: "rgba(46,168,42,0.12)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>{icon}</div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 4 }}>{vt}</h3>
                    <p style={{ fontSize: "0.875rem", color: "#1f2d1e", fontWeight: 500, lineHeight: 1.65 }}>{p}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/about" style={{ marginTop: 36, display: "inline-flex", alignItems: "center", gap: 10, background: "var(--green)", color: "white", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "0.95rem", padding: "16px 32px", borderRadius: 12, textDecoration: "none", boxShadow: "0 8px 32px rgba(46,168,42,0.35)" }}>
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
              {tr.whatWeOffer}
            </p>
            <h2 style={{ fontFamily: "var(--font-inter)", fontSize: "clamp(2rem, 3.5vw, 3.2rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.01em", color: "white" }}>
              {tr.progT}<br /><span style={{ color: "var(--green)" }}>{tr.progA}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {programs.map((prog, i) => (
              <div key={i} className="program-card overflow-hidden rounded-[20px] border-[1.5px] border-white/10 bg-white/[0.06]">
                <div className="relative h-48 overflow-hidden sm:h-52 md:h-[220px]">
                  <Image src={prog.img} alt={prog.t} fill style={{ objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(15,74,13,0.7) 100%)" }} />
                  <span style={{ position: "absolute", top: 14, right: 14, background: "var(--green)", color: "white", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "0.7rem", padding: "5px 12px", borderRadius: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>{prog.lv}</span>
                </div>
                <div style={{ padding: 26 }}>
                  <h3 style={{ fontFamily: "var(--font-inter)", fontSize: "1.2rem", fontWeight: 800, color: "white", marginBottom: 10, lineHeight: 1.2 }}>{prog.t}</h3>
                  <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", fontWeight: 500, lineHeight: 1.65, marginBottom: 18 }}>{prog.p}</p>
                  <span style={{ display: "inline-block", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", padding: "5px 12px", borderRadius: 8, textTransform: "uppercase", background: "rgba(46,168,42,0.2)", color: "var(--mint-deep)" }}>{prog.tag}</span>
                </div>
              </div>
            ))}
            {/* Pricing / CTA card */}
            <div className="program-card col-span-1 flex flex-col items-start justify-center rounded-[20px] border-none bg-[var(--green)] p-8 sm:col-span-2 xl:col-span-1">
              <h3 style={{ fontFamily: "var(--font-inter)", fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: 14, lineHeight: 1.1 }}>{tr.ctaCardT}</h3>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px", width: "100%", marginBottom: "16px" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", fontFamily: "var(--font-inter)" }}>{tr.priceMonthly}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.9)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{tr.priceMonthlySub}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px", width: "100%", marginBottom: "24px" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", fontFamily: "var(--font-inter)" }}>{tr.priceSemi}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.9)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{tr.priceSemiSub}</div>
              </div>
              <Link href="/register" style={{ display: "inline-flex", width: "100%", justifyContent: "center", alignItems: "center", gap: 10, background: "white", color: "var(--green-dark)", fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "0.9rem", padding: "14px 26px", borderRadius: 10, textDecoration: "none" }}>
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
            <p className="reveal" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 18 }}>
              {tr.whyCedar}
            </p>
            <h2 className="reveal td-1" style={{ fontFamily: "var(--font-inter)", fontSize: "clamp(2.4rem, 4vw, 4.2rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--green-deep)" }}>
              {tr.whyT}<br /><span style={{ color: "var(--green)" }}>{tr.whyA}</span>
            </h2>
            <p className="reveal td-2" style={{ marginTop: 18, fontSize: "1rem", color: "#1f2d1e", fontWeight: 500, lineHeight: 1.8, maxWidth: 480 }}>{tr.whySub}</p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-10">
              {[{ n:"01",t:tr.f1t,p:tr.f1p},{n:"02",t:tr.f2t,p:tr.f2p},{n:"03",t:tr.f3t,p:tr.f3p},{n:"04",t:tr.f4t,p:tr.f4p}].map(({n,t:ft,p},i)=>(
                <div key={i} className={`why-feature reveal td-${i+1}`} style={{ background: "var(--white)", border: "1.5px solid var(--mint-deep)", borderRadius: 18, padding: 26, boxShadow: "0 4px 20px rgba(46,168,42,0.06)" }}>
                  <div style={{ fontFamily: "var(--font-inter)", fontSize: "2rem", fontWeight: 800, color: "var(--green)", opacity: 0.4, lineHeight: 1, marginBottom: 10 }}>{n}</div>
                  <h3 style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 6 }}>{ft}</h3>
                  <p style={{ fontSize: "0.875rem", color: "#1f2d1e", fontWeight: 500, lineHeight: 1.65 }}>{p}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal-right relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
              <Image src="/young-black-man-writing-in-notebook.webp" alt="Student at Cedar Training Center" fill style={{ objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="relative overflow-hidden bg-[var(--green-deep)] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div aria-hidden="true" className="cta-bg-word hidden md:block">APPLY</div>
        <div className="relative z-[2] mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-14">
          <h2 style={{ fontFamily: "var(--font-inter)", fontSize: "clamp(2rem, 3.5vw, 3.5rem)", fontWeight: 700, color: "white", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
            {tr.ctaL1}<br /><span style={{ color: "var(--green)" }}>{tr.ctaL2}</span><br /><span style={{ opacity: 0.4 }}>{tr.ctaL3}</span>
          </h2>
          <div className="flex w-full shrink-0 flex-col items-stretch gap-3 sm:items-start lg:w-auto lg:items-start">
            <Link href="/register" className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-center text-base font-bold text-white no-underline sm:w-auto sm:whitespace-nowrap" style={{ background: "var(--green)", fontFamily: "var(--font-inter)", boxShadow: "0 8px 32px rgba(46,168,42,0.35)" }}>
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
              {tr.findUs}
            </p>
            <h2 style={{ fontFamily: "var(--font-inter)", fontSize: "clamp(2.4rem, 4vw, 4.2rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--green-deep)", marginBottom: 28 }}>
              {tr.locT1} <span style={{ color: "var(--green)" }}>{tr.locA}</span><br />{tr.locT2}
            </h2>
            {contactItems.map(({ Icon, h, p, href }) => (
              <div key={h} style={{ display: "flex", gap: 16, padding: "20px 0", borderBottom: "1.5px solid var(--mint-deep)" }}>
                <div style={{ width: 42, height: 42, flexShrink: 0, background: "rgba(46,168,42,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}><Icon /></div>
                <div>
                  <h4 style={{ fontFamily: "var(--font-inter)", fontSize: "0.85rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 4 }}>{h}</h4>
                  {href
                    ? <a href={href} style={{ fontSize: "0.875rem", color: "var(--green)", textDecoration: "none", fontWeight: 600 }}>{p}</a>
                    : <p style={{ fontSize: "0.875rem", color: "var(--text)", fontWeight: 600, lineHeight: 1.65 }}>{p}</p>}
                </div>
              </div>
            ))}
            <Link href="/contact" style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 10, background: "var(--green)", color: "white", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "0.95rem", padding: "16px 32px", borderRadius: 12, textDecoration: "none", boxShadow: "0 8px 32px rgba(46,168,42,0.35)" }}>
              {tr.contactUs} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
