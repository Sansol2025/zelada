import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Sparkles, Volume2, Puzzle, Target } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { ActivityBuilderClient } from "@/components/activity-builder-client";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { teacherNavItems } from "@/lib/navigation";
import { createActivity } from "@/features/teacher/actions";
import { requireRole } from "@/features/auth/session";
import { getTeacherModuleActivities, getTeacherModuleById } from "@/features/teacher/queries";

type NewActivityPageProps = {
  params: Promise<{ moduleId: string }>;
};

export default async function NewActivityPage({ params }: NewActivityPageProps) {
  const session = await requireRole(["teacher", "admin"]);
  const { moduleId } = await params;
  const [moduleData, activities] = await Promise.all([
    getTeacherModuleById(moduleId, session.userId as string).catch(() => null),
    getTeacherModuleActivities(moduleId, session.userId as string).catch(() => [])
  ]);

  if (!moduleData) notFound();

  const maxPosition = activities.reduce((max, act) => Math.max(max, act.position), 0);
  const nextPosition = maxPosition + 1;

  async function createActivityAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    const rawSettings = String(formData.get("settings_json") ?? "{}");
    let settings: Record<string, unknown> = {};
    try {
      settings = JSON.parse(rawSettings);
    } catch {
      settings = {};
    }

    try {
      await createActivity(
        {
          module_id: moduleId,
          type: String(formData.get("type") ?? "multiple_choice_visual"),
          title: String(formData.get("title") ?? ""),
          prompt: String(formData.get("prompt") ?? ""),
          instructions: String(formData.get("instructions") ?? ""),
          audio_url: String(formData.get("audio_url") ?? ""),
          image_url: String(formData.get("image_url") ?? ""),
          settings_json: settings,
          position: Number(formData.get("position") ?? nextPosition)
        },
        activeSession.userId as string
      );
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }

    revalidatePath(`/docente/modulos/${moduleId}/actividades`);
    redirect(`/docente/modulos/${moduleId}/actividades`);
  }

  return (
    <RoleLayout
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 p-4 text-white shadow-md sm:p-5">
          {/* Decoraciones */}
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white opacity-20 blur-2xl"></div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl flex items-center gap-2">
              <Puzzle className="h-6 w-6" /> Taller de Magia
            </h1>
            <p className="mt-1 text-xs font-medium text-amber-50 sm:text-sm">
              Crea una nueva actividad interactiva autoguiada para tus estudiantes. Ellos solo necesitarán usar el ratón.
            </p>
          </div>
        </div>

        <form action={createActivityAction} className="grid gap-3">
          <div className="grid gap-3 lg:grid-cols-2">
            
            {/* COLUMNA 1: LO BÁSICO */}
            <Card className="border border-slate-200 shadow-sm rounded-xl p-4">
              <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900">
                <Target className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-base font-bold">1. Datos principales</CardTitle>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre de la actividad</label>
                  <input className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold focus:border-amber-500 focus:bg-white focus:outline-none" name="title" placeholder="Ej: Encuentra la vocal oculta" required />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wider">¿Qué debe hacer el alumno? (Consigna visual)</label>
                  <input className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold focus:border-amber-500 focus:bg-white focus:outline-none" name="prompt" placeholder="Ej: Haz clic en el animal más grande" required />
                </div>
                
                <input type="hidden" name="position" value={nextPosition} />
              </div>
            </Card>

            {/* COLUMNA 2: ACCESIBILIDAD Y MEDIOS */}
            <Card className="border border-slate-200 shadow-sm rounded-xl p-4 bg-slate-50/50 overflow-hidden relative">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-slate-100/50 opacity-50"></div>
              
              <div className="mb-3 relative z-10 flex items-center gap-2 border-b border-slate-200 pb-3 text-slate-900">
                <Volume2 className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-base font-bold">2. Accesibilidad y Elementos</CardTitle>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
                  <p className="mb-2 text-[10px] text-slate-500 font-medium">Fundamental para niños que no pueden leer. Sube aquí tu archivo de voz.</p>
                  <FileUploader 
                    name="audio_url" 
                    accept="audio/*" 
                    label="Audio de la consigna (MP3/WAV)"
                  />
                </div>

                <div>
                  <FileUploader 
                    name="image_url" 
                    accept="image/*" 
                    label="Imagen o dibujo de ayuda visual (Opcional)"
                  />
                </div>
                
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Instrucciones de apoyo visual</label>
                  <textarea className="min-h-20 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm focus:border-amber-500 focus:outline-none" name="instructions" placeholder="Información extra para el alumno (si apllica)..." />
                </div>
              </div>
            </Card>
          </div>

          {/* CONFIGURACIÓN AVANZADA LOGICA JUEGO (REEMPLAZADA) */}
          <Card className="border border-slate-200 shadow-sm rounded-xl p-4">
            <div className="mb-3 border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-bold text-academic-navy">3. Arquitectura del Juego</CardTitle>
            </div>
            
            <ActivityBuilderClient />

            <div className="mt-4 flex justify-end">
              <Button type="submit" className="h-10 rounded-lg bg-academic-navy px-6 text-sm font-bold tracking-wide hover:bg-academic-navy/90 shadow-md transition-all hover:-translate-y-0.5 text-white">
                <Sparkles className="mr-2 h-4 w-4 text-academic-gold" />
                Crear Actividad
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </RoleLayout>
  );
}
