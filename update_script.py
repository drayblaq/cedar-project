import re

with open("components/marketing/HomePage.tsx", "r") as f:
    content = f.read()

# 1. Update colors to make text bold and not gray
content = content.replace('color: "var(--text-muted)"', 'color: "var(--text)", fontWeight: 600')
content = content.replace('color: "rgba(255,255,255,0.6)"', 'color: "white", fontWeight: 600')
content = content.replace('color: "rgba(255,255,255,0.75)"', 'color: "white", fontWeight: 600')

# 2. Update icons from emojis to SVGs
icons_original = '{[{ icon: "🎯", t: tr.v1t, p: tr.v1p }, { icon: "🌍", t: tr.v2t, p: tr.v2p }, { icon: "💬", t: tr.v3t, p: tr.v3p }].map(({ icon, t: vt, p }) => ('
icons_new = """{[
                { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>, t: tr.v1t, p: tr.v1p },
                { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>, t: tr.v2t, p: tr.v2p },
                { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, t: tr.v3t, p: tr.v3p }
              ].map(({ icon, t: vt, p }) => ("""
content = content.replace(icons_original, icons_new)

# 3. Update translations
en_programs_old = """    p1t: "General English", p1p: "Build core skills across reading, writing, speaking and listening — from Beginner to Advanced.", p1tag: "A1 → C2", p1lv: "All levels",
    p2t: "Business English", p2p: "Master professional communication for meetings, emails, presentations and negotiations.", p2tag: "Intermediate → Advanced", p2lv: "Professional",
    p3t: "IELTS · TOEFL · TOEIC", p3p: "Targeted preparation with proven strategies, practice tests and expert feedback.", p3tag: "All certifications", p3lv: "Exam Prep",
    p4t: "Personalized & Intensive", p4p: "Fast-track programs built around your goals, timeline and schedule.", p4tag: "Custom track", p4lv: "Intensive",
    ctaCardT: "Find your perfect program →", ctaCardP: "Take our placement test and start at the exact right level for you.", ctaCardBtn: "Apply Now →","""

en_programs_new = """    p1t: "General English", p1p: "Build core skills across reading, writing, speaking and listening — from Beginner to Advanced.", p1tag: "A1 → C2", p1lv: "All levels",
    p2t: "Business English", p2p: "Master professional communication for meetings, emails, presentations and negotiations.", p2tag: "Intermediate → Advanced", p2lv: "Professional",
    p3t: "International Test Preparation (TOEIC, TOEFL, IELTS, etc.)", p3p: "Targeted preparation with proven strategies, practice tests and expert feedback.", p3tag: "All certifications", p3lv: "Exam Prep",
    p4t: "Communication and Conversation Workshops", p4p: "Interactive sessions focused on improving speaking fluency and active listening.", p4tag: "Speaking", p4lv: "Workshops",
    p5t: "Personalized Courses and Intensive Programs", p5p: "Fast-track programs built around your goals, timeline and schedule.", p5tag: "Custom track", p5lv: "Intensive",
    ctaCardT: "Pricing & Registration", ctaCardP: "Take our placement test and start at the exact right level for you.", ctaCardBtn: "Apply Now →",
    priceMonthly: "50,000 CFA", priceMonthlySub: "per month",
    priceSemi: "250,000 CFA", priceSemiSub: "for 6 months",
"""
content = content.replace(en_programs_old, en_programs_new)

fr_programs_old = """    p1t: "Anglais général", p1p: "Développez les 4 compétences : lecture, écriture, expression et compréhension orale.", p1tag: "A1 → C2", p1lv: "Tous niveaux",
    p2t: "Anglais des affaires", p2p: "Maîtrisez la communication professionnelle pour réunions, e-mails et présentations.", p2tag: "Intermédiaire → Avancé", p2lv: "Professionnel",
    p3t: "IELTS · TOEFL · TOEIC", p3p: "Préparation ciblée avec stratégies éprouvées, tests blancs et feedback d'experts.", p3tag: "Toutes certifications", p3lv: "Certification",
    p4t: "Personnalisé & Intensif", p4p: "Programme sur mesure selon vos objectifs, votre rythme et vos disponibilités.", p4tag: "Parcours personnalisé", p4lv: "Intensif",
    ctaCardT: "Trouvez votre programme →", ctaCardP: "Passez notre test de niveau et commencez exactement là où il faut.", ctaCardBtn: "Candidater →","""

