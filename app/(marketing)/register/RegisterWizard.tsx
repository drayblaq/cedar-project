"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { submitPublicRegistration } from "./actions";
import { PhoneInputField } from "@/components/PhoneInput";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const TOTAL_STEPS = 7;

const card =
  "rounded-2xl border-[1.5px] border-[var(--mint-deep)] bg-white p-6 shadow-[0_8px_40px_rgba(46,168,42,0.08)] sm:p-8";
const inputClass =
  "mt-1 w-full rounded-xl border-[1.5px] border-[var(--mint-deep)] bg-[var(--mint)] px-4 py-3 text-[var(--text)] transition outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[rgba(46,168,42,0.2)]";
const labelClass =
  "block text-[0.78rem] font-bold uppercase tracking-[0.07em] text-[var(--text-muted)]";
const btnPrimary =
  "inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[var(--green)] px-8 py-3.5 font-extrabold text-white shadow-[0_8px_32px_rgba(46,168,42,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";
const btnPrimaryFont = { fontFamily: "var(--font-syne)" } as React.CSSProperties;
const btnGhost = "text-sm font-medium text-[var(--text-muted)] hover:text-[var(--green-dark)]";
const optionCard =
  "flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] border-[var(--mint-deep)] bg-[var(--mint)] px-4 py-3";

