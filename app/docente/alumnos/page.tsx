import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Download, FileSpreadsheet, Upload, UserPlus, Users } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { createStudentForTeacher, importStudentsFromCsv } from "@/features/teacher/actions";
import { getStudentsCatalogForTeacher } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";

type TeacherStudentsPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    success?: string | string[];
  }>;
};

function readQueryValue(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "";
  try {
    return decodeURIComponent(raw).replace(/\+/g, " ");
  } catch {
    return raw;
  }
}

function formatActionError(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "");
    if (message) return message;
  }
  return "No se pudo completar la operación. Intenta nuevamente.";
}

export default async function TeacherStudentsPage({ searchParams }: TeacherStudentsPageProps) {
  await requireRole(["teacher", "admin"]);

  const students = await getStudentsCatalogForTeacher().catch(() => []);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = readQueryValue(resolvedSearchParams?.error);
  const successMessage = readQueryValue(resolvedSearchParams?.success);

  async function createStudentAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    try {
      await createStudentForTeacher(
        {
          first_name: String(formData.get("first_name") ?? ""),
          second_name: String(formData.get("second_name") ?? ""),
          last_name: String(formData.get("last_name") ?? ""),
          age: String(formData.get("age") ?? ""),
          grade: String(formData.get("grade") ?? ""),
          dni: String(formData.get("dni") ?? "")
        },
        activeSession.userId as string
      );
    } catch (error) {
      const message = formatActionError(error);
      redirect(`/docente/alumnos?error=${encodeURIComponent(message)}`);
    }

    revalidatePath("/docente/alumnos");
    redirect("/docente/alumnos?success=Alumno%20guardado%20correctamente");
  }

  async function importStudentsAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    const file = formData.get("students_file");

    if (!(file instanceof File) || file.size === 0) {
      redirect("/docente/alumnos?error=Debes%20seleccionar%20un%20archivo%20CSV");
    }

    try {
      const result = await importStudentsFromCsv(file, activeSession.userId as string);
      revalidatePath("/docente/alumnos");

      const message = `Carga masiva finalizada: ${result.created} creados, ${result.updated} actualizados, ${result.failed} con error.`;
      redirect(`/docente/alumnos?success=${encodeURIComponent(message)}`);
    } catch (error) {
      const message = formatActionError(error);
      redirect(`/docente/alumnos?error=${encodeURIComponent(message)}`);
    }
  }

  return (
    <RoleLayout
      title="Gestión de alumnos"
      description="Registra alumnos de forma individual o masiva con plantilla Excel compatible (.csv)."
      navItems={teacherNavItems}
      currentPath="/docente/alumnos"
    >
      {errorMessage ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </section>
      ) : null}

      {successMessage ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-1">
          <CardText className="text-xs font-semibold uppercase tracking-wider text-brand-600">Total alumnos</CardText>
          <CardTitle className="text-3xl">{students.length}</CardTitle>
        </Card>
        <Card className="space-y-1">
          <CardText className="text-xs font-semibold uppercase tracking-wider text-brand-600">Activos</CardText>
          <CardTitle className="text-3xl">{students.filter((student) => student.active).length}</CardTitle>
        </Card>
        <Card className="space-y-1">
          <CardText className="text-xs font-semibold uppercase tracking-wider text-brand-600">Con DNI</CardText>
          <CardTitle className="text-3xl">{students.filter((student) => Boolean(student.dni)).length}</CardTitle>
          <CardText>Alumnos listos para accesos individuales</CardText>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-brand-900">
            <UserPlus className="h-5 w-5" />
            <CardTitle className="text-lg">Alta individual de alumno</CardTitle>
          </div>

          <form action={createStudentAction} className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="h-11 rounded-xl border border-brand-200 px-4 text-sm"
                name="first_name"
                placeholder="Primer nombre"
                required
              />
              <input
                className="h-11 rounded-xl border border-brand-200 px-4 text-sm"
                name="second_name"
                placeholder="Segundo nombre (opcional)"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <input
                className="h-11 rounded-xl border border-brand-200 px-4 text-sm sm:col-span-2"
                name="last_name"
                placeholder="Apellido"
                required
              />
              <input
                className="h-11 rounded-xl border border-brand-200 px-4 text-sm"
                min={3}
                max={120}
                name="age"
                placeholder="Edad"
                required
                type="number"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="h-11 rounded-xl border border-brand-200 px-4 text-sm"
                name="grade"
                placeholder="Grado (ej: 5to A)"
                required
              />
              <input
                className="h-11 rounded-xl border border-brand-200 px-4 text-sm"
                name="dni"
                placeholder="DNI"
                required
              />
            </div>

            <Button className="w-full gap-2">
              <Users className="h-4 w-4" />
              Guardar alumno
            </Button>
          </form>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-brand-900">
            <FileSpreadsheet className="h-5 w-5" />
            <CardTitle className="text-lg">Carga masiva</CardTitle>
          </div>

          <CardText>
            Descarga la plantilla Excel compatible y completa las columnas: primer nombre, segundo nombre, apellido,
            edad, grado y dni.
          </CardText>

          <a
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-brand-200 px-4 text-sm font-semibold text-brand-800 hover:bg-brand-50"
            download
            href="/plantilla-alumnos.csv"
          >
            <Download className="h-4 w-4" />
            Descargar plantilla (.csv)
          </a>

          <form action={importStudentsAction} className="space-y-3">
            <input
              accept=".csv,text/csv"
              className="block w-full rounded-xl border border-brand-200 px-4 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-100 file:px-3 file:py-2 file:font-semibold"
              name="students_file"
              required
              type="file"
            />
            <Button className="w-full gap-2" variant="secondary">
              <Upload className="h-4 w-4" />
              Importar alumnos
            </Button>
          </form>
        </Card>
      </section>

      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-brand-900">
          <Users className="h-5 w-5" />
          <CardTitle className="text-lg">Alumnos registrados</CardTitle>
        </div>

        {students.length === 0 ? (
          <CardText>No hay alumnos cargados todavía.</CardText>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-brand-100">
            <table className="min-w-full text-sm">
              <thead className="bg-brand-50 text-left text-brand-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nombre completo</th>
                  <th className="px-4 py-3 font-semibold">DNI</th>
                  <th className="px-4 py-3 font-semibold">Edad</th>
                  <th className="px-4 py-3 font-semibold">Grado</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr className="border-t border-brand-100" key={student.id}>
                    <td className="px-4 py-3 text-brand-900">{student.full_name}</td>
                    <td className="px-4 py-3 text-brand-700">{student.dni ?? "-"}</td>
                    <td className="px-4 py-3 text-brand-700">{student.age ?? "-"}</td>
                    <td className="px-4 py-3 text-brand-700">{student.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </RoleLayout>
  );
}
