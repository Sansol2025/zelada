import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  return NextResponse.redirect(
    new URL("/acceso?error=Usa%20el%20formulario%20de%20ingreso", request.url)
  );
}

export async function POST(request: Request) {
  const missingEnv = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter(
    (key) => !process.env[key]
  );

  if (missingEnv.length > 0) {
    return NextResponse.redirect(
      new URL(
        `/acceso?error=${encodeURIComponent(
          `Falta configurar variables en Vercel: ${missingEnv.join(", ")}`
        )}`,
        request.url
      )
    );
  }

  try {
    const supabase = await createClient();
    const formData = await request.formData();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const redirectTo = String(formData.get("redirectTo") ?? "/acceso");

    if (!email || !password) {
      return NextResponse.redirect(
        new URL("/acceso?error=Debes%20completar%20correo%20y%20contrasena", request.url)
      );
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.redirect(
        new URL(`/acceso?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }

    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch {
    return NextResponse.redirect(
      new URL(
        "/acceso?error=No%20se%20pudo%20iniciar%20sesion.%20Revisa%20variables%20de%20Supabase%20en%20Vercel.",
        request.url
      )
    );
  }
}
