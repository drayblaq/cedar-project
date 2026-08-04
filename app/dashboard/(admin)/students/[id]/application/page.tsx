import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTuitionAmount, getSetting } from "@/lib/settings";
import { getStudentAssessmentHistory } from "@/app/dashboard/actions/index";
import { AdmissionActions } from "../../AdmissionActions";
import { DeleteStudentButton } from "../../DeleteStudentButton";
import { ResendInviteButton } from "../../ResendInviteButton";
import { ProgressGraph } from "@/components/dashboard/ProgressGraph";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec", greenDark: "#1a6b18" };

const APP_TONE: Record<string, { bg: string; fg: string }> = {
  approved:         { bg: "rgba(46,168,42,.12)",  fg: "#1a6b18" },
  rejected:         { bg: "rgba(201,74,58,.12)",  fg: "#b3402f" },
  awaiting_payment: { bg: "rgba(212,168,67,.16)", fg: "#9a7822" },
  under_review:     { bg: "rgba(63,125,140,.14)", fg: "#2f5f6b" },
  submitted:        { bg: "#eef2ec",              fg: "#4a5a4d" },
};

function avatarColor(name: string) {
  const palette = ["#2ea82a","#1a6b18","#d4a843","#3f7d8c","#8c6a3f","#6a8c3f"];
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}
function initials(name: string) { return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase(); }

const EDU_LABELS: Record<string, string> = {
  high_school: "High school graduate",
  undergraduate: "Undergraduate (In the university)",
  graduate: "Graduate (Bachelors/Masters)",
  postgraduate: "Post graduate",
};
function eduLabel(v: string) { return EDU_LABELS[v] ?? (v || "-"); }

