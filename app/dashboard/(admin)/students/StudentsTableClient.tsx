"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ResendInviteButton } from "./ResendInviteButton";
import { AdmissionActions } from "./AdmissionActions";

type Student = {
  id: string; full_name: string; first_name: string | null; last_name: string | null;
  email: string; phone: string | null; user_id: string | null;
  status: string | null; application_status: string | null;
  last_invite_sent_at: string | null;
  levels: { name?: string } | { name?: string }[] | null;
};

const C = {
  ink: "#16241a", muted: "#687a6c", border: "#e6ece4",
  green: "#2ea82a", greenWash: "#eef6ec", greenDark: "#1a6b18", greenSoft: "#d3ead0",
  surface: "#ffffff", bg: "#f4f7f2",
};
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

const LEVELS = ["All","A1","A2","B1","B2","C1","C2"];

export function StudentsTableClient({ students, bestTestPct, paidStudentIds }: {
  students: Student[]; bestTestPct: Record<string,number>; paidStudentIds: string[];
}) {
  const [q, setQ] = useState("");
  const [lvl, setLvl] = useState("All");
  const paid = useMemo(() => new Set(paidStudentIds), [paidStudentIds]);

  function levelName(l: Student["levels"]) {
    if (!l) return "—";
    return Array.isArray(l) ? (l[0] as {name?:string})?.name ?? "—" : (l as {name?:string})?.name ?? "—";
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
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
            <thead>
              <tr>
                {["Student","Level","Program","Attend.","Avg","Balance","Portal"].map((h, i) => (
                  <th key={h} style={{ textAlign: i >= 3 ? "center" : "left", padding:"11px 14px", fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:C.muted, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>
                    {h}
                  </th>
                ))}
                <th style={{ padding:"11px 14px", borderBottom:`1px solid ${C.border}` }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const displayName = s.first_name && s.last_name ? `${s.first_name} ${s.last_name}` : s.full_name;
                const app = s.application_status ?? "submitted";
                const hasLogin = !!s.user_id;
                const canInvite = paid.has(s.id) && !hasLogin && s.status === "active";
                const lv = levelName(s.levels);
                const score = bestTestPct[s.id];
                const hasBal = false; // no balance field in current schema
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
                    {/* App status */}
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, verticalAlign:"middle" }}>
                      <Badge tone={APP_TONE[app] ?? "neutral"}>{app.replace(/_/g," ")}</Badge>
                    </td>
                    {/* Attendance */}
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, verticalAlign:"middle", textAlign:"center" }}>
                      <span style={{ fontWeight:700, color:C.muted }}>—</span>
                    </td>
                    {/* Score */}
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, verticalAlign:"middle", textAlign:"center" }}>
                      <span style={{ fontWeight:700 }}>{score != null ? score + "%" : "—"}</span>
                    </td>
                    {/* Balance */}
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, verticalAlign:"middle", textAlign:"center" }}>
                      <Badge tone={STATUS_TONE[s.status ?? "pending"] ?? "neutral"}>{s.status ?? "pending"}</Badge>
                    </td>
                    {/* Portal */}
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, verticalAlign:"middle", textAlign:"center" }}>
                      {hasLogin
                        ? <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        : canInvite
                          ? <ResendInviteButton studentId={s.id} lastInviteSentAt={s.last_invite_sent_at ?? null} />
                          : <button className="cd-mini-btn">Invite</button>
                      }
                    </td>
                    {/* Actions */}
                    <td style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, verticalAlign:"middle", textAlign:"right" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:8 }}>
                        <Link href={`/admin/students/${s.id}/application`}
                          style={{ background:C.greenWash, border:"none", borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:700, color:C.greenDark, textDecoration:"none", display:"inline-block" }}>
                          View
                        </Link>
                        <Link href={`/admin/students/${s.id}/edit`}
                          style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:700, color:C.ink, textDecoration:"none", display:"inline-block" }}>
                          Edit
                        </Link>
                        {s.status === "pending" && app !== "rejected" && (
                          <AdmissionActions studentId={s.id} applicationStatus={app} />
                        )}
                      </div>
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
