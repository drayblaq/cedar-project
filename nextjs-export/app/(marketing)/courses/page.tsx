import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programs | Cedar Training Center",
  description: "English programs at Cedar Training Center — General, Business, IELTS, TOEFL, TOEIC and intensive tracks.",
};

const programs = [
  {
    img: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=85&fit=crop&crop=faces",
    level: "All Levels", title: "General English",
    desc: "Build core English skills across reading, writing, speaking and listening. Progress from Beginner to Advanced with structured, communicative lessons.",
    reverse: false,
  },
  {
    img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=85&fit=crop",
    level: "Professional", title: "Business English",
    desc: "Master professional communication for meetings, emails, presentations and negotiations. Designed for working professionals and those seeking international careers.",
    reverse: true,
  },
  {
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=85&fit=crop&crop=faces",
    level: "Exam Prep", title: "IELTS · TOEFL · TOEIC",
    desc: "Targeted preparation for international certification exams with proven strategies, full practice tests and expert feedback to maximize your score.",
    reverse: false,
  },
  {
    img: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&q=85&fit=crop&crop=faces",
    level: "Intensive", title: "Personalized & Intensive",
    desc: "Custom fast-track programs built around your specific goals, timeline and availability. The fastest path from your current level to your target.",
    reverse: true,
  },
];

const levels = ["A1 Beginner", "A2 Elementary", "B1 Pre-Intermediate", "B2 Intermediate", "C1 Upper-Intermediate", "C2 Advanced"];

export default function CoursesPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ padding: "140px 80px 80px", background: "var(--mint)", position: "relative", overflow: "hidden", borderBottom: "2px solid var(--mint-deep)" }}>
        <div aria-hidden="true" style={{ position: "absolute", right: "-2%", bottom: "-15%", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(6rem,12vw,16rem)", color: "transparent", WebkitTextStroke: "2px rgba(46,168,42,0.1)", lineHeight: 0.85, letterSpacing: "-0.04em", userSelect: "none", pointerEvents: "none" }}>PROGRAMS</div>
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <p style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 18 }}>
            <span style={{ width: 24, height: 2.5, background: "var(--green)", borderRadius: 2 }} />Programs
          </p>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(2.8rem,5.5vw,6rem)", fontWeight: 800, lineHeight: 0.92, letterSpacing: "-0.04em", color: "var(--green-deep)", maxWidth: 700 }}>
            Training tracks<br /><em style={{ fontStyle: "normal", color: "var(--green)" }}>built for results</em>
          </h1>
          <p style={{ marginTop: 24, fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: 520, lineHeight: 1.78 }}>
            From total beginner to international certification — we have a program for every goal.
          </p>
        </div>
      </div>

      {/* Program rows */}
      <div style={{ background: "var(--white)", padding: "80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
          {programs.map(({ img, level, title, desc, reverse }) => (
            <div key={title} style={{ display: "grid", gridTemplateColumns: reverse ? "2fr 1fr" : "1fr 2fr", gap: 0, borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 40px rgba(46,168,42,0.1)", border: "1.5px solid var(--mint-deep)" }}>
              {reverse ? (
                <>
                  <div style={{ padding: 40, background: "var(--white)" }}>
                    <span style={{ background: "rgba(46,168,42,0.1)", color: "var(--green-dark)", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.7rem", padding: "5px 12px", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{level}</span>
                    <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "2rem", fontWeight: 800, color: "var(--green-deep)", margin: "16px 0 12px", lineHeight: 1.05 }}>{title}</h3>
                    <p style={{ color: "var(--text-muted)", lineHeight: 1.78, fontSize: "0.95rem", marginBottom: 24 }}>{desc}</p>
                    <a href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.875rem", padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>Enroll →</a>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={title} style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }} />
                </>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={title} style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "40px 40px 40px 40px", background: "var(--white)" }}>
                    <span style={{ background: "rgba(46,168,42,0.1)", color: "var(--green-dark)", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.7rem", padding: "5px 12px", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{level}</span>
                    <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "2rem", fontWeight: 800, color: "var(--green-deep)", margin: "16px 0 12px", lineHeight: 1.05 }}>{title}</h3>
                    <p style={{ color: "var(--text-muted)", lineHeight: 1.78, fontSize: "0.95rem", marginBottom: 24 }}>{desc}</p>
                    <a href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.875rem", padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>Enroll →</a>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Levels */}
          <div style={{ background: "var(--green-deep)", borderRadius: 28, padding: 52, marginTop: 12 }}>
            <p style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--mint)", marginBottom: 18 }}>
              <span style={{ width: 24, height: 2.5, background: "var(--green)", borderRadius: 2 }} />English Levels
            </p>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "2.4rem", fontWeight: 800, color: "white", letterSpacing: "-0.03em", marginBottom: 36 }}>
              Start at <span style={{ color: "var(--green)" }}>your level</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
              {levels.map((lv) => {
                const [code, name] = lv.split(" ");
                return (
                  <div key={lv} style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 20, textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-syne)", fontSize: "1.8rem", fontWeight: 800, color: "var(--green)" }}>{code}</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "white", marginTop: 6 }}>{name}</div>
                  </div>
                );
              })}
              <div style={{ background: "var(--green)", borderRadius: 16, padding: 20, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-syne)", fontSize: "1.1rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>CERT</div>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", marginTop: 6 }}>IELTS/TOEFL/TOEIC</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
