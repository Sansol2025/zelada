import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BarChart3, BookOpen, Layers3, Pencil, Trash2, Users, Sparkles, Wand2 } from "lucide-react";

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

function hexToRgba(hexColor: string, alpha: number) {
  const sanitized = hexColor.trim().replace("#", "");
  const isShortHex = /^[0-9a-fA-F]{3}$/.test(sanitized);
  const isLongHex = /^[0-9a-fA-F]{6}$/.test(sanitized);

  if (!isShortHex && !isLongHex) {
    return hexColor;
  }

  const normalized = isShortHex
    ? sanitized
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : sanitized;

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
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
    } catch (error) {
      const message = formatActionError(error);
      redirect(`/docente/materias?error=${encodeURIComponent(message)}`);
    }

    revalidatePath("/docente/materias");
    redirect("/docente/materias?success=materia_creada");
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

    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden border-none bg-white shadow-card rounded-[2rem]">
        <div className="mb-6 flex items-center gap-3 text-brand-900 border-b border-brand-50 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
            <Wand2 className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black text-brand-950">Crear Reíno de Aprendizaje</CardTitle>
            <CardText>Diseña una materia lúdica nueva (ej. &quot;Matelógica&quot;, &quot;Super Lectores&quot;).</CardText>
          </div>
        </div>
        
        <form action={createSubjectAction} className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-brand-900">1. Nombre mágico</label>
              <input
                className="h-14 w-full rounded-2xl border border-brand-200 bg-soft-sky px-5 text-lg font-bold text-brand-900 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none"
                name="title"
                placeholder="Ej: Aventura Matemática"
                required
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-bold text-brand-900">2. Misión o descripción (Opcional)</label>
              <textarea
                className="min-h-32 w-full resize-none rounded-2xl border border-brand-200 bg-soft-sky p-5 text-base text-brand-900 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none"
                name="description"
                placeholder="En esta materia vamos a aprender sumas y restas divirtiéndonos con animalitos..."
              />
            </div>
            
            <label className="inline-flex cursor-pointer items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4 transition-colors hover:bg-emerald-100 border border-emerald-100 w-full sm:w-auto mt-2">
              <input defaultChecked name="is_active" type="checkbox" className="h-5 w-5 accent-emerald-500" />
              <span className="font-bold text-emerald-900 text-sm">Materia Activa (Visible para alumnos)</span>
            </label>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-bold text-brand-900">3. Color distintivo</label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: "#f43f5e", bg: "bg-[#f43f5e]", shadow: "hover:shadow-rose-500/50" }, // Rose
                  { value: "#f97316", bg: "bg-[#f97316]", shadow: "hover:shadow-orange-500/50" }, // Orange
                  { value: "#eab308", bg: "bg-[#eab308]", shadow: "hover:shadow-yellow-500/50" }, // Yellow
                  { value: "#10b981", bg: "bg-[#10b981]", shadow: "hover:shadow-emerald-500/50" }, // Emerald
                  { value: "#0ea5e9", bg: "bg-[#0ea5e9]", shadow: "hover:shadow-sky-500/50" }, // Sky
                  { value: "#3b82f6", bg: "bg-[#3b82f6]", shadow: "hover:shadow-blue-500/50" }, // Blue
                  { value: "#14b8a6", bg: "bg-[#14b8a6]", shadow: "hover:shadow-teal-500/50" }, // Teal
                  { value: "#ec4899", bg: "bg-[#ec4899]", shadow: "hover:shadow-pink-500/50" }, // Pink
                ].map((color) => (
                  <label key={color.value} className="group relative cursor-pointer">
                    <input 
                      type="radio" 
                      name="color" 
                      value={color.value} 
                      className="peer sr-only"
                      defaultChecked={color.value === "#0ea5e9"}
                    />
                    <div className={`h-14 w-full rounded-2xl ${color.bg} transition-all duration-300 peer-checked:ring-4 peer-checked:ring-brand-500 peer-checked:ring-offset-2 ${color.shadow} hover:-translate-y-1`}></div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-brand-900">4. Icono o Emoji (Opcional)</label>
              <input
                className="h-14 w-full rounded-2xl border border-brand-200 bg-soft-sky px-5 text-xl transition-colors focus:border-brand-500 focus:bg-white focus:outline-none"
                name="icon"
                placeholder="🚀 🎨 🎸 🎈"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="h-14 w-full rounded-2xl bg-brand-600 text-lg font-bold tracking-wide hover:bg-brand-500 shadow-xl shadow-brand-500/30 transition-all hover:-translate-y-1">
                <Sparkles className="mr-2 h-6 w-6" />
                Dar vida a la materia
              </Button>
            </div>
          </div>
        </form>
      </Card>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          title="Sin materias aún"
          description="Crea la primera materia para comenzar el armado del recorrido pedagógico."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {subjects.map((subject) => {
            const subjectColor = subject.color || "#43b8f4";
            return (
            <Card
              key={subject.id}
              className="group flex flex-col justify-between overflow-hidden border-none shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-[2rem]"
              style={{
                backgroundColor: hexToRgba(subjectColor, 0.1),
                border: `2px solid ${hexToRgba(subjectColor, 0.3)}`
              }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <div 
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                        style={{ backgroundColor: subjectColor, color: "white" }}
                      >
                        {subject.icon || <BookOpen className="h-6 w-6" />}
                      </div>
                      <CardTitle className="text-2xl font-black text-brand-950">{subject.title}</CardTitle>
                    </div>
                    {subject.description ? (
                      <CardText className="line-clamp-2 mt-2 font-medium leading-relaxed">{subject.description}</CardText>
                    ) : null}
                  </div>
                  
                  <Badge 
                    className="rounded-full px-3 py-1 font-bold shadow-sm"
                    variant={subject.is_active ? "success" : "default"}
                    style={{ 
                      backgroundColor: subject.is_active ? hexToRgba(subjectColor, 0.2) : undefined, 
                      color: subject.is_active ? subjectColor : undefined,
                      borderColor: subject.is_active ? hexToRgba(subjectColor, 0.3) : undefined
                    }}
                  >
                    {subject.is_active ? "Activa" : "Oculta"}
                  </Badge>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="flex flex-col rounded-2xl p-4 transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.7)" }}>
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <Layers3 className="h-4 w-4" />
                      <p className="text-xs font-bold uppercase tracking-wider">Módulos</p>
                    </div>
                    <p className="text-2xl font-black text-slate-800">{subject.modules_count}</p>
                  </div>
                  <div className="flex flex-col rounded-2xl p-4 transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.7)" }}>
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <Users className="h-4 w-4" />
                      <p className="text-xs font-bold uppercase tracking-wider">Estudiantes</p>
                    </div>
                    <p className="text-2xl font-black text-slate-800">{subject.assigned_students_count}</p>
                  </div>
                  <div className="flex flex-col rounded-2xl p-4 transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.7)" }}>
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <BarChart3 className="h-4 w-4" />
                      <p className="text-xs font-bold uppercase tracking-wider">Avance</p>
                    </div>
                    <p className="text-2xl font-black text-slate-800">{percent(subject.progress_average)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t p-4" style={{ borderColor: hexToRgba(subjectColor, 0.15), backgroundColor: "rgba(255,255,255,0.4)" }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <Link href={`/docente/materias/${subject.id}/modulos`}>
                      <Button size="sm" className="h-10 rounded-xl px-4 font-bold shadow-sm transition-transform hover:-translate-y-0.5 w-full sm:w-auto" style={{ backgroundColor: subjectColor }}>
                        <Layers3 className="mr-2 h-4 w-4" /> Ver Módulos y Actividades
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/docente/materias/${subject.id}/editar`}>
                      <Button size="sm" variant="ghost" className="h-10 rounded-xl font-bold bg-white/50 hover:bg-white w-full sm:w-auto">
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </Button>
                    </Link>
                    <form action={deleteSubjectAction}>
                      <input name="subject_id" type="hidden" value={subject.id} />
                      <Button size="sm" variant="ghost" className="h-10 rounded-xl font-bold text-rose-600 hover:bg-rose-100 w-full sm:w-auto" type="submit">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </Card>
          );
          })}
        </section>
      )}
    </RoleLayout>
  );
}
