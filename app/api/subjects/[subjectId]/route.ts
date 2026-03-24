import { NextResponse } from "next/server";

import { deleteSubject, updateSubject } from "@/features/teacher/actions";
import { getApiSession } from "@/lib/api-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { subjectId } = await params;
  const payload = await request.json();
  try {
    const data = await updateSubject(subjectId, payload, session.user.id);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar materia";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { subjectId } = await params;
  try {
    await deleteSubject(subjectId, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar materia";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
