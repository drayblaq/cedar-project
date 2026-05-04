import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cedar Training Center — English in Cotonou",
  description: "English language training in Cotonou, Bénin.",
};

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section
        style={{
          minHeight: "100vh",
          paddingTop: 76,
          background: "var(--mint)",
          position: "relative",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        {/* Oversized BG word */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", left: "-2%", bottom: "-5%",
            fontFamily: "var(--font-syne)", fontWeight: 800,
            fontSize: "clamp(8rem, 18vw, 22rem)",
            color: "transparent",
            WebkitTextStroke: "2px rgba(46,168,42,0.12)",
            lineHeight: 0.85, letterSpacing: "-0.04em",
            userSelect: "none", pointerEvents: "none", zIndex: 0,
            whiteSpace: "nowrap",
          }}
        >
          APPRENDRE<br />L'ANGLAIS
        </div>

        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 60px 80px 80px", position: "relative", zIndex: 2 }}>
          <p style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 24 }}>
            <span style={{ display: "block", width: 28, height: 2.5, background: "var(--green)", borderRadius: 2 }} />
            English Training · Cotonou, Bénin 🇧🇯
          </p>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(3.2rem,5.5vw,6.5rem)", fontWeight: 800, lineHeight: 0.92, letterSpacing: "-0.04em", color: "var(--green-deep)" }}>
            <span style={{ color: "transparent", WebkitTextStroke: "3px var(--green)" }}>Learn</span><br />
            English<br />
            <span style={{ color: "var(--green)" }}>with Cedar</span>
          </h1>
          <p style={{ marginTop: 28, fontSize: "1.1rem", lineHeight: 1.7, color: "var(--text-muted)", maxWidth: 420 }}>
            We support every learner in acquiring English for studies, career and international success. Based in Cotonou — serving all of Bénin.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 44, flexWrap: "wrap" }}>
            <a href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.95rem", padding: "16px 32px", borderRadius: 12, textDecoration: "none", boxShadow: "0 8px 32px rgba(46,168,42,0.35)" }}>
              Apply Now →
            </a>
            <a href="/courses" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--green-dark)", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", padding: "16px 24px", borderRadius: 12, border: "2px solid rgba(46,168,42,0.3)" }}>
              Explore Programs
            </a>
          </div>
          <div style={{ display: "flex", gap: 40, marginTop: 56, paddingTop: 36, borderTop: "1.5px solid rgba(46,168,42,0.18)" }}>
            {[["500+", "Students trained"], ["7", "English levels"], ["5", "Programs"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "var(--font-syne)", fontSize: "2.4rem", fontWeight: 800, color: "var(--green-deep)", lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right photo */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=85&fit=crop&crop=faces" alt="Students learning English" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 600 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, var(--mint) 0%, transparent 20%, transparent 80%, var(--mint) 100%)" }} />
          <div style={{ position: "absolute", top: 30, right: 30, zIndex: 5, background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.78rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "10px 18px", borderRadius: 50, boxShadow: "0 8px 24px rgba(46,168,42,0.4)" }}>
            IELTS · TOEFL · TOEIC
          </div>
          <div style={{ position: "absolute", bottom: 40, right: 40, zIndex: 5, background: "white", borderRadius: 12, padding: "12px 20px", border: "2px solid var(--mint-deep)", boxShadow: "0 8px 32px rgba(46,168,42,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-syne)", fontSize: "1.6rem", fontWeight: 800, color: "var(--green)" }}>98%</span>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: "0.72rem", fontWeight: 700, color: "var(--green-dark)", lineHeight: 1.3 }}>Student<br />Satisfaction</div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div style={{ background: "var(--green-deep)", overflow: "hidden", padding: "15px 0" }}>
        <div className="animate-marquee" style={{ display: "flex", whiteSpace: "nowrap" }}>
          {["General English","Business English","IELTS Preparation","TOEFL Training","TOEIC Prep","Intensive Programs","Placement Testing","Cotonou, Bénin 🇧🇯",
            "General English","Business English","IELTS Preparation","TOEFL Training","TOEIC Prep","Intensive Programs","Placement Testing","Cotonou, Bénin 🇧🇯"].map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 16, fontFamily: "var(--font-syne)", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mint)", padding: "0 40px" }}>
              {item}<span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
            </span>
          ))}
        </div>
      </div>

      {/* About mini */}
      <section style={{ background: "var(--white)", padding: "120px 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div style={{ position: "relative", height: 580 }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "65%", height: "76%", borderRadius: 24, overflow: "hidden", boxShadow: "0 32px 80px rgba(46,168,42,0.15)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700&q=85&fit=crop&crop=faces" alt="Students learning" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: "54%", height: "56%", borderRadius: 24, overflow: "hidden", border: "5px solid var(--white)", boxShadow: "0 20px 60px rgba(46,168,42,0.18)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=500&q=85&fit=crop" alt="Student studying" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ position: "absolute", bottom: "28%", left: "52%", transform: "translateX(-50%)", background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "2.2rem", width: 88, height: 88, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "5px solid var(--white)", lineHeight: 1, zIndex: 3, boxShadow: "0 8px 32px rgba(46,168,42,0.35)" }}>
              5+<span style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Years</span>
            </div>
          </div>
          <div>
            <p style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 18 }}>
              <span style={{ width: 24, height: 2.5, background: "var(--green)", borderRadius: 2 }} />Who We Are
            </p>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(2.4rem,4vw,4.2rem)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.035em", color: "var(--green-deep)" }}>
              A center <span style={{ color: "var(--green)" }}>dedicated</span><br />to your success
            </h2>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.78, color: "var(--text-muted)", marginTop: 18, marginBottom: 32 }}>
              Cedar Training Center helps learners develop English language skills for studies, career growth and integration in international contexts. Based in Gbédjromédé, Cotonou.
            </p>
            {[
              { icon: "🎯", t: "Mission-driven", p: "High-quality English training that helps learners communicate with confidence and efficiency." },
              { icon: "🌍", t: "International focus", p: "Become a reference center recognized for excellence, innovation and impact across West Africa." },
              { icon: "💬", t: "Real-world methodology", p: "Dynamic courses, real-life scenarios, intensive speaking practice and individual support." },
            ].map(({ icon, t, p }) => (
              <div key={t} style={{ display: "flex", gap: 18, alignItems: "flex-start", background: "var(--mint)", border: "1.5px solid var(--mint-deep)", borderRadius: 16, padding: "18px 22px", marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, flexShrink: 0, background: "rgba(46,168,42,0.12)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>{icon}</div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 4 }}>{t}</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{p}</p>
                </div>
              </div>
            ))}
            <a href="/about" style={{ marginTop: 36, display: "inline-flex", alignItems: "center", gap: 10, background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.95rem", padding: "16px 32px", borderRadius: 12, textDecoration: "none", boxShadow: "0 8px 32px rgba(46,168,42,0.35)" }}>
              Our story →
            </a>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: "var(--green-deep)", position: "relative", overflow: "hidden", padding: "120px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 60, alignItems: "center", maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(2.6rem,4.5vw,5rem)", fontWeight: 800, color: "white", lineHeight: 1.0, letterSpacing: "-0.04em" }}>
            Start your journey<br /><span style={{ color: "var(--green)" }}>in English.</span><br /><span style={{ opacity: 0.4 }}>Today.</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start", flexShrink: 0 }}>
            <a href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1rem", padding: "18px 40px", borderRadius: 12, textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 8px 32px rgba(46,168,42,0.35)" }}>
              Apply Now →
            </a>
            <a href="/contact" style={{ color: "var(--mint)", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", opacity: 0.65 }}>
              Have questions? Contact us →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
