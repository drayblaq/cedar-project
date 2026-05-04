"use client";
import { useState } from "react";

const levels = [
  "Beginner (A1)", "Elementary (A2)", "Pre-Intermediate (B1)",
  "Intermediate (B2)", "Upper-Intermediate (C1)", "Advanced (C2)",
  "IELTS / TOEFL / TOEIC Preparation",
  "I'm not sure — I'd like to take the placement test",
];

const confirmations = [
  "I understand that courses are delivered in person at Cedar Training Center in Cotonou.",
  "I understand that fees and schedules will be confirmed by the center after my application is reviewed.",
  "I agree to provide accurate personal and contact information.",
];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  const [confirmError, setConfirmError] = useState(false);
  const [level, setLevel] = useState("");
  const [form, setForm] = useState({ fn: "", ln: "", email: "", wa: "", msg: "" });
  const [submitted, setSubmitted] = useState(false);

  function toggleCheck(i: number) {
    const next = [...checked]; next[i] = !next[i];
    setChecked(next); setConfirmError(false);
  }

  function nextStep() {
    if (step === 0 && !checked.every(Boolean)) { setConfirmError(true); return; }
    if (step === 1) {
      if (!form.fn || !form.ln || !form.email) { alert("Please fill in first name, last name and email."); return; }
    }
    setStep(step + 1);
  }

  const inputStyle: React.CSSProperties = { width: "100%", background: "var(--mint)", border: "1.5px solid var(--mint-deep)", borderRadius: 12, padding: "14px 16px", color: "var(--text)", fontSize: "0.95rem", fontFamily: "var(--font-dm-sans)", fontWeight: 500, outline: "none" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 } as React.CSSProperties;

  return (
    <div>
      {/* Hero */}
      <div style={{ padding: "140px 80px 80px", background: "var(--mint)", position: "relative", overflow: "hidden", borderBottom: "2px solid var(--mint-deep)" }}>
        <div aria-hidden="true" style={{ position: "absolute", right: "-2%", bottom: "-15%", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(6rem,12vw,16rem)", color: "transparent", WebkitTextStroke: "2px rgba(46,168,42,0.1)", lineHeight: 0.85, letterSpacing: "-0.04em", userSelect: "none", pointerEvents: "none" }}>APPLY</div>
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <p style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 18 }}>
            <span style={{ width: 24, height: 2.5, background: "var(--green)", borderRadius: 2 }} />Apply
          </p>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(2.8rem,5.5vw,6rem)", fontWeight: 800, lineHeight: 0.92, letterSpacing: "-0.04em", color: "var(--green-deep)" }}>
            Start your<br /><em style={{ fontStyle: "normal", color: "var(--green)" }}>application</em>
          </h1>
          <p style={{ marginTop: 20, fontSize: "1.05rem", color: "var(--text-muted)", maxWidth: 480, lineHeight: 1.78 }}>Complete this form and our team will contact you about admission, scheduling and fees.</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ background: "var(--white)", padding: "80px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "80px 40px" }}>
              <div style={{ fontSize: "4rem", marginBottom: 20 }}>🎉</div>
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "2.6rem", fontWeight: 800, color: "var(--green)", marginBottom: 16 }}>Application received!</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.78 }}>Your pre-registration was saved. Our team will review your application and contact you shortly.</p>
              <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.95rem", padding: "16px 32px", borderRadius: 12, textDecoration: "none" }}>Back to home →</a>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48 }}>
                {[0, 1, 2].map((i) => (
                  <>
                    <div key={i} style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.85rem", background: i < step ? "rgba(46,168,42,0.15)" : i === step ? "var(--green)" : "var(--mint-deep)", color: i < step ? "var(--green)" : i === step ? "white" : "var(--text-muted)", border: `2px solid ${i <= step ? "var(--green)" : "var(--mint-deep)"}`, transition: "all 0.3s" }}>{i + 1}</div>
                    {i < 2 && <div key={`line-${i}`} style={{ flex: 1, height: 2.5, background: "var(--mint-deep)", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", background: "var(--green)", width: step > i ? "100%" : "0%", transition: "width 0.4s" }} /></div>}
                  </>
                ))}
              </div>

              {/* Step 0 — Confirmations */}
              {step === 0 && (
                <div>
                  <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.8rem", fontWeight: 800, color: "var(--green-deep)", marginBottom: 8 }}>Before you continue</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: 32, lineHeight: 1.7 }}>Please confirm each point. Training is offered at our center in Cotonou.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
                    {confirmations.map((text, i) => (
                      <div key={i} onClick={() => toggleCheck(i)} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: checked[i] ? "rgba(46,168,42,0.08)" : "var(--mint)", border: `1.5px solid ${checked[i] ? "var(--green)" : "var(--mint-deep)"}`, borderRadius: 14, padding: "18px 20px", cursor: "pointer", transition: "all 0.2s" }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `2px solid ${checked[i] ? "var(--green)" : "var(--mint-deep)"}`, background: checked[i] ? "var(--green)" : "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                          {checked[i] && <svg viewBox="0 0 12 10" fill="none" style={{ width: 12, height: 10 }}><polyline points="1,5 4.5,9 11,1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span style={{ fontSize: "0.9rem", color: "var(--green-dark)", lineHeight: 1.65, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: text.replace("in person", "<strong>in person</strong>") }} />
                      </div>
                    ))}
                  </div>
                  {confirmError && <div style={{ color: "#c0392b", fontSize: "0.85rem", fontWeight: 600, marginBottom: 16, padding: "12px 16px", background: "rgba(192,57,43,0.08)", border: "1.5px solid rgba(192,57,43,0.2)", borderRadius: 10 }}>⚠️ Please tick all three boxes before continuing.</div>}
                  <button onClick={nextStep} style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", border: "none", background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.95rem", padding: "16px 32px", borderRadius: 12 }}>Continue →</button>
                </div>
              )}

              {/* Step 1 — Personal info + level */}
              {step === 1 && (
                <div>
                  <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.8rem", fontWeight: 800, color: "var(--green-deep)", marginBottom: 32 }}>Personal information</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ marginBottom: 20 }}><label style={labelStyle}>First name *</label><input style={inputStyle} type="text" placeholder="First name" value={form.fn} onChange={e => setForm({ ...form, fn: e.target.value })} /></div>
                    <div style={{ marginBottom: 20 }}><label style={labelStyle}>Last name *</label><input style={inputStyle} type="text" placeholder="Last name" value={form.ln} onChange={e => setForm({ ...form, ln: e.target.value })} /></div>
                  </div>
                  <div style={{ marginBottom: 20 }}><label style={labelStyle}>Email *</label><input style={inputStyle} type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                  <div style={{ marginBottom: 24 }}><label style={labelStyle}>WhatsApp</label><input style={inputStyle} type="tel" placeholder="+229 ..." value={form.wa} onChange={e => setForm({ ...form, wa: e.target.value })} /></div>

                  <div style={{ background: "rgba(46,168,42,0.06)", border: "1.5px solid rgba(46,168,42,0.18)", borderRadius: 20, padding: 28, marginBottom: 28 }}>
                    <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.1rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 6 }}>What is your current English level?</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 20 }}>A free placement test will confirm your exact level.</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {levels.map((lv) => (
                        <div key={lv} onClick={() => setLevel(lv)} style={{ display: "flex", gap: 12, alignItems: "center", background: level === lv ? "rgba(46,168,42,0.07)" : "var(--mint)", border: `2px solid ${level === lv ? "var(--green)" : "var(--mint-deep)"}`, borderRadius: 14, padding: "14px 18px", cursor: "pointer", transition: "all 0.2s", gridColumn: lv.length > 25 ? "1/-1" : "auto" }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${level === lv ? "var(--green)" : "var(--mint-deep)"}`, background: level === lv ? "var(--green)" : "white", flexShrink: 0, position: "relative", transition: "all 0.2s" }}>
                            {level === lv && <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "white" }} />}
                          </div>
                          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--green-dark)" }}>{lv}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setStep(0)} style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", background: "none", color: "var(--green-dark)", fontWeight: 600, fontSize: "0.9rem", padding: "14px 24px", borderRadius: 12, border: "2px solid rgba(46,168,42,0.3)" }}>← Back</button>
                    <button onClick={nextStep} style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", border: "none", background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.95rem", padding: "16px 32px", borderRadius: 12 }}>Continue →</button>
                  </div>
                </div>
              )}

              {/* Step 2 — Review */}
              {step === 2 && (
                <div>
                  <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.8rem", fontWeight: 800, color: "var(--green-deep)", marginBottom: 24 }}>Review & submit</h2>
                  <div style={{ background: "var(--mint)", border: "1.5px solid var(--mint-deep)", borderRadius: 20, padding: 32, marginBottom: 28 }}>
                    <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1rem", fontWeight: 800, color: "var(--green)", marginBottom: 20 }}>Application summary</h3>
                    {[["Name", `${form.fn} ${form.ln}`], ["Email", form.email], ["WhatsApp", form.wa || "—"], ["English level", level || "Not selected"]].map(([label, value]) => (
                      <div key={label} style={{ display: "flex", gap: 16, fontSize: "0.9rem", alignItems: "baseline", marginBottom: 12 }}>
                        <span style={{ color: "var(--text-muted)", minWidth: 130, fontWeight: 600, flexShrink: 0 }}>{label}</span>
                        <span style={{ color: label === "English level" ? "var(--green)" : "var(--green-deep)", fontWeight: label === "English level" ? 800 : 700 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Additional message (optional)</label>
                    <textarea rows={4} placeholder="Any other info you'd like us to know..." value={form.msg} onChange={e => setForm({ ...form, msg: e.target.value })} style={{ ...inputStyle, resize: "vertical", minHeight: 120 }} />
                  </div>
                  <div style={{ background: "rgba(46,168,42,0.06)", border: "1.5px solid rgba(46,168,42,0.15)", borderRadius: 12, padding: "16px 20px", marginBottom: 24, fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
                    ⚠️ Never share passwords or full bank card numbers through this form.
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setStep(1)} style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", background: "none", color: "var(--green-dark)", fontWeight: 600, fontSize: "0.9rem", padding: "14px 24px", borderRadius: 12, border: "2px solid rgba(46,168,42,0.3)" }}>← Back</button>
                    <button onClick={() => setSubmitted(true)} style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", border: "none", background: "var(--green)", color: "white", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.95rem", padding: "16px 32px", borderRadius: 12 }}>Submit application →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
