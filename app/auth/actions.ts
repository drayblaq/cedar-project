"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    const v = process.env.VERCEL_URL.replace(/\/$/, "");
    return v.startsWith("http") ? v : `https://${v}`;
  }
  return "http://localhost:3000";
}

function adminPasswordlessAllowlist(): Set<string> | null {
  const raw = process.env.ADMIN_PASSWORDLESS_EMAILS?.trim();
  if (!raw) return null;
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

/**
 * Allowlisted email only. Uses service role to build a magic-link URL and
 * redirects the browser there immediately (no email sent). Supabase then
 * redirects back to /auth/callback with a code and a session is created.
 */
export async function redirectAdminInstant(
  email: string,
  next: string
): Promise<{ error: string } | void> {
  const trimmed = email.trim().toLowerCase();
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") && next.startsWith("/admin")
      ? next
      : "/admin";

  if (!trimmed) {
    return { error: "Enter your email." };
  }
  const allowlist = adminPasswordlessAllowlist();
  if (allowlist === null) {
    return {
      error:
        "ADMIN_PASSWORDLESS_EMAILS is not set on this server (e.g. missing in Vercel → Settings → Environment Variables for Production). Add it and redeploy.",
    };
  }
  if (!allowlist.has(trimmed)) {
    return {
      error:
        "This email does not match ADMIN_PASSWORDLESS_EMAILS for this deployment (check spelling and commas in the host env).",
    };
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is missing Supabase service role configuration." };
  }

  const base = siteUrl();
  const redirectTo = `${base}/auth/callback?next=${encodeURIComponent(safeNext)}`;

  const { error: createErr } = await admin.auth.admin.createUser({
    email: trimmed,
    email_confirm: true,
  });
  if (createErr) {
    const m = createErr.message.toLowerCase();
    if (!m.includes("already") && !m.includes("registered") && !m.includes("exists")) {
      return { error: createErr.message };
    }
  }

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: trimmed,
    options: { redirectTo },
  });

  if (error) {
    return { error: error.message };
  }

  const actionLink = data?.properties?.action_link;
  if (!actionLink || typeof actionLink !== "string") {
    return { error: "Could not create sign-in link. Check Supabase and service role permissions." };
  }

  redirect(actionLink);
}
