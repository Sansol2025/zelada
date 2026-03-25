import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BarChart3, BookOpen, Layers3, Pencil, Plus, Trash2, Users } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { deleteSubject, createSubject } from "@/features/teacher/actions";
import { getTeacherSubjectsOverview } from "@/features/teacher/queries";
import { requireRole } from "@/features/auth/session";
import { teacherNavItems } from "@/lib/navigation";
import { percent } from "@/lib/utils";

type TeacherSubjectsPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    success?: string | string[];
  }>;
};

function readQueryValue(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "";
  try {
    return decodeURIComponent(raw).replace(/\+/g, " ");
  } catch {
    return raw;
  }
}

function formatActionError(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "");
    if (message) return message;
  }
  return "No se pudo completar la operación. Intenta nuevamente.";
}

export default async function TeacherSubjectsPage({ searchParams }: TeacherSubjectsPageProps) {
  const session = await requireRole(["teacher", "admin"]);
  const subjects = await getTeacherSubjectsOverview(session.userId as string).catch(() => []);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = readQueryValue(resolvedSearchParams?.error);
  const successValue = readQueryValue(resolvedSearchParams?.success);
  const successMessage = successValue === "materia_creada" ? "Materia creada correctamente." : successValue;
  const activeSubjectsCount = subjects.filter((subject) => subject.is_active).length;
  const assignedStudentsCount = subjects.reduce((acc, subject) => acc + subject.assigned_students_count, 0);
  const averageProgress = subjects.length
    ? subjects.reduce((acc, subject) => acc + subject.progress_average, 0) / subjects.length
    : 0;

  async function createSubjectAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    try {
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
      redirect("/docente/materias?success=materia_creada");
    } catch (error) {
      const message = formatActionError(error);
      redirect(`/docente/materias?error=${encodeURIComponent(message)}`);
    }
  }

  async function deleteSubjectAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    const subjectId = String(formData.get("subject_id") ?? "");
    if (!subjectId) return;
    try {
      await deleteSubject(subjectId, activeSession.userId as string);
      revalidatePath("/docente/materias");
    } catch (error) {
      const message = formatActionError(error);
      redirect(`/docente/materias?error=${encodeURIComponent(message)}`);
    }
  }

  return (
    <RoleLayout
      title="Gestión de materias"
      description="Define materias, organiza módulos y visualiza su uso real en estudiantes."
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      {errorMessage ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </section>
      ) : null}

      {successMessage ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-1">
          <CardText className="text-xs font-semibold uppercase tracking-wider text-brand-600">Materias</CardText>
          <CardTitle className="text-3xl">{subjects.length}</CardTitle>
          <CardText>Total creadas por el docente</CardText>
        </Card>
        <Card className="space-y-1">
          <CardText className="text-xs font-semibold uppercase tracking-wider text-brand-600">Activas</CardText>
          <CardTitle className="text-3xl">{activeSubjectsCount}</CardTitle>
          <CardText>Disponibles para asignación</CardText>
        </Card>
        <Card className="space-y-1">
          <CardText className="text-xs font-semibold uppercase tracking-wider text-brand-600">Asignaciones</CardText>
          <CardTitle className="text-3xl">{assignedStudentsCount}</CardTitle>
          <CardText>Vínculos estudiante-materia</CardText>
        </Card>
        <Card className="space-y-1">
          <CardText className="text-xs font-semibold uppercase tracking-wider text-brand-600">Progreso medio</CardText>
          <CardTitle className="text-3xl">{percent(averageProgress)}</CardTitle>
          <CardText>Promedio entre materias</CardText>
        </Card>
      </section>

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
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">{subject.title}</CardTitle>
                    <Badge variant={subject.is_active ? "success" : "warning"}>
                      {subject.is_active ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  <CardText>{subject.description || "Sin descripción pedagógica cargada."}</CardText>
                </div>
                <div
                  className="rounded-xl p-2 text-white"
                  style={{ backgroundColor: subject.color || "#43b8f4" }}
                >
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl bg-brand-50 p-3">
                  <div className="mb-1 flex items-center gap-2 text-brand-700">
                    <Layers3 className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-wider">Módulos</p>
                  </div>
                  <p className="text-xl font-bold text-brand-900">{subject.modules_count}</p>
                </div>
                <div className="rounded-xl bg-brand-50 p-3">
                  <div className="mb-1 flex items-center gap-2 text-brand-700">
                    <Users className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-wider">Estudiantes</p>
                  </div>
                  <p className="text-xl font-bold text-brand-900">{subject.assigned_students_count}</p>
                </div>
                <div className="rounded-xl bg-brand-50 p-3">
                  <div className="mb-1 flex items-center gap-2 text-brand-700">
                    <BarChart3 className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-wider">Avance</p>
                  </div>
                  <p className="text-xl font-bold text-brand-900">{percent(subject.progress_average)}</p>
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
                <Link href="/docente/asignaciones">
                  <Button size="sm" variant="secondary" className="gap-2">
                    Asignar estudiantes
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
