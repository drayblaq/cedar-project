import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as
    | "invite"
    | "recovery"
    | "magiclink"
    | "email"
    | "signup"
    | null;

  const portalBase = process.env.NEXT_PUBLIC_PORTAL_URL || requestUrl.origin;

  console.log("[callback] type:", type, "code:", !!code, "token_hash:", !!token_hash, "url:", request.url);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Build a response we can attach cookies to
  const cookieResponse = NextResponse.redirect(new URL("/", portalBase));

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // PKCE flow — code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) console.error("[callback] exchangeCodeForSession error:", error.message);
  }

  // Token-hash flow — used by invite, magic link, and recovery emails
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) {
      console.error("[callback] verifyOtp error:", error.message);
      const loginUrl = new URL("/auth/login", portalBase);
      loginUrl.searchParams.set("error", "This link has expired or has already been used. Please request a new one.");
      return NextResponse.redirect(loginUrl);
    }
  }

  // Route by link type — invite and recovery must go to set-password
  if (type === "invite" || type === "recovery") {
    const dest = new URL("/auth/reset-password", portalBase);
    cookieResponse.headers.set("Location", dest.toString());
    return cookieResponse;
  }

  // magiclink / email / signup / code — go to portal root
  // getPostLoginRedirect runs client-side after the session is available;
  // middleware handles redirecting "/" on the portal subdomain to /auth/login,
  // but the session cookie is now set so the login page immediately redirects by role.
  // To avoid that extra hop, redirect straight to /auth/login which reads the session.
  const loginUrl = new URL("/auth/login", portalBase);
  cookieResponse.headers.set("Location", loginUrl.toString());
  return cookieResponse;
}
