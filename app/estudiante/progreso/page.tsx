import { CheckCircle2, Gauge, Layers, Sparkles, TrendingUp, Trophy } from "lucide-react";
import type { Route } from "next";

import { ProgressCard } from "@/components/progress-card";
import { StudentShell } from "@/components/layout/student-shell";
import { Card, CardText, CardTitle } from "@/components/ui/card";
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
      title="Mi Gran Progreso"
      description="Mira todo lo que has avanzado en tu camino de aprendizaje."
      currentPath="/estudiante/progreso"
    >
      <section className="grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden border-none bg-brand-50 p-8 rounded-[2.5rem] shadow-sm">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-brand-100 opacity-50 blur-xl" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-brand-700 font-black uppercase tracking-widest text-xs">
              <TrendingUp className="h-4 w-4" /> Avance total
            </div>
            <p className="font-display text-5xl font-black text-brand-950">{percent(global.averageProgress)}</p>
            <CardText className="text-brand-800 font-medium italic">¡Vas por muy buen camino!</CardText>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-none bg-indigo-50 p-8 rounded-[2.5rem] shadow-sm">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-100 opacity-50 blur-xl" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-black uppercase tracking-widest text-xs">
              <Layers className="h-4 w-4" /> Materias
            </div>
            <p className="font-display text-5xl font-black text-indigo-950">{global.totalSubjects}</p>
            <CardText className="text-indigo-800 font-medium">Aventuras activas hoy.</CardText>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-none bg-emerald-50 p-8 rounded-[2.5rem] shadow-sm">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-100 opacity-50 blur-xl" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-black uppercase tracking-widest text-xs">
              <Trophy className="h-4 w-4" /> Completadas
            </div>
            <p className="font-display text-5xl font-black text-emerald-950">{global.completedSubjects}</p>
            <CardText className="text-emerald-800 font-medium">¡Ya eres experto en {global.completedSubjects}!</CardText>
          </div>
        </Card>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="font-display text-2xl font-black text-brand-950 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-brand-500" />
          Detalle de Aventuras
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
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
      </section>
    </StudentShell>
  );
}
