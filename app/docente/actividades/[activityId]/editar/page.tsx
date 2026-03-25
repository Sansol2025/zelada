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
      <div className="flex flex-col gap-6">
        <div className="mb-2">
           <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-950 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Volver al listado
           </Link>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-400 p-8 text-white shadow-xl sm:p-12">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white opacity-20 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl flex items-center gap-4">
              <Save className="h-12 w-12" /> Ajustar Actividad
            </h1>
            <p className="mt-4 text-lg font-medium text-indigo-50 sm:text-xl">
              Modifica los detalles de &quot;{currentActivity.title}&quot; para que sea perfecta para tus alumnos.
            </p>
          </div>
        </div>

        <form action={updateActivityAction} className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* COLUMNA 1: CONTENIDO */}
            <Card className="border-none shadow-card rounded-[2rem] p-8">
              <div className="mb-6 flex items-center gap-3 border-b border-brand-50 pb-4 text-brand-900">
                <Target className="h-6 w-6 text-brand-500" />
                <CardTitle className="text-xl font-bold">Contenido del juego</CardTitle>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-brand-900">Título</label>
                  <input 
                    className="h-14 w-full rounded-2xl border border-brand-200 bg-soft-sky px-5 text-lg font-semibold focus:border-brand-500 focus:bg-white focus:outline-none" 
                    name="title" 
                    defaultValue={currentActivity.title} 
                    required 
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-brand-900">Consigna para el alumno</label>
                  <input 
                    className="h-14 w-full rounded-2xl border border-brand-200 bg-soft-sky px-5 font-semibold focus:border-brand-500 focus:bg-white focus:outline-none" 
                    name="prompt" 
                    defaultValue={currentActivity.prompt} 
                    required 
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-bold text-brand-900">Orden de aparición</label>
                  <input 
                    className="h-12 w-full rounded-xl border border-brand-200 bg-white px-4 font-bold focus:border-brand-500 focus:outline-none" 
                    name="position" 
                    type="number" 
                    defaultValue={currentActivity.position} 
                  />
                </div>
              </div>
            </Card>

            {/* COLUMNA 2: APOYOS */}
            <Card className="border-none shadow-card rounded-[2rem] p-8 bg-brand-50">
              <div className="mb-6 flex items-center gap-3 border-b border-brand-200 pb-4 text-brand-900">
                <Volume2 className="h-6 w-6 text-brand-600" />
                <CardTitle className="text-xl font-bold">Apoyos Visuales y Auditivos</CardTitle>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl bg-white p-5 border border-brand-100 shadow-sm">
                  <FileUploader 
                    name="audio_url" 
                    accept="audio/*" 
                    label="Audio de la consigna"
                    initialUrl={currentActivity.audio_url || ""}
                  />
                </div>

                <div className="rounded-2xl bg-white p-5 border border-brand-100 shadow-sm">
                  <FileUploader 
                    name="image_url" 
                    accept="image/*" 
                    label="Imagen de apoyo"
                    initialUrl={currentActivity.image_url || ""}
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-bold text-brand-900">Pistas o instrucciones extra</label>
                  <textarea 
                    className="min-h-24 w-full resize-none rounded-2xl border border-brand-200 bg-white p-5 text-sm focus:border-brand-500 focus:outline-none" 
                    name="instructions" 
                    defaultValue={currentActivity.instructions || ""} 
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* BUILDER VISUAL */}
          <Card className="border-none shadow-card rounded-[2.5rem] p-8">
            <div className="mb-6 border-b border-brand-50 pb-4 flex items-center gap-3">
              <WandSparkles className="h-6 w-6 text-brand-500" />
              <CardTitle className="text-xl font-bold text-brand-900">Dinámica Interactiva</CardTitle>
            </div>
            
            <ActivityBuilderClient 
              initialType={currentActivity.type} 
              initialSettings={currentActivity.settings_json as Record<string, unknown>}
            />

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-brand-50 pt-8">
              <form action={deleteActivityAction}>
                <Button type="submit" variant="ghost" className="h-14 rounded-2xl font-black text-rose-500 hover:bg-rose-50">
                   <Trash2 className="mr-2 h-5 w-5" /> Eliminar permanentemente
                </Button>
              </form>

              <Button type="submit" className="h-16 rounded-[2rem] bg-brand-600 px-12 text-xl font-black tracking-tight hover:bg-brand-500 shadow-2xl shadow-brand-500/30 transition-all hover:-translate-y-2 text-white border-none">
                <Sparkles className="mr-3 h-6 w-6" />
                Guardar Cambios Mágicos
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </RoleLayout>
  );
}

