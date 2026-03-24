import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Save, Trash2 } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ACTIVITY_TYPES } from "@/lib/constants";
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
      title="Editar actividad"
      description="Ajusta contenido, tipo de interacción y configuración accesible."
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <Card className="space-y-4">
        <CardTitle className="text-lg">Configuración de actividad</CardTitle>
        <form action={updateActivityAction} className="grid gap-3 md:grid-cols-2">
          <select className="h-11 rounded-xl border border-brand-200 px-4 text-sm" defaultValue={currentActivity.type} name="type">
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" defaultValue={currentActivity.title} name="title" required />
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm md:col-span-2" defaultValue={currentActivity.prompt} name="prompt" required />
          <textarea
            className="min-h-20 rounded-xl border border-brand-200 px-4 py-3 text-sm md:col-span-2"
            defaultValue={currentActivity.instructions || ""}
            name="instructions"
          />
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" defaultValue={currentActivity.audio_url || ""} name="audio_url" />
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" defaultValue={currentActivity.image_url || ""} name="image_url" />
          <input
            className="h-11 rounded-xl border border-brand-200 px-4 text-sm"
            defaultValue={String(currentActivity.position)}
            min={1}
            name="position"
            type="number"
          />
          <textarea
            className="min-h-24 rounded-xl border border-brand-200 px-4 py-3 text-sm md:col-span-2"
            defaultValue={JSON.stringify(currentActivity.settings_json || {}, null, 2)}
            name="settings_json"
          />
          <div className="md:col-span-2">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Guardar cambios
            </Button>
          </div>
        </form>

        <form action={deleteActivityAction}>
          <Button className="gap-2 text-rose-700" variant="ghost">
            <Trash2 className="h-4 w-4" />
            Eliminar actividad
          </Button>
        </form>
      </Card>
    </RoleLayout>
  );
}
