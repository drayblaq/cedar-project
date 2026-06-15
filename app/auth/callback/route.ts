import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type");
  let next = url.searchParams.get("next") ?? "/admin";
  if (!next.startsWith("/") || next.startsWith("//")) next = "/admin";

  // Invite and recovery links should land on set-password page, not dashboard
  if (type === "invite" || type === "recovery") next = "/auth/reset-password";

  // Use portal subdomain as the redirect base so cookies land on the right domain
  const portalBase = process.env.NEXT_PUBLIC_PORTAL_URL || url.origin;
  const redirectTarget = new URL(next, portalBase);
  const response = NextResponse.redirect(redirectTarget);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/auth/login?error=config", url.origin));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  if (!code) {
    return NextResponse.redirect(new URL(`/auth/login?next=${encodeURIComponent(next)}`, url.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, url.origin)
    );
  }

  return response;
}
