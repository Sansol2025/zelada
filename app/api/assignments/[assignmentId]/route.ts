import { NextResponse } from "next/server";

import { unassignSubjectFromStudent } from "@/features/teacher/actions";
import { getApiSession } from "@/lib/api-auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { assignmentId } = await params;
  try {
    await unassignSubjectFromStudent(assignmentId, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo quitar asignación";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
