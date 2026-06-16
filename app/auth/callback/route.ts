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
    | null;

  const portalBase = process.env.NEXT_PUBLIC_PORTAL_URL || requestUrl.origin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

  // PKCE flow (e.g. OAuth or some magic link configs)
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Token-hash flow — used by invite, magic link, and recovery emails
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) {
      console.error("[callback] verifyOtp error:", error.message);
      const loginUrl = new URL("/auth/login", portalBase);
      loginUrl.searchParams.set("error", "Link expired or already used. Please request a new one.");
      return NextResponse.redirect(loginUrl);
    }
  }

  // Route by link type
  if (type === "invite" || type === "recovery") {
    // Send to set-password page (session is now established above)
    return NextResponse.redirect(new URL("/auth/reset-password", portalBase));
  }

  // magiclink / email / code — go to portal root; middleware routes by role
  cookieResponse.headers.set("Location", new URL("/", portalBase).toString());
  return cookieResponse;
}
