"use server";

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

export async function submitPublicRegistration(formData: FormData) {
  const supabase = await createClient();
  const full_name = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const levelSlug = (formData.get("level") as string)?.trim() || null;
  const message = (formData.get("message") as string)?.trim() || null;

  if (!full_name || !email) {
    return { error: "Full name and email are required." };
  }

  let level_id: string | null = null;
  if (levelSlug && LEVEL_SLUG_TO_NAME[levelSlug]) {
    const { data: levels } = await supabase
      .from("levels")
      .select("id")
      .eq("name", LEVEL_SLUG_TO_NAME[levelSlug])
      .limit(1);
    if (levels?.[0]?.id) level_id = levels[0].id;
  }

  const { error } = await supabase.from("students").insert({
    user_id: null,
    full_name,
    email,
    phone,
    level_id,
    notes: message || null,
  });

  if (error) return { error: error.message };
  return { error: null };
}
