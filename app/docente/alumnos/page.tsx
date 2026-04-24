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
      <div className="flex flex-col gap-8 animate-in">
        
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
        <section className="grid gap-6 md:grid-cols-3">
          <Card className="border border-academic-gold/5 shadow-premium rounded-[2.5rem] p-8 bg-white flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-academic-gold">Total Alumnos</span>
            <span className="text-4xl font-display font-black text-academic-navy my-4">{students.length}</span>
            <span className="text-[10px] font-black text-academic-slate/40">Estudiantes en sistema</span>
          </Card>
          <Card className="border border-academic-gold/5 shadow-premium rounded-[2.5rem] p-8 bg-white flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-academic-gold">Estatus: Activos</span>
            <span className="text-4xl font-display font-black text-academic-navy my-4">{students.filter((s) => s.active).length}</span>
            <span className="text-[10px] font-black text-academic-slate/40">Conectados hoy</span>
          </Card>
          <Card className="border border-academic-gold/5 shadow-premium rounded-[2.5rem] p-8 bg-white flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-academic-gold">Identidad: DNI</span>
            <span className="text-4xl font-display font-black text-academic-navy my-4">{students.filter((s) => Boolean(s.dni)).length}</span>
            <span className="text-[10px] font-black text-academic-slate/40">Listos para QR</span>
          </Card>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* INDIVIDUAL FORM */}
          <Card className="border border-academic-gold/5 shadow-premium rounded-[3rem] p-10 bg-white">
            <div className="mb-10 flex items-center gap-4 border-b border-academic-gold/5 pb-8 text-academic-navy">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-ivory text-academic-gold shadow-sm border border-academic-gold/10">
                <UserPlus className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Alta Individual</CardTitle>
            </div>

            <form action={createStudentAction} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="first_name" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Primer Nombre</label>
                  <input
                    id="first_name"
                    className="h-14 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/30 px-6 font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm"
                    name="first_name"
                    placeholder="Ej: Juan"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="second_name" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Segundo Nombre</label>
                  <input
                    id="second_name"
                    className="h-14 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/30 px-6 font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm"
                    name="second_name"
                    placeholder="(Opcional)"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="last_name" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Apellido</label>
                  <input
                    id="last_name"
                    className="h-14 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/30 px-6 font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm"
                    name="last_name"
                    placeholder="Apellido"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="age" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Edad</label>
                  <input
                    id="age"
                    className="h-14 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/30 px-6 font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm"
                    min={3}
                    max={120}
                    name="age"
                    placeholder="Edad"
                    required
                    type="number"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="grade" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Grado</label>
                  <input
                    id="grade"
                    className="h-14 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/30 px-6 font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm"
                    name="grade"
                    placeholder="Ej: 5to A"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="dni" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">DNI</label>
                  <input
                    id="dni"
                    className="h-14 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/30 px-6 font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm"
                    name="dni"
                    placeholder="Solo números"
                    required
                  />
                </div>
              </div>

              <Button className="h-16 w-full rounded-2xl bg-academic-navy text-base font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-academic-navy/20 border-none text-white">
                <Sparkles className="mr-2 h-5 w-5 text-academic-gold" />
                Registrar Estudiante
              </Button>
            </form>
          </Card>

          {/* BULK IMPORT */}
          <Card className="border border-academic-gold/5 shadow-premium rounded-[3rem] p-10 bg-academic-ivory/20 relative overflow-hidden flex flex-col">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-academic-gold/5 border-l border-b border-academic-gold/10"></div>
            
            <div className="mb-10 flex items-center gap-4 border-b border-academic-gold/5 pb-8 text-academic-navy relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-navy text-white shadow-lg">
                <FileSpreadsheet className="h-6 w-6 text-academic-gold" />
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Carga Masiva</CardTitle>
            </div>

            <p className="text-academic-slate font-medium leading-relaxed mb-10 relative z-10 text-lg">
              Descarga nuestra plantilla oficial, completa los campos pedagógicos y sube el archivo para registrar a todo tu grupo en segundos.
            </p>

            <div className="flex flex-col gap-8 relative z-10 mt-auto">
              <a
                className="inline-flex h-20 items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-academic-gold/20 bg-white px-8 text-lg font-black text-academic-navy transition-all hover:bg-academic-ivory hover:border-academic-gold/40 shadow-sm"
                download
                href="/api/students/template"
              >
                <Download className="h-8 w-8 text-academic-gold" />
                Planilla Modelo (.xlsx)
              </a>

              <form action={importStudentsAction} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="students_file" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Seleccionar Archivo</label>
                  <input
                    id="students_file"
                    accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                    className="block w-full rounded-2xl border border-academic-gold/10 bg-white px-6 py-4 text-sm font-bold text-academic-navy file:mr-4 file:rounded-xl file:border-0 file:bg-academic-navy file:px-4 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:text-white"
                    name="students_file"
                    required
                    type="file"
                  />
                </div>
                <Button className="h-20 w-full rounded-[2rem] bg-academic-gold text-xl font-black tracking-tight hover:scale-105 active:scale-95 shadow-2xl shadow-academic-gold/30 transition-all text-white border-none" variant="secondary">
                  <Upload className="mr-4 h-8 w-8 text-white" />
                  Iniciar Importación
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* STUDENTS TABLE */}
        <Card className="border border-academic-gold/5 shadow-premium rounded-[3rem] p-10 bg-white overflow-hidden">
          <div className="mb-10 flex items-center justify-between border-b border-academic-gold/5 pb-8">
            <div className="flex items-center gap-4 text-academic-navy">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-navy/5 text-academic-navy border border-academic-navy/10">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Comunidad Registrada</CardTitle>
            </div>
            <div className="hidden sm:block">
              <span className="rounded-full bg-academic-ivory px-4 py-2 text-xs font-black text-academic-navy uppercase tracking-widest border border-academic-gold/10">
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
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-academic-gold">
                    <th className="px-8 pb-4">Nombre Completo</th>
                    <th className="px-8 pb-4">DNI</th>
                    <th className="px-8 pb-4">Edad</th>
                    <th className="px-8 pb-4">Grado / Sección</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {students.map((student) => (
                    <tr key={student.id} className="group transition-all hover:translate-x-1">
                      <td className="rounded-l-[2rem] bg-academic-ivory/50 px-8 py-6 font-black text-academic-navy border-y border-l border-academic-gold/5 group-hover:bg-academic-ivory">{student.full_name}</td>
                      <td className="bg-academic-ivory/50 px-8 py-6 font-mono text-academic-slate border-y border-academic-gold/5 group-hover:bg-academic-ivory">{student.dni ?? "—"}</td>
                      <td className="bg-academic-ivory/50 px-8 py-6 text-academic-slate border-y border-academic-gold/5 group-hover:bg-academic-ivory">{student.age ?? "—"} años</td>
                      <td className="rounded-r-[2rem] bg-academic-ivory/50 px-8 py-6 font-bold text-academic-gold border-y border-r border-academic-gold/5 group-hover:bg-academic-ivory">{student.grade}</td>
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
