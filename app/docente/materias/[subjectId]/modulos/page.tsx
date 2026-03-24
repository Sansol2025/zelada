import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { Layers, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { createModule, deleteModuleForTeacher } from "@/features/teacher/actions";
import { getTeacherModulesBySubject, getTeacherSubjectById } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";

type SubjectModulesPageProps = {
  params: Promise<{ subjectId: string }>;
};

export default async function SubjectModulesPage({ params }: SubjectModulesPageProps) {
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

  async function deleteModuleAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    const moduleId = String(formData.get("module_id") ?? "");
    if (!moduleId) return;

    await deleteModuleForTeacher(moduleId, activeSession.userId as string);
    revalidatePath(`/docente/materias/${subjectId}/modulos`);
  }

  return (
    <RoleLayout
      title={`Módulos de ${subject.title}`}
      description="Define secuencia pedagógica, bloqueos y estructura del recorrido."
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-brand-900">
          <Plus className="h-5 w-5" />
          <CardTitle className="text-lg">Crear módulo</CardTitle>
        </div>
        <form action={createModuleAction} className="grid gap-3 md:grid-cols-2">
          <input className="h-11 rounded-xl border border-brand-200 px-4 text-sm" name="title" placeholder="Título del módulo" required />
          <input
            className="h-11 rounded-xl border border-brand-200 px-4 text-sm"
            defaultValue={String(modules.length + 1)}
            min={1}
            name="position"
            type="number"
          />
          <textarea
            className="min-h-24 rounded-xl border border-brand-200 px-4 py-3 text-sm md:col-span-2"
            name="description"
            placeholder="Descripción"
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input name="is_locked_by_default" type="checkbox" />
            Bloqueado por defecto
          </label>
          <div className="md:col-span-2">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Crear módulo
            </Button>
          </div>
        </form>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <Card key={module.id} className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <CardText>{module.description || "Sin descripción"}</CardText>
              </div>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
                Orden {module.position}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/docente/modulos/${module.id}/editar`}>
                <Button size="sm" variant="secondary" className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
              </Link>
              <Link href={`/docente/modulos/${module.id}/actividades`}>
                <Button size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Actividades
                </Button>
              </Link>
              <form action={deleteModuleAction}>
                <input name="module_id" type="hidden" value={module.id} />
                <Button size="sm" variant="ghost" className="gap-2 text-rose-700">
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </section>

      {!modules.length ? (
        <Card className="flex items-center gap-2 text-brand-700">
          <Layers className="h-4 w-4" />
          Esta materia aún no tiene módulos.
        </Card>
      ) : null}
    </RoleLayout>
  );
}
