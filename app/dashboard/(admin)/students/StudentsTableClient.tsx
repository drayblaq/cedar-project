"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { ResendInviteButton } from "./ResendInviteButton";
import { setStudentApplicationStatus } from "@/app/dashboard/actions/index";

type Student = {
  id: string; full_name: string; first_name: string | null; last_name: string | null;
  email: string; phone: string | null; user_id: string | null;
  status: string | null; application_status: string | null;
  last_invite_sent_at: string | null;
  levels: { name?: string } | { name?: string }[] | null;
  class_id: string | null;
  classes: { name?: string } | { name?: string }[] | null;
};

const C = {
  ink: "#16241a", muted: "#687a6c", border: "#e6ece4",
  green: "#2ea82a", greenWash: "#eef6ec", greenDark: "#1a6b18", greenSoft: "#d3ead0",
  surface: "#ffffff", bg: "#f4f7f2",
};
function fmtXOF(n: number) { return new Intl.NumberFormat("fr-FR").format(n) + " FCFA"; }

const AVATAR_PALETTE = ["#2ea82a","#1a6b18","#d4a843","#3f7d8c","#8c6a3f","#6a8c3f"];
function avatarColor(name: string) {
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}
function initials(name: string) { return name.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase(); }

const BADGE: Record<string, {bg:string;fg:string}> = {
  neutral: { bg:"#eef2ec", fg:"#4a5a4d" },
  green:   { bg:"rgba(46,168,42,.12)", fg:"#1a6b18" },
  gold:    { bg:"rgba(212,168,67,.16)", fg:"#9a7822" },
  red:     { bg:"rgba(201,74,58,.12)", fg:"#b3402f" },
  blue:    { bg:"rgba(63,125,140,.14)", fg:"#2f5f6b" },
};
const APP_TONE: Record<string,string> = {
  approved:"green", rejected:"red", awaiting_payment:"gold", under_review:"blue", submitted:"neutral",
};
const STATUS_TONE: Record<string,string> = { active:"green", pending:"gold", inactive:"neutral", paused:"red" };

function Badge({ children, tone="neutral" }: { children: React.ReactNode; tone?: string }) {
  const t = BADGE[tone] ?? BADGE.neutral;
  return <span style={{ display:"inline-flex", alignItems:"center", background:t.bg, color:t.fg, fontSize:11.5, fontWeight:700, padding:"3px 10px", borderRadius:7, whiteSpace:"nowrap", textTransform:"capitalize" }}>{children}</span>;
}

// ── Small inline SVG icons ────────────────────────────────────────────────────
function Icon({ d, color = "currentColor" }: { d: string; color?: string }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {d.split(" M").map((seg, i) => <path key={i} d={i === 0 ? seg : "M" + seg} />)}
    </svg>
  );
}
const ICONS = {
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  pencil:  "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  check:   "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  clock:   "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 6v6l4 2",
  x:       "M18 6L6 18 M6 6l12 12",
  mail:    "M4 4h16v16H4z M22 6l-10 7L2 6",
};

function DropItem({ icon, label, color, hover, onClick, disabled, borderTop, href, onClose }: {
  icon: string; label: string; color: string; hover: string;
  onClick?: () => void; disabled?: boolean; borderTop?: boolean;
  href?: string; onClose?: () => void;
}) {
  const style: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left",
    padding: "9px 14px", fontSize: 13, fontWeight: 600, color, background: "transparent",
    border: "none", cursor: disabled ? "default" : "pointer", textDecoration: "none",
    borderTop: borderTop ? `1px solid ${C.border}` : undefined, opacity: disabled ? 0.5 : 1,
    fontFamily: "inherit",
  };
  function onHover(e: React.MouseEvent<HTMLElement>) { e.currentTarget.style.background = hover; }
  function onOut(e: React.MouseEvent<HTMLElement>) { e.currentTarget.style.background = "transparent"; }

  if (href) {
    return (
      <Link href={href} onClick={onClose} style={style} onMouseOver={onHover} onMouseOut={onOut}>
        <Icon d={icon} color={color} />{label}
      </Link>
    );
  }
  return (
    <button onClick={onClick} disabled={disabled} style={style} onMouseOver={onHover} onMouseOut={onOut}>
      <Icon d={icon} color={color} />{label}
    </button>
  );
}

