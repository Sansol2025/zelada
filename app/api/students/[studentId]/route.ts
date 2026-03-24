import { NextResponse } from "next/server";

import { getTeacherStudentDetail } from "@/features/teacher/queries";
import { getApiSession } from "@/lib/api-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { studentId } = await params;
  const data = await getTeacherStudentDetail(session.user.id, studentId);

  if (!data) {
    return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ data });
}
