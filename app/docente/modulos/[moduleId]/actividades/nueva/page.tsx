import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Sparkles, Volume2, Puzzle, Target, Image as ImageIcon } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardText } from "@/components/ui/card";
import { ACTIVITY_TYPES } from "@/lib/constants";
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
        position: Number(formData.get("position") ?? activities.length + 1)
      },
      activeSession.userId as string
    );

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
      <div className="flex flex-col gap-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-400 p-8 text-white shadow-xl sm:p-12">
          {/* Decoraciones */}
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white opacity-20 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl flex items-center gap-4">
              <Puzzle className="h-12 w-12" /> Taller de Magia
            </h1>
            <p className="mt-4 text-lg font-medium text-amber-50 sm:text-xl">
              Crea una nueva actividad interactiva autoguiada para tus estudiantes. Ellos solo necesitarán usar el ratón.
            </p>
          </div>
        </div>

        <form action={createActivityAction} className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* COLUMNA 1: LO BÁSICO */}
            <Card className="border-none shadow-card rounded-[2rem] p-8">
              <div className="mb-6 flex items-center gap-3 border-b border-brand-50 pb-4 text-brand-900">
                <Target className="h-6 w-6 text-brand-500" />
                <CardTitle className="text-xl font-bold">1. Datos principales</CardTitle>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-brand-900">¿Qué tipo de juego será?</label>
                  <select className="h-14 w-full rounded-2xl border border-brand-200 bg-soft-sky px-5 text-base font-semibold text-brand-900 focus:border-brand-500 focus:bg-white focus:outline-none" name="type" defaultValue="multiple_choice_visual">
                    {ACTIVITY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-brand-900">Nombre de la actividad</label>
                  <input className="h-14 w-full rounded-2xl border border-brand-200 bg-soft-sky px-5 text-lg font-semibold focus:border-brand-500 focus:bg-white focus:outline-none" name="title" placeholder="Ej: Encuentra la vocal oculta" required />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-brand-900">¿Qué debe hacer el alumno? (Consigna visual)</label>
                  <input className="h-14 w-full rounded-2xl border border-brand-200 bg-soft-sky px-5 font-semibold focus:border-brand-500 focus:bg-white focus:outline-none" name="prompt" placeholder="Ej: Haz clic en el animal más grande" required />
                </div>
                
                <input type="hidden" name="position" value={activities.length + 1} />
              </div>
            </Card>

            {/* COLUMNA 2: ACCESIBILIDAD Y MEDIOS */}
            <Card className="border-none shadow-card rounded-[2rem] p-8 bg-brand-50 overflow-hidden relative">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-brand-100 opacity-50"></div>
              
              <div className="mb-6 relative z-10 flex items-center gap-3 border-b border-brand-200 pb-4 text-brand-900">
                <Volume2 className="h-6 w-6 text-brand-600" />
                <CardTitle className="text-xl font-bold">2. Accesibilidad y Elementos</CardTitle>
              </div>

              <div className="space-y-5 relative z-10">
                <div className="rounded-2xl bg-white p-5 shadow-sm border border-brand-100">
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-rose-600">
                    <Volume2 className="h-4 w-4" /> Enlace del Audio (Clave para autoguiados)
                  </label>
                  <p className="mb-3 text-xs text-brand-700 font-medium">Fundamental para niños que no pueden leer. Pega aquí el enlace de la consigna hablada.</p>
                  <input className="h-12 w-full rounded-xl border border-brand-200 bg-soft-sky px-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none" name="audio_url" placeholder="https://ejemplo.com/audio.mp3" />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-900">
                    <ImageIcon className="h-4 w-4 text-brand-500" /> URL de Imagen decorativa (Opcional)
                  </label>
                  <input className="h-12 w-full rounded-xl border border-brand-200 bg-white px-4 text-sm focus:border-brand-500 focus:outline-none" name="image_url" placeholder="https://..." />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-bold text-brand-900">Instrucciones de apoyo visual</label>
                  <textarea className="min-h-24 w-full resize-none rounded-xl border border-brand-200 bg-white p-4 text-sm focus:border-brand-500 focus:outline-none" name="instructions" placeholder="Información extra para el alumno (si apllica)..." />
                </div>
              </div>
            </Card>
          </div>

          {/* CONFIGURACIÓN AVANZADA LOGICA JUEGO */}
          <Card className="border-none shadow-card rounded-[2rem] p-8">
            <div className="mb-6 border-b border-brand-50 pb-4">
              <CardTitle className="text-xl font-bold text-brand-900">3. Variables Interactivas</CardTitle>
              <CardText className="mt-1 font-medium">Define las opciones que se mostrarán en pantalla. El niño interactuará solo con clics.</CardText>
            </div>
            
            <textarea
              className="min-h-40 w-full resize-y rounded-2xl border-2 border-dashed border-brand-200 bg-soft-sky p-6 font-mono text-sm text-brand-800 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none"
              defaultValue={JSON.stringify({ options: [{ text: "Opcion 1", isCorrect: true, imageUrl: "" }, { text: "Opcion 2", isCorrect: false, imageUrl: "" }] }, null, 2)}
              name="settings_json"
              placeholder="Estructura JSON de las opciones..."
            />
            <p className="mt-3 text-xs text-brand-600 font-bold bg-brand-50 inline-block px-3 py-1 rounded-full">Nota temporal: Utiliza el formato JSON para las opciones. Esto habilitará los botones en pantalla gigante.</p>

            <div className="mt-8 flex justify-end">
              <Button type="submit" className="h-14 rounded-2xl bg-amber-500 px-10 text-lg font-bold tracking-wide hover:bg-amber-400 shadow-xl shadow-amber-500/30 transition-all hover:-translate-y-1 text-white">
                <Sparkles className="mr-2 h-6 w-6" />
                Crear Actividad Interactiva
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </RoleLayout>
  );
}
