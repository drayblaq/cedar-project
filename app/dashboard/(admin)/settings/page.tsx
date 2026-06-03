import { getAllSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

const C = { ink: "#16241a", muted: "#687a6c" };

export default async function SettingsPage() {
  const settings = await getAllSettings();

  return (
    <div style={{ padding: "30px 30px 60px" }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>Settings</h1>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>
          Manage centre-wide configuration. These values are used across payments, receipts and the public site.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