// ── Actions dropdown ──────────────────────────────────────────────────────────
function ActionsDropdown({ student, canInvite }: { student: Student; canInvite: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function runAction(key: string, next: "approved" | "rejected" | "awaiting_payment") {
    setLoading(key); setMsg(null);
    const r = await setStudentApplicationStatus(student.id, next);
    setLoading(null);
    if (r.error) setMsg("Error: " + r.error);
    else { setMsg("Updated"); setTimeout(() => { setMsg(null); setOpen(false); }, 1200); }
  }

  const app = student.application_status ?? "submitted";
  const busy = loading !== null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 700, color: C.ink, cursor: "pointer", whiteSpace: "nowrap" }}
      >
        ••• Actions
      </button>
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 50,
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)", minWidth: 200, overflow: "hidden", padding: "4px 0",
        }}>
          {/* Group 1: navigate */}
          <DropItem icon={ICONS.eye}    label="View Application" color={C.ink}     hover={C.greenWash} href={`/admin/students/${student.id}/application`} onClose={() => setOpen(false)} />
          <DropItem icon={ICONS.pencil} label="Edit"             color={C.ink}     hover={C.greenWash} href={`/admin/students/${student.id}/edit`}        onClose={() => setOpen(false)} />

          {/* Group 2: status actions */}
          {app !== "approved" && (
            <DropItem icon={ICONS.check} label={loading === "ap" ? "…" : "Approve"} color="#1a6b18" hover={C.greenWash} onClick={() => runAction("ap", "approved")} disabled={busy} borderTop />
          )}
          {app !== "awaiting_payment" && (
            <DropItem icon={ICONS.clock} label={loading === "aw" ? "…" : "Set Awaiting Payment"} color="#9a7822" hover="#fffbeb" onClick={() => runAction("aw", "awaiting_payment")} disabled={busy} borderTop={app === "approved"} />
          )}
          {app !== "rejected" && (
            <DropItem icon={ICONS.x} label={loading === "rj" ? "…" : "Reject"} color="#b3402f" hover="#fef2f2" onClick={() => runAction("rj", "rejected")} disabled={busy} />
          )}

          {/* Group 3: invite */}
          {canInvite && (
            <div style={{ borderTop: `1px solid ${C.border}`, padding: "4px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 14px" }}>
                <Icon d={ICONS.mail} color={C.greenDark} />
                <ResendInviteButton studentId={student.id} lastInviteSentAt={student.last_invite_sent_at ?? null} />
              </div>
            </div>
          )}

          {msg && <p style={{ fontSize: 11.5, padding: "6px 16px", color: msg.startsWith("Error") ? "#b3402f" : C.greenDark }}>{msg}</p>}
        </div>
      )}
    </div>
  );
}

const LEVELS = ["All","A1","A2","B1","B2","C1","C2"];

