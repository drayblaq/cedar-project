"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME } from '@/lib/roleHome'

function siteUrl(): string {
  // In local dev always use localhost so magic links redirect back here.
  // Set NEXT_PUBLIC_SITE_URL in Vercel env vars (not in .env.local) for production.
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    const v = process.env.VERCEL_URL.replace(/\/$/, "");
    return v.startsWith("http") ? v : `https://${v}`;
  }
  return "http://localhost:3000";
}

/**
 * Sends a magic-link for any email. Access is determined by the user's
 * database role (profiles.role_id → roles.name), not by an email allowlist.
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

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is missing Supabase service role configuration." };
  }

  const base = siteUrl();
  const redirectTo = `${base}/auth/login?next=${encodeURIComponent(safeNext)}`;

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

/**
 * After password sign-in, use the server session to pick the dashboard URL.
 * Routing is determined entirely by the user's database role.
 */
export async function getPostLoginRedirect(next: string): Promise<string> {
  const safeNext =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return "/auth/login";

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single();

  let roleName: string | null = null;
  if (profile?.role_id) {
    const { data: role } = await supabase.from("roles").select("name").eq("id", profile.role_id).single();
    roleName = role?.name ?? null;
  }

  if (roleName === "admin") {
    return safeNext.startsWith("/admin") ? safeNext : "/admin";
  }

  const home =
    roleName && roleName in ROLE_HOME ? ROLE_HOME[roleName as keyof typeof ROLE_HOME] : "";
  return home || safeNext || "/auth/login";
}
