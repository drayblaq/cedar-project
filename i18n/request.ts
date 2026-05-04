import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const LOCALES = ["en", "fr"] as const;
export type AppLocale = (typeof LOCALES)[number];

const DEFAULT_LOCALE: AppLocale = "en";

function normalizeLocale(value: string | null | undefined): AppLocale | null {
  if (!value) return null;
  const cleaned = value.toLowerCase();
  if (cleaned.startsWith("fr")) return "fr";
  if (cleaned.startsWith("en")) return "en";
  return null;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieLocale = normalizeLocale(cookieStore.get("NEXT_LOCALE")?.value);
  const browserLocale = normalizeLocale(headerStore.get("accept-language"));
  const locale = cookieLocale ?? browserLocale ?? DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
