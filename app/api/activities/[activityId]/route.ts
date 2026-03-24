import { NextResponse } from "next/server";

import { deleteActivityForTeacher, updateActivity } from "@/features/teacher/actions";
import { getApiSession } from "@/lib/api-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { activityId } = await params;
  const payload = await request.json();

  try {
    const data = await updateActivity(activityId, payload, session.user.id);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { activityId } = await params;

  try {
    await deleteActivityForTeacher(activityId, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
