"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAdminPasswordlessEmail, parseAdminPasswordlessAllowlist } from "@/lib/auth/admin-allowlist";

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
  const allowlist = parseAdminPasswordlessAllowlist();
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

const ROLE_HOME = {
  admin: "/admin",
  staff: "/staff",
  student: "/student",
  parent: "/parent",
} as const;

/**
 * After password sign-in, use the server session to pick the dashboard URL.
 * Admin (DB role or allowlisted email) always goes to /admin or ?next=/admin/...
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

  const email = user.email ?? "";
  const treatAsAdmin = roleName === "admin" || isAdminPasswordlessEmail(email);
  if (treatAsAdmin) {
    return safeNext.startsWith("/admin") ? safeNext : "/admin";
  }

  const home =
    roleName && roleName in ROLE_HOME ? ROLE_HOME[roleName as keyof typeof ROLE_HOME] : "";
  return home || safeNext || "/auth/login";
}
