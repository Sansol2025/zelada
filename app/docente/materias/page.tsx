import Link from "next/link";
import { revalidatePath } from "next/cache";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { deleteSubject, createSubject } from "@/features/teacher/actions";
import { getTeacherSubjects } from "@/features/teacher/queries";
import { requireRole } from "@/features/auth/session";
import { teacherNavItems } from "@/lib/navigation";

export default async function TeacherSubjectsPage() {
  const session = await requireRole(["teacher", "admin"]);
  const subjects = await getTeacherSubjects(session.userId as string);

  async function createSubjectAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);

    await createSubject(
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
  }

  async function deleteSubjectAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    const subjectId = String(formData.get("subject_id") ?? "");
    if (!subjectId) return;

    await deleteSubject(subjectId, activeSession.userId as string);
    revalidatePath("/docente/materias");
  }

  return (
    <RoleLayout
      title="Gestión de materias"
      description="Crea y administra materias personalizadas con identidad visual propia."
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-brand-900">
          <Plus className="h-5 w-5" />
          <CardTitle className="text-lg">Crear materia</CardTitle>
        </div>
        <form action={createSubjectAction} className="grid gap-3 md:grid-cols-2">
          <input
            className="h-11 rounded-xl border border-brand-200 px-4 text-sm"
            name="title"
            placeholder="Ej: Matemática"
            required
          />
          <input
            className="h-11 rounded-xl border border-brand-200 px-4 text-sm"
            name="icon"
            placeholder="Icono (opcional)"
          />
          <textarea
            className="min-h-24 rounded-xl border border-brand-200 px-4 py-3 text-sm md:col-span-2"
            name="description"
            placeholder="Descripción pedagógica"
          />
          <input
            className="h-11 rounded-xl border border-brand-200 px-4 text-sm"
            defaultValue="#43b8f4"
            name="color"
            type="color"
          />
          <label className="inline-flex items-center gap-2 text-sm font-medium text-brand-800">
            <input defaultChecked name="is_active" type="checkbox" />
            Materia activa
          </label>
          <div className="md:col-span-2">
            <Button className="gap-2" type="submit">
              <Plus className="h-4 w-4" />
              Crear materia
            </Button>
          </div>
        </form>
      </Card>

      {subjects.length === 0 ? (
        <EmptyState
          title="Sin materias aún"
          description="Crea la primera materia para comenzar el armado del recorrido pedagógico."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {subjects.map((subject) => (
            <Card key={subject.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{subject.title}</CardTitle>
                  <CardText>{subject.description || "Sin descripción"}</CardText>
                </div>
                <div
                  className="rounded-xl p-2 text-white"
                  style={{ backgroundColor: subject.color || "#43b8f4" }}
                >
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={`/docente/materias/${subject.id}/editar`}>
                  <Button size="sm" variant="secondary" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                </Link>
                <Link href={`/docente/materias/${subject.id}/modulos`}>
                  <Button size="sm" className="gap-2">
                    Gestionar módulos
                  </Button>
                </Link>
                <form action={deleteSubjectAction}>
                  <input name="subject_id" type="hidden" value={subject.id} />
                  <Button size="sm" variant="ghost" className="gap-2 text-rose-700" type="submit">
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </section>
      )}
    </RoleLayout>
  );
}
