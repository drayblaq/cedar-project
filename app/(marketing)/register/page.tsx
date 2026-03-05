"use client";

import { useState } from "react";
import { submitPublicRegistration } from "./actions";

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName:"",
    email:"",
    phone:"",
    level:"",
    message:"",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.target as HTMLFormElement);
    const result = await submitPublicRegistration(fd);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white">
            ✓
          </div>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Thank you for registering
          </h2>
          <p className="mt-3 text-slate-600">
            We have received your information. Our team will contact you
            shortly with next steps.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-8 rounded-xl bg-emerald-500 px-6 py-2.5 font-medium text-white hover:bg-emerald-600"
          >
            Submit another registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
        Join us
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
        Registration form
      </h1>
      <p className="mt-4 text-slate-600">
        Fill out the form below. We will get back to you with course details and enrollment steps.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Phone (optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-slate-700">
            Preferred level (optional)
          </label>
          <select
            id="level"
            name="level"
            value={form.level}
            onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Select a level</option>
            <option value="beginner">Beginner</option>
            <option value="elementary">Elementary</option>
            <option value="pre-intermediate">Pre-Intermediate</option>
            <option value="intermediate">Intermediate</option>
            <option value="upper-intermediate">Upper-Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="ielts-toefl">IELTS / TOEFL prep</option>
          </select>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-700">
            Message (optional)
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-600 hover:to-teal-600 disabled:opacity-70"
        >
          {loading ?"Submitting…" :"Submit registration"}
        </button>
        </div>
      </form>
    </div>
  );
}
