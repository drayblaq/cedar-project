"use client";

import { useState } from "react";
import Papa from "papaparse";
import Link from "next/link";
import { importStudents, type ParsedStudent, type ImportResult } from "@/app/dashboard/actions/import";

const C = { ink: "#16241a", muted: "#687a6c", border: "#e6ece4", green: "#2ea82a", greenWash: "#eef6ec", greenDark: "#1a6b18" };

function parseDateOfBirth(raw: string): string {
  if (!raw) return "";
  const cleaned = raw.trim();
  // Try DD/MM/YYYY first (most common in Benin)
  const ddmmyyyy = cleaned.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, "0")}-${ddmmyyyy[1].padStart(2, "0")}`;
  try {
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  } catch { /* ignore */ }
  return "";
}

// Map by column index (0-based) to avoid duplicate-header ambiguity.
// Google Sheet column order:
// 0:Timestamp 1:Full name(student) 2:Why learn English 3:Date of Birth
// 4:Gender    5:Phone(student)     6:Email             7:Address(student)
// 8:Full name(guardian) 9:Phone(guardian) 10:Address(guardian)
// 11:Educational level  12:How heard  13:Declaration
function mapRowToStudent(row: string[]): ParsedStudent {
  const col = (i: number) => (row[i] ?? "").trim();
  const genderRaw = col(4).toLowerCase();
  return {
    full_name: col(1),
    why_learn_english: col(2),
    date_of_birth: parseDateOfBirth(col(3)),
    gender: genderRaw === "female" ? "female" : genderRaw === "male" ? "male" : null,
    phone: col(5),
    email: col(6).toLowerCase(),
    resident_address: col(7),
    guardian_name: col(8),
    guardian_phone: col(9),
    guardian_address: col(10),
    educational_level: col(11),
    discovery_channel: col(12),
    declaration_agreed: col(13).toLowerCase().includes("yes"),
  };
}

export default function ImportStudentsPage() {
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [rows, setRows] = useState<ParsedStudent[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<ImportResult[]>([]);
  const [fileName, setFileName] = useState("");

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    Papa.parse<string[]>(file, {
      header: false,
      skipEmptyLines: true,
      complete: (res) => {
        // Skip row 0 (the header row)
        const dataRows = res.data.slice(1);
        const parsed = dataRows.map(mapRowToStudent);
        setRows(parsed);
        setSelected(new Set(parsed.map((_, i) => i)));
        setStep("preview");
      },
    });
  }

  function toggleRow(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => prev.size === rows.length ? new Set() : new Set(rows.map((_, i) => i)));
  }

  async function handleImport() {
    setStep("importing");
    const toImport = rows.filter((_, i) => selected.has(i));
    const res = await importStudents(toImport);
    setResults(res);
    setStep("done");
  }

  const created = results.filter((r) => r.status === "created").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const errors  = results.filter((r) => r.status === "error").length;

  return (
    <div style={{ padding: "30px 30px 60px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/students" style={{ fontSize: 13, color: C.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          ← Students
        </Link>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink }}>Import Students from CSV</h1>
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>
          Export your Google Sheet as CSV and upload it here to bulk-create student records.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, alignItems: "center" }}>
        {(["upload", "preview", "done"] as const).map((s, idx) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800,
              background: step === s || (step === "importing" && s === "preview") ? C.green : step === "done" && s !== "done" ? C.greenWash : "#f1f5ee",
              color: step === s || (step === "importing" && s === "preview") ? "#fff" : step === "done" && s !== "done" ? C.greenDark : C.muted,
            }}>{idx + 1}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: step === s ? C.ink : C.muted, textTransform: "capitalize" }}>
              {s === "upload" ? "Upload" : s === "preview" ? "Preview" : "Done"}
            </span>
            {idx < 2 && <span style={{ color: C.border, margin: "0 4px" }}>→</span>}
          </div>
        ))}
      </div>

      {/* ── STEP: UPLOAD ── */}
      {step === "upload" && (
        <div className="cd-card" style={{ padding: 0 }}>
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.greenWash, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Upload your CSV file</p>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Export from Google Sheets: File → Download → CSV</p>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" style={{ display: "none" }} />
            <label htmlFor="csv-upload" style={{ cursor: "pointer", display: "inline-block" }}>
              <span className="cd-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Choose CSV file
              </span>
            </label>
            <p style={{ fontSize: 11.5, color: C.muted, marginTop: 16 }}>
              Expected columns: Full name, Email address, Phone number, Date of Birth, Gender, and more
            </p>
          </div>
        </div>
      )}

      {/* ── STEP: PREVIEW ── */}
      {(step === "preview" || step === "importing") && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{rows.length} students parsed</span>
              <span style={{ fontSize: 13, color: C.muted, marginLeft: 8 }}>from {fileName}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep("upload")} className="cd-btn-ghost" style={{ fontSize: 13 }}>← Back</button>
              <button
                onClick={handleImport}
                disabled={selected.size === 0 || step === "importing"}
                className="cd-btn-primary"
                style={{ fontSize: 13, opacity: selected.size === 0 ? 0.5 : 1 }}
              >
                {step === "importing" ? "Importing…" : `Import ${selected.size} student${selected.size !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>

          <div className="cd-card" style={{ padding: 0 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 640 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "center", width: 40 }}>
                      <input type="checkbox" checked={selected.size === rows.length} onChange={toggleAll} style={{ cursor: "pointer" }} />
                    </th>
                    {["Name", "Email", "Phone", "Gender", "Status"].map((h, i) => (
                      <th key={h} style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, textAlign: i >= 4 ? "center" : "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const warn = !r.email;
                    const isSelected = selected.has(i);
                    return (
                      <tr key={i} className="cd-trow" style={{ opacity: isSelected ? 1 : 0.45 }}>
                        <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleRow(i)} style={{ cursor: "pointer" }} />
                        </td>
                        <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 600, color: C.ink }}>{r.full_name || <span style={{ color: C.muted }}>-</span>}</td>
                        <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: warn ? "#b3402f" : C.muted }}>{r.email || "⚠ missing"}</td>
                        <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: C.muted }}>{r.phone || "-"}</td>
                        <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: C.muted, textTransform: "capitalize" }}>{r.gender ?? "-"}</td>
                        <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>
                          {warn ? (
                            <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(201,74,58,.1)", color: "#b3402f", padding: "3px 8px", borderRadius: 6 }}>No email</span>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 700, background: C.greenWash, color: C.greenDark, padding: "3px 8px", borderRadius: 6 }}>Ready</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p style={{ fontSize: 12.5, color: C.muted, marginTop: 10, background: "#f4f7f2", padding: "8px 14px", borderRadius: 8 }}>
            ℹ Students whose email already exists in the database will be skipped. To re-import, delete the existing records first.
          </p>
          {rows.some((r) => !r.email) && (
            <p style={{ fontSize: 12.5, color: "#9a7822", marginTop: 8, background: "rgba(212,168,67,.1)", padding: "8px 14px", borderRadius: 8 }}>
              ⚠ Rows without an email address will be imported without portal access and cannot receive a login invite.
            </p>
          )}
        </div>
      )}

      {/* ── STEP: DONE ── */}
      {step === "done" && (
        <div>
          <div className="cd-card" style={{ padding: 32, marginBottom: 18, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.greenWash, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.ink, marginBottom: 16 }}>Import complete!</h2>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.greenDark }}>{created}</div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>students created</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#9a7822" }}>{skipped}</div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>skipped</div>
              </div>
              {errors > 0 && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#b3402f" }}>{errors}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>errors</div>
                </div>
              )}
            </div>
            <Link href="/admin/students" className="cd-btn-primary" style={{ textDecoration: "none", display: "inline-flex" }}>
              View all students →
            </Link>
          </div>

          <div className="cd-card" style={{ padding: 0 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 480 }}>
                <thead>
                  <tr>
                    {["Name", "Result", "Detail"].map((h, i) => (
                      <th key={h} style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, textAlign: i === 1 ? "center" : "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="cd-trow">
                      <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontWeight: 600, color: C.ink }}>{r.name}</td>
                      <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, textAlign: "center" }}>
                        {r.status === "created" && <span style={{ fontSize: 11, fontWeight: 700, background: C.greenWash, color: C.greenDark, padding: "3px 8px", borderRadius: 6 }}>✓ Created</span>}
                        {r.status === "skipped" && <span style={{ fontSize: 11, fontWeight: 700, background: "#eef2ec", color: "#4a5a4d", padding: "3px 8px", borderRadius: 6 }}>Skipped</span>}
                        {r.status === "error"   && <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(201,74,58,.1)", color: "#b3402f", padding: "3px 8px", borderRadius: 6 }}>Error</span>}
                      </td>
                      <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, fontSize: 12.5, color: C.muted }}>{r.reason ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
