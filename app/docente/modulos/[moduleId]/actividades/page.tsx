import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { Pencil, Plus, Sparkles, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { ACTIVITY_TYPES } from "@/lib/constants";
import { teacherNavItems } from "@/lib/navigation";
import { createActivity, deleteActivityForTeacher } from "@/features/teacher/actions";
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

  async function createActivityAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await createActivity(
      {
        module_id: moduleId,
        type: String(formData.get("type") ?? "multiple_choice_visual"),
        title: String(formData.get("title") ?? ""),
        prompt: String(formData.get("prompt") ?? ""),
        instructions: String(formData.get("instructions") ?? ""),
        position: Number(formData.get("position") ?? activities.length + 1),
        settings_json: {}
      },
      activeSession.userId as string
    );

    revalidatePath(`/docente/modulos/${moduleId}/actividades`);
  }

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
      title={`Actividades - ${moduleData.title}`}
      description="Diseña actividades inclusivas, visuales y secuenciales para primaria."
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-brand-900">
          <Plus className="h-5 w-5" />
          <CardTitle className="text-lg">Crear actividad rápida</CardTitle>
        </div>
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
          <textarea className="min-h-20 rounded-xl border border-brand-200 px-4 py-3 text-sm md:col-span-2" name="instructions" placeholder="Instrucciones opcionales" />
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" defaultValue={String(activities.length + 1)} min={1} name="position" type="number" />
          <div className="md:col-span-2">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Crear actividad
            </Button>
          </div>
        </form>
      </Card>

      <div className="flex">
        <Link href={`/docente/modulos/${moduleId}/actividades/nueva`}>
          <Button variant="secondary">Abrir constructor avanzado</Button>
        </Link>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          title="Sin actividades aún"
          description="Agrega la primera actividad para habilitar el recorrido del módulo."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {activities.map((activity) => (
            <Card key={activity.id} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{activity.title}</CardTitle>
                  <CardText>{activity.prompt}</CardText>
                </div>
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
                  {activity.type}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/docente/actividades/${activity.id}/editar`}>
                  <Button size="sm" variant="secondary" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                </Link>
                <form action={deleteActivityAction}>
                  <input name="activity_id" type="hidden" value={activity.id} />
                  <Button size="sm" variant="ghost" className="gap-2 text-rose-700">
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </form>
                <span className="inline-flex items-center gap-1 text-xs text-brand-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  Orden {activity.position}
                </span>
              </div>
            </Card>
          ))}
        </section>
      )}
    </RoleLayout>
  );
}
