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

function redirectToAccess(request: NextRequest, errorMessage?: string) {
  const destination = new URL("/acceso", request.url);
  if (errorMessage) {
    destination.searchParams.set("error", errorMessage);
  }
  if (request.method === "GET" || request.method === "HEAD") {
    return NextResponse.redirect(destination);
  }
  return NextResponse.redirect(destination, { status: 303 });
}

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
    return redirectToAccess(request, "Debes iniciar sesion");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  if (isTeacherRoute && !["teacher", "admin"].includes(role)) {
    return redirectToAccess(request, "Tu usuario no tiene permisos de docente");
  }

  if (isFamilyRoute && role !== "family") {
    return redirectToAccess(request, "Tu usuario no tiene permisos de familia");
  }

  if (isStudentRoute && role !== "student" && !studentToken) {
    return redirectToAccess(request, "Tu usuario no tiene permisos de estudiante");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
