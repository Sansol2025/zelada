import { BarChart3, BookOpenCheck, Layers3, Sparkles, Users } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { RoleLayout } from "@/components/layout/role-layout";
import { StudentProgressTable } from "@/components/student-progress-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { getStudentsProgressForTeacher, getTeacherDashboardMetrics } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";
import { percent } from "@/lib/utils";
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

export default async function TeacherDashboardPage() {
  const session = await requireRole(["teacher", "admin"]);
  const teacherId = session.userId as string;

  const [metrics, rawRows] = await Promise.all([
    getTeacherDashboardMetrics(teacherId),
    getStudentsProgressForTeacher(teacherId)
  ]);

  const studentRows = normalizeStudentRows(rawRows);

  const cards = [
    {
      title: "Materias",
      value: metrics.subjectsCount,
      description: "Recorridos creados por el docente",
      icon: BookOpenCheck
    },
    {
      title: "Módulos",
      value: metrics.modulesCount,
      description: "Bloques pedagógicos activos",
      icon: Layers3
    },
    {
      title: "Actividades",
      value: metrics.activitiesCount,
      description: "Ejercicios totales configurados",
      icon: Sparkles
    },
    {
      title: "Asignaciones",
      value: metrics.assignedStudents,
      description: "Vínculos estudiante-materia",
      icon: Users
    }
  ];

  return (
    <RoleLayout
      title="Panel docente"
      description="Monitoreo rápido de contenidos, avance estudiantil y señales de bloqueo."
      navItems={teacherNavItems}
      currentPath="/docente"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="space-y-2">
            <div className="flex items-center justify-between">
              <CardText className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                {card.title}
              </CardText>
              <card.icon className="h-4 w-4 text-brand-700" />
            </div>
            <CardTitle className="text-3xl">{card.value}</CardTitle>
            <CardText>{card.description}</CardText>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">Panorama pedagógico</CardTitle>
            <Badge variant="default">Promedio: {percent(metrics.progressAverage)}</Badge>
          </div>
          <CardText>
            Este indicador resume el progreso actual de quienes tienen materias asignadas.
          </CardText>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Estudiantes bloqueados</p>
              <p className="mt-1 text-2xl font-bold text-amber-900">{metrics.blockedStudents}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Estudiantes completados</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">{metrics.completedStudents}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-brand-900">
            <BarChart3 className="h-5 w-5" />
            <CardTitle className="text-lg">Lectura rápida del tablero</CardTitle>
          </div>
          <CardText>
            Si hay bloqueos altos y avance bajo, conviene revisar secuencia de módulos y nivel de dificultad de actividades.
          </CardText>
          <CardText>
            Cuando el avance promedio supera 70%, suele ser buen momento para agregar nuevas actividades de práctica guiada.
          </CardText>
        </Card>
      </section>

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Acciones rápidas</CardTitle>
            <CardText>Accede directo a creación de contenidos, asignaciones y accesos.</CardText>
          </div>
          <div className="w-full md:w-72">
            <input
              className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm"
              placeholder="Buscar estudiante o materia"
              type="search"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/docente/materias/nueva">
            <Button size="sm">Nueva materia</Button>
          </Link>
          <Link href="/docente/asignaciones">
            <Button size="sm" variant="secondary">Asignar materias</Button>
          </Link>
          <Link href="/docente/accesos">
            <Button size="sm" variant="secondary">Generar QR/enlace</Button>
          </Link>
          <Link href="/docente/seguimiento">
            <Button size="sm" variant="secondary">Ver seguimiento</Button>
          </Link>
        </div>
      </Card>

      {metrics.subjectsCount === 0 ? (
        <EmptyState
          title="Aún no hay materias creadas"
          description="El siguiente paso es crear la primera materia y asignarla para comenzar a medir progreso."
        />
      ) : (
        <StudentProgressTable rows={studentRows} />
      )}
    </RoleLayout>
  );
}
