import { NextResponse } from "next/server";

import { assignSubjectToStudent } from "@/features/teacher/actions";
import { getTeacherAssignments, getTeacherStudents, getTeacherSubjects } from "@/features/teacher/queries";
import { getApiSession } from "@/lib/api-auth";

export async function GET() {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [assignments, students, subjects] = await Promise.all([
    getTeacherAssignments(session.user.id),
    getTeacherStudents(session.user.id),
    getTeacherSubjects(session.user.id)
  ]);

  return NextResponse.json({ data: { assignments, students, subjects } });
}

export async function POST(request: Request) {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payload = await request.json();
  try {
    const data = await assignSubjectToStudent(payload, session.user.id);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear la asignación";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
