import { BarChart3, BookOpenCheck, Layers3, Sparkles, Users, PlusCircle, QrCode, Activity, School, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { RoleLayout } from "@/components/layout/role-layout";
import { StudentProgressTable } from "@/components/student-progress-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { getStudentsProgressForTeacher, getTeacherDashboardMetrics } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";
import { percent } from "@/lib/utils";
import type { StudentSummary } from "@/types/domain";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Panel Docente | ${APP_NAME}`,
  description: "Gestión pedagógica y seguimiento de alumnos."
};

function normalizeStudentRows(rows: unknown): StudentSummary[] {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const studentId = row.student_id;

      if (typeof studentId !== "string" || !studentId) return null;

      return {
        student_id: studentId,
        student_name: String(row.student_name ?? "Estudiante"),
        progress_percent: Number(row.progress_percent ?? 0),
        blocked_modules: Number(row.blocked_modules ?? 0),
        completed_modules: Number(row.completed_modules ?? 0),
        total_time_seconds: Number(row.total_time_seconds ?? 0)
      };
    })
    .filter((row): row is StudentSummary => row !== null);
}

export default async function TeacherDashboardPage() {
  const session = await requireRole(["teacher", "admin"]);
  const teacherId = session.userId as string;

  const [metrics, rawRows] = await Promise.all([
    getTeacherDashboardMetrics(teacherId),
    getStudentsProgressForTeacher(teacherId)
  ]);

  const studentRows = normalizeStudentRows(rawRows);

  const stats = [
    {
      title: "Materias",
      value: metrics.subjectsCount,
      description: "Rutas de aprendizaje",
      icon: BookOpenCheck,
      colorClass: "text-academic-navy",
      bgClass: "bg-academic-ivory"
    },
    {
      title: "Módulos",
      value: metrics.modulesCount,
      description: "Bloques pedagógicos",
      icon: Layers3,
      colorClass: "text-academic-forest",
      bgClass: "bg-soft-mint"
    },
    {
      title: "Actividades",
      value: metrics.activitiesCount,
      description: "Ejercicios interactivos",
      icon: Sparkles,
      colorClass: "text-academic-gold",
      bgClass: "bg-gold-50"
    },
    {
      title: "Alumnos",
      value: metrics.assignedStudents,
      description: "Estudiantes en ruta",
      icon: Users,
      colorClass: "text-academic-navy",
      bgClass: "bg-academic-ivory"
    }
  ];

  return (
    <RoleLayout
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente"
    >
      <div className="flex flex-col gap-10 pb-12">
        
        {/* WELCOME BANNER COMPACT */}
        <div className="animate-in relative overflow-hidden rounded-2xl bg-academic-navy p-6 md:p-8 text-white shadow-md">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-academic-gold opacity-10 blur-2xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-academic-gold mb-2">
                <School className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Portal Institucional</span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                ¡Buen día, Docente!
              </h1>
              <p className="mt-2 text-sm font-medium text-white/80 leading-relaxed">
                Transformamos el aprendizaje en una experiencia sin barreras. Monitorea el progreso y gestiona tus materias.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/docente/materias/nueva">
                <Button className="h-10 rounded-lg bg-academic-gold px-5 font-bold text-academic-navy hover:bg-academic-gold/90 shadow-sm transition-all hover:-translate-y-0.5 border-none">
                  <PlusCircle className="mr-2 h-4 w-4" /> Nueva Materia
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* METRICS GRID */}
        <section className="animate-in grid gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: "0.1s" }}>
          {stats.map((stat) => (
            <Card 
              key={stat.title} 
              className="group cursor-default overflow-hidden border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md rounded-xl p-5 bg-white"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${stat.bgClass} transition-colors duration-300 group-hover:bg-academic-navy group-hover:text-white`}>
                  <stat.icon className={`h-6 w-6 ${stat.colorClass} transition-transform duration-300 group-hover:scale-110 group-hover:text-white`} />
                </div>
                <div>
                  <CardText className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {stat.title}
                  </CardText>
                  <p className="font-display text-2xl font-bold text-academic-navy leading-none mt-1">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* PROGRESS ANALYSIS */}
          <Card className="animate-in col-span-1 border border-slate-200 bg-white shadow-sm rounded-2xl lg:col-span-2 p-6" style={{ animationDelay: "0.2s" }}>
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 text-academic-navy">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-academic-navy" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Panorama de avance</CardTitle>
                  <p className="text-xs font-medium text-slate-500">Resumen operativo de tu aula</p>
                </div>
              </div>
              <Badge className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-academic-navy text-white shadow-sm" variant="default">
                Media: {percent(metrics.progressAverage)}
              </Badge>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="group flex flex-col justify-center rounded-xl bg-slate-50 border border-slate-100 p-6 transition-all hover:border-academic-gold/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Alumnos en Pausa</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-academic-navy">{metrics.blockedStudents}</p>
                  <span className="text-xs font-medium text-slate-500">requieren guía</span>
                </div>
              </div>
              
              <div className="group flex flex-col justify-center rounded-xl bg-slate-50 border border-slate-100 p-6 transition-all hover:border-academic-forest/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Completados</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-academic-forest">{metrics.completedStudents}</p>
                  <span className="text-xs font-medium text-slate-500">objetivos logrados</span>
                </div>
              </div>
            </div>
          </Card>

          {/* ACTION CENTER */}
          <Card className="animate-in col-span-1 flex flex-col justify-between border border-slate-200 bg-white shadow-sm rounded-2xl p-6" style={{ animationDelay: "0.3s" }}>
            <div>
              <div className="mb-4 h-10 w-10 rounded-lg bg-academic-navy/5 flex items-center justify-center border border-academic-navy/10">
                <QrCode className="h-5 w-5 text-academic-navy" />
              </div>
              <CardTitle className="mb-2 text-lg font-bold text-academic-navy">Panel de accesos</CardTitle>
              <CardText className="text-xs font-medium text-slate-500 leading-relaxed">
                Genera credenciales para que tus estudiantes puedan jugar y aprender.
              </CardText>
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/docente/accesos" className="w-full">
                <Button className="h-10 w-full justify-between rounded-lg bg-academic-navy px-4 font-semibold text-white hover:bg-academic-navy/90 transition-colors shadow-sm">
                  <span className="flex items-center gap-2 text-sm">
                    <QrCode className="h-4 w-4" /> Gestionar QRs
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-70" />
                </Button>
              </Link>
              <Link href="/docente/seguimiento" className="w-full">
                <Button className="h-10 w-full justify-between rounded-lg bg-white px-4 font-semibold text-academic-navy border border-slate-200 hover:bg-slate-50 transition-colors">
                  <span className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-academic-navy/70" /> Analítica avanzada
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* STUDENTS TABLE SECTION */}
        <section className="animate-in mt-2" style={{ animationDelay: "0.4s" }}>
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-academic-navy">Progreso Reciente</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">Estado dinámico de tus alumnos en tiempo real.</p>
            </div>
            <Link href="/docente/seguimiento">
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-md">
                Ver todos <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          
          {metrics.subjectsCount === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <EmptyState
                title="Aún no hay materias creadas"
                description="Comienza creando tu primera materia para ver el progreso de tus alumnos aquí."
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <StudentProgressTable rows={studentRows} />
            </div>
          )}
        </section>

      </div>
    </RoleLayout>
  );
}
