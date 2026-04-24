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
      <div className="flex flex-col gap-8 animate-in">
        
        <PageHeader
          icon={<Gamepad2 className="h-4 w-4" />}
          subtitle="Taller de Juegos Interactivos"
          title={moduleData.title}
          description="Diseña experiencias de aprendizaje autoguiadas. Los estudiantes avanzarán resolviendo desafíos visuales y auditivos."
          actions={
            <Link href={`/docente/modulos/${moduleId}/actividades/nueva` as Route}>
              <Button className="h-12 rounded-xl bg-academic-gold px-6 font-black text-academic-navy hover:bg-academic-gold/90 shadow-lg transition-all hover:scale-105 border-none">
                <Wand2 className="mr-2 h-5 w-5" />
                Nuevo Juego
              </Button>
            </Link>
          }
        />

        {activities.length === 0 ? (
          <div className="rounded-[3rem] border-2 border-dashed border-academic-gold/20 bg-academic-ivory/50 p-20 text-center">
            <EmptyState
              title="Aún no hay juegos creados"
              description="Haz clic en 'Nuevo Juego' para abrir el Taller de Magia y crear la primera actividad de este módulo."
            />
          </div>
        ) : (
          <section className="grid gap-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-2xl font-black tracking-tight text-academic-navy">Actividades del Módulo</h2>
              <div className="rounded-full bg-academic-gold/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-academic-gold">{activities.length} juegos</div>
            </div>
            {activities.map((activity, index) => (
              <Card key={activity.id} className="group overflow-hidden border border-academic-gold/5 shadow-sm transition-all duration-500 hover:shadow-premium hover:-translate-y-1 rounded-[2.5rem] p-0 flex flex-col md:flex-row bg-white">
                
                {/* Lado izquierdo VISUAL */}
                <div className="flex w-full md:w-56 shrink-0 flex-col items-center justify-center bg-academic-ivory/30 p-8 border-b md:border-b-0 md:border-r border-academic-gold/5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-academic-navy text-academic-gold mb-4 shadow-lg group-hover:rotate-6 transition-transform">
                    <span className="font-display text-3xl font-black">{index + 1}</span>
                  </div>
                  <span className="rounded-full bg-white px-4 py-1.5 font-black text-academic-navy text-[10px] shadow-sm border border-academic-gold/10 text-center uppercase tracking-[0.15em]">
                    {activity.type.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Contenido principal */}
                <div className="flex flex-1 flex-col justify-between p-8 lg:p-10">
                  <div>
                    <CardTitle className="text-3xl font-black text-academic-navy mb-3 tracking-tight">{activity.title}</CardTitle>
                    <CardText className="text-lg text-academic-slate font-medium leading-relaxed italic opacity-80">&quot;{activity.prompt}&quot;</CardText>
                    
                    {activity.audio_url && (
                      <div className="mt-6 flex items-center gap-2 text-academic-forest bg-academic-forest/5 px-4 py-2 rounded-xl inline-flex text-xs font-black uppercase tracking-widest border border-academic-forest/10">
                        <Volume2 className="h-4 w-4" /> Audio Configurado
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-academic-gold/5 pt-6">
                    <div className="flex gap-3">
                      <Link href={`/docente/actividades/${activity.id}/editar` as Route}>
                        <Button size="sm" variant="outline" className="h-12 rounded-xl px-6 font-black bg-academic-ivory text-academic-navy border-academic-gold/10 hover:border-academic-gold hover:bg-white transition-all text-sm uppercase tracking-widest">
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                    
                    <form action={deleteActivityAction}>
                      <input name="activity_id" type="hidden" value={activity.id} />
                      <Button size="sm" variant="ghost" className="h-12 rounded-xl font-black text-rose-600/60 hover:bg-rose-50 hover:text-rose-600 transition-all text-sm uppercase tracking-widest px-6">
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
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
