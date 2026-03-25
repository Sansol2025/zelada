import Link from "next/link";
import type { Route } from "next";
import { 
  ArrowLeft, 
  CircleCheckBig, 
  LockKeyhole, 
  Sparkles, 
  Gamepad2 
} from "lucide-react";
import { notFound } from "next/navigation";

import { ActivityRenderer } from "@/components/activity-renderer";
import { VideoPlayer } from "@/components/video-player";
import { EmptyState } from "@/components/empty-state";
import { LockedModuleCard } from "@/components/locked-module-card";
import { Badge } from "@/components/ui/badge";
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
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Nivel de aprendizaje</p>
            <h1 className="font-display text-4xl font-black text-brand-950">{moduleData.title}</h1>
            {moduleData.description ? <p className="text-lg font-medium text-brand-700">{moduleData.description}</p> : null}
          </div>
          <Badge variant={moduleData.status === "completed" ? "success" : "default"} className="h-10 px-4 text-sm font-bold shadow-sm">
            Avance: {percent(moduleData.progress_percent)}
          </Badge>
        </div>
      </header>

      {/* VIDEO INTRODUCTORIO (SOLO SI EXISTE) */}
      {moduleData.intro_video_url && (
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-3 text-rose-600">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl font-bold">¡Mira este video para empezar!</h2>
          </div>
          <VideoPlayer url={moduleData.intro_video_url} />
        </section>
      )}

      <section className="mt-12 rounded-[2rem] border-2 border-brand-100 bg-white p-8 shadow-card overflow-hidden">
        <div className="flex items-center gap-3 text-brand-900 mb-2">
          <Gamepad2 className="h-6 w-6 text-brand-500" />
          <h2 className="font-display text-2xl font-black">Actividades Interactivas</h2>
        </div>
        <p className="text-slate-600 font-medium">Completa cada juego para subir de nivel.</p>
      </section>

      {activities.length === 0 ? (
        <section className="mt-5">
          <EmptyState
            title="Aún no hay actividades en este módulo"
            description="Cuando el docente agregue actividades, aparecerán aquí."
          />
        </section>
      ) : (
        <section className="mt-6 space-y-8">
          {activities.map((activity, index) => (
            <article key={activity.id} className="relative space-y-4 rounded-[2.5rem] border-2 border-brand-50 bg-brand-50/10 p-8 shadow-sm transition-all hover:bg-white hover:shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-xl font-black text-white shadow-lg">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-black text-brand-950">{activity.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {activity.progress?.status === "completed" ? (
                    <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-black text-emerald-700 border-2 border-emerald-200 shadow-sm">
                      <CircleCheckBig className="h-4 w-4" /> ¡Completado!
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-black text-amber-700 border-2 border-amber-200 shadow-sm">
                      <Gamepad2 className="h-4 w-4" /> Jugando...
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                <ActivityRenderer
                  studentId={student.studentId}
                  activity={{
                    id: activity.id,
                    type: activity.type,
                    title: activity.title,
                    prompt: activity.prompt,
                    instructions: activity.instructions,
                    image_url: activity.image_url,
                    audio_url: activity.audio_url,
                    settings_json: (activity.settings_json as Record<string, unknown> | null) ?? null
                  }}
                />
              </div>
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
