import { Award, Smile, Sparkles, Trophy } from "lucide-react";

import { StudentShell } from "@/components/layout/student-shell";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { getStudentContextOrRedirect } from "@/features/student/access";
import { getStudentAssignedSubjects, getStudentGlobalProgress } from "@/features/student/queries";

export default async function StudentAchievementsPage() {
  const student = await getStudentContextOrRedirect();
  const [assigned, global] = await Promise.all([
    getStudentAssignedSubjects(student.studentId),
    getStudentGlobalProgress(student.studentId)
  ]);

  const inProgress = (assigned ?? []).filter((entry) => entry.progress?.status === "in_progress").length;
  const completed = global.completedSubjects;

  return (
    <StudentShell
      title="Mis logros"
      description="Celebramos tu esfuerzo y cada paso de aprendizaje."
      currentPath="/estudiante/logros"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <div className="inline-flex rounded-xl bg-amber-100 p-2 text-amber-700">
            <Trophy className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">Materias completadas</CardTitle>
          <p className="text-3xl font-extrabold text-brand-950">{completed}</p>
          <CardText>Has terminado {completed} materias. ¡Gran trabajo!</CardText>
        </Card>
        <Card className="space-y-2">
          <div className="inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700">
            <Award className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">Recorridos activos</CardTitle>
          <p className="text-3xl font-extrabold text-brand-950">{inProgress}</p>
          <CardText>Continúa practicando para desbloquear nuevos módulos.</CardText>
        </Card>
        <Card className="space-y-2">
          <div className="inline-flex rounded-xl bg-brand-100 p-2 text-brand-700">
            <Smile className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">Mensaje positivo</CardTitle>
          <CardText>
            Tu constancia vale mucho. Cada actividad completada te acerca a nuevos logros.
          </CardText>
        </Card>
      </div>

      <Card className="space-y-2 bg-soft-mint">
        <div className="flex items-center gap-2 text-emerald-900">
          <Sparkles className="h-5 w-5" />
          <CardTitle className="text-lg">Felicitación</CardTitle>
        </div>
        <CardText className="text-emerald-900">
          ¡Sigue así! Tu esfuerzo diario construye grandes aprendizajes.
        </CardText>
      </Card>
    </StudentShell>
  );
}
