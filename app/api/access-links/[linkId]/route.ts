import { NextResponse } from "next/server";

import { getApiSession } from "@/lib/api-auth";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { linkId } = await params;
  const payload = await request.json().catch(() => ({}));
  const isActive = Boolean(payload?.is_active);

  const supabase = await createClient();

  const { data: link } = await supabase
    .from("access_links")
    .select("id, student_id")
    .eq("id", linkId)
    .single();

  if (!link) {
    return NextResponse.json({ error: "Enlace no encontrado" }, { status: 404 });
  }

  const { data: ownership } = await supabase
    .from("student_subjects")
    .select("student_id, subjects!inner(teacher_id)")
    .eq("student_id", link.student_id)
    .eq("subjects.teacher_id", session.user.id)
    .limit(1);

  if (!ownership?.length && session.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("access_links")
    .update({ is_active: isActive })
    .eq("id", linkId)
    .select("id, is_active")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
