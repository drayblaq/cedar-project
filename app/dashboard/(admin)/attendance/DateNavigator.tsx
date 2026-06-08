"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const C = { muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", ink: "#16241a" };

function todayStr() { return new Date().toISOString().split("T")[0]; }

export function DateNavigator({ currentDate }: { currentDate: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function go(date: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("date", date);
    router.push(`${pathname}?${p.toString()}`);
  }
  function backToToday() {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("date");
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }
  function shift(days: number) {
    const d = new Date(currentDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    go(d.toISOString().split("T")[0]);
  }

  const today = todayStr();
  const isToday = currentDate === today;
  const displayDate = new Date(currentDate + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const btn: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, cursor: "pointer", fontSize: 16, fontFamily: "inherit",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <button type="button" onClick={() => shift(-1)} style={btn} aria-label="Previous day">←</button>

      <div className="cd-select-field" style={{ gap: 8 }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18v18H3z"/><path d="M3 9h18"/><path d="M8 2v4"/><path d="M16 2v4"/></svg>
        <input type="date" value={currentDate} max={today} onChange={(e) => go(e.target.value)} />
      </div>
      <span style={{ fontSize: 13, color: C.muted }} className="dn-display">{displayDate}</span>

      <button type="button" onClick={() => shift(1)} disabled={isToday}
        style={{ ...btn, opacity: isToday ? 0.3 : 1, cursor: isToday ? "not-allowed" : "pointer" }} aria-label="Next day">→</button>

      {!isToday && (
        <button type="button" onClick={backToToday} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: C.green, fontFamily: "inherit" }}>
          Back to today
        </button>
      )}
      <style>{`@media (max-width: 640px){ .dn-display { display: none; } }`}</style>
    </div>
  );
}
