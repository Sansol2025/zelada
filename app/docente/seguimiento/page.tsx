import Link from "next/link";
import { BarChart3, Eye } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { StudentProgressTable } from "@/components/student-progress-table";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { getStudentsProgressForTeacher } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";
import type { StudentSummary } from "@/types/domain";

function normalizeStudentRows(rows: unknown): StudentSummary[] {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const studentId = row.student_id;
      if (typeof studentId !== "string" || !studentId) return null;
      return {
        student_id: studentId,
        student_name: String(row.student_name ?? "Estudiante"),
        progress_percent: Number(row.progress_percent ?? 0),
        blocked_modules: Number(row.blocked_modules ?? 0),
        completed_modules: Number(row.completed_modules ?? 0),
        total_time_seconds: Number(row.total_time_seconds ?? 0)
      };
    })
    .filter((row): row is StudentSummary => row !== null);
}

export default async function TeacherTrackingPage() {
  const session = await requireRole(["teacher", "admin"]);
  const rows = normalizeStudentRows(await getStudentsProgressForTeacher(session.userId as string));

  return (
    <RoleLayout
      title="Seguimiento por alumno"
      description="Observa avance, bloqueos y tiempo de dedicación con vista detallada."
      navItems={teacherNavItems}
      currentPath="/docente/seguimiento"
    >
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-brand-900">
          <BarChart3 className="h-5 w-5" />
          <CardTitle className="text-lg">Vista general de progreso</CardTitle>
        </div>
        <CardText>
          Selecciona un estudiante para acceder al reporte detallado por materia, módulo y actividad.
        </CardText>
      </Card>

      <StudentProgressTable rows={rows} />

      <section className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <Card key={row.student_id} className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{row.student_name}</CardTitle>
              <CardText>Avance {Math.round(row.progress_percent)}%</CardText>
            </div>
            <Link href={`/docente/seguimiento/${row.student_id}`}>
              <Button className="gap-2" size="sm" variant="secondary">
                <Eye className="h-4 w-4" />
                Ver detalle
              </Button>
            </Link>
          </Card>
        ))}
      </section>
    </RoleLayout>
  );
}
