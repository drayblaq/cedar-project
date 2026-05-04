"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { submitPublicRegistration } from "./actions";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

export default function RegisterWizard() {
  const t = useTranslations("marketing.registerFlow");
  const [step, setStep] = useState<Step>(0);
  const [checklist, setChecklist] = useState<boolean[]>(() => Array(8).fill(false));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placementToken, setPlacementToken] = useState<string | null>(null);

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
    bac_year: "",
    bac_series: "",
    previous_school: "",
    parent_whatsapp: "",
    parent_email: "",
    discovery_channel: "",
    level: "",
    message: "",
  });

  const checklistItems = t.raw("checklistItems") as string[];

  function toggleCheck(i: number) {
    setChecklist((c) => c.map((v, j) => (j === i ? !v : v)));
  }

  const allChecked = checklist.every(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.set(k, v));
    const result = await submitPublicRegistration(fd);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if ("placementToken" in result && result.placementToken) {
      setPlacementToken(result.placementToken);
    }
  }

  if (placementToken) {
    const testUrl = `/register/placement-test?token=${encodeURIComponent(placementToken)}`;
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white">
            ✓
          </div>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">{t("successTitle")}</h2>
          <p className="mt-3 text-slate-600">{t("successBody")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={testUrl}
              className="inline-flex justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg"
            >
              {t("takeTestNow")}
            </Link>
            <Link href="/" className="inline-flex justify-center rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50">
              {t("takeTestLater")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const input =
    "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
  const label = "block text-sm font-medium text-slate-700";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">{t("eyebrow")}</p>
        <span className="text-xs font-medium text-slate-500">
          {t("stepIndicator", { current: step + 1, total: 6 })}
        </span>
      </div>

      {step === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("introTitle")}</h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-slate-600">{t("introBody")}</p>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-10 inline-flex rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-10 py-3.5 font-semibold text-white shadow-lg"
          >
            {t("start")}
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <button type="button" onClick={() => setStep(0)} className="text-sm text-slate-500 hover:text-slate-800">
            ← {t("back")}
          </button>
          <h2 className="mt-4 text-xl font-bold text-slate-900">{t("checklistTitle")}</h2>
          <p className="mt-2 text-sm text-slate-600">{t("checklistIntro")}</p>
          <ul className="mt-6 space-y-3">
            {checklistItems.map((text, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={checklist[i]}
                  onChange={() => toggleCheck(i)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
                />
                <span className="text-sm text-slate-700">{text}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!allChecked}
            onClick={() => setStep(2)}
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("next")}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg space-y-5">
          <button type="button" onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-slate-800">
            ← {t("back")}
          </button>
          <h2 className="text-xl font-bold text-slate-900">{t("personalTitle")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>{t("firstName")} *</label>
              <input
                className={input}
                value={fields.first_name}
                onChange={(e) => setFields((f) => ({ ...f, first_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className={label}>{t("lastName")} *</label>
              <input
                className={input}
                value={fields.last_name}
                onChange={(e) => setFields((f) => ({ ...f, last_name: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <span className={label}>{t("gender.label")} *</span>
            <div className="mt-2 flex flex-wrap gap-4">
              {(["male", "female", "other"] as const).map((g) => (
                <label key={g} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-3">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={fields.gender === g}
                    onChange={() => setFields((f) => ({ ...f, gender: g }))}
                  />
                  <span className="text-sm">{t(`gender.${g}`)}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={label}>{t("dob")} *</label>
            <input
              type="date"
              className={input}
              value={fields.date_of_birth}
              onChange={(e) => setFields((f) => ({ ...f, date_of_birth: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className={label}>{t("nationality")} *</label>
            <input className={input} value={fields.nationality} onChange={(e) => setFields((f) => ({ ...f, nationality: e.target.value }))} required />
          </div>
          <button type="button" onClick={() => setStep(3)} className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white">
            {t("next")}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg space-y-5">
          <button type="button" onClick={() => setStep(2)} className="text-sm text-slate-500 hover:text-slate-800">
            ← {t("back")}
          </button>
          <h2 className="text-xl font-bold text-slate-900">{t("contactTitle")}</h2>
          <div>
            <label className={label}>{t("email")} *</label>
            <input type="email" className={input} value={fields.email} onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className={label}>{t("whatsapp")} *</label>
            <input type="tel" className={input} value={fields.whatsapp} onChange={(e) => setFields((f) => ({ ...f, whatsapp: e.target.value }))} required />
          </div>
          <div>
            <label className={label}>{t("address")} *</label>
            <input className={input} value={fields.address_line} onChange={(e) => setFields((f) => ({ ...f, address_line: e.target.value }))} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>{t("country")} *</label>
              <input className={input} value={fields.country} onChange={(e) => setFields((f) => ({ ...f, country: e.target.value }))} required />
            </div>
            <div>
              <label className={label}>{t("city")} *</label>
              <input className={input} value={fields.city} onChange={(e) => setFields((f) => ({ ...f, city: e.target.value }))} required />
            </div>
          </div>
          <button type="button" onClick={() => setStep(4)} className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white">
            {t("next")}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg space-y-5">
          <button type="button" onClick={() => setStep(3)} className="text-sm text-slate-500 hover:text-slate-800">
            ← {t("back")}
          </button>
          <h2 className="text-xl font-bold text-slate-900">{t("academicTitle")}</h2>
          <div>
            <label className={label}>{t("bacYear")} *</label>
            <input className={input} value={fields.bac_year} onChange={(e) => setFields((f) => ({ ...f, bac_year: e.target.value }))} required />
          </div>
          <div>
            <label className={label}>{t("bacSeries")} *</label>
            <input className={input} value={fields.bac_series} onChange={(e) => setFields((f) => ({ ...f, bac_series: e.target.value }))} required />
          </div>
          <div>
            <label className={label}>{t("previousSchool")} *</label>
            <input className={input} value={fields.previous_school} onChange={(e) => setFields((f) => ({ ...f, previous_school: e.target.value }))} required />
          </div>
          <button type="button" onClick={() => setStep(5)} className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white">
            {t("next")}
          </button>
        </div>
      )}

      {step === 5 && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg space-y-5">
          <button type="button" onClick={() => setStep(4)} className="text-sm text-slate-500 hover:text-slate-800">
            ← {t("back")}
          </button>
          <h2 className="text-xl font-bold text-slate-900">{t("parentTitle")}</h2>
          <div>
            <label className={label}>{t("parentWhatsapp")} *</label>
            <input type="tel" className={input} value={fields.parent_whatsapp} onChange={(e) => setFields((f) => ({ ...f, parent_whatsapp: e.target.value }))} required />
          </div>
          <div>
            <label className={label}>{t("parentEmail")} *</label>
            <input type="email" className={input} value={fields.parent_email} onChange={(e) => setFields((f) => ({ ...f, parent_email: e.target.value }))} required />
          </div>
          <div>
            <label className={label}>{t("discovery.label")} *</label>
            <select className={input} value={fields.discovery_channel} onChange={(e) => setFields((f) => ({ ...f, discovery_channel: e.target.value }))} required>
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
            <label className={label}>{t("preferredLevel")}</label>
            <select className={input} value={fields.level} onChange={(e) => setFields((f) => ({ ...f, level: e.target.value }))}>
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
            <label className={label}>{t("message")}</label>
            <textarea rows={3} className={input} value={fields.message} onChange={(e) => setFields((f) => ({ ...f, message: e.target.value }))} />
          </div>
          <p className="text-xs text-slate-500">{t("securityNote")}</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 font-semibold text-white shadow-lg disabled:opacity-70"
          >
            {loading ? t("submitting") : t("submit")}
          </button>
        </form>
      )}
    </div>
  );
}