const PROGRAM_META: Record<string, { name: string; level: string }> = {
  "general-english":  { name: "General English",        level: "" },
  "business-english": { name: "Business English",        level: "" },
  "ielts-toefl-toeic":{ name: "IELTS · TOEFL · TOEIC",  level: "ielts-toefl" },
  "workshops":        { name: "Workshops & Intensive",   level: "" },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Benin number in E.164 from the phone input: +229 followed by 8–11 digits.
function isValidBeninPhone(raw: string) {
  const digits = raw.replace(/[\s\-().]/g, "");
  return /^\+?229\d{8,11}$/.test(digits);
}

const EDU_LEVELS = ["high_school", "undergraduate", "graduate", "postgraduate"] as const;
const EDU_LABEL: Record<string, string> = {
  high_school: "highSchool", undergraduate: "undergraduate", graduate: "graduate", postgraduate: "postgraduate",
};
const HEARD = ["social_media", "friends_family", "former_student", "other"] as const;
const HEARD_LABEL: Record<string, string> = {
  social_media: "socialMedia", friends_family: "friendsFamily", former_student: "formerStudent", other: "other",
};

interface Props {
  initialProgram: string | null;
}

export default function RegisterWizard({ initialProgram }: Props) {
  const t = useTranslations("marketing.registerFlow");
  const tp = useTranslations("programs");
  const [step, setStep] = useState<Step>(0);
  const [checklist, setChecklist] = useState<boolean[]>(() => Array(3).fill(false));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placementToken, setPlacementToken] = useState<string | null>(null);

  const programMeta = initialProgram ? PROGRAM_META[initialProgram] ?? null : null;

  const [fields, setFields] = useState({
    why_learn_english: "",
    full_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    resident_address: "",
    guardian_name: "",
    guardian_phone: "",
    guardian_address: "",
    educational_level: "",
    discovery_channel: "",
    discovery_other: "",
    declaration_agreed: false,
    level: programMeta?.level ?? "",
    message: programMeta ? `Interested in: ${programMeta.name}` : "",
  });

  const checklistItems = t.raw("checklistItems") as string[];
  const allChecked = checklist.every(Boolean);

  function set<K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) {
    setFields((f) => ({ ...f, [key]: value }));
  }
  function toggleCheck(i: number) {
    setChecklist((c) => c.map((v, j) => (j === i ? !v : v)));
  }
  function goToStep(next: Step) {
    setError(null);
    setStep(next);
  }

  function advanceFromWhy() {
    if (!fields.why_learn_english.trim()) { setError(t("errors.requiredFields")); return; }
    goToStep(3);
  }
  function advanceFromPersonal() {
    const { full_name, date_of_birth, gender, phone, email, resident_address } = fields;
    if (!full_name.trim() || !date_of_birth || !gender || !phone.trim() || !email.trim() || !resident_address.trim()) {
      setError(t("errors.requiredFields"));
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError(t("errors.invalidEmail"));
      return;
    }
    if (!isValidBeninPhone(phone)) {
      setError(t("errors.invalidPhone"));
      return;
    }
    goToStep(4);
  }
  function advanceFromOther() {
    if (!fields.educational_level || !fields.discovery_channel) { setError(t("errors.requiredFields")); return; }
    if (fields.discovery_channel === "other" && !fields.discovery_other.trim()) { setError(t("errors.requiredFields")); return; }
    if (!fields.declaration_agreed) { setError(t("declarationRequired")); return; }
    goToStep(6);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.declaration_agreed) { setError(t("declarationRequired")); return; }
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.set(k, typeof v === "boolean" ? (v ? "true" : "false") : v));
      const result = await submitPublicRegistration(fd);
      if (result.error) {
        setError(result.error === "DUPLICATE_EMAIL" ? t("errors.duplicateEmail") : result.error);
        return;
      }
      if ("placementToken" in result && result.placementToken) {
        setPlacementToken(result.placementToken);
      }
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  const ErrorBox = () =>
    error ? (
      <div className="rounded-md border border-red-200 bg-red-50 p-4" role="alert">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    ) : null;

  if (placementToken) {
    const testUrl = `/register/placement-test?token=${encodeURIComponent(placementToken)}`;
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div className={`${card} text-center`} style={{ borderColor: "rgba(46,168,42,0.35)", background: "linear-gradient(145deg, var(--mint) 0%, var(--white) 55%)" }}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-extrabold text-white" style={{ background: "var(--green)", fontFamily: "var(--font-syne)" }}>✓</div>
          <h2 className="mt-6 text-2xl font-extrabold text-[var(--green-deep)]" style={{ fontFamily: "var(--font-syne)" }}>{t("successTitle")}</h2>
          <p className="mt-3 text-[var(--text-muted)]">{t("successBody")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={testUrl} className="inline-flex justify-center rounded-xl px-6 py-3 font-bold text-white no-underline" style={{ background: "var(--green)", fontFamily: "var(--font-syne)", boxShadow: "0 8px 28px rgba(46,168,42,0.35)" }}>{t("takeTestNow")}</Link>
            <Link href="/" className="inline-flex justify-center rounded-xl border-[1.5px] border-[var(--mint-deep)] bg-white px-6 py-3 font-semibold text-[var(--green-dark)] no-underline hover:bg-[var(--mint)]">{t("takeTestLater")}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green)]" style={{ fontFamily: "var(--font-syne)" }}>{t("eyebrow")}</p>
        <span className="text-xs font-semibold text-[var(--text-muted)]">{t("stepIndicator", { current: step + 1, total: TOTAL_STEPS })}</span>
      </div>

      {/* Step 0 — Intro */}
      {step === 0 && (
        <div className={`${card} text-center`}>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--green-deep)] sm:text-3xl" style={{ fontFamily: "var(--font-syne)" }}>{t("introTitle")}</h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">{t("introBody")}</p>
          {programMeta && (
            <div className="mx-auto mt-6 max-w-sm rounded-xl border border-[var(--mint-deep)] bg-[var(--mint)] px-4 py-3 text-left">
              <p className="text-sm font-semibold text-[var(--green-dark)]">{tp("preSelected", { program: programMeta.name })}</p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{tp("changeBelow")}</p>
            </div>
          )}
          <button type="button" onClick={() => goToStep(1)} className={`${btnPrimary} mt-10 w-full max-w-xs sm:mx-auto`} style={btnPrimaryFont}>{t("start")}</button>
        </div>
      )}

      {/* Step 1 — Checklist */}
      {step === 1 && (
        <div className={`${card} space-y-4`}>
          <button type="button" onClick={() => goToStep(0)} className={btnGhost}>← {t("back")}</button>
          <h2 className="text-xl font-extrabold text-[var(--green-deep)]" style={{ fontFamily: "var(--font-syne)" }}>{t("checklistTitle")}</h2>
          <p className="text-sm text-[var(--text-muted)]">{t("checklistIntro")}</p>
          <ul className="mt-4 space-y-3">
            {checklistItems.map((text, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border-[1.5px] border-[var(--mint-deep)] bg-[var(--mint)] px-3 py-3 sm:px-4">
                <input type="checkbox" checked={checklist[i]} onChange={() => toggleCheck(i)} className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--mint-deep)] text-[var(--green)] focus:ring-[var(--green)]" />
                <span className="text-sm leading-relaxed text-[var(--green-dark)]">{text}</span>
              </li>
            ))}
          </ul>
          <button type="button" disabled={!allChecked} onClick={() => goToStep(2)} className={`${btnPrimary} mt-6 w-full`} style={btnPrimaryFont}>{t("next")}</button>
        </div>
      )}

      {/* Step 2 — Why learn English */}
      {step === 2 && (
        <div className={`${card} space-y-5`}>
          <button type="button" onClick={() => goToStep(1)} className={btnGhost}>← {t("back")}</button>
          <h2 className="text-xl font-extrabold text-[var(--green-deep)]" style={{ fontFamily: "var(--font-syne)" }}>{t("whyLearn")}</h2>
          <div>
            <label className={labelClass}>{t("whyLearn")} *</label>
            <textarea rows={5} className={inputClass} value={fields.why_learn_english} placeholder={t("whyLearnPlaceholder")} onChange={(e) => set("why_learn_english", e.target.value)} />
          </div>
          <ErrorBox />
          <button type="button" onClick={advanceFromWhy} className={`${btnPrimary} w-full`} style={btnPrimaryFont}>{t("next")}</button>
        </div>
      )}

      {/* Step 3 — Personal Information */}
      {step === 3 && (
        <div className={`${card} space-y-5`}>
          <button type="button" onClick={() => goToStep(2)} className={btnGhost}>← {t("back")}</button>
          <h2 className="text-xl font-extrabold text-[var(--green-deep)]" style={{ fontFamily: "var(--font-syne)" }}>{t("personalTitle")}</h2>
          <div>
            <label className={labelClass}>{t("fullName")} *</label>
            <input className={inputClass} value={fields.full_name} onChange={(e) => set("full_name", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{t("dateOfBirth")} *</label>
              <input type="date" className={inputClass} value={fields.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} />
            </div>
            <div>
              <span className={labelClass}>{t("gender.label")} *</span>
              <div className="mt-2 flex gap-3">
                {(["male", "female"] as const).map((g) => (
                  <label key={g} className={`${optionCard} flex-1`}>
                    <input type="radio" name="gender" value={g} checked={fields.gender === g} onChange={() => set("gender", g)} className="text-[var(--green)] focus:ring-[var(--green)]" />
                    <span className="text-sm text-[var(--green-dark)]">{t(`gender.${g}`)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>{t("guardianPhone")} *</label>
            <PhoneInputField name="phone" value={fields.phone} onChange={(v) => set("phone", v)} placeholder="01 11 22 33 44" />
          </div>
          <div>
            <label className={labelClass}>{t("email")} *</label>
            <input type="email" inputMode="email" className={inputClass} value={fields.email} placeholder="name@gmail.com" onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{t("residentAddress")} *</label>
            <input className={inputClass} value={fields.resident_address} onChange={(e) => set("resident_address", e.target.value)} />
          </div>
          <ErrorBox />
          <button type="button" onClick={advanceFromPersonal} className={`${btnPrimary} w-full`} style={btnPrimaryFont}>{t("next")}</button>
        </div>
      )}

      {/* Step 4 — Emergency contact (optional) */}
      {step === 4 && (
        <div className={`${card} space-y-5`}>
          <button type="button" onClick={() => goToStep(3)} className={btnGhost}>← {t("back")}</button>
          <h2 className="text-xl font-extrabold text-[var(--green-deep)]" style={{ fontFamily: "var(--font-syne)" }}>
            {t("emergencyContact")} <span className="text-sm font-medium text-[var(--text-muted)]">{t("optional")}</span>
          </h2>
          <div>
            <label className={labelClass}>{t("guardianName")}</label>
            <input className={inputClass} value={fields.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{t("guardianPhone")}</label>
            <PhoneInputField name="guardian_phone" value={fields.guardian_phone} onChange={(v) => set("guardian_phone", v)} placeholder="01 11 22 33 44" />
          </div>
          <div>
            <label className={labelClass}>{t("guardianAddress")}</label>
            <input className={inputClass} value={fields.guardian_address} onChange={(e) => set("guardian_address", e.target.value)} />
          </div>
          <button type="button" onClick={() => goToStep(5)} className={`${btnPrimary} w-full`} style={btnPrimaryFont}>{t("next")}</button>
        </div>
      )}

      {/* Step 5 — Other information */}
      {step === 5 && (
        <div className={`${card} space-y-6`}>
          <button type="button" onClick={() => goToStep(4)} className={btnGhost}>← {t("back")}</button>
          <h2 className="text-xl font-extrabold text-[var(--green-deep)]" style={{ fontFamily: "var(--font-syne)" }}>{t("otherInfoTitle")}</h2>

          {/* Educational level */}
          <div>
            <span className={labelClass}>{t("educationalLevel")} *</span>
            <div className="mt-2 space-y-2">
              {EDU_LEVELS.map((e) => (
                <label key={e} className={optionCard}>
                  <input type="checkbox" checked={fields.educational_level === e} onChange={() => set("educational_level", fields.educational_level === e ? "" : e)} className="h-4 w-4 rounded text-[var(--green)] focus:ring-[var(--green)]" />
                  <span className="text-sm text-[var(--green-dark)]">{t(EDU_LABEL[e])}</span>
                </label>
              ))}
            </div>
          </div>

          {/* How heard */}
          <div>
            <span className={labelClass}>{t("howHeard")} *</span>
            <div className="mt-2 space-y-2">
              {HEARD.map((h) => (
                <label key={h} className={optionCard}>
                  <input type="checkbox" checked={fields.discovery_channel === h} onChange={() => set("discovery_channel", fields.discovery_channel === h ? "" : h)} className="h-4 w-4 rounded text-[var(--green)] focus:ring-[var(--green)]" />
                  <span className="text-sm text-[var(--green-dark)]">{t(HEARD_LABEL[h])}</span>
                </label>
              ))}
              {fields.discovery_channel === "other" && (
                <input className={inputClass} value={fields.discovery_other} placeholder={t("otherSpecify")} onChange={(e) => set("discovery_other", e.target.value)} />
              )}
            </div>
          </div>

          {/* Declaration */}
          <label className="flex items-start gap-3 rounded-xl border-[1.5px] border-[var(--mint-deep)] bg-[var(--mint)] px-4 py-3">
            <input type="checkbox" checked={fields.declaration_agreed} onChange={(e) => set("declaration_agreed", e.target.checked)} className="mt-1 h-4 w-4 shrink-0 rounded text-[var(--green)] focus:ring-[var(--green)]" />
            <span className="text-sm leading-relaxed text-[var(--green-dark)]">{t("declaration")} *</span>
          </label>

          <ErrorBox />
          <button type="button" onClick={advanceFromOther} className={`${btnPrimary} w-full`} style={btnPrimaryFont}>{t("next")}</button>
        </div>
      )}

      {/* Step 6 — Program + level + submit */}
      {step === 6 && (
        <form onSubmit={handleSubmit} className={`${card} space-y-5`}>
          <button type="button" onClick={() => goToStep(5)} className={btnGhost}>← {t("back")}</button>
          <h2 className="text-xl font-extrabold text-[var(--green-deep)]" style={{ fontFamily: "var(--font-syne)" }}>{t("programTitle")}</h2>

          {programMeta && (
            <div className="rounded-xl border border-[var(--mint-deep)] bg-[var(--mint)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--green-dark)]">{tp("preSelected", { program: programMeta.name })}</p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{tp("changeBelow")}</p>
            </div>
          )}

          <div>
            <label className={labelClass}>{t("preferredLevel")}</label>
            <select className={inputClass} value={fields.level} onChange={(e) => set("level", e.target.value)}>
              <option value="">{t("levelPlaceholder")}</option>
              <option value="beginner">{t("levels.beginner")}</option>
              <option value="elementary">{t("levels.elementary")}</option>
              <option value="pre-intermediate">{t("levels.preIntermediate")}</option>
              <option value="intermediate">{t("levels.intermediate")}</option>
              <option value="upper-intermediate">{t("levels.upperIntermediate")}</option>
              <option value="advanced">{t("levels.advanced")}</option>
              <option value="ielts-toefl">{t("levels.toefl")}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("message")}</label>
            <textarea rows={3} className={inputClass} value={fields.message} onChange={(e) => set("message", e.target.value)} />
          </div>
          <p className="text-xs text-[var(--text-muted)]">{t("securityNote")}</p>
          <ErrorBox />
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full`} style={btnPrimaryFont}>{loading ? t("submitting") : t("submit")}</button>
        </form>
      )}
    </div>
  );
}
