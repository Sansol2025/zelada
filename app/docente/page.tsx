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
        <div className="animate-in relative overflow-hidden rounded-[2.5rem] bg-academic-navy p-8 text-white shadow-premium md:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-academic-gold opacity-10 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-academic-gold mb-3">
                <School className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Portal Institucional</span>
              </div>
              <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
                ¡Buen día, Docente! 🏫
              </h1>
              <p className="mt-4 text-base font-medium text-white/70 leading-relaxed">
                Transformamos el aprendizaje en una experiencia sin barreras. Monitorea el progreso y gestiona tus materias.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/docente/materias/nueva">
                <Button className="h-12 rounded-xl bg-academic-gold px-6 font-black text-academic-navy hover:bg-academic-gold/90 shadow-lg transition-all hover:scale-105 border-none">
                  <PlusCircle className="mr-2 h-5 w-5" /> Nueva Materia
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* METRICS GRID */}
        <section className="animate-in grid gap-6 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: "0.1s" }}>
          {stats.map((stat) => (
            <Card 
              key={stat.title} 
              className="group cursor-default overflow-hidden border-academic-gold/5 shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-premium rounded-[2rem] p-6 bg-white"
            >
              <div className="flex items-center gap-5">
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] ${stat.bgClass} transition-colors duration-300 group-hover:bg-academic-navy group-hover:text-white`}>
                  <stat.icon className={`h-8 w-8 ${stat.colorClass} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:text-white`} />
                </div>
                <div>
                  <CardText className="text-xs font-black uppercase tracking-widest text-academic-slate">
                    {stat.title}
                  </CardText>
                  <p className="mt-1 font-display text-4xl font-black text-academic-navy">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* PROGRESS ANALYSIS */}
          <Card className="animate-in col-span-1 border-academic-gold/5 bg-white shadow-premium rounded-[2.5rem] lg:col-span-2 p-8" style={{ animationDelay: "0.2s" }}>
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-4 text-academic-navy">
                <div className="p-3 bg-academic-ivory rounded-2xl">
                  <BarChart3 className="h-6 w-6 text-academic-gold" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black">Panorama de avance</CardTitle>
                  <p className="text-sm font-medium text-academic-slate">Resumen operativo de tu aula</p>
                </div>
              </div>
              <Badge className="rounded-2xl px-5 py-2 text-sm font-black bg-academic-navy text-white shadow-lg" variant="default">
                Media: {percent(metrics.progressAverage)}
              </Badge>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="group flex flex-col justify-center rounded-[2rem] bg-academic-ivory p-8 transition-all hover:shadow-lg hover:scale-[1.02]">
                <p className="text-xs font-black uppercase tracking-widest text-academic-gold">Alumnos en Pausa</p>
                <div className="mt-4 flex items-baseline gap-3">
                  <p className="text-6xl font-black text-academic-navy">{metrics.blockedStudents}</p>
                  <span className="text-sm font-bold text-academic-slate">requieren guía</span>
                </div>
              </div>
              
              <div className="group flex flex-col justify-center rounded-[2rem] bg-soft-mint p-8 transition-all hover:shadow-lg hover:scale-[1.02]">
                <p className="text-xs font-black uppercase tracking-widest text-academic-forest">Completados</p>
                <div className="mt-4 flex items-baseline gap-3">
                  <p className="text-6xl font-black text-academic-forest">{metrics.completedStudents}</p>
                  <span className="text-sm font-bold text-academic-slate">objetivos logrados</span>
                </div>
              </div>
            </div>
          </Card>

          {/* ACTION CENTER */}
          <Card className="animate-in col-span-1 flex flex-col justify-between border-academic-gold/5 bg-academic-navy shadow-premium rounded-[2.5rem] p-8 text-white" style={{ animationDelay: "0.3s" }}>
            <div>
              <div className="mb-6 h-12 w-12 rounded-2xl bg-academic-gold flex items-center justify-center">
                <QrCode className="h-6 w-6 text-academic-navy" />
              </div>
              <CardTitle className="mb-4 text-2xl font-black">Panel de accesos</CardTitle>
              <CardText className="text-lg font-medium text-white/60 leading-relaxed">
                Genera credenciales mágicas para que tus estudiantes puedan jugar y aprender.
              </CardText>
            </div>
            
            <div className="mt-8 flex flex-col gap-4">
              <Link href="/docente/accesos" className="w-full">
                <Button className="h-16 w-full justify-between rounded-2xl bg-academic-gold px-6 font-black text-academic-navy hover:bg-academic-gold/90 transition-transform active:scale-95 shadow-xl">
                  <span className="flex items-center gap-3">
                    <QrCode className="h-6 w-6" /> Gestionar QRs
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/docente/seguimiento" className="w-full">
                <Button className="h-16 w-full justify-between rounded-2xl bg-white/10 px-6 font-bold text-white hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-all">
                  <span className="flex items-center gap-3">
                    <Activity className="h-6 w-6 text-academic-gold" /> Analítica avanzada
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* STUDENTS TABLE SECTION */}
        <section className="animate-in mt-6" style={{ animationDelay: "0.4s" }}>
          <div className="mb-8 ml-2 flex items-center justify-between">
            <div>
              <h2 className="font-display text-4xl font-black tracking-tight text-academic-navy">Progreso Reciente</h2>
              <p className="mt-2 text-lg font-medium text-academic-slate">Estado dinámico de tus alumnos en tiempo real.</p>
            </div>
            <Link href="/docente/seguimiento">
              <Button variant="ghost" className="text-academic-navy font-black hover:bg-academic-ivory">
                Ver todos <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          {metrics.subjectsCount === 0 ? (
            <div className="rounded-[3rem] border-4 border-dashed border-academic-ivory bg-academic-ivory/20 p-16 text-center">
              <EmptyState
                title="Aún no hay materias creadas"
                description="Comienza creando tu primera materia para ver el progreso de tus alumnos aquí."
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-[2.5rem] border border-academic-gold/5 bg-white shadow-premium">
              <StudentProgressTable rows={studentRows} />
            </div>
          )}
        </section>

      </div>
    </RoleLayout>
  );
}
