import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, CircleCheckBig, LockKeyhole } from "lucide-react";
import { notFound } from "next/navigation";

import { ActivityRenderer } from "@/components/activity-renderer";
import { EmptyState } from "@/components/empty-state";
import { LockedModuleCard } from "@/components/locked-module-card";
import { Badge } from "@/components/ui/badge";
import { CardText, CardTitle } from "@/components/ui/card";
import { getStudentContextOrRedirect } from "@/features/student/access";
import { getStudentModuleActivities, getSubjectLearningPath } from "@/features/student/queries";
import { percent } from "@/lib/utils";

type ModulePageProps = {
  params: Promise<{ subjectId: string; moduleId: string }>;
};

export default async function StudentModulePage({ params }: ModulePageProps) {
  const { subjectId, moduleId } = await params;
  const student = await getStudentContextOrRedirect();
  const subjectPath = await getSubjectLearningPath(subjectId, student.studentId);

  const moduleData = subjectPath.find((module) => module.id === moduleId);
  if (!moduleData) notFound();

  const backHref = `/estudiante/${subjectId}` as Route;

  if (moduleData.is_locked) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-6">
        <div className="mb-4">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700" href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            Volver a la materia
          </Link>
        </div>
        <LockedModuleCard
          title={moduleData.title}
          description={moduleData.description}
          reason="Este módulo permanece bloqueado hasta completar el anterior."
        />
      </main>
    );
  }

  const activities = await getStudentModuleActivities(moduleId, student.studentId);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6">
      <header className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
        <div className="mb-3">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700" href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            Volver a la materia
          </Link>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Módulo activo</p>
            <h1 className="font-display text-3xl font-extrabold text-brand-950">{moduleData.title}</h1>
            {moduleData.description ? <p className="text-sm text-brand-700">{moduleData.description}</p> : null}
          </div>
          <Badge variant={moduleData.status === "completed" ? "success" : "default"}>
            Progreso: {percent(moduleData.progress_percent)}
          </Badge>
        </div>
      </header>

      <section className="mt-5 rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
        <div className="flex items-center gap-2 text-brand-900">
          <CircleCheckBig className="h-5 w-5" />
          <CardTitle className="text-lg">Actividades del módulo</CardTitle>
        </div>
        <CardText className="mt-1">
          Completa cada actividad para actualizar automáticamente tu avance.
        </CardText>
      </section>

      {activities.length === 0 ? (
        <section className="mt-5">
          <EmptyState
            title="Aún no hay actividades en este módulo"
            description="Cuando el docente agregue actividades, aparecerán aquí."
          />
        </section>
      ) : (
        <section className="mt-5 space-y-4">
          {activities.map((activity, index) => (
            <article key={activity.id} className="space-y-3 rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="default">Actividad {index + 1}</Badge>
                {activity.progress?.status === "completed" ? (
                  <Badge variant="success">Completada</Badge>
                ) : (
                  <Badge variant="warning">Pendiente</Badge>
                )}
              </div>
              <ActivityRenderer
                studentId={student.studentId}
                activity={{
                  id: activity.id,
                  type: activity.type,
                  title: activity.title,
                  prompt: activity.prompt,
                  instructions: activity.instructions,
                  image_url: activity.image_url,
                  settings_json: (activity.settings_json as Record<string, unknown> | null) ?? null
                }}
              />
            </article>
          ))}
        </section>
      )}

      <section className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
        <LockKeyhole className="h-4 w-4" />
        Guardado automático de progreso
      </section>
    </main>
  );
}
