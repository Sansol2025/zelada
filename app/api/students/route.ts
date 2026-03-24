import { NextResponse } from "next/server";

import { getTeacherFamilies, getTeacherStudents } from "@/features/teacher/queries";
import { getApiSession } from "@/lib/api-auth";

export async function GET() {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [students, families] = await Promise.all([
    getTeacherStudents(session.user.id),
    getTeacherFamilies(session.user.id)
  ]);

  return NextResponse.json({ data: { students, families } });
}
