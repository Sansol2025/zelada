import Link from "next/link";
import { BarChart3, Eye, Search, Filter } from "lucide-react";
import type { Route } from "next";

import { RoleLayout } from "@/components/layout/role-layout";
import { StudentProgressTable } from "@/components/student-progress-table";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { getStudentsProgressForTeacher } from "@/features/teacher/queries";
import { PageHeader } from "@/components/page-header";
import { teacherNavItems } from "@/lib/navigation";
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

export default async function TeacherTrackingPage() {
  const session = await requireRole(["teacher", "admin"]);
  const rows = normalizeStudentRows(await getStudentsProgressForTeacher(session.userId as string));

  return (
    <RoleLayout
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente/seguimiento"
    >
    >
      <div className="flex flex-col gap-4 animate-in">

        {/* HEADER PREMIUM */}
        <PageHeader
          icon={<BarChart3 className="h-4 w-4" />}
          subtitle="Observatorio de Progreso"
          title="Seguimiento de Alumnos"
          description="Analiza el avance individual, identifica bloqueos tempranos y optimiza el tiempo de dedicación de cada estudiante."
        />

        {/* CONTROLS AREA (OPTIONAL BUT GOOD FOR DENSITY) */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="relative w-full md:w-80">
            <label htmlFor="search_student" className="sr-only">Buscar estudiante</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input 
              id="search_student"
              disabled
              placeholder="Buscar estudiante..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-xs font-semibold text-academic-navy focus:outline-none focus:border-academic-navy transition-all"
            />
          </div>
          <Button variant="ghost" className="h-10 rounded-lg px-6 font-bold text-[10px] uppercase tracking-wider text-slate-400 border border-slate-200 bg-white/50 hover:bg-white" disabled>
            <Filter className="mr-2 h-3.5 w-3.5" /> Filtrar por Grado
          </Button>
        </div>

        {/* MAIN DATA TABLE/LIST */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-academic-navy tracking-tight uppercase">Radar de Rendimiento</h3>
          </div>
          <div className="p-5">
            <StudentProgressTable rows={rows} />
          </div>
        </div>

        {/* MOBILE GRID VIEW / DETAILED CARDS */}
        <section className="grid gap-4 md:grid-cols-2">
          {rows.map((row) => (
            <Card key={row.student_id} className="group flex items-center justify-between p-5 rounded-xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-lg text-academic-navy tracking-tight group-hover:text-academic-gold transition-colors">{row.student_name}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Avance Global: <span className="text-academic-navy">{Math.round(row.progress_percent)}%</span>
                </span>
                <div className="mt-2 flex gap-3">
                  <div className="h-1 w-20 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-academic-gold transition-all duration-1000" 
                      style={{ width: `${row.progress_percent}%` }}
                    />
                  </div>
                </div>
              </div>
              <Link href={`/docente/seguimiento/${row.student_id}` as Route}>
                <Button className="h-10 w-10 rounded-lg bg-academic-navy text-white shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center border-none">
                  <Eye className="h-4 w-4 text-academic-gold" />
                </Button>
              </Link>
            </Card>
          ))}
        </section>

        {rows.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <EmptyState
              title="Sin estudiantes vinculados"
              description="Asigna materias a tus alumnos para comenzar a visualizar su progreso detallado."
            />
          </div>
        )}
      </div>
    </RoleLayout>
  );
}
