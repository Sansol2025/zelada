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
      <div className="flex flex-col gap-8 animate-in">

        {/* HEADER PREMIUM */}
        <PageHeader
          icon={<BarChart3 className="h-4 w-4" />}
          subtitle="Observatorio de Progreso"
          title="Seguimiento de Alumnos"
          description="Analiza el avance individual, identifica bloqueos tempranos y optimiza el tiempo de dedicación de cada estudiante."
        />

        {/* CONTROLS AREA (OPTIONAL BUT GOOD FOR DENSITY) */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-academic-ivory/20 p-6 rounded-[2rem] border border-academic-gold/5">
          <div className="relative w-full md:w-96">
            <label htmlFor="search_student" className="sr-only">Buscar estudiante</label>
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-academic-gold" />
            <input 
              id="search_student"
              disabled
              placeholder="Buscar estudiante... (Próximamente)"
              className="h-14 w-full rounded-2xl border border-academic-gold/10 bg-white pl-12 pr-6 text-sm font-bold text-academic-navy focus:outline-none focus:border-academic-gold transition-all"
            />
          </div>
          <Button variant="ghost" className="h-14 rounded-2xl px-8 font-black text-[10px] uppercase tracking-widest text-academic-navy/60 border border-academic-gold/5 bg-white/50 hover:bg-white" disabled>
            <Filter className="mr-2 h-4 w-4" /> Filtrar por Grado
          </Button>
        </div>

        {/* MAIN DATA TABLE/LIST */}
        <div className="bg-white rounded-[3rem] shadow-premium border border-academic-gold/5 overflow-hidden">
          <div className="p-8 border-b border-academic-gold/5">
            <h3 className="text-xl font-black text-academic-navy tracking-tight uppercase">Radar de Rendimiento</h3>
          </div>
          <div className="p-8">
            <StudentProgressTable rows={rows} />
          </div>
        </div>

        {/* MOBILE GRID VIEW / DETAILED CARDS */}
        <section className="grid gap-6 md:grid-cols-2">
          {rows.map((row) => (
            <Card key={row.student_id} className="group flex items-center justify-between p-8 rounded-[2.5rem] bg-white border border-academic-gold/5 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="flex flex-col gap-1">
                <span className="font-black text-xl text-academic-navy tracking-tight group-hover:text-academic-gold transition-colors">{row.student_name}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-academic-slate/40">
                  Avance Global: <span className="text-academic-navy">{Math.round(row.progress_percent)}%</span>
                </span>
                <div className="mt-4 flex gap-3">
                  <div className="h-1 w-24 bg-academic-ivory rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-academic-gold transition-all duration-1000" 
                      style={{ width: `${row.progress_percent}%` }}
                    />
                  </div>
                </div>
              </div>
              <Link href={`/docente/seguimiento/${row.student_id}` as Route}>
                <Button className="h-16 w-16 rounded-2xl bg-academic-navy text-white shadow-xl shadow-academic-navy/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-none">
                  <Eye className="h-6 w-6 text-academic-gold" />
                </Button>
              </Link>
            </Card>
          ))}
        </section>

        {rows.length === 0 && (
          <div className="rounded-[3rem] border-2 border-dashed border-academic-gold/10 bg-academic-ivory/30 p-20 text-center">
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
