"use client";

import { useState } from "react";

const details = [
  { icon: "📍", h: "Address", p: "Gbédjromédé, Cotonou, Bénin — Near Nagueze school, Ola Fitness buildings" },
  { icon: "📞", h: "Phone", p: "+229 97 00 00 00", href: "tel:+22997000000" },
  { icon: "✉️", h: "Email", p: "contact@cedartrainingcenter.com", href: "mailto:contact@cedartrainingcenter.com" },
  { icon: "🕐", h: "Hours", p: "Monday – Saturday · 8:00 am – 7:00 pm" },
];

export default function MarketingContact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

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
          CONTACT
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
            Contact
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
            Get in touch
            <br />
            <em style={{ fontStyle: "normal", color: "var(--green)" }}>with Cedar</em>
          </h1>
          <p style={{ marginTop: 20, fontSize: "1.05rem", color: "var(--text-muted)", maxWidth: 480, lineHeight: 1.78 }}>
            Call, email or visit us in Cotonou. We reply within 24 hours.
          </p>
        </div>
      </div>

      <div style={{ background: "var(--white)", padding: "80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.6rem", fontWeight: 800, color: "var(--green-deep)", marginBottom: 32 }}>
              Send us a message
            </h2>
            {sent ? (
              <div
                style={{
                  background: "rgba(46,168,42,0.07)",
                  border: "1.5px solid rgba(46,168,42,0.25)",
                  borderRadius: 20,
                  padding: 40,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
                <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.3rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 8 }}>
                  Message sent!
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>We&apos;ll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { label: "Full name", type: "text", placeholder: "Your name" },
                  { label: "Email", type: "email", placeholder: "your@email.com" },
                  { label: "Phone / WhatsApp (optional)", type: "tel", placeholder: "+229 ..." },
                ].map(({ label, type, placeholder }) => (
                  <div key={label} style={{ marginBottom: 20 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        color: "var(--text-muted)",
                        marginBottom: 8,
                      }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      required={!label.includes("optional")}
                      style={{
                        width: "100%",
                        background: "var(--mint)",
                        border: "1.5px solid var(--mint-deep)",
                        borderRadius: 12,
                        padding: "14px 16px",
                        color: "var(--text)",
                        fontSize: "0.95rem",
                        fontFamily: "var(--font-dm-sans)",
                        outline: "none",
                      }}
                    />
                  </div>
                ))}
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      marginBottom: 8,
                    }}
                  >
                    Message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="How can we help you?"
                    required
                    style={{
                      width: "100%",
                      background: "var(--mint)",
                      border: "1.5px solid var(--mint-deep)",
                      borderRadius: 12,
                      padding: "14px 16px",
                      color: "var(--text)",
                      fontSize: "0.95rem",
                      fontFamily: "var(--font-dm-sans)",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    border: "none",
                    background: "var(--green)",
                    color: "white",
                    fontFamily: "var(--font-syne)",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    padding: "16px 32px",
                    borderRadius: 12,
                    marginTop: 8,
                  }}
                >
                  Send message →
                </button>
              </form>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "var(--mint)", border: "1.5px solid var(--mint-deep)", borderRadius: 24, padding: 36 }}>
              <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "1.1rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 24 }}>
                Contact details
              </h3>
              {details.map(({ icon, h, p, href }) => (
                <div key={h} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: "1.5px solid var(--mint-deep)" }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      background: "rgba(46,168,42,0.1)",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <h4 style={{ fontFamily: "var(--font-syne)", fontSize: "0.85rem", fontWeight: 800, color: "var(--green-dark)", marginBottom: 4 }}>
                      {h}
                    </h4>
                    {href ? (
                      <a href={href} style={{ fontSize: "0.875rem", color: "var(--green)", textDecoration: "none", fontWeight: 600 }}>
                        {p}
                      </a>
                    ) : (
                      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{p}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "4/3", boxShadow: "0 8px 40px rgba(46,168,42,0.1)" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.8!2d2.3915!3d6.3645!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x102355b28a37a4cb%3A0x0!2sGb%C3%A9djrom%C3%A9d%C3%A9%2C+Cotonou!5e0!3m2!1sen!2sbj!4v1714825200000"
                width="100%"
                height="100%"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                title="Map"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
