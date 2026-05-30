"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { submitPublicRegistration } from "./actions";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

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

// Map a program slug to the display name and the level dropdown pre-selection
const PROGRAM_META: Record<string, { name: string; level: string }> = {
  "general-english":  { name: "General English",           level: "" },
  "business-english": { name: "Business English",           level: "" },
  "ielts-toefl-toeic":{ name: "IELTS · TOEFL · TOEIC",     level: "ielts-toefl" },
  "workshops":        { name: "Workshops & Intensive",      level: "" },
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
    first_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    nationality: "",
    email: "",
    whatsapp: "",
    address_line: "",
    country: "",
    city: "",
    education_level: "",
    parent_whatsapp: "",
    parent_email: "",
    discovery_channel: "",
    level: programMeta?.level ?? "",
    message: programMeta ? `Interested in: ${programMeta.name}` : "",
  });

  const checklistItems = t.raw("checklistItems") as string[];

  function toggleCheck(i: number) {
    setChecklist((c) => c.map((v, j) => (j === i ? !v : v)));
  }

  const allChecked = checklist.every(Boolean);

  function goToStep(next: Step) {
    setError(null);
    setStep(next);
  }

  function advanceFromPersonal() {
    const { first_name, last_name, gender, date_of_birth, nationality } = fields;
    if (!first_name.trim() || !last_name.trim() || !gender || !date_of_birth || !nationality.trim()) {
      setError(t("errors.requiredPersonal"));
      return;
    }
    goToStep(3);
  }

  function advanceFromContact() {
    const { email, whatsapp, address_line, country, city } = fields;
    if (!email.trim() || !whatsapp.trim() || !address_line.trim() || !country.trim() || !city.trim()) {
      setError(t("errors.requiredContact"));
      return;
    }
    goToStep(4);
  }

  function advanceFromAcademic() {
    if (!fields.education_level.trim()) {
      setError(t("errors.requiredAcademic"));
      return;
    }
    goToStep(5);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { parent_whatsapp, parent_email, discovery_channel } = fields;
    if (!parent_whatsapp.trim() || !parent_email.trim() || !discovery_channel) {
      setError(t("errors.requiredParent"));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.set(k, v));
      const result = await submitPublicRegistration(fd);
      if (result.error) {
        setError(
          result.error === "DUPLICATE_EMAIL"
            ? t("errors.duplicateEmail")
            : result.error
        );
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

  if (placementToken) {
    const testUrl = `/register/placement-test?token=${encodeURIComponent(placementToken)}`;
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div
          className={`${card} text-center`}
          style={{ borderColor: "rgba(46,168,42,0.35)", background: "linear-gradient(145deg, var(--mint) 0%, var(--white) 55%)" }}
        >
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-extrabold text-white"
            style={{ background: "var(--green)", fontFamily: "var(--font-syne)" }}
          >
            ✓
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-[var(--green-deep)]" style={{ fontFamily: "var(--font-syne)" }}>
            {t("successTitle")}
          </h2>
          <p className="mt-3 text-[var(--text-muted)]">{t("successBody")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={testUrl}
              className="inline-flex justify-center rounded-xl px-6 py-3 font-bold text-white no-underline"
              style={{ background: "var(--green)", fontFamily: "var(--font-syne)", boxShadow: "0 8px 28px rgba(46,168,42,0.35)" }}
            >
              {t("takeTestNow")}
            </Link>
            <Link
              href="/"
              className="inline-flex justify-center rounded-xl border-[1.5px] border-[var(--mint-deep)] bg-white px-6 py-3 font-semibold text-[var(--green-dark)] no-underline hover:bg-[var(--mint)]"
            >
              {t("takeTestLater")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green)]" style={{ fontFamily: "var(--font-syne)" }}>
          {t("eyebrow")}
        </p>
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          {t("stepIndicator", { current: step + 1, total: 6 })}
        </span>
      </div>

      {step === 0 && (
        <div className={`${card} text-center`}>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--green-deep)] sm:text-3xl" style={{ fontFamily: "var(--font-syne)" }}>
            {t("introTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">{t("introBody")}</p>

          {/* Pre-selected program banner */}
          {programMeta && (
            <div className="mx-auto mt-6 max-w-sm rounded-xl border border-[var(--mint-deep)] bg-[var(--mint)] px-4 py-3 text-left">
              <p className="text-sm font-semibold text-[var(--green-dark)]">
                {tp("preSelected", { program: programMeta.name })}
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{tp("changeBelow")}</p>
            </div>
          )}

          <button type="button" onClick={() => goToStep(1)} className={`${btnPrimary} mt-10 w-full max-w-xs sm:mx-auto`} style={btnPrimaryFont}>
            {t("start")}
          </button>
        </div>
      )}

      {step === 1 && (
        <div className={`${card} space-y-4`}>
          <button type="button" onClick={() => goToStep(0)} className={btnGhost}>
            ← {t("back")}
          </button>
          <h2 className="text-xl font-extrabold text-[var(--green-deep)]" style={{ fontFamily: "var(--font-syne)" }}>
            {t("checklistTitle")}
          </h2>
          <p className="text-sm text-[var(--text-muted)]">{t("checklistIntro")}</p>
          <ul className="mt-4 space-y-3">
            {checklistItems.map((text, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border-[1.5px] border-[var(--mint-deep)] bg-[var(--mint)] px-3 py-3 sm:px-4"
              >
                <input
                  type="checkbox"
                  checked={checklist[i]}
                  onChange={() => toggleCheck(i)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--mint-deep)] text-[var(--green)] focus:ring-[var(--green)]"
                />
                <span className="text-sm leading-relaxed text-[var(--green-dark)]">{text}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!allChecked}
            onClick={() => goToStep(2)}
            className={`${btnPrimary} mt-6 w-full`}
            style={btnPrimaryFont}
          >
            {t("next")}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className={`${card} space-y-5`}>
          <button type="button" onClick={() => goToStep(1)} className={btnGhost}>
            ← {t("back")}
          </button>
          <h2 className="text-xl font-extrabold text-[var(--green-deep)]" style={{ fontFamily: "var(--font-syne)" }}>
            {t("personalTitle")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{t("firstName")} *</label>
              <input
                className={inputClass}
                value={fields.first_name}
                onChange={(e) => setFields((f) => ({ ...f, first_name: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>{t("lastName")} *</label>
              <input
                className={inputClass}
                value={fields.last_name}
                onChange={(e) => setFields((f) => ({ ...f, last_name: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <span className={labelClass}>{t("gender.label")} *</span>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {(["male", "female", "other"] as const).map((g) => (
                <label
                  key={g}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border-[1.5px] border-[var(--mint-deep)] bg-[var(--mint)] px-4 py-3 sm:flex-1"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={fields.gender === g}
                    onChange={() => setFields((f) => ({ ...f, gender: g }))}
                    className="text-[var(--green)] focus:ring-[var(--green)]"
                  />
                  <span className="text-sm text-[var(--green-dark)]">{t(`gender.${g}`)}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>{t("dob")} *</label>
            <input
              type="date"
              className={inputClass}
              value={fields.date_of_birth}
              onChange={(e) => setFields((f) => ({ ...f, date_of_birth: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>{t("nationality")} *</label>
            <input
              className={inputClass}
              value={fields.nationality}
              onChange={(e) => setFields((f) => ({ ...f, nationality: e.target.value }))}
            />
          </div>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4" role="alert">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <button type="button" onClick={advanceFromPersonal} className={`${btnPrimary} w-full`} style={btnPrimaryFont}>
            {t("next")}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className={`${card} space-y-5`}>
          <button type="button" onClick={() => goToStep(2)} className={btnGhost}>
            ← {t("back")}
          </button>
          <h2 className="text-xl font-extrabold text-[var(--green-deep)]" style={{ fontFamily: "var(--font-syne)" }}>
            {t("contactTitle")}
          </h2>
          <div>
            <label className={labelClass}>{t("email")} *</label>
            <input
              type="email"
              className={inputClass}
              value={fields.email}
              onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>{t("whatsapp")} *</label>
            <input
              type="tel"
              className={inputClass}
              value={fields.whatsapp}
              onChange={(e) => setFields((f) => ({ ...f, whatsapp: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>{t("address")} *</label>
            <input
              className={inputClass}
              value={fields.address_line}
              onChange={(e) => setFields((f) => ({ ...f, address_line: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{t("country")} *</label>
              <input
                className={inputClass}
                value={fields.country}
                onChange={(e) => setFields((f) => ({ ...f, country: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>{t("city")} *</label>
              <input
                className={inputClass}
                value={fields.city}
                onChange={(e) => setFields((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
          </div>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4" role="alert">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <button type="button" onClick={advanceFromContact} className={`${btnPrimary} w-full`} style={btnPrimaryFont}>
            {t("next")}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className={`${card} space-y-5`}>
          <button type="button" onClick={() => goToStep(3)} className={btnGhost}>
            ← {t("back")}
          </button>
          <h2 className="text-xl font-extrabold text-[var(--green-deep)]" style={{ fontFamily: "var(--font-syne)" }}>
            {t("academicTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">{t("educationLevelIntro")}</p>
          <div>
            <label className={labelClass}>{t("educationLevelLabel")} *</label>
            <textarea
              rows={4}
              className={inputClass}
              value={fields.education_level}
              onChange={(e) => setFields((f) => ({ ...f, education_level: e.target.value }))}
              placeholder={t("educationLevelPlaceholder")}
            />
          </div>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4" role="alert">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <button type="button" onClick={advanceFromAcademic} className={`${btnPrimary} w-full`} style={btnPrimaryFont}>
            {t("next")}
          </button>
        </div>
      )}

      {step === 5 && (
        <form onSubmit={handleSubmit} className={`${card} space-y-5`}>
          <button type="button" onClick={() => goToStep(4)} className={btnGhost}>
            ← {t("back")}
          </button>
          <h2 className="text-xl font-extrabold text-[var(--green-deep)]" style={{ fontFamily: "var(--font-syne)" }}>
            {t("parentTitle")}
          </h2>

          {/* Pre-selected program reminder */}
          {programMeta && (
            <div className="rounded-xl border border-[var(--mint-deep)] bg-[var(--mint)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--green-dark)]">
                {tp("preSelected", { program: programMeta.name })}
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{tp("changeBelow")}</p>
            </div>
          )}

          <div>
            <label className={labelClass}>{t("parentWhatsapp")} *</label>
            <input
              type="tel"
              className={inputClass}
              value={fields.parent_whatsapp}
              onChange={(e) => setFields((f) => ({ ...f, parent_whatsapp: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>{t("parentEmail")} *</label>
            <input
              type="email"
              className={inputClass}
              value={fields.parent_email}
              onChange={(e) => setFields((f) => ({ ...f, parent_email: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>{t("discovery.label")} *</label>
            <select
              className={inputClass}
              value={fields.discovery_channel}
              onChange={(e) => setFields((f) => ({ ...f, discovery_channel: e.target.value }))}
            >
              <option value="">{t("discovery.placeholder")}</option>
              <option value="social_media">{t("discovery.social_media")}</option>
              <option value="friend_family">{t("discovery.friend_family")}</option>
              <option value="search_engine">{t("discovery.search_engine")}</option>
              <option value="school_partner">{t("discovery.school_partner")}</option>
              <option value="advertisement">{t("discovery.advertisement")}</option>
              <option value="other">{t("discovery.other")}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("preferredLevel")}</label>
            <select
              className={inputClass}
              value={fields.level}
              onChange={(e) => setFields((f) => ({ ...f, level: e.target.value }))}
            >
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
            <textarea
              rows={3}
              className={inputClass}
              value={fields.message}
              onChange={(e) => setFields((f) => ({ ...f, message: e.target.value }))}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)]">{t("securityNote")}</p>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4" role="alert">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`${btnPrimary} w-full`}
            style={btnPrimaryFont}
          >
            {loading ? t("submitting") : t("submit")}
          </button>
        </form>
      )}
    </div>
  );
}
