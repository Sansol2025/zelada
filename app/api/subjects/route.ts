import { NextResponse } from "next/server";

import { getApiSession } from "@/lib/api-auth";
import { createSubject } from "@/features/teacher/actions";
import { getTeacherSubjects } from "@/features/teacher/queries";

export async function GET() {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const data = await getTeacherSubjects(session.user.id);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron obtener materias";
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
    const data = await createSubject(payload, session.user.id);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear materia";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
