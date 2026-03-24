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
};

export default async function StudentHomePage() {
  const studentContext = await getStudentContextOrRedirect();

  const [assignedRaw, globalProgress] = await Promise.all([
    getStudentAssignedSubjects(studentContext.studentId),
    getStudentGlobalProgress(studentContext.studentId)
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
        progressPercent: Number(entry.progress?.progress_percent ?? 0)
      };
    })
    .filter((subject): subject is AssignedSubject => subject !== null);

  return (
    <StudentShell
      title={`Hola${studentContext.fullName ? `, ${studentContext.fullName}` : ""}!`}
      description="Aquí encontrarás tus materias asignadas y el avance de cada recorrido."
      currentPath="/estudiante"
    >
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-brand-800">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Avance general</span>
          </div>
          <p className="text-3xl font-extrabold text-brand-950">{percent(globalProgress.averageProgress)}</p>
          <CardText>Promedio entre todas tus materias activas.</CardText>
        </Card>
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-brand-800">
            <BookOpenCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Materias</span>
          </div>
          <p className="text-3xl font-extrabold text-brand-950">{globalProgress.totalSubjects}</p>
          <CardText>Recorridos asignados para este ciclo.</CardText>
        </Card>
        <Card className="space-y-1">
          <div className="flex items-center gap-2 text-brand-800">
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Completadas</span>
          </div>
          <p className="text-3xl font-extrabold text-brand-950">{globalProgress.completedSubjects}</p>
          <CardText>Materias que ya tienen progreso finalizado.</CardText>
        </Card>
      </section>

      <section className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-brand-900">Tus materias</h2>
        <Badge variant="default">{assignedSubjects.length} activas</Badge>
      </section>

      {assignedSubjects.length === 0 ? (
        <EmptyState
          title="Todavía no tienes materias asignadas"
          description="Cuando tu docente te asigne una materia, aparecerá aquí para comenzar el recorrido."
          action={
            <Link href="/acceso">
              <Button variant="secondary">Volver al acceso</Button>
            </Link>
          }
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assignedSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              title={subject.title}
              description={subject.description}
              color={subject.color}
              progressPercent={subject.progressPercent}
              status={subject.status}
              href={`/estudiante/${subject.id}` as Route}
            />
          ))}
        </section>
      )}
    </StudentShell>
  );
}
