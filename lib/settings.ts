import { createClient } from "@/lib/supabase/server";

export const DEFAULT_TUITION = 50000;

export async function getSetting(key: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return data?.value ?? null;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key, value");
  if (!data) return {};
  return Object.fromEntries(data.map((s) => [s.key, s.value]));
}

/** Tuition as a number, falling back to the default if the setting is missing/invalid. */
export async function getTuitionAmount(): Promise<number> {
  const raw = await getSetting("tuition_amount");
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_TUITION;
}
