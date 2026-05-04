import type { Metadata } from "next";
import RegisterWizard from "./RegisterWizard";

export const metadata: Metadata = {
  title: "Apply | Cedar Training Center",
  description: "Pre-register for English programs at Cedar Training Center, Cotonou, Bénin.",
};

export default function RegisterPage() {
  return (
    <div>
      <div
        style={{
          padding: "140px 80px 80px",
          background: "var(--mint)",
          position: "relative",
          overflow: "hidden",
          borderBottom: "2px solid var(--mint-deep)",
        }}
      >
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
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>
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
            <span style={{ width: 24, height: 2.5, background: "var(--green)", borderRadius: 2 }} />
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
      <div style={{ background: "var(--white)", padding: "48px 24px 80px" }} className="sm:px-8">
        <RegisterWizard />
      </div>
    </div>
  );
}
