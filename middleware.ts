import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";

const PUBLIC_PATHS = ["/", "/acceso", "/proyecto", "/auth/callback"];
const PUBLIC_API_PREFIXES = ["/api/public", "/api/auth/", "/api/access/"];
type SupabaseCookie = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/ingreso/") ||
    pathname.startsWith("/_next") ||
    isPublicApi
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: SupabaseCookie[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const studentToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isStudentRoute = pathname.startsWith("/estudiante");
  const isStudentApiRoute = pathname.startsWith("/api/student");
  const isTeacherRoute = pathname.startsWith("/docente");
  const isFamilyRoute = pathname.startsWith("/familia");

  if (!user) {
    if (studentToken && (isStudentRoute || isStudentApiRoute)) return response;
    if (pathname.startsWith("/api")) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    return NextResponse.redirect(new URL("/acceso", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  if (isTeacherRoute && !["teacher", "admin"].includes(role)) {
    return NextResponse.redirect(new URL("/acceso", request.url));
  }

  if (isFamilyRoute && role !== "family") {
    return NextResponse.redirect(new URL("/acceso", request.url));
  }

  if (isStudentRoute && role !== "student" && !studentToken) {
    return NextResponse.redirect(new URL("/acceso", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
