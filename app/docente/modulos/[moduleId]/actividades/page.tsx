import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { Pencil, Trash2, Wand2, Volume2, Gamepad2 } from "lucide-react";
import type { Route } from "next";

import { EmptyState } from "@/components/empty-state";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { deleteActivityForTeacher } from "@/features/teacher/actions";
import { requireRole } from "@/features/auth/session";
import { getTeacherModuleActivities, getTeacherModuleById } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";
import { PageHeader } from "@/components/page-header";

type ModuleActivitiesPageProps = {
  params: Promise<{ moduleId: string }>;
};

export default async function ModuleActivitiesPage({ params }: ModuleActivitiesPageProps) {
  const session = await requireRole(["teacher", "admin"]);
  const { moduleId } = await params;

  const [moduleData, activities] = await Promise.all([
    getTeacherModuleById(moduleId, session.userId as string).catch(() => null),
    getTeacherModuleActivities(moduleId, session.userId as string).catch(() => [])
  ]);

  if (!moduleData) notFound();

  async function deleteActivityAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    const activityId = String(formData.get("activity_id") ?? "");
    if (!activityId) return;
    await deleteActivityForTeacher(activityId, activeSession.userId as string);
    revalidatePath(`/docente/modulos/${moduleId}/actividades`);
  }

  return (
    <RoleLayout
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <div className="flex flex-col gap-4 animate-in">
        
        <PageHeader
          icon={<Gamepad2 className="h-4 w-4" />}
          subtitle="Taller de Juegos Interactivos"
          title={moduleData.title}
          description="Diseña experiencias de aprendizaje autoguiadas. Los estudiantes avanzarán resolviendo desafíos visuales y auditivos."
          actions={
            <Link href={`/docente/modulos/${moduleId}/actividades/nueva` as Route}>
              <Button className="h-10 rounded-lg bg-academic-gold px-5 font-bold text-academic-navy hover:bg-academic-gold/90 shadow-md transition-all hover:-translate-y-0.5 border-none">
                <Wand2 className="mr-2 h-4 w-4" />
                Nuevo Juego
              </Button>
            </Link>
          }
        />

        {activities.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-academic-gold/20 bg-academic-ivory/50 p-10 text-center">
            <EmptyState
              title="Aún no hay juegos creados"
              description="Haz clic en 'Nuevo Juego' para abrir el Taller de Magia y crear la primera actividad de este módulo."
            />
          </div>
        ) : (
          <section className="grid gap-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display text-lg font-bold tracking-tight text-academic-navy">Actividades del Módulo</h2>
              <div className="rounded-full bg-academic-gold/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-academic-gold">{activities.length} juegos</div>
            </div>
            {activities.map((activity, index) => (
              <Card key={activity.id} className="group overflow-hidden border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 rounded-xl p-0 flex flex-col md:flex-row bg-white">
                
                {/* Lado izquierdo VISUAL */}
                <div className="flex w-full md:w-40 shrink-0 flex-col items-center justify-center bg-slate-50/50 p-6 border-b md:border-b-0 md:border-r border-slate-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-academic-navy text-academic-gold mb-2 shadow-md transition-transform group-hover:rotate-6">
                    <span className="font-display text-xl font-bold">{index + 1}</span>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 font-bold text-academic-navy text-[9px] shadow-sm border border-slate-100 text-center uppercase tracking-wider">
                    {activity.type.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Contenido principal */}
                <div className="flex flex-1 flex-col justify-between p-4 lg:p-5">
                  <div>
                    <CardTitle className="text-lg font-bold text-academic-navy mb-0.5 tracking-tight">{activity.title}</CardTitle>
                    <CardText className="text-xs text-slate-500 font-medium leading-relaxed italic">&quot;{activity.prompt}&quot;</CardText>
                    
                    {activity.audio_url && (
                      <div className="mt-2 flex items-center gap-1 text-academic-forest bg-green-50 px-2 py-0.5 rounded inline-flex text-[9px] font-bold uppercase tracking-wider border border-green-100">
                        <Volume2 className="h-3 w-3" /> Audio Configurado
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3">
                    <div className="flex gap-2">
                      <Link href={`/docente/actividades/${activity.id}/editar` as Route}>
                        <Button size="sm" variant="outline" className="h-8 rounded-md px-3 font-bold bg-white text-academic-navy border-slate-200 hover:border-academic-navy transition-all text-[10px] uppercase tracking-wider">
                          <Pencil className="mr-2 h-3 w-3" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                    
                    <form action={deleteActivityAction}>
                      <input name="activity_id" type="hidden" value={activity.id} />
                      <Button size="sm" variant="ghost" className="h-8 rounded-md font-bold text-rose-500/70 hover:bg-rose-50 hover:text-rose-600 transition-all text-[10px] uppercase tracking-wider px-3">
                        <Trash2 className="mr-2 h-3 w-3" /> Eliminar
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            ))}
          </section>
        )}
      </div>
    </RoleLayout>
  );
}
