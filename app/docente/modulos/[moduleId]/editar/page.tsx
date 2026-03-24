import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Save, Trash2 } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { deleteModuleForTeacher, updateModule } from "@/features/teacher/actions";
import { getTeacherModuleById } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";

type EditModulePageProps = {
  params: Promise<{ moduleId: string }>;
};

export default async function EditModulePage({ params }: EditModulePageProps) {
  const session = await requireRole(["teacher", "admin"]);
  const { moduleId } = await params;
  const moduleData = await getTeacherModuleById(moduleId, session.userId as string).catch(() => null);

  if (!moduleData) notFound();
  const currentModule = moduleData;

  async function updateModuleAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await updateModule(
      moduleId,
      {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        position: Number(formData.get("position") ?? currentModule.position),
        is_locked_by_default: formData.get("is_locked_by_default") === "on"
      },
      activeSession.userId as string
    );
    revalidatePath(`/docente/materias/${currentModule.subject_id}/modulos`);
    revalidatePath(`/docente/modulos/${moduleId}/editar`);
  }

  async function deleteModuleAction() {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await deleteModuleForTeacher(moduleId, activeSession.userId as string);
    revalidatePath(`/docente/materias/${currentModule.subject_id}/modulos`);
    redirect(`/docente/materias/${currentModule.subject_id}/modulos`);
  }

  return (
    <RoleLayout
      title="Editar módulo"
      description="Ajusta estructura, orden y bloqueo secuencial del módulo."
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <Card className="space-y-4">
        <CardTitle className="text-lg">Configuración del módulo</CardTitle>
        <form action={updateModuleAction} className="grid gap-3 md:grid-cols-2">
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" defaultValue={currentModule.title} name="title" required />
          <input
            className="h-11 rounded-xl border border-brand-200 px-4 text-sm"
            defaultValue={String(currentModule.position)}
            min={1}
            name="position"
            type="number"
          />
          <textarea
            className="min-h-24 rounded-xl border border-brand-200 px-4 py-3 text-sm md:col-span-2"
            defaultValue={currentModule.description || ""}
            name="description"
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input defaultChecked={currentModule.is_locked_by_default} name="is_locked_by_default" type="checkbox" />
            Bloqueado por defecto
          </label>
          <div className="md:col-span-2">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Guardar cambios
            </Button>
          </div>
        </form>

        <form action={deleteModuleAction}>
          <Button className="gap-2 text-rose-700" variant="ghost">
            <Trash2 className="h-4 w-4" />
            Eliminar módulo
          </Button>
        </form>
      </Card>
    </RoleLayout>
  );
}
