import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROLE_HOME } from '@/lib/roleHome'

const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || "https://cedartrainingcenter.com";
const PORTAL_URL    = process.env.NEXT_PUBLIC_PORTAL_URL    || "https://portal.cedartrainingcenter.com";

function roleNameFromJoinedRoles(roles: unknown): string | undefined {
  if (roles == null) return undefined;
  if (Array.isArray(roles)) {
    const first = roles[0] as { name?: string } | undefined;
    return typeof first?.name === "string" ? first.name : undefined;
  }
  if (typeof roles === "object" && "name" in roles) {
    const n = (roles as { name?: unknown }).name;
    return typeof n === "string" ? n : undefined;
  }
  return undefined;
}

function mapLegacyDashboardPath(pathname: string): string {
  if (pathname === "/dashboard" || pathname === "/dashboard/") return "/admin";
  if (pathname.startsWith("/dashboard/student")) return pathname.replace("/dashboard/student", "/student");
  if (pathname.startsWith("/dashboard/parent"))  return pathname.replace("/dashboard/parent",  "/parent");
  if (pathname.startsWith("/dashboard/staff"))   return pathname.replace("/dashboard/staff",   "/staff");
  if (pathname.startsWith("/dashboard/admin"))   return pathname.replace("/dashboard/admin",   "/admin");
  if (pathname.startsWith("/dashboard"))         return pathname.replace("/dashboard",         "/admin");
  return pathname;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // ── Subdomain detection ────────────────────────────────────────────────────
  const isPortalSubdomain =
    hostname.startsWith("portal.") ||
    hostname.startsWith("portal-");          // handles preview deployments like portal-xyz.vercel.app

  const isLocalDev =
    hostname.startsWith("localhost") ||
    hostname.startsWith("127.0.0.1") ||
    hostname.includes(".vercel.app") && !hostname.startsWith("portal");

  const isMarketingDomain = !isPortalSubdomain;

  const marketingPaths = ["/", "/about", "/courses", "/contact", "/register"];
  const isMarketingPath =
    marketingPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  const isPortalPath =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/parent") ||
    pathname.startsWith("/dashboard");

  // Skip subdomain cross-redirects in local dev to avoid infinite loops
  if (!isLocalDev) {
    // Portal subdomain visiting a marketing page → redirect to marketing domain
    if (isPortalSubdomain && isMarketingPath && pathname !== "/") {
      return NextResponse.redirect(new URL(pathname, MARKETING_URL));
    }

    // Portal subdomain root "/" → redirect to login
    if (isPortalSubdomain && pathname === "/") {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Main domain trying to access portal pages → redirect to portal subdomain
    if (isMarketingDomain && isPortalPath) {
      return NextResponse.redirect(new URL(pathname, PORTAL_URL));
    }
  }

  // ── Legacy /dashboard redirect ─────────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL(mapLegacyDashboardPath(pathname), request.url));
  }

  // ── Supabase auth session refresh ─────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            response.cookies.set(name, value)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  // ── Role-based auth checks (portal paths only) ────────────────────────────
  const protectedArea =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/parent");

  if (protectedArea || pathname === "/auth/login") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (pathname === "/auth/login" && user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("roles(name)")
        .eq("id", user.id)
        .single();
      const roleName = roleNameFromJoinedRoles(profile?.roles);
      if (roleName && ROLE_HOME[roleName]) {
        return NextResponse.redirect(new URL(ROLE_HOME[roleName], request.url));
      }
    }

    if (!protectedArea) return response;

    if (!user) {
      const redirect = new URL("/auth/login", request.url);
      redirect.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(redirect);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("roles(name), locale")
      .eq("id", user.id)
      .single();
    const roleName = roleNameFromJoinedRoles(profile?.roles);

    const expectedPrefix = roleName && ROLE_HOME[roleName] ? ROLE_HOME[roleName] : null;
    if (!expectedPrefix) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!pathname.startsWith(expectedPrefix)) {
      return NextResponse.redirect(new URL(expectedPrefix, request.url));
    }

    if (!request.cookies.get("NEXT_LOCALE")) {
      if (profile?.locale === "en" || profile?.locale === "fr") {
        response.cookies.set("NEXT_LOCALE", profile.locale, {
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
          sameSite: "lax",
        });
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/staff/:path*", "/student/:path*", "/parent/:path*", "/auth/login"],
};
