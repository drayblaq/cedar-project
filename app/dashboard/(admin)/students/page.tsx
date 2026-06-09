import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTuitionAmount } from "@/lib/settings";
import { StudentsTableClient } from "./StudentsTableClient";

const C = { ink: "#16241a", muted: "#687a6c" };

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, first_name, last_name, email, phone, user_id, enrollment_date, status, application_status, last_invite_sent_at, levels(name)")
    .order("full_name");

  const studentIds = (students ?? []).map((s) => s.id);

  // Payment totals per student
  const paymentTotals: Record<string, number> = {};
  if (studentIds.length) {
    const { data: payments } = await supabase
      .from("payments")
      .select("student_id, amount")
      .in("student_id", studentIds);
    for (const p of payments ?? []) {
      paymentTotals[(p as { student_id: string; amount: number }).student_id] =
        (paymentTotals[(p as { student_id: string; amount: number }).student_id] ?? 0) +
        Number((p as { student_id: string; amount: number }).amount);
    }
  }

  // Best placement test score
  const bestTestPct: Record<string, number> = {};
  if (studentIds.length) {
    const { data: attempts } = await supabase
      .from("test_attempts")
      .select("student_id, score, max_score, completed_at")
      .in("student_id", studentIds)
      .order("completed_at", { ascending: false });
    for (const a of attempts ?? []) {
      if (bestTestPct[a.student_id] != null) continue;
      bestTestPct[a.student_id] = Math.round((Number(a.score) / (Number(a.max_score) || 1)) * 100);
    }
  }

  const tuitionAmount = await getTuitionAmount();

  const total = students?.length ?? 0;
  const withLogin = (students ?? []).filter((s) => s.user_id).length;

  return (
    <div style={{ padding: "30px 30px 60px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>Students</h1>
          <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>
            {total} enrolled · {withLogin} with portal access
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/students/import" className="cd-btn-ghost" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Import CSV
          </Link>
          <Link href="/admin/students/new" className="cd-btn-primary" style={{ textDecoration: "none" }}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14 M5 12h14" /></svg>
            Add student
          </Link>
        </div>
      </div>

      <StudentsTableClient
        students={(students ?? []) as Parameters<typeof StudentsTableClient>[0]["students"]}
        bestTestPct={bestTestPct}
        paymentTotals={paymentTotals}
        tuitionAmount={tuitionAmount}
      />
    </div>
  );
}
