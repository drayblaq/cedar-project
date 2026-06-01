import React from "react";

const C = { ink: "#16241a", muted: "#687a6c" };

export function SectionHead({
  title,
  sub,
  action,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        marginBottom: 18, gap: 16, flexWrap: "wrap",
      }}
    >
      <div>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>
          {title}
        </h1>
        {sub && <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
