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
      <div className="flex flex-col gap-6">

        {/* HEADER MAGICO */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-400 p-8 text-white shadow-xl sm:p-12">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-blue-100 font-bold uppercase tracking-wider text-sm">
              <Users className="h-4 w-4" /> Alumnos y Magia
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Asignación de Materias
            </h1>
            <p className="mt-4 text-lg font-medium text-blue-50">
              Vincula las materias mágicas con tus estudiantes para que puedan comenzar su aventura de aprendizaje.
            </p>
          </div>
        </div>

        <Card className="border-none shadow-card rounded-[2rem] p-6 lg:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-brand-50 pb-4 text-brand-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Link2 className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-bold">Unir estudiante a materia</CardTitle>
          </div>
          <form action={assignAction} className="grid md:grid-cols-[1fr,1fr,auto] items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-900">¿Quién va a jugar?</label>
              <select className="h-14 w-full rounded-2xl border border-brand-200 bg-soft-sky px-4 font-semibold text-brand-900 focus:border-brand-500 focus:bg-white focus:outline-none transition-colors" name="student_id" required>
                <option value="">Selecciona un estudiante</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} - {student.grade} {student.section}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-900">¿A qué aventura se une?</label>
              <select className="h-14 w-full rounded-2xl border border-brand-200 bg-soft-sky px-4 font-semibold text-brand-900 focus:border-brand-500 focus:bg-white focus:outline-none transition-colors" name="subject_id" required>
                <option value="">Selecciona una materia</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.title}
                  </option>
                ))}
              </select>
            </div>
            <Button className="h-14 rounded-2xl bg-blue-600 px-8 font-bold hover:bg-blue-500 transition-all shadow-md shadow-blue-500/20 hover:-translate-y-1 w-full md:w-auto">
              <Plus className="mr-2 h-5 w-5" />
              Asignar Aventura
            </Button>
          </form>
        </Card>

        {assignments.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed border-brand-200 bg-brand-50 p-12 text-center mt-4 h-64 flex flex-col items-center justify-center">
            <EmptyState
              title="Aún no hay asignaciones"
              description="Empieza a vincular niños con materias en la caja de arriba."
            />
          </div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 mt-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="group overflow-hidden border-none shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-[2rem] p-0 flex flex-col sm:flex-row bg-white">
                <div className="flex w-full sm:w-24 shrink-0 items-center justify-center bg-blue-50 p-4 border-b sm:border-b-0 sm:border-r border-brand-100 text-blue-600">
                  <Users className="h-10 w-10 opacity-50" />
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <CardTitle className="text-xl font-bold text-brand-950 mb-1">{assignment.student_name}</CardTitle>
                      <CardText className="text-sm text-brand-600 font-semibold uppercase tracking-wider">
                        {assignment.grade} {assignment.section}
                      </CardText>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-soft-sky p-3 rounded-xl border border-brand-100">
                    <BookOpen className="h-5 w-5 text-brand-500" />
                    <span className="font-bold text-brand-800 text-sm">
                      {assignment.subject_title}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-medium text-slate-500">
                      Unido el: {new Date(assignment.assigned_at).toLocaleDateString()}
                    </span>
                    <form action={unassignAction}>
                      <input name="assignment_id" type="hidden" value={assignment.id} />
                      <Button className="h-9 px-3 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold text-xs" size="sm" variant="ghost">
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
