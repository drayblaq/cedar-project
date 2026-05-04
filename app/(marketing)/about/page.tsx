import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Cedar Training Center",
  description: "Learn about Cedar Training Center — English language training in Cotonou, Bénin.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden border-b-2 border-[var(--mint-deep)] bg-[var(--mint)] px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-12 lg:pb-20 lg:pt-36 xl:px-20">
        <div aria-hidden="true" style={{ position: "absolute", right: "-2%", bottom: "-15%", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(6rem,12vw,16rem)", color: "transparent", WebkitTextStroke: "2px rgba(46,168,42,0.1)", lineHeight: 0.85, letterSpacing: "-0.04em", userSelect: "none", pointerEvents: "none" }}>ABOUT</div>
        <div className="relative z-[2] mx-auto max-w-6xl">
          <p style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 18 }}>
            <span style={{ width: 24, height: 2.5, background: "var(--green)", borderRadius: 2 }} />About Us
          </p>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(2.8rem,5.5vw,6rem)", fontWeight: 800, lineHeight: 0.92, letterSpacing: "-0.04em", color: "var(--green-deep)", maxWidth: 680 }}>
            A center <em style={{ fontStyle: "normal", color: "var(--green)" }}>dedicated</em><br />to English learning
          </h1>
          <p style={{ marginTop: 24, fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: 520, lineHeight: 1.78 }}>
            Cedar Training Center helps learners develop language skills for studies, career growth and integration in international contexts.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="bg-[var(--white)] px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid grid-cols-1 gap-10 sm:mb-16 lg:mb-20 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700&q=85&fit=crop&crop=faces" alt="Teaching at Cedar" style={{ width: "100%", borderRadius: 24, objectFit: "cover", aspectRatio: "4/3", boxShadow: "0 20px 60px rgba(46,168,42,0.15)" }} />
            <div className="flex flex-col gap-5">
              {[
                { emoji: "🎯", title: "Mission", text: "Offer high-quality English training that allows learners to communicate with confidence and effectiveness in professional and academic environments." },
                { emoji: "🌍", title: "Vision", text: "Become a reference center in language training, recognized for excellence, innovation and impact across West Africa and beyond." },
                { emoji: "💡", title: "Our methodology", text: "Dynamic courses, real-life scenarios, intensive speaking practice and individual support to guarantee measurable progress at every level." },
              ].map(({ emoji, title, text }) => (
                <div key={title} className="rounded-[20px] border-[1.5px] border-[rgba(46,168,42,0.2)] bg-[rgba(46,168,42,0.06)] p-6 sm:p-8 lg:p-9">
                  <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.2rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 10 }}>{emoji} {title}</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.75 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Full-width banner */}
            <div className="relative overflow-hidden rounded-[28px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=85&fit=crop&crop=faces" alt="Cedar Training Center students" className="block h-[280px] w-full object-cover sm:h-[360px] lg:h-[400px]" />
            <div className="absolute inset-0 flex items-center bg-gradient-to-r from-[rgba(15,74,13,0.92)] via-[rgba(15,74,13,0.45)] to-transparent px-6 py-10 sm:px-10 sm:py-14 lg:px-16">
              <div>
                <p style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(1.6rem,3vw,3.2rem)", fontWeight: 800, color: "white", lineHeight: 1.1, maxWidth: 420 }}>
                  Learning English opens<br /><span style={{ color: "var(--green)" }}>every door.</span>
                </p>
                <a href="/register" style={{ marginTop: 28, display: "inline-flex", alignItems: "center", gap: 10, background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.95rem", padding: "16px 32px", borderRadius: 12, textDecoration: "none", boxShadow: "0 8px 32px rgba(46,168,42,0.35)" }}>
                  Apply now →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
