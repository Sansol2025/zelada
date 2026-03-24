import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { createModule } from "@/features/teacher/actions";
import { getTeacherModulesBySubject, getTeacherSubjectById } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";

type NewModulePageProps = {
  params: Promise<{ subjectId: string }>;
};

export default async function NewModulePage({ params }: NewModulePageProps) {
  const session = await requireRole(["teacher", "admin"]);
  const { subjectId } = await params;

  const [subject, modules] = await Promise.all([
    getTeacherSubjectById(subjectId, session.userId as string).catch(() => null),
    getTeacherModulesBySubject(subjectId, session.userId as string).catch(() => [])
  ]);

  if (!subject) notFound();

  async function createModuleAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await createModule(
      {
        subject_id: subjectId,
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        position: Number(formData.get("position") ?? modules.length + 1),
        is_locked_by_default: formData.get("is_locked_by_default") === "on"
      },
      activeSession.userId as string
    );
    revalidatePath(`/docente/materias/${subjectId}/modulos`);
  }

  return (
    <RoleLayout
      title={`Nuevo módulo - ${subject.title}`}
      description="Crea un módulo secuencial y define su comportamiento de bloqueo."
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <Card className="space-y-4">
        <CardTitle className="text-lg">Crear módulo</CardTitle>
        <form action={createModuleAction} className="grid gap-3 md:grid-cols-2">
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" name="title" placeholder="Título" required />
          <input
            className="h-11 rounded-xl border border-brand-200 px-4 text-sm"
            defaultValue={String(modules.length + 1)}
            min={1}
            name="position"
            type="number"
          />
          <textarea className="min-h-24 rounded-xl border border-brand-200 px-4 py-3 text-sm md:col-span-2" name="description" />
          <label className="inline-flex items-center gap-2 text-sm">
            <input name="is_locked_by_default" type="checkbox" />
            Bloqueado por defecto
          </label>
          <div className="md:col-span-2">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Guardar módulo
            </Button>
          </div>
        </form>
      </Card>
    </RoleLayout>
  );
}
