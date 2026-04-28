import { revalidatePath } from "next/cache";
import { Link2, Plus, Trash2, Users, BookOpen } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { assignSubjectToStudent, unassignSubjectFromStudent } from "@/features/teacher/actions";
import { getTeacherAssignments, getStudentsCatalogForTeacher, getTeacherSubjects } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";
import { PageHeader } from "@/components/page-header";

export default async function TeacherAssignmentsPage() {
  const session = await requireRole(["teacher", "admin"]);
  const teacherId = session.userId as string;

  const [assignments, students, subjects] = await Promise.all([
    getTeacherAssignments(teacherId).catch(() => []),
    getStudentsCatalogForTeacher().catch(() => []),
    getTeacherSubjects(teacherId).catch(() => [])
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
    >
      <div className="flex flex-col gap-4 animate-in">

        <PageHeader
          icon={<Users className="h-4 w-4" />}
          subtitle="Gestión de Estudiantes"
          title="Asignación de Materias"
          description="Vincula los recorridos pedagógicos con tus estudiantes para habilitar su acceso a las actividades."
        />

        <Card className="border border-slate-200 shadow-sm rounded-xl p-6 bg-white">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 text-academic-navy">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-academic-gold shadow-sm border border-slate-100">
              <Link2 className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-bold tracking-tight">Vincular Nueva Aventura</CardTitle>
          </div>
          <form action={assignAction} className="grid md:grid-cols-[1fr,1fr,auto] items-end gap-4">
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
            <div className="space-y-2">
              <label htmlFor="subject_id" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Materia</label>
              <select 
                id="subject_id"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm" 
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
            <Button className="h-10 rounded-xl bg-academic-navy px-8 font-bold text-white hover:-translate-y-0.5 transition-all shadow-md w-full md:w-auto border-none text-sm">
              <Plus className="mr-2 h-4 w-4 text-academic-gold" />
              Asignar
            </Button>
          </form>
        </Card>

        {assignments.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <EmptyState
              title="Aún no hay asignaciones"
              description="Empieza a vincular niños con materias en la caja de arriba para que puedan empezar a jugar."
            />
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            {assignments.map((assignment) => (
              <Card key={assignment.assignment_id} className="group overflow-hidden border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 rounded-xl p-0 flex flex-col sm:flex-row bg-white">
                <div className="flex w-full sm:w-24 shrink-0 items-center justify-center bg-slate-50 p-4 border-b sm:border-b-0 sm:border-r border-slate-100 text-slate-400">
                  <Users className="h-8 w-8 opacity-40" />
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <CardTitle className="text-xl font-bold text-academic-navy mb-1 tracking-tight">{assignment.student_name}</CardTitle>
                      <CardText className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {assignment.grade} {assignment.section}
                      </CardText>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <BookOpen className="h-4 w-4 text-academic-gold" />
                    <span className="font-bold text-academic-navy text-xs uppercase tracking-tight">
                      {assignment.subject_title}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Desde: {assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleDateString() : "Fecha pendiente"}
                    </span>
                    <form action={unassignAction}>
                      <input name="assignment_id" type="hidden" value={assignment.assignment_id} />
                      <Button className="h-8 px-3 rounded-lg text-rose-400/80 bg-rose-50 hover:bg-rose-100 hover:text-rose-600 font-bold text-[9px] uppercase tracking-wider transition-all" size="sm" variant="ghost">
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Quitar
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
