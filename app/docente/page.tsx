import { BarChart3, BookOpenCheck, Layers3, Sparkles, Users, PlusCircle, UserPlus, QrCode, Activity } from "lucide-react";
import Link from "next/link";

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
      colorClass: "text-brand-600",
      bgClass: "bg-brand-50"
    },
    {
      title: "Módulos",
      value: metrics.modulesCount,
      description: "Bloques pedagógicos",
      icon: Layers3,
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-50"
    },
    {
      title: "Actividades",
      value: metrics.activitiesCount,
      description: "Ejercicios interactivos",
      icon: Sparkles,
      colorClass: "text-amber-600",
      bgClass: "bg-amber-50"
    },
    {
      title: "Familia/Alumnos",
      value: metrics.assignedStudents,
      description: "Estudiantes en ruta",
      icon: Users,
      colorClass: "text-rose-600",
      bgClass: "bg-rose-50"
    }
  ];

  return (
    <RoleLayout
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente"
    >
      <div className="flex flex-col gap-8 pb-10">
        
        {/* WELCOME BANNER */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-400 p-8 text-white shadow-xl sm:p-12">
          {/* Decoraciones de fondo */}
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-brand-200 opacity-20 blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              ¡Hola, Docente! 👋
            </h1>
            <p className="mt-4 text-lg font-medium text-brand-50 sm:text-xl">
              Aquí puedes crear recorridos mágicos, monitorear el progreso de tus estudiantes y gestionar sus perfiles de forma rápida y sencilla.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/docente/materias/nueva">
                <Button className="h-12 rounded-2xl bg-white px-6 font-bold text-brand-700 hover:bg-brand-50 hover:text-brand-800 shadow-md transition-all hover:-translate-y-1">
                  <PlusCircle className="mr-2 h-5 w-5" /> Nueva materia
                </Button>
              </Link>
              <Link href="/docente/asignaciones">
                <Button className="h-12 rounded-2xl border-none bg-brand-700/30 px-6 font-bold text-white hover:bg-brand-700/50 shadow-sm transition-all hover:-translate-y-1 backdrop-blur-md">
                  <UserPlus className="mr-2 h-5 w-5" /> Asignar estudiantes
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* METRICS GRID */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card 
              key={stat.title} 
              className="group cursor-default overflow-hidden border-none shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-[1.5rem]"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${stat.bgClass}`}>
                  <stat.icon className={`h-7 w-7 ${stat.colorClass} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`} />
                </div>
                <div>
                  <CardText className="text-sm font-bold uppercase tracking-wide text-brand-500">
                    {stat.title}
                  </CardText>
                  <p className="font-display text-3xl font-extrabold text-brand-950">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* QUICK INSIGHTS */}
          <Card className="col-span-1 border-none bg-white shadow-card rounded-[2rem] lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3 text-brand-900">
                <Activity className="h-6 w-6 text-brand-500" />
                <CardTitle className="text-2xl font-bold">Panorama de avance</CardTitle>
              </div>
              <Badge className="rounded-xl px-4 py-1.5 text-sm font-bold shadow-sm" variant="default">
                Media: {percent(metrics.progressAverage)}
              </Badge>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="group flex flex-col justify-center rounded-3xl bg-amber-50 p-6 transition-colors hover:bg-amber-100">
                <p className="text-sm font-extrabold uppercase tracking-wider text-amber-700">Estudiantes Atascados</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-5xl font-black text-amber-900">{metrics.blockedStudents}</p>
                  <span className="text-sm font-medium text-amber-800">requieren ayuda</span>
                </div>
              </div>
              
              <div className="group flex flex-col justify-center rounded-3xl bg-emerald-50 p-6 transition-colors hover:bg-emerald-100">
                <p className="text-sm font-extrabold uppercase tracking-wider text-emerald-700">Completaron todo</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-5xl font-black text-emerald-900">{metrics.completedStudents}</p>
                  <span className="text-sm font-medium text-emerald-800">alumnos listos</span>
                </div>
              </div>
            </div>
          </Card>

          {/* ACTION CENTER */}
          <Card className="col-span-1 flex flex-col justify-between border-none bg-white shadow-card rounded-[2rem]">
            <div>
              <CardTitle className="mb-2 text-xl font-bold text-brand-900">Panel de accesos</CardTitle>
              <CardText className="text-base text-brand-700">
                Genera credenciales mágicas para que tus estudiantes puedan jugar y aprender.
              </CardText>
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/docente/accesos" className="w-full">
                <Button className="h-14 w-full justify-between rounded-2xl bg-brand-50 text-left font-bold text-brand-700 hover:bg-brand-100 shadow-none border border-brand-200">
                  <span className="flex items-center gap-3">
                    <QrCode className="h-5 w-5 text-brand-500" /> Tarjetas QR
                  </span>
                  <BarChart3 className="h-4 w-4 opacity-50" />
                </Button>
              </Link>
              <Link href="/docente/seguimiento" className="w-full">
                <Button className="h-14 w-full justify-between rounded-2xl bg-soft-sky text-left font-bold text-brand-700 hover:bg-blue-50 shadow-none border border-brand-100">
                  <span className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-brand-500" /> Analítica detallada
                  </span>
                  <Activity className="h-4 w-4 opacity-50" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* STUDENTS TABLE SECTION */}
        <section className="mt-4">
          <div className="mb-6 ml-2">
            <h2 className="font-display text-2xl font-bold text-brand-900">Progreso Reciente</h2>
            <p className="text-brand-600">Visualiza el estado de los alumnos que están interactuando con las actividades.</p>
          </div>
          
          {metrics.subjectsCount === 0 ? (
            <div className="rounded-[2rem] border-2 border-dashed border-brand-200 bg-brand-50 p-12 text-center">
              <EmptyState
                title="Aún no hay materias creadas"
                description="El siguiente paso es crear la primera materia lúdica y asignarla para comenzar la magia."
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-card">
              <StudentProgressTable rows={studentRows} />
            </div>
          )}
        </section>

      </div>
    </RoleLayout>
  );
}
