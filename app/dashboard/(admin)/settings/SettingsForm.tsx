"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "@/app/dashboard/actions/index";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a" };

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#f9fafb",
  border: "1px solid #e5e7eb", borderRadius: 8,
  padding: "9px 12px", fontSize: 13.5, color: C.ink,
  outline: "none", fontFamily: "inherit",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 18, marginTop: 8 }}>
      <p style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted }}>
        {children}
      </p>
    </div>
  );
}

function Field({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue: string; type?: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} style={inputStyle} />
    </div>
  );
}

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setMsg(null);
    startTransition(async () => {
      const res = await updateSettings(fd);
      if (res?.error) {
        setMsg({ type: "err", text: res.error });
      } else {
        setMsg({ type: "ok", text: "Settings saved." });
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 760 }}>
      <div className="cd-card" style={{ padding: 28 }}>
        <SectionTitle>Financial Settings</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
          <Field name="tuition_amount" label="Tuition fee (XOF)" defaultValue={settings.tuition_amount ?? "50000"} type="number" />
          <Field name="currency" label="Currency" defaultValue={settings.currency ?? "FCFA"} />
        </div>

        <SectionTitle>Center Information</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
          <Field name="center_name" label="Center name" defaultValue={settings.center_name ?? ""} />
          <Field name="center_phone" label="Phone number" defaultValue={settings.center_phone ?? ""} />
          <Field name="center_email" label="Email address" defaultValue={settings.center_email ?? ""} type="email" />
          <Field name="center_address" label="Address" defaultValue={settings.center_address ?? ""} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
          <button type="submit" disabled={pending} className="cd-btn-primary" style={{ justifyContent: "center" }}>
            {pending ? "Saving…" : "Save all settings"}
          </button>
          {msg && (
            <span style={{ fontSize: 13, fontWeight: 600, color: msg.type === "ok" ? C.green : "#b3402f" }}>
              {msg.type === "ok" ? "✓ " : ""}{msg.text}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
