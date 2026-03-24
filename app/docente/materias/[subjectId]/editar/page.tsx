import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Save, Trash2 } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { deleteSubject, updateSubject } from "@/features/teacher/actions";
import { getTeacherSubjectById } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";

type EditSubjectPageProps = {
  params: Promise<{ subjectId: string }>;
};

export default async function EditSubjectPage({ params }: EditSubjectPageProps) {
  const session = await requireRole(["teacher", "admin"]);
  const { subjectId } = await params;
  const subject = await getTeacherSubjectById(subjectId, session.userId as string).catch(() => null);

  if (!subject) notFound();

  async function updateSubjectAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await updateSubject(
      subjectId,
      {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        color: String(formData.get("color") ?? "#43b8f4"),
        icon: String(formData.get("icon") ?? ""),
        is_active: formData.get("is_active") === "on"
      },
      activeSession.userId as string
    );
    revalidatePath("/docente/materias");
    revalidatePath(`/docente/materias/${subjectId}/editar`);
  }

  async function deleteSubjectAction() {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await deleteSubject(subjectId, activeSession.userId as string);
    revalidatePath("/docente/materias");
    redirect("/docente/materias");
  }

  return (
    <RoleLayout
      title="Editar materia"
      description="Actualiza nombre, descripción e identidad de la materia."
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <Card className="space-y-4">
        <CardTitle className="text-lg">Configuración de materia</CardTitle>
        <form action={updateSubjectAction} className="grid gap-3 md:grid-cols-2">
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" defaultValue={subject.title} name="title" required />
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" defaultValue={subject.icon || ""} name="icon" />
          <textarea
            className="min-h-24 rounded-xl border border-brand-200 px-4 py-3 text-sm md:col-span-2"
            defaultValue={subject.description || ""}
            name="description"
          />
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" defaultValue={subject.color || "#43b8f4"} name="color" type="color" />
          <label className="inline-flex items-center gap-2 text-sm">
            <input defaultChecked={subject.is_active} name="is_active" type="checkbox" />
            Activa
          </label>
          <div className="md:col-span-2">
            <Button className="gap-2" type="submit">
              <Save className="h-4 w-4" />
              Guardar cambios
            </Button>
          </div>
        </form>

        <form action={deleteSubjectAction}>
          <Button className="gap-2 text-rose-700" type="submit" variant="ghost">
            <Trash2 className="h-4 w-4" />
            Eliminar materia
          </Button>
        </form>
      </Card>
    </RoleLayout>
  );
}