export default async function StudentApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: s, error } = await supabase.from("students").select("*").eq("id", id).maybeSingle();
  if (error || !s) notFound();

  const [{ data: attempts }, assessmentHistory] = await Promise.all([
    supabase
      .from("test_attempts")
      .select("id, score, max_score, time_taken_seconds, completed_at, tests(title)")
      .eq("student_id", id)
      .order("completed_at", { ascending: false }),
    getStudentAssessmentHistory(id),
  ]);

  // Payment balance
  const TUITION = await getTuitionAmount();
  const currency = (await getSetting("currency")) ?? "FCFA";
  const { data: pays } = await supabase.from("payments").select("amount").eq("student_id", id);
  const totalPaid = (pays ?? []).reduce((sum, p) => sum + Number((p as { amount: number }).amount), 0);
  const remaining = TUITION - totalPaid;
  const fmtXOF = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " " + currency;

  const app = String(s.application_status ?? "submitted");
  const appTone = APP_TONE[app] ?? APP_TONE.submitted;
  const hasLogin = !!s.user_id;

  const rows: { label: string; value: string }[] = [
    { label: "First name", value: String(s.first_name ?? "-") },
    { label: "Last name", value: String(s.last_name ?? "-") },
    { label: "Email", value: String(s.email ?? "-") },
    { label: "Gender", value: String(s.gender ?? "-") },
    { label: "Date of birth", value: s.date_of_birth ? String(s.date_of_birth) : "-" },
    { label: "Phone / WhatsApp", value: String(s.whatsapp ?? s.phone ?? "-") },
    { label: "Resident address", value: String(s.resident_address ?? s.address_line ?? "-") },
    { label: "Educational level", value: eduLabel(String(s.educational_level ?? "")) },
    { label: "How they heard about us", value: String(s.discovery_channel ?? "-") },
    { label: "Notes", value: String(s.notes ?? "-") },
  ];

  const guardianRows: { label: string; value: string }[] = [
    { label: "Full name", value: String(s.guardian_name ?? "-") },
    { label: "Phone number", value: String(s.guardian_phone ?? s.parent_whatsapp ?? "-") },
    { label: "Resident address", value: String(s.guardian_address ?? "-") },
    { label: "Parent email", value: String(s.parent_email ?? "-") },
  ];
  const hasGuardian = !!(s.guardian_name || s.guardian_phone || s.guardian_address || s.parent_email);
  const declarationAgreed = s.declaration_agreed === true;

  return (
    <div style={{ padding: "30px 30px 60px" }}>
      <Link href="/admin/students"
        style={{ fontSize: 13, color: C.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
        ← Students
      </Link>

      {/* Header card */}
      <div className="cd-card" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0, background: avatarColor(s.full_name), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20 }}>
              {initials(s.full_name)}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.green }}>Application</p>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em", marginTop: 2 }}>{s.full_name}</h1>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                <span style={{ display: "inline-flex", background: appTone.bg, color: appTone.fg, fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 7, textTransform: "capitalize" }}>
                  {app.replace(/_/g, " ")}
                </span>
                <span style={{ display: "inline-flex", background: s.status === "active" ? "rgba(46,168,42,.12)" : "#eef2ec", color: s.status === "active" ? "#1a6b18" : "#4a5a4d", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 7, textTransform: "capitalize" }}>
                  {String(s.status ?? "pending")}
                </span>
                {hasLogin && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(46,168,42,.12)", color: "#1a6b18", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 7 }}>
                    Portal access
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link href={`/admin/students/${id}/edit`} className="cd-btn-ghost" style={{ textDecoration: "none" }}>
            Edit details
          </Link>
        </div>

        {/* Admission decision */}
        {app !== "rejected" && (
          <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 18, paddingTop: 16 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 10 }}>Admission decision</p>
            <AdmissionActions studentId={id} applicationStatus={app} />
          </div>
        )}
      </div>

      {/* Why learn English, prominent */}
      <div className="cd-card" style={{ padding: 22, marginBottom: 18, background: C.greenWash, border: `1px solid ${C.green}` }}>
        <h2 style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.greenDark, marginBottom: 8 }}>Why they want to learn English</h2>
        <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.6, fontWeight: 500 }}>
          {s.why_learn_english ? String(s.why_learn_english) : <span style={{ color: C.muted, fontWeight: 400 }}>Not provided.</span>}
        </p>
      </div>

      {/* Declaration status */}
      <div className="cd-card" style={{ padding: "14px 22px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700,
          background: declarationAgreed ? "rgba(46,168,42,.12)" : "rgba(212,168,67,.16)",
          color: declarationAgreed ? "#1a6b18" : "#9a7822", padding: "4px 12px", borderRadius: 8 }}>
          {declarationAgreed ? "✓ Declaration agreed" : "Declaration not agreed"}
        </span>
        <span style={{ fontSize: 12.5, color: C.muted }}>The applicant confirmed the information is accurate and agreed to the code of conduct.</span>
      </div>

      {/* Portal access */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Portal Access</h3>
        {s.user_id ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Portal access active</p>
                <p className="text-xs text-gray-500">
                  {s.last_invite_sent_at
                    ? `Last invite: ${new Date(String(s.last_invite_sent_at)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                    : "Student has logged in before"}
                </p>
              </div>
            </div>
            <ResendInviteButton studentId={id} lastInviteSentAt={s.last_invite_sent_at ? String(s.last_invite_sent_at) : null} />
          </div>
        ) : s.status === "active" ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">No portal access yet</p>
                <p className="text-xs text-gray-500">
                  {s.last_invite_sent_at
                    ? `Invite sent ${new Date(String(s.last_invite_sent_at)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}, student hasn't accepted yet`
                    : "Send an invite to give this student portal access"}
                </p>
              </div>
            </div>
            <ResendInviteButton studentId={id} lastInviteSentAt={s.last_invite_sent_at ? String(s.last_invite_sent_at) : null} />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Portal access locked</p>
              <p className="text-xs text-gray-500">Activate the student and confirm payment to send a login invite</p>
            </div>
          </div>
        )}
      </div>

      {/* Payment balance */}
      <div className="cd-card" style={{ padding: 22, marginBottom: 18 }}>
        <h2 style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 14 }}>Payment balance</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
          <div>
            <p style={{ fontSize: 11.5, fontWeight: 600, color: C.muted }}>Paid</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: C.ink, marginTop: 2 }}>{fmtXOF(totalPaid)}</p>
          </div>
          <div>
            <p style={{ fontSize: 11.5, fontWeight: 600, color: C.muted }}>Tuition</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: C.ink, marginTop: 2 }}>{fmtXOF(TUITION)}</p>
          </div>
          <div>
            <p style={{ fontSize: 11.5, fontWeight: 600, color: C.muted, marginBottom: 4 }}>Status</p>
            {remaining <= 0 ? (
              <span style={{ display: "inline-flex", background: "rgba(46,168,42,.12)", color: "#1a6b18", fontSize: 13, fontWeight: 700, padding: "5px 12px", borderRadius: 8 }}>Paid in full</span>
            ) : (
              <span style={{ display: "inline-flex", background: "rgba(212,168,67,.16)", color: "#9a7822", fontSize: 13, fontWeight: 700, padding: "5px 12px", borderRadius: 8 }}>{fmtXOF(remaining)} remaining</span>
            )}
          </div>
        </div>
      </div>

      {/* English Level Progress */}
      <div className="cd-card" style={{ padding: 22, marginBottom: 18 }}>
        <h2 style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 16 }}>English Level Progress</h2>
        <ProgressGraph history={assessmentHistory} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
        {/* Registration details */}
        <div className="cd-card" style={{ padding: 22 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 14 }}>Registration details</h2>
          <dl style={{ display: "flex", flexDirection: "column" }}>
            {rows.map((r) => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                <dt style={{ fontSize: 12.5, fontWeight: 600, color: C.muted, flexShrink: 0 }}>{r.label}</dt>
                <dd style={{ fontSize: 13, color: C.ink, textAlign: "right", wordBreak: "break-word" }}>{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Emergency contact / guardian */}
          <div className="cd-card" style={{ padding: 22 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 14 }}>Emergency contact, guardian or parent</h2>
            {!hasGuardian ? (
              <p style={{ fontSize: 13.5, color: C.muted }}>No emergency contact provided.</p>
            ) : (
              <dl style={{ display: "flex", flexDirection: "column" }}>
                {guardianRows.map((r) => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                    <dt style={{ fontSize: 12.5, fontWeight: 600, color: C.muted, flexShrink: 0 }}>{r.label}</dt>
                    <dd style={{ fontSize: 13, color: C.ink, textAlign: "right", wordBreak: "break-word" }}>{r.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Placement attempts */}
          <div className="cd-card" style={{ padding: 22 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 14 }}>English placement attempts</h2>
            {!attempts?.length ? (
              <p style={{ fontSize: 13.5, color: C.muted }}>No test submitted yet.</p>
            ) : (
              <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none" }}>
                {attempts.map((a: { id: string; score: number; max_score: number; time_taken_seconds: number | null; completed_at: string; tests: { title?: string } | { title?: string }[] | null }) => {
                  const title = Array.isArray(a.tests) ? a.tests[0]?.title : (a.tests as { title?: string })?.title;
                  const pct = Math.round((Number(a.score) / (Number(a.max_score) || 1)) * 100);
                  return (
                    <li key={a.id} style={{ background: "#f9fafb", border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{title ?? "Placement test"}</p>
                      <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                        Score: {a.score} / {a.max_score} ({pct}%) · Time: {a.time_taken_seconds ?? "-"}s · {new Date(a.completed_at).toLocaleString()}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Awaiting payment info */}
          {app === "awaiting_payment" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-800">Awaiting payment</p>
              <p className="text-sm text-amber-700 mt-1">
                Ask the student to send payment via Mobile Money to <strong>+229 01 96 19 64 40</strong> (Cedar Training Center). Once received, record it in the Payments tab.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Danger zone, admin only */}
      <div className="cd-card" style={{ padding: 22, marginTop: 18, border: "1px solid #fecaca", background: "#fffafa" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#b91c1c", marginBottom: 6 }}>Danger zone</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 14, maxWidth: 520, lineHeight: 1.6 }}>
          Deleting a student permanently removes their record and all linked payments, attendance, grades and portal login. This action cannot be undone.
        </p>
        <DeleteStudentButton studentId={id} studentName={s.full_name} />
      </div>
    </div>
  );
}
