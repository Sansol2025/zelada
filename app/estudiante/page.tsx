import Link from "next/link";
import type { Route } from "next";
import { BookOpenCheck, GraduationCap, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { StudentShell } from "@/components/layout/student-shell";
import { SubjectCard } from "@/components/subject-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardText } from "@/components/ui/card";
import { getStudentContextOrRedirect } from "@/features/student/access";
import { getStudentAssignedSubjects, getStudentGlobalProgress } from "@/features/student/queries";
import { percent } from "@/lib/utils";

type AssignedSubject = {
  id: string;
  title: string;
  description: string | null;
  color: string;
  status: string;
  progressPercent: number;
  icon: string | null;
};

export default async function StudentHomePage() {
  const studentContext = await getStudentContextOrRedirect();

  const [assignedRaw, globalProgress] = await Promise.all([
    getStudentAssignedSubjects(studentContext.studentId).catch(() => []),
    getStudentGlobalProgress(studentContext.studentId).catch(() => ({ averageProgress: 0, totalSubjects: 0, completedSubjects: 0 }))
  ]);

  const assignedSubjects: AssignedSubject[] = (assignedRaw ?? [])
    .map((entry) => {
      const subject = Array.isArray(entry.subject) ? entry.subject[0] : entry.subject;
      if (!subject?.id || !subject.title) return null;

      return {
        id: String(subject.id),
        title: String(subject.title),
        description: subject.description ? String(subject.description) : null,
        color: subject.color ? String(subject.color) : "#43b8f4",
        status: String(entry.progress?.status ?? "pending"),
        progressPercent: Number(entry.progress?.progress_percent ?? 0),
        icon: subject.icon ? String(subject.icon) : null
      };
    })
    .filter((subject): subject is AssignedSubject => subject !== null);

  return (
    <StudentShell
      title={`Hola${studentContext.fullName ? `, ${studentContext.fullName}` : ""}!`}
      description="Aquí encontrarás tus materias asignadas y el avance de cada recorrido."
      currentPath="/estudiante"
    >
      <section className="grid gap-6 md:grid-cols-3">
        <Card className="p-5 shadow-card border-academic-gold/5 bg-white transition-all hover:shadow-premium group">
          <div className="flex items-center gap-2 text-academic-gold mb-2">
            <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-70">Avance General</span>
          </div>
          <p className="font-display text-2xl md:text-3xl font-black text-academic-navy tracking-tight">{percent(globalProgress.averageProgress)}</p>
          <CardText className="mt-1 text-xs font-medium text-academic-slate">Promedio total de tus materias activas.</CardText>
        </Card>

        <Card className="p-5 shadow-card border-academic-gold/5 bg-white transition-all hover:shadow-premium group">
          <div className="flex items-center gap-2 text-academic-gold mb-2">
            <BookOpenCheck className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-70">Recorridos</span>
          </div>
          <p className="font-display text-2xl md:text-3xl font-black text-academic-navy tracking-tight">{globalProgress.totalSubjects}</p>
          <CardText className="mt-1 text-xs font-medium text-academic-slate">Materias asignadas para este ciclo.</CardText>
        </Card>

        <Card className="p-5 shadow-card border-academic-gold/5 bg-white transition-all hover:shadow-premium group">
          <div className="flex items-center gap-2 text-academic-gold mb-2">
            <GraduationCap className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-70">Completadas</span>
          </div>
          <p className="font-display text-2xl md:text-3xl font-black text-academic-navy tracking-tight">{globalProgress.completedSubjects}</p>
          <CardText className="mt-1 text-xs font-medium text-academic-slate">Proyectos que ya fueron finalizados.</CardText>
        </Card>
      </section>

      <section className="flex items-center justify-between mt-12 mb-6">
        <h2 className="font-display text-3xl font-black tracking-tight text-academic-navy">Tus Materias</h2>
        <Badge className="bg-academic-gold/10 text-academic-gold border-none font-bold px-4 py-1 rounded-full">{assignedSubjects.length} activas</Badge>
      </section>

      {assignedSubjects.length === 0 ? (
        <EmptyState
          title="Todavía no tienes materias asignadas"
          description="Cuando tu docente te asigne una materia, aparecerá aquí para comenzar el recorrido."
          action={
            <Link href="/acceso">
              <Button variant="secondary" className="h-12 rounded-xl font-bold px-8">Volver al acceso</Button>
            </Link>
          }
        />
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {assignedSubjects.map((subject) => (
            <div key={subject.id} className="animate-in" style={{ animationDelay: "0.1s" }}>
              <SubjectCard
                title={subject.title}
                description={subject.description}
                color={subject.color}
                progressPercent={subject.progressPercent}
                status={subject.status}
                icon={subject.icon}
                href={`/estudiante/${subject.id}` as Route}
              />
            </div>
          ))}
        </section>
      )}
    </StudentShell>
  );
}
