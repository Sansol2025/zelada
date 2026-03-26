import { NextResponse } from "next/server";
import { utils, write } from "xlsx";

import { getApiSession } from "@/lib/api-auth";

export async function GET() {
  const session = await getApiSession();
  if (!session?.user || !["teacher", "admin"].includes(session.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const worksheet = utils.aoa_to_sheet([
    ["primer_nombre", "segundo_nombre", "apellido", "edad", "grado", "dni"],
    ["Juan", "Carlos", "Perez", 10, "5to A", "12345678"]
  ]);

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Plantilla");

  const fileBuffer = write(workbook, {
    type: "buffer",
    bookType: "xlsx"
  });

  return new NextResponse(fileBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=\"plantilla-alumnos.xlsx\"",
      "Cache-Control": "no-store"
    }
  });
}
