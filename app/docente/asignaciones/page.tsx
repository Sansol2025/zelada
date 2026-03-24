import { revalidatePath } from "next/cache";
import { Link2, Plus, Trash2, Users } from "lucide-react";

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
      title="Asignación a estudiantes"
      description="Vincula materias a estudiantes y gestiona las asignaciones activas."
      navItems={teacherNavItems}
      currentPath="/docente/asignaciones"
    >
      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-brand-900">
          <Plus className="h-5 w-5" />
          <CardTitle className="text-lg">Nueva asignación</CardTitle>
        </div>
        <form action={assignAction} className="grid gap-3 md:grid-cols-3">
          <select className="h-11 rounded-xl border border-brand-200 px-4 text-sm" name="student_id" required>
            <option value="">Seleccionar estudiante</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name} - {student.grade} {student.section}
              </option>
            ))}
          </select>
          <select className="h-11 rounded-xl border border-brand-200 px-4 text-sm" name="subject_id" required>
            <option value="">Seleccionar materia</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.title}
              </option>
            ))}
          </select>
          <Button className="gap-2">
            <Link2 className="h-4 w-4" />
            Asignar
          </Button>
        </form>
      </Card>

      {assignments.length === 0 ? (
        <EmptyState
          title="Sin asignaciones registradas"
          description="Asigna materias para que los estudiantes comiencen su recorrido."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{assignment.student_name}</CardTitle>
                  <CardText>
                    {assignment.grade} {assignment.section}
                  </CardText>
                </div>
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
                  {assignment.subject_title}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-600">
                <Users className="h-4 w-4" />
                Asignado: {new Date(assignment.assigned_at).toLocaleDateString()}
              </div>
              <form action={unassignAction}>
                <input name="assignment_id" type="hidden" value={assignment.id} />
                <Button className="gap-2 text-rose-700" size="sm" variant="ghost">
                  <Trash2 className="h-4 w-4" />
                  Quitar asignación
                </Button>
              </form>
            </Card>
          ))}
        </section>
      )}
    </RoleLayout>
  );
}
