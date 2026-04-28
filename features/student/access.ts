import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export type StudentContext = {
  studentId: string;
  profileId: string;
  fullName: string | null;
};

export async function getStudentContextOrRedirect(): Promise<StudentContext> {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", user.id)
      .single();

    if (profile?.role === "student") {
      const { data: student } = await supabase
        .from("students")
        .select("id, profile_id")
        .eq("profile_id", profile.id)
        .single();

      if (!student) notFound();

      return {
        studentId: student.id,
        profileId: student.profile_id,
        fullName: profile.full_name
      };
    }
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) redirect("/acceso");

  // Utilizamos el service client porque el estudiante solo tiene un token (es anónimo para Supabase Auth)
  // y RLS bloquearía la lectura de access_links
  const serviceSupabase = createServiceClient();
  const { data: accessLink } = await serviceSupabase
    .from("access_links")
    .select("student_id, is_active, expires_at, students ( id, profile_id )")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (!accessLink) redirect("/acceso");

  const expiresAt = accessLink.expires_at ? new Date(accessLink.expires_at) : null;
  if (expiresAt && expiresAt < new Date()) redirect("/acceso");

  const student = Array.isArray(accessLink.students)
    ? accessLink.students[0]
    : accessLink.students;

  if (!student) redirect("/acceso");

  const { data: profile } = await serviceSupabase
    .from("profiles")
    .select("full_name")
    .eq("id", student.profile_id)
    .single();

  return {
    studentId: student.id,
    profileId: student.profile_id,
    fullName: profile?.full_name ?? null
  };
}
