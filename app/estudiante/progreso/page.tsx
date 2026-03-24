import { CheckCircle2, Gauge, Layers } from "lucide-react";
import type { Route } from "next";

import { ProgressCard } from "@/components/progress-card";
import { StudentShell } from "@/components/layout/student-shell";
import { Card, CardText } from "@/components/ui/card";
import { getStudentContextOrRedirect } from "@/features/student/access";
import { getStudentAssignedSubjects, getStudentGlobalProgress } from "@/features/student/queries";
import { percent } from "@/lib/utils";

export default async function StudentProgressPage() {
  const student = await getStudentContextOrRedirect();
  const [assigned, global] = await Promise.all([
    getStudentAssignedSubjects(student.studentId),
    getStudentGlobalProgress(student.studentId)
  ]);

  return (
    <StudentShell
      title="Mi progreso"
      description="Visualiza tu avance general y por materia."
      currentPath="/estudiante/progreso"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-brand-800">
            <Gauge className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Avance general</span>
          </div>
          <p className="text-3xl font-extrabold text-brand-950">{percent(global.averageProgress)}</p>
          <CardText>Promedio de todas tus materias.</CardText>
        </Card>
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-brand-800">
            <Layers className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Materias activas</span>
          </div>
          <p className="text-3xl font-extrabold text-brand-950">{global.totalSubjects}</p>
          <CardText>Total de materias asignadas.</CardText>
        </Card>
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-brand-800">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Completadas</span>
          </div>
          <p className="text-3xl font-extrabold text-brand-950">{global.completedSubjects}</p>
          <CardText>Materias finalizadas con éxito.</CardText>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(assigned ?? []).map((entry) => {
          const subject = Array.isArray(entry.subject) ? entry.subject[0] : entry.subject;
          if (!subject) return null;
          return (
            <ProgressCard
              key={subject.id}
              title={subject.title}
              description={subject.description}
              progress={Number(entry.progress?.progress_percent ?? 0)}
              href={`/estudiante/${subject.id}` as Route}
              accent={subject.color || "#43b8f4"}
            />
          );
        })}
      </div>
    </StudentShell>
  );
}
