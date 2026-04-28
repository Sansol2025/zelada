import { revalidatePath } from "next/cache";
import { Link2, Trash2, Users, HeartHandshake, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { linkFamilyToStudent, unlinkFamilyFromStudent } from "@/features/teacher/actions";
import { getAvailableFamilies, getTeacherFamilies, getTeacherStudents } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";
import { PageHeader } from "@/components/page-header";

export default async function TeacherFamiliesPage() {
  const session = await requireRole(["teacher", "admin"]);
  const teacherId = session.userId as string;

  const [links, students, families] = await Promise.all([
    getTeacherFamilies(teacherId),
    getTeacherStudents(teacherId),
    getAvailableFamilies()
  ]);

  async function linkFamilyAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await linkFamilyToStudent(
      {
        family_id: String(formData.get("family_id") ?? ""),
        student_id: String(formData.get("student_id") ?? "")
      },
      activeSession.userId as string
    );
    revalidatePath("/docente/familias");
  }

  async function unlinkFamilyAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    const relationId = String(formData.get("relation_id") ?? "");
    if (!relationId) return;
    await unlinkFamilyFromStudent(relationId, activeSession.userId as string);
    revalidatePath("/docente/familias");
  }

  return (
    <RoleLayout
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente/familias"
    >
    >
      <div className="flex flex-col gap-4 animate-in">
        
        <PageHeader
          icon={<HeartHandshake className="h-4 w-4" />}
          subtitle="Vínculo Institucional"
          title="Gestión de Familias"
          description="Establece el puente entre el aula y el hogar. Conecta a los responsables con el perfil académico para un seguimiento compartido."
        />

        {/* CONNECTION FORM */}
        <Card className="border border-slate-200 shadow-sm rounded-xl p-6 bg-white">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 text-academic-navy">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-academic-gold shadow-sm border border-slate-100">
              <Link2 className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-bold uppercase tracking-tight">Establecer Nuevo Vínculo</CardTitle>
          </div>

          <form action={linkFamilyAction} className="grid md:grid-cols-[1fr,1fr,auto] items-end gap-4">
            <div className="space-y-2">
              <label htmlFor="family_id" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Responsable Familiar</label>
              <select 
                id="family_id"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm" 
                name="family_id" 
                required
              >
                <option value="">Selecciona un responsable</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.full_name} • {family.relation_type}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="student_id" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Estudiante</label>
              <select 
                id="student_id"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm" 
                name="student_id" 
                required
              >
                <option value="">Selecciona un alumno</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} • {student.grade}{student.section}
                  </option>
                ))}
              </select>
            </div>
            <Button className="h-10 rounded-xl bg-academic-navy px-10 font-bold text-white hover:-translate-y-0.5 transition-all shadow-md w-full md:w-auto border-none text-sm">
              <PlusIcon className="mr-2 h-4 w-4 text-academic-gold" />
              Vincular
            </Button>
          </form>
        </Card>

        {/* LINKS GRID */}
        {links.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <EmptyState
              title="Sin vínculos detectados"
              description="Empieza a conectar familias con estudiantes para habilitar los reportes de progreso."
            />
          </div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {links.map((link) => {
              const student = students.find((row) => row.id === link.student_id);
              return (
                <Card key={link.relation_id} className="group overflow-hidden border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 rounded-xl bg-white p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-academic-gold border border-slate-200">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-academic-navy tracking-tight">{link.family_name}</CardTitle>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-academic-gold opacity-80">{link.relation_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Representa al estudiante:</p>
                    <p className="font-bold text-academic-navy text-base">
                      {student?.full_name || "Desconocido"}
                    </p>
                    <p className="text-xs font-medium text-academic-gold italic mt-0.5">
                      {student?.grade || "-"} {student?.section || "-"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-academic-forest/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-academic-forest">
                      <Sparkles className="h-2.5 w-2.5" /> Vínculo Activo
                    </span>
                    <form action={unlinkFamilyAction}>
                      <input name="relation_id" type="hidden" value={link.relation_id} />
                      <Button className="h-8 px-4 rounded-lg text-rose-400/80 bg-rose-50 hover:bg-rose-100 hover:text-rose-600 font-bold text-[9px] uppercase tracking-wider transition-all" size="sm" variant="ghost" type="submit">
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Desvincular
                      </Button>
                    </form>
                  </div>
                </Card>
              );
            })}
          </section>
        )}
      </div>
    </RoleLayout>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
