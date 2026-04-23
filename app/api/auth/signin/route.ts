import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/domain";

function redirectAfterPost(url: URL) {
  return NextResponse.redirect(url, { status: 303 });
}

const roleHome: Record<Role, string> = {
  teacher: "/docente",
  admin: "/docente",
  family: "/familia",
  student: "/estudiante"
};

function normalizeInternalPath(value: string) {
  return value.startsWith("/") ? value : "/acceso";
}

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
    return redirectAfterPost(
      new URL(
        `/acceso?error=${encodeURIComponent(
          `Falta configurar variables en Vercel: ${missingEnv.join(", ")}`
        )}`,
        request.url
      )
    );
  }

  try {
    console.log("[DIAGNOSTIC] Auth SignIn Attempt starting...");
    const supabase = await createClient();
    const formData = await request.formData();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const redirectTo = normalizeInternalPath(String(formData.get("redirectTo") ?? "/acceso"));

    console.log("[DIAGNOSTIC] SignIn email:", email);

    if (!email || !password) {
      return redirectAfterPost(
        new URL("/acceso?error=Debes%20completar%20correo%20y%20contrasena", request.url)
      );
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("[DIAGNOSTIC] Supabase Auth Error:", error.message);
      return redirectAfterPost(
        new URL(`/acceso?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return redirectAfterPost(
        new URL("/acceso?error=No%20se%20pudo%20leer%20la%20sesion%20del%20usuario", request.url)
      );
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = profile?.role as Role | undefined;

    if (!role || !roleHome[role]) {
      return redirectAfterPost(
        new URL(
          "/acceso?error=Tu%20usuario%20no%20tiene%20rol%20configurado%20en%20la%20tabla%20profiles",
          request.url
        )
      );
    }

    const destination = redirectTo === "/acceso" ? roleHome[role] : redirectTo;
    return redirectAfterPost(new URL(destination, request.url));
  } catch {
    return redirectAfterPost(
      new URL(
        "/acceso?error=No%20se%20pudo%20iniciar%20sesion.%20Revisa%20variables%20de%20Supabase%20en%20Vercel.",
        request.url
      )
    );
  }
}
