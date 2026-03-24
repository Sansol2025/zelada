import { NextResponse } from "next/server";

import { deleteModuleForTeacher, updateModule } from "@/features/teacher/actions";
import { getApiSession } from "@/lib/api-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { moduleId } = await params;
  const payload = await request.json();
  try {
    const data = await updateModule(moduleId, payload, session.user.id);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar módulo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { moduleId } = await params;
  try {
    await deleteModuleForTeacher(moduleId, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar módulo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
