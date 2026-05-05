"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

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

  const first_name = trim(formData.get("first_name"));
  const last_name = trim(formData.get("last_name"));
  const email = trim(formData.get("email")).toLowerCase();
  const gender = trim(formData.get("gender"));
  const date_of_birth = trim(formData.get("date_of_birth")) || null;
  const nationality = trim(formData.get("nationality"));
  const whatsapp = trim(formData.get("whatsapp"));
  const address_line = trim(formData.get("address_line"));
  const country = trim(formData.get("country"));
  const city = trim(formData.get("city"));
  const education_level = trim(formData.get("education_level"));
  const parent_whatsapp = trim(formData.get("parent_whatsapp"));
  const parent_email = trim(formData.get("parent_email")).toLowerCase() || null;
  const discovery_channel = trim(formData.get("discovery_channel"));
  const levelSlug = trim(formData.get("level")) || null;
  const message = trim(formData.get("message")) || null;

  if (!first_name || !last_name || !email) {
    return { error: "First name, last name, and email are required." };
  }
  if (!gender || !date_of_birth || !nationality || !whatsapp || !address_line || !country || !city) {
    return { error: "Please complete all required personal and contact fields." };
  }
  if (!education_level || !parent_whatsapp || !parent_email || !discovery_channel) {
    return { error: "Please complete education and parent contact sections." };
  }

  const full_name = `${first_name} ${last_name}`.trim();
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
    phone: whatsapp || null,
    gender,
    date_of_birth,
    nationality,
    whatsapp,
    address_line,
    country,
    city,
    bac_year: "—",
    bac_series: "—",
    previous_school: education_level,
    parent_whatsapp,
    parent_email,
    discovery_channel,
    level_id,
    notes: message || null,
  };

  const { error } = await supabase.from("students").insert(row);

  if (error) return { error: error.message };
  return {
    error: null as null,
    placementToken: placement_access_token,
  };
}