fr_programs_new = """    p1t: "Anglais général", p1p: "Développez les 4 compétences : lecture, écriture, expression et compréhension orale.", p1tag: "A1 → C2", p1lv: "Tous niveaux",
    p2t: "Anglais professionnel (Business English)", p2p: "Maîtrisez la communication professionnelle pour réunions, e-mails et présentations.", p2tag: "Intermédiaire → Avancé", p2lv: "Professionnel",
    p3t: "Préparation aux tests internationaux (TOEIC, TOEFL, IELTS, etc.)", p3p: "Préparation ciblée avec stratégies éprouvées et tests blancs.", p3tag: "Toutes certifications", p3lv: "Certification",
    p4t: "Ateliers de communication et de conversation", p4p: "Sessions interactives pour améliorer la fluidité et la compréhension orale en situation réelle.", p4tag: "Oral", p4lv: "Ateliers",
    p5t: "Cours personnalisés et programmes intensifs", p5p: "Programme sur mesure selon vos objectifs, votre rythme et vos disponibilités.", p5tag: "Parcours personnalisé", p5lv: "Intensif",
    ctaCardT: "Tarifs & Inscription", ctaCardP: "Passez notre test de niveau et rejoignez le programme idéal pour vous.", ctaCardBtn: "Candidater →",
    priceMonthly: "50 000 CFA", priceMonthlySub: "par mois",
    priceSemi: "250 000 CFA", priceSemiSub: "pour 6 mois",
"""
content = content.replace(fr_programs_old, fr_programs_new)

# 4. Update programs array
programs_old = """  const programs = [
    { img: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=85&fit=crop&crop=faces", lv: tr.p1lv, t: tr.p1t, p: tr.p1p, tag: tr.p1tag },
    { img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=85&fit=crop", lv: tr.p2lv, t: tr.p2t, p: tr.p2p, tag: tr.p2tag },
    { img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=85&fit=crop&crop=faces", lv: tr.p3lv, t: tr.p3t, p: tr.p3p, tag: tr.p3tag },
    { img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=85&fit=crop&crop=faces", lv: tr.p4lv, t: tr.p4t, p: tr.p4p, tag: tr.p4tag },
  ];"""

programs_new = """  const programs = [
    { img: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=85&fit=crop&crop=faces", lv: tr.p1lv, t: tr.p1t, p: tr.p1p, tag: tr.p1tag },
    { img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=85&fit=crop", lv: tr.p2lv, t: tr.p2t, p: tr.p2p, tag: tr.p2tag },
    { img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=85&fit=crop&crop=faces", lv: tr.p3lv, t: tr.p3t, p: tr.p3p, tag: tr.p3tag },
    { img: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=600&q=85&fit=crop", lv: tr.p4lv, t: tr.p4t, p: tr.p4p, tag: tr.p4tag },
    { img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=85&fit=crop&crop=faces", lv: tr.p5lv, t: tr.p5t, p: tr.p5p, tag: tr.p5tag },
  ];"""
content = content.replace(programs_old, programs_new)

# 5. Update CTA/Pricing Card
cta_old = """            {/* CTA card spanning 2 cols */}
            <div className="program-card col-span-1 flex flex-col items-start justify-center rounded-[20px] border-none bg-[var(--green)] p-8 sm:col-span-2 sm:p-10">
              <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.7rem", fontWeight: 800, color: "white", marginBottom: 14, lineHeight: 1.1 }}>{tr.ctaCardT}</h3>
              <p style={{ fontSize: "0.9rem", color: "white", fontWeight: 600, lineHeight: 1.65, marginBottom: 28 }}>{tr.ctaCardP}</p>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "white", color: "var(--green-dark)", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.9rem", padding: "14px 26px", borderRadius: 10, textDecoration: "none" }}>
                {tr.ctaCardBtn}
              </Link>
            </div>"""

cta_new = """            {/* Pricing / CTA card */}
            <div className="program-card col-span-1 flex flex-col items-start justify-center rounded-[20px] border-none bg-[var(--green)] p-8 sm:col-span-2 xl:col-span-1">
              <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: 14, lineHeight: 1.1 }}>{tr.ctaCardT}</h3>
              
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px", width: "100%", marginBottom: "16px" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", fontFamily: "var(--font-syne)" }}>{tr.priceMonthly}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.9)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{tr.priceMonthlySub}</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px", width: "100%", marginBottom: "24px" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", fontFamily: "var(--font-syne)" }}>{tr.priceSemi}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.9)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{tr.priceSemiSub}</div>
              </div>

              <Link href="/register" style={{ display: "inline-flex", width: "100%", justifyContent: "center", alignItems: "center", gap: 10, background: "white", color: "var(--green-dark)", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.9rem", padding: "14px 26px", borderRadius: 10, textDecoration: "none" }}>
                {tr.ctaCardBtn}
              </Link>
            </div>"""
content = content.replace(cta_old, cta_new)

with open("components/marketing/HomePage.tsx", "w") as f:
    f.write(content)

print("Updated successfully")
