import type { Metadata } from "next";
import RegisterWizard from "./RegisterWizard";

export const metadata: Metadata = {
  title: "Apply | Cedar Training Center",
  description: "Pre-register for English programs at Cedar Training Center, Cotonou, Bénin.",
};

const VALID_PROGRAMS = new Set([
  "general-english",
  "business-english",
  "ielts-toefl-toeic",
  "workshops",
]);

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ program?: string }>;
}) {
  const { program } = await searchParams;
  const selectedProgram = program && VALID_PROGRAMS.has(program) ? program : null;

  return (
    <div>
      <div className="relative overflow-hidden border-b-2 border-[var(--mint-deep)] bg-[var(--mint)] px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-12 lg:pb-20 lg:pt-36 xl:px-20">
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "-2%",
            bottom: "-15%",
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(6rem,12vw,16rem)",
            color: "transparent",
            WebkitTextStroke: "2px rgba(46,168,42,0.1)",
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          APPLY
        </div>
        <div className="relative z-[2] mx-auto max-w-6xl">
          <p
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--green)",
              marginBottom: 18,
            }}
          >
            
            Apply
          </p>
          <h1
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(2.8rem,5.5vw,6rem)",
              fontWeight: 800,
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              color: "var(--green-deep)",
            }}
          >
            Start your
            <br />
            <em style={{ fontStyle: "normal", color: "var(--green)" }}>application</em>
          </h1>
          <p style={{ marginTop: 20, fontSize: "1.05rem", color: "var(--text-muted)", maxWidth: 520, lineHeight: 1.78 }}>
            Complete the steps below. Our team will contact you about admission, scheduling and fees.
          </p>
        </div>
      </div>
      <div className="bg-[var(--white)] px-4 pb-16 pt-8 sm:px-6 sm:pb-20 lg:px-12">
        <RegisterWizard initialProgram={selectedProgram} />
      </div>
    </div>
  );
}
