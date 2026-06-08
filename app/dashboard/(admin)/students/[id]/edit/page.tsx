import { createClient } from "@/lib/supabase/server";
import { updateStudent } from "@/app/dashboard/actions/index";
import { PhoneInputField } from "@/components/PhoneInput";
import Link from "next/link";
import { notFound } from "next/navigation";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec" };

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#f9fafb",
  border: "1px solid #e5e7eb", borderRadius: 8,
  padding: "9px 12px", fontSize: 13.5, color: C.ink,
  outline: "none", fontFamily: "inherit",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5,
};

function Required() {
  return <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 18, marginTop: 8 }}>
      <p style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted }}>
        {children}
      </p>
    </div>
  );
}

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, email, phone, whatsapp, level_id, enrollment_date, notes, status, application_status, date_of_birth, gender, nationality, discovery_channel, parent_whatsapp, parent_email")
    .eq("id", id)
    .single();

  if (!student) notFound();

  const { data: levels } = await supabase.from("levels").select("id, name").order("sort_order");
  const s = student as Record<string, string | null>;

  return (
    <div style={{ padding: "30px 30px 60px" }}>
      <Link href="/admin/students"
        style={{ fontSize: 13, color: C.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
        ← Students
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink, marginBottom: 6 }}>Edit student</h1>
      <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 24 }}>{student.full_name}</p>

      <form action={updateStudent.bind(null, id) as unknown as (fd: FormData) => Promise<void>}
        style={{ maxWidth: 760 }}>
        <div className="cd-card" style={{ padding: 28 }}>

          {/* ── Section 1: Personal ── */}
          <SectionTitle>Personal Information</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Full name<Required /></label>
              <input name="full_name" required defaultValue={student.full_name ?? ""} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email<Required /></label>
              <input name="email" type="email" required defaultValue={student.email ?? ""} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone / WhatsApp<Required /></label>
              <PhoneInputField name="phone" required value={student.phone ?? s.whatsapp ?? ""} placeholder="01 11 22 33 44" />
            </div>
            <div>
              <label style={labelStyle}>Date of birth</label>
              <input name="dob" type="date" defaultValue={s.date_of_birth ?? ""} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Gender</label>
              <select name="gender" defaultValue={s.gender ?? ""} style={inputStyle}>
                <option value="">— Select —</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Nationality</label>
              <input name="nationality" defaultValue={s.nationality ?? ""} placeholder="e.g. Beninese" style={inputStyle} />
            </div>
          </div>

          {/* ── Section 2: Academic ── */}
          <SectionTitle>Academic</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Level</label>
              <select name="level_id" defaultValue={student.level_id ?? ""} style={inputStyle}>
                <option value="">— Select level —</option>
                {(levels ?? []).map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Enrollment date</label>
              <input name="enrollment_date" type="date" defaultValue={student.enrollment_date ?? ""} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>How did they hear about us?</label>
              <select name="discovery" defaultValue={s.discovery_channel ?? ""} style={inputStyle}>
                <option value="">— Select —</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="friend">Friend / Referral</option>
                <option value="walk_in">Walk-in</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* ── Section 3: Status & Access ── */}
          <SectionTitle>Status &amp; Access</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Application status</label>
              <select name="application_status" defaultValue={s.application_status ?? "submitted"} style={inputStyle}>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Student status</label>
              <select name="status" defaultValue={student.status ?? "active"} style={inputStyle}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Notes</label>
              <textarea name="notes" rows={3} defaultValue={student.notes ?? ""} placeholder="Any additional notes…" style={{ ...inputStyle, resize: "vertical" }} />
            </div>
          </div>

          {/* ── Section 4: Parent / Guardian ── */}
          <SectionTitle>Parent / Guardian (optional)</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
            <div>
              <label style={labelStyle}>Parent phone / WhatsApp</label>
              <PhoneInputField name="parent_phone" value={s.parent_whatsapp ?? ""} placeholder="01 11 22 33 44" />
            </div>
            <div>
              <label style={labelStyle}>Parent email</label>
              <input name="parent_email" type="email" defaultValue={s.parent_email ?? ""} placeholder="parent@example.com" style={inputStyle} />
            </div>
          </div>

          {/* ── Actions ── */}
          <div style={{ display: "flex", gap: 12, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
            <button type="submit" className="cd-btn-primary" style={{ flex: 1, justifyContent: "center" }}>
              Save changes
            </button>
            <Link href="/admin/students" className="cd-btn-ghost" style={{ textDecoration: "none" }}>
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
