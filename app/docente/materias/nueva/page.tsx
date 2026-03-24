import { revalidatePath } from "next/cache";
import { Plus } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { createSubject } from "@/features/teacher/actions";
import { teacherNavItems } from "@/lib/navigation";

export default async function NewSubjectPage() {
  await requireRole(["teacher", "admin"]);

  async function createSubjectAction(formData: FormData) {
    "use server";
    const session = await requireRole(["teacher", "admin"]);
    await createSubject(
      {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        color: String(formData.get("color") ?? "#43b8f4"),
        icon: String(formData.get("icon") ?? ""),
        is_active: formData.get("is_active") === "on"
      },
      session.userId as string
    );
    revalidatePath("/docente/materias");
  }

  return (
    <RoleLayout
      title="Crear materia"
      description="Define una nueva materia personalizada con identidad visual y enfoque pedagógico."
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <Card className="space-y-4">
        <CardTitle className="text-lg">Nueva materia</CardTitle>
        <form action={createSubjectAction} className="grid gap-3 md:grid-cols-2">
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" name="title" placeholder="Título" required />
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" name="icon" placeholder="Icono (opcional)" />
          <textarea
            className="min-h-24 rounded-xl border border-brand-200 px-4 py-3 text-sm md:col-span-2"
            name="description"
            placeholder="Descripción"
          />
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" defaultValue="#43b8f4" name="color" type="color" />
          <label className="inline-flex items-center gap-2 text-sm">
            <input defaultChecked name="is_active" type="checkbox" />
            Activa
          </label>
          <div className="md:col-span-2">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Guardar materia
            </Button>
          </div>
        </form>
      </Card>
    </RoleLayout>
  );
}
