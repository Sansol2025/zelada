"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateAccessToken } from "@/services/access-links";

function normalizeDni(value: string) {
  return value.replace(/[.\-\s]/g, "");
}

function normalizeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export async function studentLoginAction(formData: FormData) {
  const dni = String(formData.get("dni") ?? "");
  const firstName = String(formData.get("first_name") ?? "");
  const grado = String(formData.get("grado") ?? "");

  const cleanDni = normalizeDni(dni);
  const cleanFirstName = normalizeName(firstName);

  if (!cleanDni || !cleanFirstName) {
    redirect(`/ingreso/alumnos?error=Comprueba%20tus%20datos${grado ? `&grado=${grado}` : ""}`);
  }

  const supabase = await createClient();

  const { data: student, error } = await supabase
    .from("students")
    .select("id, active, profiles!inner(full_name), grade")
    .eq("dni", cleanDni)
    .single();

  if (error || !student || !student.active) {
    redirect(`/ingreso/alumnos?error=Datos%20incorrectos%20o%20alumno%20no%20activo${grado ? `&grado=${grado}` : ""}`);
  }

  // Check if first name matches
  // The full_name could be "Juan Perez". We split it to get the first part.
  const profileFullName = student.profiles?.full_name ?? "";
  const firstPartOfName = normalizeName(profileFullName.split(" ")[0] || "");

  if (cleanFirstName !== firstPartOfName) {
    // If it's totally different, block. But allow some leniency, like maybe they typed two names.
    // e.g. "juan carlos" instead of "juan"
    const isContained = normalizeName(profileFullName).includes(cleanFirstName);
    if (!isContained) {
      redirect(`/ingreso/alumnos?error=Primer%20nombre%20incorrecto${grado ? `&grado=${grado}` : ""}`);
    }
  }

  // Create an access link and redirect to activate it
  const token = generateAccessToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  const { error: linkError } = await supabase.from("access_links").insert({
    student_id: student.id,
    type: "qr", // Logged in through the interface
    token,
    expires_at: expiresAt,
    is_active: true
  });

  if (linkError) {
    redirect(`/ingreso/alumnos?error=Problema%20al%20iniciar%20sesion${grado ? `&grado=${grado}` : ""}`);
  }

  redirect(`/api/access/activate?token=${encodeURIComponent(token)}`);
}
