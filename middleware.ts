import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

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

  // Redirect old /dashboard/admin/* URLs to /dashboard/*
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/dashboard/admin")) {
    const newPath = pathname.replace(/^\/dashboard\/admin/, "/dashboard");
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Protect dashboard: redirect to login if unauthenticated
  if (pathname.startsWith("/dashboard")) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const redirect = new URL("/auth/login", request.url);
      redirect.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(redirect);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
