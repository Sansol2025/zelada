import { NextResponse } from "next/server";

import { createActivity } from "@/features/teacher/actions";
import { getTeacherModuleActivities } from "@/features/teacher/queries";
import { getApiSession } from "@/lib/api-auth";

export async function GET(request: Request) {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId");
  if (!moduleId) {
    return NextResponse.json({ error: "moduleId es obligatorio" }, { status: 400 });
  }

  try {
    const data = await getTeacherModuleActivities(moduleId, session.user.id);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron obtener actividades";
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
    const data = await createActivity(payload, session.user.id);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear la actividad";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
