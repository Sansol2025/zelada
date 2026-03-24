import { revalidatePath } from "next/cache";
import { Link2, Trash2, Users } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
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
      title="Gestión de familias vinculadas"
      description="Conecta familias con estudiantes para seguimiento desde el hogar."
      navItems={teacherNavItems}
      currentPath="/docente/familias"
    >
      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-brand-900">
          <Link2 className="h-5 w-5" />
          <CardTitle className="text-lg">Vincular familia a estudiante</CardTitle>
        </div>
        <form action={linkFamilyAction} className="grid gap-3 md:grid-cols-3">
          <select className="h-11 rounded-xl border border-brand-200 px-4 text-sm" name="family_id" required>
            <option value="">Seleccionar familia</option>
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.full_name} ({family.relation_type})
              </option>
            ))}
          </select>
          <select className="h-11 rounded-xl border border-brand-200 px-4 text-sm" name="student_id" required>
            <option value="">Seleccionar estudiante</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name} - {student.grade} {student.section}
              </option>
            ))}
          </select>
          <Button>Vincular</Button>
        </form>
      </Card>

      {links.length === 0 ? (
        <EmptyState
          title="Sin vínculos familiares aún"
          description="Realiza la primera vinculación para habilitar reportes familiares."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {links.map((link) => {
            const student = students.find((row) => row.id === link.student_id);
            return (
              <Card key={link.relation_id} className="space-y-3">
                <div className="flex items-center gap-2 text-brand-900">
                  <Users className="h-4 w-4" />
                  <CardTitle className="text-lg">{link.family_name}</CardTitle>
                </div>
                <CardText>{link.relation_type}</CardText>
                <CardText>
                  Estudiante: {student?.full_name || "Estudiante"} ({student?.grade || "-"} {student?.section || "-"})
                </CardText>
                <form action={unlinkFamilyAction}>
                  <input name="relation_id" type="hidden" value={link.relation_id} />
                  <Button className="gap-2 text-rose-700" size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                    Desvincular
                  </Button>
                </form>
              </Card>
            );
          })}
        </section>
      )}
    </RoleLayout>
  );
}
