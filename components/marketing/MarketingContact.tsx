"use client";

import { useState, useTransition } from "react";
import { submitContactForm } from "@/app/(marketing)/contact/actions";

function PinIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx={12} cy={10} r={3}/>
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/>
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--green)" }}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

const details = [
  { Icon: PinIcon,   h: "Address",          p: "Gbédjromédé, Rue avant l'école Nagueze en venant du carrefour 16 ampoules, Immeubles Ola Fitness, Entrée Auto tours, Cotonou, Bénin" },
  { Icon: PhoneIcon, h: "Phone / WhatsApp",  p: "+229 01 96 19 64 40",            href: "tel:+22901961964 40" },
  { Icon: MailIcon,  h: "Email",             p: "trainingcentercedar@gmail.com",  href: "mailto:trainingcentercedar@gmail.com" },
];

export default function MarketingContact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await submitContactForm(fd);
      if (res?.error) setError(res.error);
      else setSent(true);
    });
  }

  return (
    <div>
      <div className="relative overflow-hidden border-b-2 border-[var(--mint-deep)] bg-[var(--mint)] px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-12 lg:pb-20 lg:pt-36 xl:px-20">
        <div aria-hidden="true" style={{ position: "absolute", right: "-2%", bottom: "-15%", fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "clamp(6rem,12vw,16rem)", color: "transparent", WebkitTextStroke: "2px rgba(46,168,42,0.1)", lineHeight: 0.85, letterSpacing: "-0.04em", userSelect: "none", pointerEvents: "none" }}>CONTACT</div>
        <div className="relative z-[2] mx-auto max-w-6xl">
          <p style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--green)", marginBottom: 18 }}>
            Contact
          </p>
          <h1 style={{ fontFamily: "var(--font-inter)", fontSize: "clamp(2.2rem,4vw,3.5rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.01em", color: "var(--green-deep)" }}>
            Get in touch<br /><em style={{ fontStyle: "normal", color: "var(--green)" }}>with Cedar</em>
          </h1>
          <p style={{ marginTop: 20, fontSize: "1rem", color: "#1f2d1e", fontWeight: 500, maxWidth: 480, lineHeight: 1.78 }}>
            Interested in joining Cedar Training Center? Get in touch with us and we will guide you through the enrollment process.
          </p>
          <p style={{ marginTop: 12, fontSize: "0.9rem", color: "#4a6741", fontWeight: 500, maxWidth: 480, lineHeight: 1.78 }}>
            Call, email or visit us in Cotonou. We reply within 24 hours.
          </p>
        </div>
      </div>

      <div className="bg-[var(--white)] px-4 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          <div>
            <h2 style={{ fontFamily: "var(--font-inter)", fontSize: "1.6rem", fontWeight: 800, color: "var(--green-deep)", marginBottom: 32 }}>
              Send us a message
            </h2>
            {sent ? (
              <div style={{ background: "rgba(46,168,42,0.07)", border: "1.5px solid rgba(46,168,42,0.25)", borderRadius: 20, padding: 40, textAlign: "center" }}>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><CheckIcon /></div>
                <h3 style={{ fontFamily: "var(--font-inter)", fontSize: "1.3rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 8 }}>Message sent!</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>We&apos;ll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { name: "name", label: "Full name", type: "text", placeholder: "Your name" },
                  { name: "email", label: "Email", type: "email", placeholder: "your@email.com" },
                  { name: "phone", label: "Phone / WhatsApp (optional)", type: "tel", placeholder: "+229 ..." },
                ].map(({ name, label, type, placeholder }) => (
                  <div key={name} style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>{label}</label>
                    <input name={name} type={type} placeholder={placeholder} required={!label.includes("optional")} style={{ width: "100%", boxSizing: "border-box", background: "var(--mint)", border: "1.5px solid var(--mint-deep)", borderRadius: 12, padding: "14px 16px", color: "var(--text)", fontSize: "0.95rem", fontFamily: "var(--font-inter)", outline: "none" }} />
                  </div>
                ))}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Message</label>
                  <textarea name="message" rows={5} placeholder="How can we help you?" required style={{ width: "100%", boxSizing: "border-box", background: "var(--mint)", border: "1.5px solid var(--mint-deep)", borderRadius: 12, padding: "14px 16px", color: "var(--text)", fontSize: "0.95rem", fontFamily: "var(--font-inter)", outline: "none", resize: "vertical" }} />
                </div>
                {error && (
                  <p style={{ marginBottom: 14, fontSize: "0.875rem", fontWeight: 600, color: "#b3402f" }}>{error}</p>
                )}
                <button type="submit" disabled={pending} style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1, border: "none", background: "var(--green)", color: "white", fontFamily: "var(--font-inter)", fontWeight: 800, fontSize: "0.95rem", padding: "16px 32px", borderRadius: 12, marginTop: 8 }}>
                  {pending ? "Sending…" : "Send message →"}
                </button>
              </form>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "var(--mint)", border: "1.5px solid var(--mint-deep)", borderRadius: 24, padding: 36 }}>
              <h3 style={{ fontFamily: "var(--font-inter)", fontSize: "1.1rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 24 }}>Contact details</h3>
              {details.map(({ Icon, h, p, href }) => (
                <div key={h} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: "1.5px solid var(--mint-deep)" }}>
                  <div style={{ width: 42, height: 42, flexShrink: 0, background: "rgba(46,168,42,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}>
                    <Icon />
                  </div>
                  <div>
                    <h4 style={{ fontFamily: "var(--font-inter)", fontSize: "0.85rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 4 }}>{h}</h4>
                    {href ? (
                      <a href={href} style={{ fontSize: "0.875rem", color: "var(--green)", textDecoration: "none", fontWeight: 600 }}>{p}</a>
                    ) : (
                      <p style={{ fontSize: "0.875rem", color: "#1f2d1e", fontWeight: 500, lineHeight: 1.65 }}>{p}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "4/3", boxShadow: "0 8px 40px rgba(46,168,42,0.1)" }}>
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.8!2d2.3915!3d6.3645!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x102355b28a37a4cb%3A0x0!2sGb%C3%A9djrom%C3%A9d%C3%A9%2C+Cotonou!5e0!3m2!1sen!2sbj!4v1714825200000" width="100%" height="100%" style={{ border: 0, display: "block" }} allowFullScreen loading="lazy" title="Map" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
