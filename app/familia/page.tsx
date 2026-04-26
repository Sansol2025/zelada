import { BookOpenCheck, HeartHandshake, House, ArrowRight, UserCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { FamilyProgressCard } from "@/components/family-progress-card";
import { RoleLayout } from "@/components/layout/role-layout";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { getFamilyDashboard } from "@/features/family/queries";
import { familyNavItems } from "@/lib/navigation";
import { percent } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Panel Familiar | ${APP_NAME}`,
  description: "Seguimiento académico y acompañamiento escolar desde casa."
};

export default async function FamilyDashboardPage() {
  const session = await requireRole(["family"]);
  const dashboard = await getFamilyDashboard(session.userId as string);

  return (
    <RoleLayout
      title=" "
      description=" "
      navItems={familyNavItems}
      currentPath="/familia"
    >
      <div className="flex flex-col gap-10 pb-12">
        {/* HEADER SECTION */}
        <section className="animate-in relative overflow-hidden rounded-[2.5rem] bg-academic-navy p-10 text-white shadow-premium">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-academic-gold opacity-10 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-academic-gold mb-4">
              <UserCheck className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-widest opacity-80">Acompañamiento Familiar</span>
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">Panel del Hogar</h1>
            <p className="mt-4 text-lg font-medium text-white/60 max-w-xl">
              Visualiza el avance escolar de tus hijos y acompáñalos en su camino de aprendizaje inclusivo.
            </p>
          </div>
        </section>

        <section className="animate-in grid gap-6 md:grid-cols-2" style={{ animationDelay: "0.1s" }}>
          <Card className="p-8 border-academic-gold/5 bg-white shadow-card rounded-[2rem] flex flex-col justify-between">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-ivory text-academic-navy">
                <House className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-black text-academic-navy">Resumen del Hogar</CardTitle>
              <CardText className="mt-2 text-sm font-medium text-academic-slate">Promedio general de avance entre estudiantes vinculados.</CardText>
            </div>
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-6xl font-black text-academic-gold leading-none">{percent(dashboard.overallProgress)}</span>
              <span className="text-sm font-bold text-academic-slate uppercase tracking-wider">Avance Total</span>
            </div>
          </Card>

          <Card className="p-8 border-academic-gold/5 bg-white shadow-card rounded-[2rem]">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-mint text-academic-forest">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-black text-academic-navy">Sugerencia Pedagógica</CardTitle>
            <CardText className="mt-3 text-base font-medium text-academic-slate leading-relaxed">
              Revisar semanalmente las materias ayuda a detectar barreras tempranas y sostener la continuidad escolar.
            </CardText>
            <div className="mt-6 rounded-2xl bg-academic-ivory p-4 border border-academic-gold/10">
              <p className="text-sm font-bold text-academic-navy flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-academic-gold" />
                Dato: Prioriza actividades con menor progreso.
              </p>
            </div>
          </Card>
        </section>

        {dashboard.linkedStudents.length === 0 ? (
          <div className="animate-in rounded-[3rem] border-4 border-dashed border-academic-ivory bg-academic-ivory/20 p-16 text-center" style={{ animationDelay: "0.2s" }}>
            <EmptyState
              title="No hay estudiantes vinculados"
              description="Solicita al docente la vinculación familiar para comenzar a ver los reportes aquí."
            />
          </div>
        ) : (
          <div className="animate-in space-y-8" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-4 text-academic-navy px-2">
              <div className="h-px bg-academic-navy/10 flex-grow"></div>
              <div className="flex items-center gap-3">
                <BookOpenCheck className="h-6 w-6 text-academic-gold" />
                <h2 className="font-display text-2xl font-black tracking-tight">Tus Estudiantes</h2>
              </div>
              <div className="h-px bg-academic-navy/10 flex-grow"></div>
            </div>
            
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {dashboard.linkedStudents.map((row) => (
                <Link key={row.studentId} href={`/familia/estudiantes/${row.studentId}`} className="group">
                  <FamilyProgressCard
                    studentName={row.studentName}
                    grade={row.grade}
                    section={row.section}
                    progressPercent={row.progressPercent}
                    subjectsCount={row.subjectsCount}
                    completedSubjects={row.completedSubjects}
                  />
                  <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                    <span className="text-xs font-black text-academic-gold uppercase tracking-widest flex items-center gap-1">
                      Ver detalle <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </section>
          </div>
        )}
      </div>
    </RoleLayout>
  );
}
