import { NextResponse } from "next/server";

import { createAccessLinkForStudent } from "@/features/teacher/actions";
import { getTeacherAccessLinks, getTeacherStudents } from "@/features/teacher/queries";
import { getApiSession } from "@/lib/api-auth";

export async function GET() {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [links, students] = await Promise.all([
    getTeacherAccessLinks(session.user.id),
    getTeacherStudents(session.user.id)
  ]);

  return NextResponse.json({ data: { links, students } });
}

export async function POST(request: Request) {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payload = await request.json();
  try {
    const data = await createAccessLinkForStudent(payload, session.user.id);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo generar acceso";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
