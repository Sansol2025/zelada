import { BookOpenCheck, HeartHandshake, House } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { FamilyProgressCard } from "@/components/family-progress-card";
import { RoleLayout } from "@/components/layout/role-layout";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { getFamilyDashboard } from "@/features/family/queries";
import { familyNavItems } from "@/lib/navigation";
import { percent } from "@/lib/utils";

export default async function FamilyDashboardPage() {
  const session = await requireRole(["family"]);
  const dashboard = await getFamilyDashboard(session.userId as string);

  return (
    <RoleLayout
      title="Panel familiar"
      description="Visualización simple del avance escolar para acompañar desde casa."
      navItems={familyNavItems}
      currentPath="/familia"
    >
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <House className="h-5 w-5 text-brand-700" />
            <CardTitle className="text-lg">Resumen del hogar</CardTitle>
          </div>
          <CardText>Promedio general de avance entre estudiantes vinculados.</CardText>
          <p className="text-4xl font-extrabold text-brand-900">{percent(dashboard.overallProgress)}</p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-brand-700" />
            <CardTitle className="text-lg">Acompañamiento sugerido</CardTitle>
          </div>
          <CardText>
            Revisar semanalmente materias con menor progreso ayuda a detectar barreras tempranas y sostener la continuidad.
          </CardText>
          <div className="rounded-xl bg-soft-mint p-3 text-sm text-emerald-900">
            Consejo: priorizar actividades pendientes antes de iniciar nuevos módulos.
          </div>
        </Card>
      </section>

      {dashboard.linkedStudents.length === 0 ? (
        <EmptyState
          title="No hay estudiantes vinculados aún"
          description="Solicita al docente la vinculación familiar para comenzar a ver reportes."
        />
      ) : (
        <>
          <section className="flex items-center gap-2 text-brand-900">
            <BookOpenCheck className="h-5 w-5" />
            <h2 className="font-display text-2xl font-bold">Progreso por estudiante</h2>
          </section>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.linkedStudents.map((row) => (
              <Link key={row.studentId} href={`/familia/estudiantes/${row.studentId}`}>
                <FamilyProgressCard
                  studentName={row.studentName}
                  grade={row.grade}
                  section={row.section}
                  progressPercent={row.progressPercent}
                  subjectsCount={row.subjectsCount}
                  completedSubjects={row.completedSubjects}
                />
              </Link>
            ))}
          </section>
        </>
      )}
    </RoleLayout>
  );
}
