import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, Map, Sparkles, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { LockedModuleCard } from "@/components/locked-module-card";
import { ProgressCard } from "@/components/progress-card";
import { StudentShell } from "@/components/layout/student-shell";
import { Badge } from "@/components/ui/badge";
import { getStudentContextOrRedirect } from "@/features/student/access";
import { getStudentAssignedSubjects, getSubjectLearningPath } from "@/features/student/queries";
import { percent } from "@/lib/utils";
export const revalidate = 0;

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
  const isCompleted = assignment.progress?.status === "completed";

  return (
    <StudentShell
      title={subject.title}
      description={subject.description || "¡Bienvenido a esta gran aventura! Completa todos los niveles para ganar la medalla."}
      currentPath={`/estudiante/${subjectId}`}
    >
      <div className="mb-6">
        <Link 
          href="/estudiante" 
          className="inline-flex items-center gap-2 rounded-full bg-white border-2 border-brand-100 px-5 py-2 text-sm font-black text-brand-700 shadow-sm transition-all hover:bg-brand-50 hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mis Aventuras
        </Link>
      </div>

      <header className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 mb-8 border-4 border-brand-100 shadow-xl">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundColor: subject.color }}
        />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-brand-700 font-black uppercase tracking-widest text-xs">
              <Map className="h-4 w-4" /> Tu Mapa de Progreso
            </div>
            <h1 className="font-display text-4xl font-black text-brand-950 leading-tight">
              Aventura en {subject.title}
            </h1>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div 
              className="flex h-20 w-20 items-center justify-center rounded-[2.5rem] shadow-xl"
              style={{ backgroundColor: subject.color }}
            >
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-brand-950">{percent(progressPercent)}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Completado</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mt-8 space-y-4">
        <div className="flex items-center justify-between mb-2">
           <h2 className="font-display text-2xl font-black text-brand-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-brand-500" />
              Tus Próximos Retos
           </h2>
           <Badge className="rounded-full px-4 py-1.5 font-black uppercase tracking-widest text-[10px]" variant={isCompleted ? "success" : "default"}>
              {assignedSubjects.length > 0 ? `${modules.length} NIVELES` : "SIN NIVELES"}
           </Badge>
        </div>

        {modules.length === 0 ? (
          <EmptyState
            title="Aún no hay retos aquí"
            description="Tu docente está preparando los niveles más divertidos. ¡Vuelve pronto!"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {modules.map((module) =>
              module.is_locked ? (
                <LockedModuleCard
                  key={module.id}
                  title={module.title}
                  description={module.description}
                  reason="🔒 Desbloquea este nivel completando el anterior"
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
          </div>
        )}
      </section>
    </StudentShell>
  );
}
