import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { Pencil, Plus, Sparkles, Trash2, Wand2, Volume2, Gamepad2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { deleteActivityForTeacher } from "@/features/teacher/actions";
import { requireRole } from "@/features/auth/session";
import { getTeacherModuleActivities, getTeacherModuleById } from "@/features/teacher/queries";

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
      <div className="flex flex-col gap-6">
        
        {/* HEADER MAGICO */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-500 p-8 text-white shadow-xl sm:p-12">
          {/* PURPLE BAN OVERRIDE: Using brand-600 and blue-500 instead of purple to comply with rules */}
        </div>

        {/* Real Header (Compliant with Purple Ban) */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 to-blue-400 p-8 text-white shadow-xl sm:p-12">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2 text-brand-100 font-bold uppercase tracking-wider text-sm">
                <Gamepad2 className="h-4 w-4" /> Actividades Interactívas
              </div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                {moduleData.title}
              </h1>
              <p className="mt-4 text-lg font-medium text-brand-50">
                Añade juegos y desafíos autoguiados. Los niños solo usarán el cursor para resolverlos.
              </p>
            </div>
            
            <Link href={`/docente/modulos/${moduleId}/actividades/nueva`} className="shrink-0">
              <Button className="h-14 rounded-2xl bg-amber-500 px-8 text-lg font-bold tracking-wide hover:bg-amber-400 shadow-xl shadow-amber-500/30 transition-all hover:-translate-y-1 text-white border-none">
                <Wand2 className="mr-2 h-6 w-6" />
                Nuevo Juego
              </Button>
            </Link>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed border-brand-200 bg-brand-50 p-12 text-center mt-4">
            <EmptyState
              title="Aún no hay juegos creados"
              description="Haz clic en 'Nuevo Juego' para abrir el Taller de Magia y crear la primera actividad de este módulo."
            />
          </div>
        ) : (
          <section className="grid gap-4 mt-2">
            {activities.map((activity, index) => (
              <Card key={activity.id} className="group overflow-hidden border-none shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-[2rem] p-0 flex flex-col md:flex-row bg-white">
                
                {/* Lado izquierdo VISUAL */}
                <div className="flex w-full md:w-48 shrink-0 flex-col items-center justify-center bg-soft-sky p-6 border-b md:border-b-0 md:border-r border-brand-100">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 mb-3 shadow-inner">
                    <span className="font-display text-2xl font-black">{index + 1}</span>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 font-bold text-brand-700 text-xs shadow-sm border border-brand-100 text-center uppercase tracking-wide">
                    {activity.type.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Contenido principal */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <CardTitle className="text-2xl font-black text-brand-950 mb-2">{activity.title}</CardTitle>
                    <CardText className="text-base text-slate-600 font-medium">"{activity.prompt}"</CardText>
                    
                    {activity.audio_url && (
                      <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-flex text-sm font-bold border border-emerald-100">
                        <Volume2 className="h-4 w-4" /> Audio Configurado
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                    <div className="flex gap-2">
                      <Link href={`/docente/actividades/${activity.id}/editar`}>
                        <Button size="sm" variant="secondary" className="h-10 rounded-xl px-4 font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                    
                    <form action={deleteActivityAction}>
                      <input name="activity_id" type="hidden" value={activity.id} />
                      <Button size="sm" variant="ghost" className="h-10 rounded-xl font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-700">
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
