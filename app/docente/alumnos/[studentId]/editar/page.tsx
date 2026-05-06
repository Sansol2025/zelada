import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { UserPlus, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { updateStudentForTeacher } from "@/features/teacher/actions";
import { getStudentsCatalogForTeacher } from "@/features/teacher/queries";
import { PageHeader } from "@/components/page-header";
import { teacherNavItems } from "@/lib/navigation";

type EditStudentPageProps = {
  params: Promise<{ studentId: string }>;
};

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const session = await requireRole(["teacher", "admin"]);
  const { studentId } = await params;
  
  const students = await getStudentsCatalogForTeacher().catch(() => []);
  const student = students.find(s => s.id === studentId);

  if (!student) notFound();

  // Intentar separar el nombre completo (aproximado)
  const nameParts = student.full_name?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts[nameParts.length - 1] || "";
  const secondName = nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";

  async function updateAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    try {
      await updateStudentForTeacher(
        studentId,
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
      console.error(error);
      return;
    }

    revalidatePath("/docente/alumnos");
    redirect("/docente/alumnos?success=Alumno%20actualizado%20correctamente");
  }

  return (
    <RoleLayout
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente/alumnos"
    >
      <div className="flex flex-col gap-4 animate-in">
        
        <Link 
          href="/docente/alumnos"
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-academic-navy transition-colors mb-2"
        >
          <ArrowLeft className="h-3 w-3" />
          Volver al listado
        </Link>

        <PageHeader
          icon={<UserPlus className="h-4 w-4" />}
          subtitle="Modificar Aprendiz"
          title={`Editar a ${student.full_name}`}
          description="Actualiza la información pedagógica o de identidad del estudiante."
        />

        <div className="max-w-2xl">
          <Card className="border border-slate-200 shadow-sm rounded-xl p-6 bg-white">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 text-academic-navy">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-academic-gold shadow-sm border border-slate-100">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold uppercase tracking-tight">Datos del Estudiante</CardTitle>
            </div>

            <form action={updateAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="first_name" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Primer Nombre</label>
                  <input
                    id="first_name"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm"
                    name="first_name"
                    defaultValue={firstName}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="second_name" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Segundo Nombre</label>
                  <input
                    id="second_name"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm"
                    name="second_name"
                    defaultValue={secondName}
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
                    defaultValue={lastName}
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
                    defaultValue={student.age || ""}
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
                    defaultValue={student.grade || ""}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="dni" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">DNI</label>
                  <input
                    id="dni"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm"
                    name="dni"
                    defaultValue={student.dni || ""}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Link href="/docente/alumnos" className="flex-1">
                  <Button type="button" variant="outline" className="w-full h-12 rounded-xl text-sm font-bold uppercase tracking-wider border-slate-200 text-slate-500">
                    Cancelar
                  </Button>
                </Link>
                <Button className="flex-[2] h-12 rounded-xl bg-academic-navy text-sm font-bold uppercase tracking-wider hover:-translate-y-0.5 transition-all shadow-md text-white border-none">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </RoleLayout>
  );
}
