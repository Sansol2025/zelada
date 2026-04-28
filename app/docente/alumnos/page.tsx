import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Download, FileSpreadsheet, Upload, UserPlus, Users, Sparkles } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { createStudentForTeacher, importStudentsFromCsv } from "@/features/teacher/actions";
import { getStudentsCatalogForTeacher } from "@/features/teacher/queries";
import { PageHeader } from "@/components/page-header";
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
      redirect("/docente/alumnos?error=Debes%20seleccionar%20un%20archivo%20Excel%20o%20CSV");
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
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente/alumnos"
    >
      <div className="flex flex-col gap-4 animate-in">
        
        {/* MESSAGES */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-black text-rose-800 uppercase tracking-widest text-center">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="rounded-2xl border border-academic-gold/20 bg-academic-gold/10 p-6 text-sm font-black text-academic-navy uppercase tracking-widest text-center">
            {successMessage}
          </div>
        )}

        <PageHeader
          icon={<Users className="h-4 w-4" />}
          subtitle="Gestión de Matrícula"
          title="Registro de Alumnos"
          description="Administra la comunidad de aprendices. Registra estudiantes de forma individual o mediante importación masiva para habilitar su experiencia digital."
        />

        {/* METRICS */}
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border border-slate-200 shadow-sm rounded-xl p-5 bg-white flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Alumnos</span>
            <span className="text-2xl font-display font-bold text-academic-navy my-2">{students.length}</span>
            <span className="text-[10px] font-semibold text-slate-400">Estudiantes en sistema</span>
          </Card>
          <Card className="border border-slate-200 shadow-sm rounded-xl p-5 bg-white flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Estatus: Activos</span>
            <span className="text-2xl font-display font-bold text-academic-navy my-2">{students.filter((s) => s.active).length}</span>
            <span className="text-[10px] font-semibold text-slate-400">Conectados hoy</span>
          </Card>
          <Card className="border border-slate-200 shadow-sm rounded-xl p-5 bg-white flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Identidad: DNI</span>
            <span className="text-2xl font-display font-bold text-academic-navy my-2">{students.filter((s) => Boolean(s.dni)).length}</span>
            <span className="text-[10px] font-semibold text-slate-400">Listos para QR</span>
          </Card>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* INDIVIDUAL FORM */}
          <Card className="border border-slate-200 shadow-sm rounded-xl p-6 bg-white">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 text-academic-navy">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-academic-gold shadow-sm border border-slate-100">
                <UserPlus className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold uppercase tracking-tight">Alta Individual</CardTitle>
            </div>

            <form action={createStudentAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="first_name" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Primer Nombre</label>
                  <input
                    id="first_name"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm"
                    name="first_name"
                    placeholder="Ej: Juan"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="second_name" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Segundo Nombre</label>
                  <input
                    id="second_name"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm"
                    name="second_name"
                    placeholder="(Opcional)"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="last_name" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Apellido</label>
                  <input
                    id="last_name"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm"
                    name="last_name"
                    placeholder="Apellido"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="age" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Edad</label>
                  <input
                    id="age"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm"
                    min={3}
                    max={120}
                    name="age"
                    placeholder="Edad"
                    required
                    type="number"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="grade" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Grado</label>
                  <input
                    id="grade"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm"
                    name="grade"
                    placeholder="Ej: 5to A"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="dni" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">DNI</label>
                  <input
                    id="dni"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm"
                    name="dni"
                    placeholder="Solo números"
                    required
                  />
                </div>
              </div>

              <Button className="h-12 w-full rounded-xl bg-academic-navy text-sm font-bold uppercase tracking-wider hover:-translate-y-0.5 transition-all shadow-md text-white border-none">
                <Sparkles className="mr-2 h-4 w-4 text-academic-gold" />
                Registrar Estudiante
              </Button>
            </form>
          </Card>

          {/* BULK IMPORT */}
          <Card className="border border-slate-200 shadow-sm rounded-xl p-6 bg-slate-50 relative overflow-hidden flex flex-col">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-slate-100 border-l border-b border-slate-200 opacity-50"></div>
            
            <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4 text-academic-navy relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-academic-navy text-white shadow-md">
                <FileSpreadsheet className="h-5 w-5 text-academic-gold" />
              </div>
              <CardTitle className="text-lg font-bold uppercase tracking-tight">Carga Masiva</CardTitle>
            </div>

            <p className="text-slate-500 font-medium leading-relaxed mb-6 relative z-10 text-sm italic">
              Descarga nuestra plantilla oficial, completa los campos pedagógicos y sube el archivo para registrar a todo tu grupo en segundos.
            </p>

            <div className="flex flex-col gap-6 relative z-10 mt-auto">
              <a
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-6 text-sm font-bold text-academic-navy transition-all hover:bg-slate-50 hover:border-slate-400 shadow-sm"
                download
                href="/api/students/template"
              >
                <Download className="h-5 w-5 text-academic-gold" />
                Planilla Modelo (.xlsx)
              </a>

              <form action={importStudentsAction} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="students_file" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Seleccionar Archivo</label>
                  <input
                    id="students_file"
                    accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                    className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-academic-navy file:mr-4 file:rounded-md file:border-0 file:bg-academic-navy file:px-3 file:py-1 file:text-[9px] file:font-bold file:uppercase file:tracking-wider file:text-white"
                    name="students_file"
                    required
                    type="file"
                  />
                </div>
                <Button className="h-12 w-full rounded-xl bg-academic-gold text-base font-bold hover:-translate-y-0.5 shadow-md transition-all text-white border-none" variant="secondary">
                  <Upload className="mr-2 h-5 w-5 text-white" />
                  Iniciar Importación
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* STUDENTS TABLE */}
        <Card className="border border-slate-200 shadow-sm rounded-xl p-6 bg-white overflow-hidden">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3 text-academic-navy">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-academic-navy border border-slate-200">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold uppercase tracking-tight">Comunidad Registrada</CardTitle>
            </div>
            <div className="hidden sm:block">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200">
                {students.length} Estudiantes
              </span>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="py-20 text-center italic text-academic-slate opacity-40">
              No hay aprendices registrados en este reino escolar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 pb-2">Nombre Completo</th>
                    <th className="px-6 pb-2">DNI</th>
                    <th className="px-6 pb-2">Edad</th>
                    <th className="px-6 pb-2">Grado / Sección</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium">
                  {students.map((student) => (
                    <tr key={student.id} className="group transition-all">
                      <td className="rounded-l-lg bg-slate-50/50 px-6 py-4 font-bold text-academic-navy border-y border-l border-slate-100 group-hover:bg-slate-100/50">{student.full_name}</td>
                      <td className="bg-slate-50/50 px-6 py-4 font-mono text-slate-500 border-y border-slate-100 group-hover:bg-slate-100/50">{student.dni ?? "—"}</td>
                      <td className="bg-slate-50/50 px-6 py-4 text-slate-500 border-y border-slate-100 group-hover:bg-slate-100/50">{student.age ?? "—"} años</td>
                      <td className="rounded-r-lg bg-slate-50/50 px-6 py-4 font-bold text-academic-gold border-y border-r border-slate-100 group-hover:bg-slate-100/50">{student.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </RoleLayout>
  );
}
