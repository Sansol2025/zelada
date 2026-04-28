import Link from "next/link";
import NextImage from "next/image";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BarChart3, BookOpen, Layers3, Pencil, Trash2, Users, Sparkles, Wand2, Layout } from "lucide-react";
import type { Route } from "next";

import { EmptyState } from "@/components/empty-state";
import { RoleLayout } from "@/components/layout/role-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { deleteSubject, createSubject } from "@/features/teacher/actions";
import { getTeacherSubjectsOverview } from "@/features/teacher/queries";
import { requireRole } from "@/features/auth/session";
import { PageHeader } from "@/components/page-header";
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
          color: String(formData.get("color") ?? "#C6A24E"), // Use gold as default
          icon: String(formData.get("icon") ?? ""),
          is_active: formData.get("is_active") === "on"
        },
        activeSession.userId as string
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        throw error;
      }
      console.error("Error creating subject:", error);
      
      // Capturar mensaje de error de forma segura para TypeScript/ESLint
      let errorMsg = "error_creacion";
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMsg = String((error as { message: unknown }).message);
      } else if (typeof error === 'string') {
        errorMsg = error;
      }

      redirect(`/docente/materias?error=${encodeURIComponent(errorMsg)}`);
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
    } catch {
      redirect(`/docente/materias?error=error_eliminacion`);
    }
  }

  return (
    <RoleLayout
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <div className="flex flex-col gap-4 animate-in">

        {/* MESSAGES */}
        {errorMessage && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-black text-rose-800 uppercase tracking-widest text-center shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
            {errorMessage === "error_creacion" 
              ? "Error al crear la materia. Verifica que el nombre tenga al menos 3 caracteres." 
              : errorMessage.includes('new row violates row-level security policy')
                ? "Error de permisos: No puedes crear materias con este usuario."
                : `Error: ${errorMessage}`}
          </div>
        )}
        {successMessage && (
          <div className="rounded-2xl border border-academic-gold/20 bg-academic-gold/10 p-6 text-sm font-black text-academic-navy uppercase tracking-widest text-center">
            {successMessage}
          </div>
        )}

        <PageHeader
          icon={<Layout className="h-4 w-4" />}
          subtitle="Centro de Ingeniería Educativa"
          title="Gestión de Materias"
          description="Define recorridos, organiza módulos y monitorea el alcance pedagógico de tus propios contenidos."
        />

        {/* METRICS ROW */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border border-slate-200 shadow-sm rounded-xl p-5 bg-white flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Materias Totales</span>
            <span className="text-2xl font-display font-bold text-academic-navy my-2">{subjects.length}</span>
            <span className="text-[10px] font-semibold text-slate-400">Recorridos creados</span>
          </Card>
          <Card className="border border-slate-200 shadow-sm rounded-xl p-5 bg-white flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Visibilidad</span>
            <span className="text-2xl font-display font-bold text-academic-navy my-2">{activeSubjectsCount}</span>
            <span className="text-[10px] font-semibold text-slate-400">Materias Activas</span>
          </Card>
          <Card className="border border-slate-200 shadow-sm rounded-xl p-5 bg-white flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Alcance</span>
            <span className="text-2xl font-display font-bold text-academic-navy my-2">{assignedStudentsCount}</span>
            <span className="text-[10px] font-semibold text-slate-400">Estudiantes Vinculados</span>
          </Card>
          <Card className="border border-slate-200 shadow-sm rounded-xl p-5 bg-white flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Efectividad</span>
            <span className="text-2xl font-display font-bold text-academic-navy my-2">{percent(averageProgress)}</span>
            <span className="text-[10px] font-semibold text-slate-400">Progreso Promedio</span>
          </Card>
        </section>

        {/* CREATION FORM */}
        <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm rounded-2xl p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 text-academic-navy">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-academic-navy text-white shadow-sm">
              <Wand2 className="h-5 w-5 text-academic-gold" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold uppercase tracking-tight">Crear Reino de Aprendizaje</CardTitle>
              <CardText className="text-xs font-medium text-slate-500 italic">Diseña una nueva materia lúdica personalizada.</CardText>
            </div>
          </div>
          
          <form action={createSubjectAction} className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Nombre Mágico</label>
                <input
                  id="title"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy transition-all focus:border-academic-navy focus:bg-white focus:outline-none shadow-sm"
                  name="title"
                  placeholder="Ej: Aventura Matemática"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Misión Pedagógica</label>
                <textarea
                  id="description"
                  className="min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600 transition-all focus:border-academic-navy focus:bg-white focus:outline-none shadow-sm"
                  name="description"
                  placeholder="En esta materia vamos a aprender sumas y restas divirtiéndonos con animalitos..."
                />
              </div>
              
              <div className="pt-2">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked name="is_active" type="checkbox" className="sr-only peer" id="is_active_toggle" />
                  <div className="w-14 h-8 bg-academic-ivory border-2 border-academic-gold/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-academic-gold after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-academic-navy peer-checked:border-academic-gold/30"></div>
                  <label htmlFor="is_active_toggle" className="ml-4 text-xs font-black uppercase tracking-widest text-academic-navy cursor-pointer">Visibilidad Activa</label>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Identidad Visual (Color)</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: "#C6A24E", bg: "bg-[#C6A24E]" }, // Academic Gold
                    { value: "#1A2B3C", bg: "bg-[#1A2B3C]" }, // Sovereign Navy
                    { value: "#E11D48", bg: "bg-[#E11D48]" }, // Vibrant Rose
                    { value: "#059669", bg: "bg-[#059669]" }, // Emerald Growth
                    { value: "#4F46E5", bg: "bg-[#4F46E5]" }, // Premium Indigo
                    { value: "#D97706", bg: "bg-[#D97706]" }, // Sunset Amber
                    { value: "#7C3AED", bg: "bg-[#7C3AED]" }, // Royal Violet
                    { value: "#0284C7", bg: "bg-[#0284C7]" }, // Ocean Azure
                  ].map((color) => (
                    <label key={color.value} className="group relative cursor-pointer" htmlFor={`color-${color.value}`}>
                      <input 
                        id={`color-${color.value}`}
                        type="radio" 
                        name="color" 
                        value={color.value} 
                        className="peer sr-only"
                        defaultChecked={color.value === "#C6A24E"}
                      />
                      <div className={`h-10 w-full rounded-lg ${color.bg} transition-all duration-200 peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-academic-navy shadow-sm hover:scale-105 active:scale-95`}></div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <FileUploader 
                  name="icon" 
                  accept="image/*" 
                  label="Icono de la materia"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="h-12 w-full rounded-xl bg-academic-navy text-sm font-bold hover:scale-[1.02] active:scale-95 shadow-md transition-all text-white border-none">
                  <Sparkles className="mr-2 h-4 w-4 text-academic-gold" />
                  Crear Materia
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* SUBJECTS LIST */}
        {subjects.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <EmptyState
              title="Sin materias creadas"
              description="Empieza a diseñar tus recorridos pedagógicos usando el panel superior."
            />
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            {subjects.map((subject) => {
              const subjectColor = subject.color || "#C6A24E";
              return (
              <Card
                key={subject.id}
                className="group flex flex-col justify-between overflow-hidden border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 rounded-2xl bg-white"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div 
                        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-2xl shadow-sm border border-black/5"
                        style={{ backgroundColor: subjectColor, color: "white" }}
                      >
                        {subject.icon ? (
                          (subject.icon.startsWith("http") || subject.icon.startsWith("/")) ? (
                            <NextImage 
                              src={subject.icon} 
                              alt={subject.title} 
                              width={48} 
                              height={48} 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            subject.icon
                          )
                        ) : (
                          <BookOpen className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <CardTitle className="text-lg font-bold text-academic-navy tracking-tight truncate max-w-[180px] lg:max-w-[220px]">{subject.title}</CardTitle>
                        <Badge 
                          className="mt-1 w-fit rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border"
                          variant={subject.is_active ? "success" : "default"}
                          style={{ 
                            backgroundColor: subject.is_active ? hexToRgba(subjectColor, 0.1) : undefined, 
                            color: subject.is_active ? subjectColor : undefined,
                            borderColor: subject.is_active ? hexToRgba(subjectColor, 0.2) : undefined
                          }}
                        >
                          {subject.is_active ? "Materia Activa" : "Materia Oculta"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {subject.description && (
                    <CardText className="line-clamp-2 mt-2 text-xs font-medium text-slate-500 leading-relaxed italic">&quot;{subject.description}&quot;</CardText>
                  )}

                  <div className="mt-6 grid gap-2 grid-cols-3">
                    <div className="flex flex-col rounded-lg bg-slate-50 p-3 border border-slate-100 transition-all group-hover:bg-slate-100">
                      <Layers3 className="h-3.5 w-3.5 text-slate-400 mb-1" />
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Módulos</p>
                      <p className="text-lg font-bold text-academic-navy mt-0.5">{subject.modules_count}</p>
                    </div>
                    <div className="flex flex-col rounded-lg bg-slate-50 p-3 border border-slate-100 transition-all group-hover:bg-slate-100">
                      <Users className="h-3.5 w-3.5 text-slate-400 mb-1" />
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Alumnos</p>
                      <p className="text-lg font-bold text-academic-navy mt-0.5">{subject.assigned_students_count}</p>
                    </div>
                    <div className="flex flex-col rounded-lg bg-slate-50 p-3 border border-slate-100 transition-all group-hover:bg-slate-100">
                      <BarChart3 className="h-3.5 w-3.5 text-slate-400 mb-1" />
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Avance</p>
                      <p className="text-lg font-bold text-academic-navy mt-0.5">{percent(subject.progress_average)}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 p-4 bg-slate-50 transition-all">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Link href={`/docente/materias/${subject.id}/modulos` as Route} className="w-full sm:w-auto">
                        <Button className="h-10 rounded-lg px-4 font-bold text-[11px] shadow-sm transition-all hover:-translate-y-0.5 border-none text-white w-full sm:w-auto" style={{ backgroundColor: subjectColor }}>
                          <Layers3 className="mr-1.5 h-4 w-4" /> Gestionar Contenidos
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Link href={`/docente/materias/${subject.id}/editar` as Route}>
                        <Button variant="outline" className="h-10 w-10 p-0 rounded-lg text-slate-400 hover:text-academic-navy hover:bg-white border-slate-200 transition-all">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form action={deleteSubjectAction}>
                        <input name="subject_id" type="hidden" value={subject.id} />
                        <Button variant="outline" className="h-10 w-10 p-0 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 border-rose-100 transition-all" type="submit">
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
      </div>
    </RoleLayout>
  );
}