export function StudentsTableClient({ students, bestTestPct, paymentTotals, tuitionAmount }: {
  students: Student[];
  bestTestPct: Record<string,number>;
  paymentTotals: Record<string,number>;
  tuitionAmount: number;
}) {
  const [q, setQ] = useState("");
  const [lvl, setLvl] = useState("All");

  function levelName(l: Student["levels"]) {
    if (!l) return "—";
    return Array.isArray(l) ? (l[0] as {name?:string})?.name ?? "—" : (l as {name?:string})?.name ?? "—";
  }
  function className(c: Student["classes"]) {
    if (!c) return null;
    return Array.isArray(c) ? (c[0] as {name?:string})?.name ?? null : (c as {name?:string})?.name ?? null;
  }

  const filtered = useMemo(() => {
    const qq = q.toLowerCase().trim();
    return students.filter(s => {
      const lv = levelName(s.levels);
      const matchLvl = lvl === "All" || lv === lvl;
      const matchQ = !qq || s.full_name.toLowerCase().includes(qq) || s.email.toLowerCase().includes(qq);
      return matchLvl && matchQ;
    });
  }, [students, q, lvl]);

  const HEADERS = ["Student","Level","Class","Status","Balance","Portal","Actions"];

  return (
    <div className="cd-card" style={{ padding: 0 }}>
      {/* Toolbar */}
      <div className="cd-table-toolbar">
        <div className="cd-search" style={{ maxWidth: 300, flex: 1 }}>
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3"/></svg>
          <input placeholder="Search students…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLvl(l)} className={"cd-chip" + (lvl===l?" cd-chip-on":"")}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {!filtered.length ? (
        <div style={{ padding:"48px 22px", textAlign:"center" }}>
          <p style={{ fontSize:14, color:C.muted }}>No students match your search.</p>
          <button onClick={() => { setQ(""); setLvl("All"); }}
            style={{ marginTop:12, background:C.greenWash, border:"none", borderRadius:8, padding:"7px 16px", fontSize:12.5, fontWeight:700, color:C.greenDark, cursor:"pointer" }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5, minWidth:700 }}>
            <thead>
              <tr>
                {HEADERS.map((h, i) => (
                  <th key={h} style={{ textAlign: i >= 4 ? "center" : "left", padding:"11px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const displayName = s.first_name && s.last_name ? `${s.first_name} ${s.last_name}` : s.full_name;
                const app = s.application_status ?? "submitted";
                const hasLogin = !!s.user_id;
                const canInvite = !hasLogin && s.status === "active";
                const lv = levelName(s.levels);
                const cls = className(s.classes);

                // Balance
                const totalPaid = paymentTotals[s.id] ?? 0;
                const remaining = tuitionAmount - totalPaid;

                return (
                  <tr key={s.id} className="cd-trow">
                    {/* Student */}
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, verticalAlign:"middle" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                        <div style={{ width:34, height:34, borderRadius:"50%", flexShrink:0, background:avatarColor(displayName), color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12.3 }}>
                          {initials(displayName)}
                        </div>
                        <div>
                          <div style={{ fontWeight:600, color:C.ink }}>{displayName}</div>
                          <div style={{ fontSize:11.5, color:C.muted }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    {/* Level */}
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, verticalAlign:"middle" }}>
                      <LevelPillInline level={lv} />
                    </td>
                    {/* Class */}
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, verticalAlign:"middle" }}>
                      {cls ? (
                        <span style={{ fontSize:12.5, fontWeight:600, color:C.ink }}>{cls}</span>
                      ) : (
                        <span style={{ fontSize:11.5, color:C.muted }}>—</span>
                      )}
                    </td>
                    {/* Status (application_status) */}
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, verticalAlign:"middle" }}>
                      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        <Badge tone={APP_TONE[app] ?? "neutral"}>{app.replace(/_/g," ")}</Badge>
                        <Badge tone={STATUS_TONE[s.status ?? "pending"] ?? "neutral"}>{s.status ?? "pending"}</Badge>
                      </div>
                    </td>
                    {/* Balance */}
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, verticalAlign:"middle", textAlign:"center" }}>
                      {remaining <= 0 ? (
                        <Badge tone="green">Paid in full</Badge>
                      ) : totalPaid > 0 ? (
                        <span style={{ fontSize:12.5, fontWeight:700, color:"#9a7822" }}>
                          {fmtXOF(totalPaid)} / {fmtXOF(tuitionAmount)}
                        </span>
                      ) : (
                        <span style={{ fontSize:12.5, fontWeight:600, color:C.muted }}>
                          0 / {fmtXOF(tuitionAmount)}
                        </span>
                      )}
                    </td>
                    {/* Portal */}
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, verticalAlign:"middle", textAlign:"center" }}>
                      {hasLogin ? (
                        <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12, fontWeight:700, color:"#1a6b18" }}>✓ Active</span>
                      ) : s.last_invite_sent_at ? (
                        <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:12, fontWeight:600, color:"#d97706" }}>Invited</span>
                      ) : (
                        <span style={{ fontSize:11.5, color:C.muted }}>No access</span>
                      )}
                    </td>
                    {/* Actions dropdown */}
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, verticalAlign:"middle", textAlign:"center" }}>
                      <ActionsDropdown student={s} canInvite={canInvite} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LevelPillInline({ level }: { level: string }) {
  const order: Record<string,number> = { A1:0, A2:1, B1:2, B2:3, C1:4, C2:5 };
  const hue = 95 + (order[level] ?? 0) * 6;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", minWidth:30, height:22, padding:"0 7px", borderRadius:6, fontSize:11.5, fontWeight:800,
      background:`oklch(0.93 0.06 ${hue})`, color:`oklch(0.40 0.10 ${hue})` }}>
      {level}
    </span>
  );
}
