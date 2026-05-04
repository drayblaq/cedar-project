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
      <div className="relative overflow-hidden border-b-2 border-[var(--mint-deep)] bg-[var(--mint)] px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-12 lg:pb-20 lg:pt-36 xl:px-20">
        <div aria-hidden="true" style={{ position: "absolute", right: "-2%", bottom: "-15%", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(6rem,12vw,16rem)", color: "transparent", WebkitTextStroke: "2px rgba(46,168,42,0.1)", lineHeight: 0.85, letterSpacing: "-0.04em", userSelect: "none", pointerEvents: "none" }}>PROGRAMS</div>
        <div className="relative z-[2] mx-auto max-w-6xl">
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
      <div className="bg-[var(--white)] px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:gap-10">
          {programs.map(({ img, level, title, desc, reverse }) => (
            <div
              key={title}
              className={`grid grid-cols-1 overflow-hidden rounded-3xl border-[1.5px] border-[var(--mint-deep)] shadow-[0_8px_40px_rgba(46,168,42,0.1)] md:gap-0 ${reverse ? "md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" : "md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={title}
                className={`order-1 block h-52 w-full object-cover sm:h-64 md:h-full md:min-h-[260px] ${reverse ? "md:order-2" : "md:order-1"}`}
              />
              <div
                className={`order-2 bg-[var(--white)] p-6 sm:p-8 md:p-10 ${reverse ? "md:order-1" : "md:order-2"}`}
              >
                <span
                  className="inline-block rounded-lg px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wide text-[var(--green-dark)]"
                  style={{ background: "rgba(46,168,42,0.1)", fontFamily: "var(--font-syne)" }}
                >
                  {level}
                </span>
                <h3 className="mt-4 text-xl font-extrabold leading-tight text-[var(--green-deep)] sm:text-2xl lg:text-[2rem]" style={{ fontFamily: "var(--font-syne)" }}>
                  {title}
                </h3>
                <p className="mb-6 mt-3 text-[0.95rem] leading-relaxed text-[var(--text-muted)]">{desc}</p>
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--green)] px-5 py-3 text-sm font-bold text-white no-underline"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  Enroll →
                </a>
              </div>
            </div>
          ))}

          {/* Levels */}
          <div className="mt-4 rounded-[28px] bg-[var(--green-deep)] px-5 py-10 sm:px-8 sm:py-12 lg:p-12">
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
