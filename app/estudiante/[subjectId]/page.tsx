import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, FolderKanban, LockKeyhole, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { LockedModuleCard } from "@/components/locked-module-card";
import { ProgressCard } from "@/components/progress-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { getStudentContextOrRedirect } from "@/features/student/access";
import { getStudentAssignedSubjects, getSubjectLearningPath } from "@/features/student/queries";
import { percent } from "@/lib/utils";

type SubjectPageProps = {
  params: Promise<{ subjectId: string }>;
};

export default async function StudentSubjectPage({ params }: SubjectPageProps) {
  const { subjectId } = await params;
  const student = await getStudentContextOrRedirect();
  const assignedSubjects = await getStudentAssignedSubjects(student.studentId);

  const assignment = assignedSubjects.find((entry) => {
    const subject = Array.isArray(entry.subject) ? entry.subject[0] : entry.subject;
    return subject?.id === subjectId;
  });

  if (!assignment) notFound();

  const subject = (Array.isArray(assignment.subject) ? assignment.subject[0] : assignment.subject) as
    | {
        id: string;
        title: string;
        description: string | null;
        color: string;
      }
    | undefined;

  if (!subject) notFound();

  const modules = await getSubjectLearningPath(subjectId, student.studentId);
  const progressPercent = Number(assignment.progress?.progress_percent ?? 0);
  const status = String(assignment.progress?.status ?? "pending");

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6">
      <header className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
        <div className="mb-3">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700" href="/estudiante">
            <ArrowLeft className="h-4 w-4" />
            Volver a materias
          </Link>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Recorrido asignado</p>
            <h1 className="font-display text-3xl font-extrabold text-brand-950">{subject.title}</h1>
            {subject.description ? <p className="text-sm text-brand-700">{subject.description}</p> : null}
          </div>
          <div className="space-y-2">
            <Badge variant={status === "completed" ? "success" : "default"}>{status.replace("_", " ")}</Badge>
            <p className="text-right text-sm font-semibold text-brand-700">Avance: {percent(progressPercent)}</p>
          </div>
        </div>
      </header>

      <section className="mt-5 grid gap-4 md:grid-cols-2">
        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-brand-900">
            <FolderKanban className="h-4 w-4" />
            <CardTitle className="text-lg">Módulos del recorrido</CardTitle>
          </div>
          <CardText>
            Completa los módulos en orden. Algunos se desbloquean automáticamente al finalizar el anterior.
          </CardText>
        </Card>
        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-brand-900">
            <Sparkles className="h-4 w-4" />
            <CardTitle className="text-lg">Recomendación</CardTitle>
          </div>
          <CardText>
            Si encuentras un módulo bloqueado, vuelve al anterior y completa las actividades pendientes.
          </CardText>
        </Card>
      </section>

      {modules.length === 0 ? (
        <section className="mt-5">
          <EmptyState
            title="Sin módulos disponibles"
            description="Tu docente todavía no cargó módulos en esta materia."
          />
        </section>
      ) : (
        <section className="mt-5 grid gap-4 md:grid-cols-2">
          {modules.map((module) =>
            module.is_locked ? (
              <LockedModuleCard
                key={module.id}
                title={module.title}
                description={module.description}
                reason="Debes completar el módulo previo para desbloquear este contenido."
              />
            ) : (
              <ProgressCard
                key={module.id}
                title={module.title}
                description={module.description}
                progress={module.progress_percent}
                href={`/estudiante/${subjectId}/modulo/${module.id}` as Route}
                accent={subject.color ?? "#43b8f4"}
              />
            )
          )}
        </section>
      )}

      <section className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
        <LockKeyhole className="h-4 w-4" />
        Flujo secuencial activo
      </section>
    </main>
  );
}
