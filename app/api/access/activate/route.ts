import { NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  
  if (!token) {
    return NextResponse.redirect(new URL("/ingreso/alumnos?error=token_invalido", request.url));
  }

  try {
    const supabase = createServiceClient();
    const { data: link, error } = await supabase
      .from("access_links")
      .select("token, is_active, expires_at")
      .eq("token", token)
      .eq("is_active", true)
      .single();

    if (error || !link) {
      console.error("[ACTIVATE] Error al buscar link:", error);
      return NextResponse.redirect(new URL("/ingreso/alumnos?error=link_no_encontrado", request.url));
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.redirect(new URL("/ingreso/alumnos?error=link_expirado", request.url));
    }

    // Usamos el objeto response para establecer la cookie de forma más segura en Route Handlers
    const response = NextResponse.redirect(new URL("/estudiante", request.url));
    
    response.cookies.set(ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: "/"
    });

    return response;
  } catch (err) {
    console.error("[ACTIVATE] Error inesperado:", err);
    return NextResponse.redirect(new URL("/ingreso/alumnos?error=error_interno", request.url));
  }
}
