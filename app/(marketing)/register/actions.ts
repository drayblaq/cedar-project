"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Benin number in E.164 from the phone input: +229 followed by 8–11 digits.
function isValidBeninPhone(raw: string) {
  const digits = raw.replace(/[\s\-().]/g, "");
  return /^\+?229\d{8,11}$/.test(digits);
}

const LEVEL_SLUG_TO_NAME: Record<string, string> = {
  beginner: "Beginner",
  elementary: "Elementary",
  "pre-intermediate": "Pre-Intermediate",
  intermediate: "Intermediate",
  "upper-intermediate": "Upper-Intermediate",
  advanced: "Advanced",
  "ielts-toefl": "Advanced",
};

function trim(s: FormDataEntryValue | null | undefined) {
  if (s == null || typeof s !== "string") return "";
  return s.trim();
}

export async function submitPublicRegistration(formData: FormData) {
  const supabase = await createClient();

  const why_learn_english = trim(formData.get("why_learn_english"));
  const full_name = trim(formData.get("full_name"));
  const date_of_birth = trim(formData.get("date_of_birth")) || null;
  const gender = trim(formData.get("gender"));
  const phone = trim(formData.get("phone"));
  const email = trim(formData.get("email")).toLowerCase();
  const resident_address = trim(formData.get("resident_address"));

  const guardian_name = trim(formData.get("guardian_name")) || null;
  const guardian_phone = trim(formData.get("guardian_phone")) || null;
  const guardian_address = trim(formData.get("guardian_address")) || null;

  const educational_level = trim(formData.get("educational_level"));
  const discovery_raw = trim(formData.get("discovery_channel"));
  const discovery_other = trim(formData.get("discovery_other"));
  const discovery_channel =
    discovery_raw === "other" && discovery_other ? `other: ${discovery_other}` : discovery_raw;
  const declaration_agreed = trim(formData.get("declaration_agreed")) === "true";

  const levelSlug = trim(formData.get("level")) || null;
  const message = trim(formData.get("message")) || null;

  // Required fields (emergency contact is optional)
  if (!why_learn_english || !full_name || !date_of_birth || !gender || !phone || !email || !resident_address) {
    return { error: "Please complete all required fields." };
  }
  if (!educational_level || !discovery_raw) {
    return { error: "Please complete the education and referral fields." };
  }
  if (gender !== "male" && gender !== "female") {
    return { error: "Please select a valid gender." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address (e.g. name@gmail.com)." };
  }
  if (!isValidBeninPhone(phone)) {
    return { error: "Please enter a valid Benin phone number, e.g. +229 0111223344." };
  }
  if (!declaration_agreed) {
    return { error: "You must agree to the declaration to submit your application." };
  }

  const { data: existing } = await supabase
    .from("students")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return { error: "DUPLICATE_EMAIL" };
  }

  // Rate limit: max 3 registrations with the same phone per hour (prevents phone enumeration spam)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentByPhone } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("phone", phone)
    .gte("created_at", oneHourAgo);
  if ((recentByPhone ?? 0) >= 3) {
    return { error: "Too many submissions from this phone number. Please try again later." };
  }

  const parts = full_name.split(" ").filter(Boolean);
  const first_name = parts[0] ?? full_name;
  const last_name = parts.slice(1).join(" ") || "";
  const placement_access_token = randomUUID();

  let level_id: string | null = null;
  if (levelSlug && LEVEL_SLUG_TO_NAME[levelSlug]) {
    const { data: levels } = await supabase
      .from("levels")
      .select("id")
      .eq("name", LEVEL_SLUG_TO_NAME[levelSlug])
      .limit(1);
    if (levels?.[0]?.id) level_id = levels[0].id;
  }

  const row: Record<string, unknown> = {
    user_id: null,
    status: "pending",
    application_status: "submitted",
    placement_access_token,
    full_name,
    first_name,
    last_name,
    email,
    phone: phone || null,
    whatsapp: phone || null,
    gender,
    date_of_birth,
    resident_address,
    why_learn_english,
    educational_level,
    discovery_channel,
    guardian_name,
    guardian_phone,
    guardian_address,
    parent_whatsapp: guardian_phone,
    declaration_agreed,
    level_id,
    notes: message || null,
  };

  const { error } = await supabase.from("students").insert(row);

  if (error) return { error: error.message };

  // Notify admins that a new registration came in (best-effort, service role).
  try {
    const admin = createAdminClient();
    const { data: created } = await admin
      .from("students")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    const link = created?.id ? `/admin/students/${created.id}/application` : "/admin/students";
    await admin.from("notifications").insert({
      type: "registration",
      title: `New registration: ${full_name}`,
      body: `${full_name} just applied online. Phone: ${phone} · Email: ${email}`,
      link,
    });
  } catch {
    // Notifications are non-critical — never block the applicant on this.
  }

  return {
    error: null as null,
    placementToken: placement_access_token,
  };
}
