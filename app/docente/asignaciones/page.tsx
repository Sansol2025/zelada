import { revalidatePath } from "next/cache";
import { Link2, Plus, Trash2, Users, BookOpen, ChevronRight } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
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

  // ── Group: grade → student → [assignments] ──────────────────────────
  type AssignmentItem = (typeof assignments)[number];
  const byGrade = new Map<string, Map<string, AssignmentItem[]>>();

  for (const a of assignments) {
    const gradeKey = `${a.grade ?? "Sin grado"} ${a.section ?? ""}`.trim();
    const studentKey = a.student_id ?? a.student_name;

    if (!byGrade.has(gradeKey)) byGrade.set(gradeKey, new Map());
    const gradeMap = byGrade.get(gradeKey)!;
    if (!gradeMap.has(studentKey)) gradeMap.set(studentKey, []);
    gradeMap.get(studentKey)!.push(a);
  }

  const sortedGrades = Array.from(byGrade.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <RoleLayout
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente/asignaciones"
    >
      <div className="flex flex-col gap-4 animate-in">

        <PageHeader
          icon={<Users className="h-4 w-4" />}
          subtitle="Gestión de Estudiantes"
          title="Asignación de Materias"
          description="Vincula los recorridos pedagógicos con tus estudiantes para habilitar su acceso a las actividades."
        />

        {/* ── Form ─────────────────────────────────────── */}
        <Card className="border border-slate-200 shadow-sm rounded-xl p-5 bg-white">
          <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3 text-academic-navy">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-academic-gold shadow-sm border border-slate-100">
              <Link2 className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-bold tracking-tight">Vincular Nueva Aventura</CardTitle>
          </div>
          <form action={assignAction} className="grid md:grid-cols-[1fr,1fr,auto] items-end gap-3">
            <div className="space-y-1">
              <label htmlFor="student_id" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Estudiante</label>
              <select
                id="student_id"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm"
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
            <div className="space-y-1">
              <label htmlFor="subject_id" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Materia</label>
              <select
                id="subject_id"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm"
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
            <Button className="h-9 rounded-lg bg-academic-navy px-6 font-bold text-white hover:-translate-y-0.5 transition-all shadow-md w-full md:w-auto border-none text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5 text-academic-gold" />
              Asignar
            </Button>
          </form>
        </Card>

        {/* ── Grouped list ─────────────────────────────── */}
        {assignments.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <EmptyState
              title="Aún no hay asignaciones"
              description="Empieza a vincular niños con materias en la caja de arriba para que puedan empezar a jugar."
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedGrades.map(([grade, studentMap]) => (
              <Card key={grade} className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white p-0">

                {/* Grade header */}
                <div className="flex items-center gap-2 bg-academic-navy px-4 py-2">
                  <ChevronRight className="h-3.5 w-3.5 text-academic-gold" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">{grade}</span>
                  <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70">
                    {studentMap.size} alumno{studentMap.size !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Student rows */}
                <div className="divide-y divide-slate-100">
                  {Array.from(studentMap.entries()).map(([, studentAssignments], idx) => {
                    const first = studentAssignments[0];
                    return (
                      <div key={idx} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors">

                        {/* Avatar */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xs font-black uppercase">
                          {first.student_name?.charAt(0) ?? "?"}
                        </div>

                        {/* Name */}
                        <span className="w-36 shrink-0 text-sm font-bold text-academic-navy truncate">
                          {first.student_name}
                        </span>

                        {/* Subject pills */}
                        <div className="flex flex-1 flex-wrap gap-1.5 min-w-0">
                          {studentAssignments.map((a) => (
                            <form key={a.assignment_id} action={unassignAction} className="inline-flex">
                              <input name="assignment_id" type="hidden" value={a.assignment_id} />
                              <button
                                type="submit"
                                title="Quitar materia"
                                className="group/pill inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-academic-navy uppercase tracking-tight transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                              >
                                <BookOpen className="h-3 w-3 text-academic-gold group-hover/pill:text-rose-400 transition-colors" />
                                {a.subject_title}
                                <Trash2 className="h-2.5 w-2.5 opacity-0 group-hover/pill:opacity-100 transition-opacity text-rose-400" />
                              </button>
                            </form>
                          ))}
                        </div>

                        {/* Date of earliest assignment */}
                        <span className="ml-auto shrink-0 text-[9px] font-bold uppercase tracking-wider text-slate-300">
                          {first.assigned_at ? new Date(first.assigned_at).toLocaleDateString() : ""}
                        </span>

                      </div>
                    );
                  })}
                </div>

              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleLayout>
  );
}

