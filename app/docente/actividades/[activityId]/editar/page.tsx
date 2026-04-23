import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Save, Trash2, ArrowLeft, Target, Volume2, Sparkles, WandSparkles } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/file-uploader";
import { ActivityBuilderClient } from "@/components/activity-builder-client";
import { teacherNavItems } from "@/lib/navigation";
import { deleteActivityForTeacher, updateActivity } from "@/features/teacher/actions";
import { requireRole } from "@/features/auth/session";
import { getTeacherActivityById } from "@/features/teacher/queries";

type EditActivityPageProps = {
  params: Promise<{ activityId: string }>;
};

export default async function EditActivityPage({ params }: EditActivityPageProps) {
  const session = await requireRole(["teacher", "admin"]);
  const { activityId } = await params;
  const activity = await getTeacherActivityById(activityId, session.userId as string).catch(() => null);

  if (!activity) notFound();
  const currentActivity = activity;
  const backHref = `/docente/modulos/${currentActivity.module_id}/actividades` as Route;

  async function updateActivityAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    const rawSettings = String(formData.get("settings_json") ?? "{}");
    let settings: Record<string, unknown> = {};
    try {
      settings = JSON.parse(rawSettings);
    } catch {
      settings = {};
    }

    await updateActivity(
      activityId,
      {
        module_id: currentActivity.module_id,
        type: String(formData.get("type") ?? currentActivity.type),
        title: String(formData.get("title") ?? ""),
        prompt: String(formData.get("prompt") ?? ""),
        instructions: String(formData.get("instructions") ?? ""),
        audio_url: String(formData.get("audio_url") ?? ""),
        image_url: String(formData.get("image_url") ?? ""),
        settings_json: settings,
        position: Number(formData.get("position") ?? currentActivity.position)
      },
      activeSession.userId as string
    );

    revalidatePath(`/docente/modulos/${currentActivity.module_id}/actividades`);
    redirect(`/docente/modulos/${currentActivity.module_id}/actividades`);
  }

  async function deleteActivityAction() {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await deleteActivityForTeacher(activityId, activeSession.userId as string);
    revalidatePath(`/docente/modulos/${currentActivity.module_id}/actividades`);
    redirect(`/docente/modulos/${currentActivity.module_id}/actividades`);
  }

  return (
    <RoleLayout
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <div className="flex flex-col gap-8 animate-in">
        <div className="mb-2">
           <Link href={backHref}>
              <Button variant="ghost" className="inline-flex items-center gap-2 h-10 px-4 font-black text-xs uppercase tracking-widest text-academic-navy/60 hover:text-academic-navy transition-all rounded-xl">
                <ArrowLeft className="h-4 w-4" /> Volver al listado
              </Button>
           </Link>
        </div>

        <div className="relative overflow-hidden rounded-[3rem] bg-academic-navy p-10 text-white shadow-2xl md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-academic-gold/20 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl flex items-center gap-6 leading-[1.1]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-academic-gold text-academic-navy shadow-lg">
                <Save className="h-8 w-8" />
              </div>
              Ajustar Actividad
            </h1>
            <p className="mt-6 text-xl font-medium text-white/70 leading-relaxed max-w-prose">
              Modifica los detalles de &quot;{currentActivity.title}&quot; para que sea perfecta para tus alumnos.
            </p>
          </div>
        </div>

        <form action={updateActivityAction} className="grid gap-8">
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* COLUMNA 1: CONTENIDO */}
            <Card className="border border-academic-gold/5 shadow-premium rounded-[2.5rem] p-10 bg-white">
              <div className="mb-8 flex items-center gap-3 border-b border-academic-gold/5 pb-6 text-academic-navy">
                <Target className="h-6 w-6 text-academic-gold" />
                <CardTitle className="text-2xl font-black tracking-tight">Contenido del juego</CardTitle>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-xs font-black uppercase tracking-widest text-academic-gold">Título</label>
                  <input 
                    className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/30 px-6 text-lg font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all" 
                    name="title" 
                    defaultValue={currentActivity.title} 
                    required 
                  />
                </div>

                <div>
                  <label className="mb-3 block text-xs font-black uppercase tracking-widest text-academic-gold">Consigna para el alumno</label>
                  <input 
                    className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/30 px-6 font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all" 
                    name="prompt" 
                    defaultValue={currentActivity.prompt} 
                    required 
                  />
                </div>
                
                <div>
                  <label className="mb-3 block text-xs font-black uppercase tracking-widest text-academic-gold">Orden de aparición</label>
                  <input 
                    className="h-14 w-full rounded-2xl border border-academic-gold/10 bg-white px-6 font-black text-academic-navy focus:border-academic-gold focus:outline-none transition-all" 
                    name="position" 
                    type="number" 
                    defaultValue={currentActivity.position} 
                  />
                </div>
              </div>
            </Card>

            {/* COLUMNA 2: APOYOS */}
            <Card className="border border-academic-gold/5 shadow-premium rounded-[2.5rem] p-10 bg-academic-ivory/20">
              <div className="mb-8 flex items-center gap-3 border-b border-academic-gold/5 pb-6 text-academic-navy">
                <Volume2 className="h-6 w-6 text-academic-gold" />
                <CardTitle className="text-2xl font-black tracking-tight">Apoyos Visuales y Auditivos</CardTitle>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl bg-white p-6 border border-academic-gold/10 shadow-sm">
                  <FileUploader 
                    name="audio_url" 
                    accept="audio/*" 
                    label="Audio de la consigna"
                    initialUrl={currentActivity.audio_url || ""}
                  />
                </div>

                <div className="rounded-2xl bg-white p-6 border border-academic-gold/10 shadow-sm">
                  <FileUploader 
                    name="image_url" 
                    accept="image/*" 
                    label="Imagen de apoyo"
                    initialUrl={currentActivity.image_url || ""}
                  />
                </div>
                
                <div>
                  <label className="mb-3 block text-xs font-black uppercase tracking-widest text-academic-gold">Pistas o instrucciones extra</label>
                  <textarea 
                    className="min-h-32 w-full resize-none rounded-2xl border border-academic-gold/10 bg-white p-6 text-base font-medium text-academic-slate focus:border-academic-gold focus:outline-none transition-all" 
                    name="instructions" 
                    defaultValue={currentActivity.instructions || ""} 
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* BUILDER VISUAL */}
          <Card className="border border-academic-gold/5 shadow-premium rounded-[3rem] p-10 bg-white">
            <div className="mb-8 border-b border-academic-gold/5 pb-6 flex items-center gap-3">
              <WandSparkles className="h-6 w-6 text-academic-gold" />
              <CardTitle className="text-2xl font-black tracking-tight text-academic-navy uppercase">Dinámica Interactiva</CardTitle>
            </div>
            
            <ActivityBuilderClient 
              initialType={currentActivity.type} 
              initialSettings={currentActivity.settings_json as Record<string, unknown>}
            />

            <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-academic-gold/5 pt-10">
              <div className="order-2 sm:order-1">
                <form action={deleteActivityAction}>
                  <Button 
                     type="submit"
                     variant="ghost" 
                     className="h-14 rounded-2xl font-black text-rose-600/70 hover:bg-rose-50 hover:text-rose-600 px-8 uppercase tracking-widest text-xs transition-all"
                  >
                     <Trash2 className="mr-3 h-5 w-5" /> Eliminar Actividad
                  </Button>
                </form>
              </div>

              <Button type="submit" className="order-1 sm:order-2 h-20 rounded-[2rem] bg-academic-navy px-16 text-xl font-black tracking-tight hover:scale-105 active:scale-95 shadow-2xl shadow-academic-navy/30 transition-all text-white border-none">
                <Sparkles className="mr-4 h-8 w-8 text-academic-gold" />
                Guardar Cambios Mágicos
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </RoleLayout>
  );
}
