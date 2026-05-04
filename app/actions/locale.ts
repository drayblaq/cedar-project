"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/i18n/request";

const LOCALE_COOKIE = "NEXT_LOCALE";
const LOCALES: AppLocale[] = ["en", "fr"];

export async function setLocale(locale: AppLocale) {
  if (!LOCALES.includes(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from("profiles")
      .update({ locale })
      .eq("id", user.id);
  }

  revalidatePath("/");
}
