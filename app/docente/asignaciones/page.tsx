import { revalidatePath } from "next/cache";
import { Link2, Plus, Trash2, Users, BookOpen } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { assignSubjectToStudent, unassignSubjectFromStudent } from "@/features/teacher/actions";
import { getTeacherAssignments, getTeacherStudents, getTeacherSubjects } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";

export default async function TeacherAssignmentsPage() {
  const session = await requireRole(["teacher", "admin"]);
  const teacherId = session.userId as string;

  const [assignments, students, subjects] = await Promise.all([
    getTeacherAssignments(teacherId),
    getTeacherStudents(teacherId),
    getTeacherSubjects(teacherId)
  ]);

  async function assignAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await assignSubjectToStudent(
      {
        subject_id: String(formData.get("subject_id") ?? ""),
        student_id: String(formData.get("student_id") ?? "")
      },
      activeSession.userId as string
    );
    revalidatePath("/docente/asignaciones");
  }

  async function unassignAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    const assignmentId = String(formData.get("assignment_id") ?? "");
    if (!assignmentId) return;
    await unassignSubjectFromStudent(assignmentId, activeSession.userId as string);
    revalidatePath("/docente/asignaciones");
  }

  return (
    <RoleLayout
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente/asignaciones"
    >
      <div className="flex flex-col gap-8 animate-in">

        {/* HEADER PREMIUM */}
        <div className="relative overflow-hidden rounded-[3rem] bg-academic-navy p-10 text-white shadow-2xl md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-academic-gold/20 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-academic-gold font-black uppercase tracking-[0.2em] text-xs">
              <Users className="h-4 w-4" /> Gestión de Estudiantes
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl leading-[1.1]">
              Asignación de Materias
            </h1>
            <p className="mt-6 text-xl font-medium text-white/70 max-w-prose leading-relaxed">
              Vincula los recorridos pedagógicos con tus estudiantes para habilitar su acceso a las actividades.
            </p>
          </div>
        </div>

        <Card className="border border-academic-gold/5 shadow-premium rounded-[3rem] p-10 bg-white">
          <div className="mb-8 flex items-center gap-4 border-b border-academic-gold/5 pb-6 text-academic-navy">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-ivory text-academic-gold shadow-sm border border-academic-gold/10">
              <Link2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight">Vincular Nueva Aventura</CardTitle>
          </div>
          <form action={assignAction} className="grid md:grid-cols-[1fr,1fr,auto] items-end gap-6">
            <div className="space-y-3">
              <label htmlFor="student_id" className="text-xs font-black uppercase tracking-widest text-academic-gold">Estudiante</label>
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
            <div className="space-y-3">
              <label htmlFor="subject_id" className="text-xs font-black uppercase tracking-widest text-academic-gold">Materia</label>
              <select 
                id="subject_id"
                className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 px-6 font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm" 
                name="subject_id" 
                required
              >
                <option value="">Selecciona un recorrido</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.title}
                  </option>
                ))}
              </select>
            </div>
            <Button className="h-16 rounded-2xl bg-academic-navy px-10 font-black text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-academic-navy/30 w-full md:w-auto border-none">
              <Plus className="mr-2 h-6 w-6 text-academic-gold" />
              Asignar
            </Button>
          </form>
        </Card>

        {assignments.length === 0 ? (
          <div className="rounded-[3rem] border-2 border-dashed border-academic-gold/10 bg-academic-ivory/30 p-20 text-center">
            <EmptyState
              title="Aún no hay asignaciones"
              description="Empieza a vincular niños con materias en la caja de arriba para que puedan empezar a jugar."
            />
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="group overflow-hidden border border-academic-gold/5 shadow-sm transition-all duration-500 hover:shadow-premium hover:-translate-y-1 rounded-[2.5rem] p-0 flex flex-col sm:flex-row bg-white">
                <div className="flex w-full sm:w-32 shrink-0 items-center justify-center bg-academic-ivory/30 p-6 border-b sm:border-b-0 sm:border-r border-academic-gold/5 text-academic-gold">
                  <Users className="h-12 w-12 opacity-30 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-1 flex-col justify-between p-8">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <CardTitle className="text-2xl font-black text-academic-navy mb-1 tracking-tight">{assignment.student_name}</CardTitle>
                      <CardText className="text-[10px] font-black uppercase tracking-[0.2em] text-academic-gold opacity-80">
                        {assignment.grade} {assignment.section}
                      </CardText>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-academic-ivory/50 p-4 rounded-2xl border border-academic-gold/5">
                    <BookOpen className="h-5 w-5 text-academic-gold" />
                    <span className="font-black text-academic-navy text-sm uppercase tracking-tight">
                      {assignment.subject_title}
                    </span>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-academic-gold/5 pt-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-academic-slate/40">
                      Desde: {new Date(assignment.assigned_at).toLocaleDateString()}
                    </span>
                    <form action={unassignAction}>
                      <input name="assignment_id" type="hidden" value={assignment.id} />
                      <Button className="h-10 px-5 rounded-xl text-rose-600/60 bg-rose-50 hover:bg-rose-100 hover:text-rose-600 font-black text-[10px] uppercase tracking-widest transition-all" size="sm" variant="ghost">
                        <Trash2 className="mr-2 h-4 w-4" /> Quitar
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            ))}
          </section>
        )}
      </div>
    </RoleLayout>
  );
}
