import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { completeStudentActivity } from "@/features/student/actions";
import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const payloadSchema = z.object({
  score: z.coerce.number().min(0).max(100).optional(),
  time_spent_seconds: z.coerce.number().int().min(0).optional(),
  response_json: z.record(z.string(), z.unknown()).optional()
});

const activityIdSchema = z.string().uuid();

async function resolveStudentId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "student") {
      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

      if (student?.id) return student.id;
    }
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;

  const serviceClient = createServiceClient();
  const { data: accessLink } = await serviceClient
    .from("access_links")
    .select("student_id, is_active, expires_at")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (!accessLink?.student_id) return null;

  if (accessLink.expires_at && new Date(accessLink.expires_at) < new Date()) {
    return null;
  }

  return accessLink.student_id;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  const studentId = await resolveStudentId();
  if (!studentId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { activityId: rawActivityId } = await params;
  const activityId = activityIdSchema.safeParse(rawActivityId);
  if (!activityId.success) {
    return NextResponse.json({ error: "Actividad inválida" }, { status: 400 });
  }

  const rawBody = await request.json().catch(() => ({}));
  const payload = payloadSchema.safeParse(rawBody);
  if (!payload.success) {
    return NextResponse.json(
      { error: "Payload inválido", details: payload.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const data = await completeStudentActivity({
      student_id: studentId,
      activity_id: activityId.data,
      score: payload.data.score,
      time_spent_seconds: payload.data.time_spent_seconds ?? 0,
      response_json: payload.data.response_json ?? {}
    });

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo completar la actividad";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
