import { NextResponse } from "next/server";

import { createModule } from "@/features/teacher/actions";
import { getApiSession } from "@/lib/api-auth";
import { getTeacherModulesBySubject } from "@/features/teacher/queries";

export async function GET(request: Request) {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subjectId");

  if (!subjectId) {
    return NextResponse.json({ error: "subjectId es obligatorio" }, { status: 400 });
  }

  try {
    const data = await getTeacherModulesBySubject(subjectId, session.user.id);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron obtener módulos";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payload = await request.json();
  try {
    const data = await createModule(payload, session.user.id);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear módulo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
