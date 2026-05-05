import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/ingreso/alumnos?error=token_invalido", request.url));
  }

  const supabase = createServiceClient();
  const { data: link } = await supabase
    .from("access_links")
    .select("token, is_active, expires_at")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (!link) {
    return NextResponse.redirect(new URL("/ingreso/alumnos?error=link_no_encontrado", request.url));
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return NextResponse.redirect(new URL("/ingreso/alumnos?error=link_expirado", request.url));
  }

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });

  return NextResponse.redirect(new URL("/estudiante", request.url));
}
