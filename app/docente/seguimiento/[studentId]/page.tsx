import { notFound } from "next/navigation";
import { Clock3, Gauge, Layers, ListChecks } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { getTeacherStudentDetail } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";
import { formatSeconds, percent } from "@/lib/utils";

type StudentDetailPageProps = {
  params: Promise<{ studentId: string }>;
};

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const session = await requireRole(["teacher", "admin"]);
  const { studentId } = await params;
  const detail = await getTeacherStudentDetail(session.userId as string, studentId);

  if (!detail) notFound();

  const totalTime = detail.activityProgress.reduce((acc, row) => acc + Number(row.time_spent_seconds || 0), 0);
  const completedActivities = detail.activityProgress.filter((row) => row.status === "completed").length;
  const averageScore = detail.activityProgress.length
    ? detail.activityProgress.reduce((acc, row) => acc + Number(row.score || 0), 0) / detail.activityProgress.length
    : 0;

  return (
    <RoleLayout
      title={`Progreso de ${detail.student.full_name}`}
      description={`Grado ${detail.student.grade} - Sección ${detail.student.section}`}
      navItems={teacherNavItems}
      currentPath="/docente/seguimiento"
    >
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-brand-800">
            <Gauge className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Puntaje promedio</span>
          </div>
          <p className="text-3xl font-extrabold text-brand-950">{Math.round(averageScore)}</p>
          <CardText>Promedio de resultados registrados.</CardText>
        </Card>
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-brand-800">
            <Clock3 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Tiempo invertido</span>
          </div>
          <p className="text-3xl font-extrabold text-brand-950">{formatSeconds(totalTime)}</p>
          <CardText>Suma de tiempo registrado en actividades.</CardText>
        </Card>
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-brand-800">
            <ListChecks className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Actividades completadas</span>
          </div>
          <p className="text-3xl font-extrabold text-brand-950">{completedActivities}</p>
          <CardText>Total de actividades finalizadas por el alumno.</CardText>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {detail.subjectProgress.map((row) => (
          <Card key={row.subject_id} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">Materia {row.subject_id.slice(0, 8)}</CardTitle>
              <Badge variant={row.status === "completed" ? "success" : "default"}>
                {row.status}
              </Badge>
            </div>
            <CardText>Avance: {percent(Number(row.progress_percent || 0))}</CardText>
            <CardText>
              Módulos: {row.completed_modules}/{row.total_modules}
            </CardText>
          </Card>
        ))}
      </section>

      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-brand-900">
          <Layers className="h-5 w-5" />
          <CardTitle className="text-lg">Estado por módulo</CardTitle>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {detail.moduleProgress.map((row) => (
            <div key={row.module_id} className="rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm">
              <p className="font-semibold text-brand-900">Módulo {row.module_id.slice(0, 8)}</p>
              <p className="text-brand-700">Estado: {row.status}</p>
              <p className="text-brand-700">Progreso: {percent(Number(row.progress_percent || 0))}</p>
            </div>
          ))}
        </div>
      </Card>
    </RoleLayout>
  );
}
