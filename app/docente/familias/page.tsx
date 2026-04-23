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
      <div className="flex flex-col gap-8 animate-in">
        
        {/* HEADER PREMIUM */}
        <div className="relative overflow-hidden rounded-[3rem] bg-academic-navy p-10 text-white shadow-2xl md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-academic-gold/20 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-academic-gold font-black uppercase tracking-[0.2em] text-xs">
              <HeartHandshake className="h-4 w-4" /> Vínculo Institucional
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl leading-[1.1]">
              Gestión de Familias
            </h1>
            <p className="mt-6 text-xl font-medium text-white/70 max-w-prose leading-relaxed">
              Establece el puente entre el aula y el hogar. Conecta a los responsables con el perfil académico de sus hijos para un seguimiento compartido.
            </p>
          </div>
        </div>

        {/* CONNECTION FORM */}
        <Card className="border border-academic-gold/5 shadow-premium rounded-[3rem] p-10 bg-white">
          <div className="mb-8 flex items-center gap-4 border-b border-academic-gold/5 pb-6 text-academic-navy">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-ivory text-academic-gold shadow-sm border border-academic-gold/10">
              <Link2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-black uppercase tracking-tight">Establecer Nuevo Vínculo</CardTitle>
          </div>

          <form action={linkFamilyAction} className="grid md:grid-cols-[1fr,1fr,auto] items-end gap-6">
            <div className="space-y-3">
              <label htmlFor="family_id" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Responsable Familiar</label>
              <select 
                id="family_id"
                className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 px-6 font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm" 
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
            <div className="space-y-3">
              <label htmlFor="student_id" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Estudiante</label>
              <select 
                id="student_id"
                className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 px-6 font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm" 
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
            <Button className="h-16 rounded-2xl bg-academic-navy px-12 font-black text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-academic-navy/20 border-none">
              <PlusIcon className="mr-2 h-6 w-6 text-academic-gold" />
              Vincular
            </Button>
          </form>
        </Card>

        {/* LINKS GRID */}
        {links.length === 0 ? (
          <div className="rounded-[3rem] border-2 border-dashed border-academic-gold/10 bg-academic-ivory/30 p-20 text-center">
            <EmptyState
              title="Sin vínculos detectados"
              description="Empieza a conectar familias con estudiantes para habilitar los reportes de progreso."
            />
          </div>
        ) : (
          <section className="grid gap-8 md:grid-cols-2">
            {links.map((link) => {
              const student = students.find((row) => row.id === link.student_id);
              return (
                <Card key={link.relation_id} className="group overflow-hidden border border-academic-gold/5 shadow-sm transition-all duration-500 hover:shadow-premium hover:-translate-y-1 rounded-[2.5rem] bg-white p-8">
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-academic-ivory text-academic-gold border border-academic-gold/10">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black text-academic-navy tracking-tight">{link.family_name}</CardTitle>
                        <span className="text-[10px] font-black uppercase tracking-widest text-academic-gold opacity-80">{link.relation_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-academic-ivory/50 p-6 rounded-2xl border border-academic-gold/5 mb-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-academic-slate/40 mb-2">Representa al estudiante:</p>
                    <p className="font-black text-academic-navy text-lg">
                      {student?.full_name || "Desconocido"}
                    </p>
                    <p className="text-sm font-medium text-academic-gold italic mt-1">
                      {student?.grade || "-"} {student?.section || "-"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-academic-gold/5 pt-6 mt-auto">
                    <span className="inline-flex items-center gap-2 rounded-full bg-academic-forest/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-academic-forest">
                      <Sparkles className="h-3 w-3" /> Vínculo Activo
                    </span>
                    <form action={unlinkFamilyAction}>
                      <input name="relation_id" type="hidden" value={link.relation_id} />
                      <Button className="h-10 px-6 rounded-xl text-rose-600/60 bg-rose-50 hover:bg-rose-100 hover:text-rose-600 font-black text-[10px] uppercase tracking-widest transition-all" size="sm" variant="ghost" type="submit">
                        <Trash2 className="mr-2 h-4 w-4" /> Desvincular
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
