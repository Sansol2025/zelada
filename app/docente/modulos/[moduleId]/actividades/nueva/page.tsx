import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
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
  }

  return (
    <RoleLayout
      title="Constructor de actividades"
      description="Configura consignas, recursos audiovisuales y opciones accesibles."
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <Card className="space-y-4">
        <CardTitle className="text-lg">Nueva actividad</CardTitle>
        <form action={createActivityAction} className="grid gap-3 md:grid-cols-2">
          <select className="h-11 rounded-xl border border-brand-200 px-4 text-sm" name="type" defaultValue="multiple_choice_visual">
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" name="title" placeholder="Título" required />
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm md:col-span-2" name="prompt" placeholder="Consigna" required />
          <textarea className="min-h-20 rounded-xl border border-brand-200 px-4 py-3 text-sm md:col-span-2" name="instructions" placeholder="Instrucciones de apoyo" />
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" name="audio_url" placeholder="URL de audio (opcional)" />
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" name="image_url" placeholder="URL de imagen (opcional)" />
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" defaultValue={String(activities.length + 1)} min={1} name="position" type="number" />
          <textarea
            className="min-h-24 rounded-xl border border-brand-200 px-4 py-3 text-sm md:col-span-2"
            defaultValue='{"options":[]}'
            name="settings_json"
            placeholder='JSON de configuración, ej: {"options":[...]}'
          />
          <div className="md:col-span-2">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Guardar actividad
            </Button>
          </div>
        </form>
      </Card>
    </RoleLayout>
  );
}
