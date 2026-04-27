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
    } catch (error) {
      // Si el error es una redirección de Next.js, dejarla pasar
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        throw error;
      }
      console.error("Error creating subject:", error);
      redirect(`/docente/materias?error=error_creacion`);
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
      <div className="flex flex-col gap-8 animate-in">

        {/* MESSAGES */}
        {errorMessage && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-black text-rose-800 uppercase tracking-widest text-center shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
            {errorMessage === "error_creacion" ? "Error al crear la materia. Verifica que el nombre tenga al menos 3 caracteres." : "Error en la operación. Intenta nuevamente."}
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
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border border-academic-gold/5 shadow-premium rounded-[2.5rem] p-8 bg-white flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-academic-gold">Materias Totales</span>
            <span className="text-4xl font-display font-black text-academic-navy my-4">{subjects.length}</span>
            <span className="text-[10px] font-black text-academic-slate/40">Recorridos creados</span>
          </Card>
          <Card className="border border-academic-gold/5 shadow-premium rounded-[2.5rem] p-8 bg-white flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-academic-gold">Visibilidad</span>
            <span className="text-4xl font-display font-black text-academic-navy my-4">{activeSubjectsCount}</span>
            <span className="text-[10px] font-black text-academic-slate/40">Materias Activas</span>
          </Card>
          <Card className="border border-academic-gold/5 shadow-premium rounded-[2.5rem] p-8 bg-white flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-academic-gold">Alcance</span>
            <span className="text-4xl font-display font-black text-academic-navy my-4">{assignedStudentsCount}</span>
            <span className="text-[10px] font-black text-academic-slate/40">Estudiantes Vinculados</span>
          </Card>
          <Card className="border border-academic-gold/5 shadow-premium rounded-[2.5rem] p-8 bg-white flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-academic-gold">Efectividad</span>
            <span className="text-4xl font-display font-black text-academic-navy my-4">{percent(averageProgress)}</span>
            <span className="text-[10px] font-black text-academic-slate/40">Progreso Promedio</span>
          </Card>
        </section>

        {/* CREATION FORM */}
        <Card className="overflow-hidden border border-academic-gold/5 bg-white shadow-premium rounded-[3rem] p-10">
          <div className="mb-10 flex items-center gap-4 border-b border-academic-gold/5 pb-8 text-academic-navy">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-navy text-white shadow-lg">
              <Wand2 className="h-6 w-6 text-academic-gold" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Crear Reino de Aprendizaje</CardTitle>
              <CardText className="font-medium text-academic-slate italic opacity-60">Diseña una nueva materia lúdica personalizada.</CardText>
            </div>
          </div>
          
          <form action={createSubjectAction} className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="space-y-3">
                <label htmlFor="title" className="mb-2 block text-xs font-black uppercase tracking-widest text-academic-gold">Nombre Mágico</label>
                <input
                  id="title"
                  className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/30 px-6 text-lg font-black text-academic-navy transition-all focus:border-academic-gold focus:bg-white focus:outline-none shadow-sm"
                  name="title"
                  placeholder="Ej: Aventura Matemática"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <label htmlFor="description" className="mb-2 block text-xs font-black uppercase tracking-widest text-academic-gold">Misión Pedagógica</label>
                <textarea
                  id="description"
                  className="min-h-32 w-full resize-none rounded-2xl border border-academic-gold/10 bg-academic-ivory/30 p-6 text-base font-medium text-academic-slate transition-all focus:border-academic-gold focus:bg-white focus:outline-none shadow-sm"
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
            
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="mb-3 block text-xs font-black uppercase tracking-widest text-academic-gold">Identidad Visual (Color)</label>
                <div className="grid grid-cols-4 gap-4">
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
                      <div className={`h-14 w-full rounded-2xl ${color.bg} transition-all duration-300 peer-checked:ring-4 peer-checked:ring-academic-gold peer-checked:ring-offset-4 shadow-sm hover:scale-105 active:scale-95`}></div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <FileUploader 
                  name="icon" 
                  accept="image/*" 
                  label="Icono de la materia"
                />
              </div>

              <div className="pt-6">
                <Button type="submit" className="h-20 w-full rounded-[2rem] bg-academic-navy text-xl font-black tracking-tight hover:scale-105 active:scale-95 shadow-2xl shadow-academic-navy/30 transition-all text-white border-none">
                  <Sparkles className="mr-4 h-8 w-8 text-academic-gold" />
                  Dar Vida a la Materia
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* SUBJECTS LIST */}
        {subjects.length === 0 ? (
          <div className="rounded-[3rem] border-2 border-dashed border-academic-gold/10 bg-academic-ivory/30 p-20 text-center">
            <EmptyState
              title="Sin materias creadas"
              description="Empieza a diseñar tus recorridos pedagógicos usando el panel superior."
            />
          </div>
        ) : (
          <section className="grid gap-8 md:grid-cols-2">
            {subjects.map((subject) => {
              const subjectColor = subject.color || "#C6A24E";
              return (
              <Card
                key={subject.id}
                className="group flex flex-col justify-between overflow-hidden border border-academic-gold/5 shadow-sm transition-all duration-500 hover:shadow-premium hover:-translate-y-2 rounded-[3rem] bg-white"
              >
                <div className="p-10">
                  <div className="flex items-start justify-between gap-6 mb-8">
                    <div className="flex flex-wrap items-center gap-6">
                      <div 
                        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] text-3xl shadow-lg border border-white/50"
                        style={{ backgroundColor: subjectColor, color: "white" }}
                      >
                        {subject.icon ? (
                          (subject.icon.startsWith("http") || subject.icon.startsWith("/")) ? (
                            <NextImage 
                              src={subject.icon} 
                              alt={subject.title} 
                              width={64} 
                              height={64} 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            subject.icon
                          )
                        ) : (
                          <BookOpen className="h-8 w-8" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <CardTitle className="text-3xl font-black text-academic-navy tracking-tight truncate max-w-[200px] lg:max-w-md">{subject.title}</CardTitle>
                        <Badge 
                          className="mt-2 w-fit rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border"
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
                    <CardText className="line-clamp-2 mt-4 font-medium text-academic-slate leading-relaxed italic opacity-80">&quot;{subject.description}&quot;</CardText>
                  )}

                  <div className="mt-10 grid gap-4 grid-cols-3">
                    <div className="flex flex-col rounded-2xl bg-academic-ivory/30 p-5 border border-academic-gold/5 transition-all group-hover:bg-academic-ivory/50">
                      <Layers3 className="h-4 w-4 text-academic-gold mb-2 opacity-50" />
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-academic-slate/60">Módulos</p>
                      <p className="text-2xl font-black text-academic-navy mt-1">{subject.modules_count}</p>
                    </div>
                    <div className="flex flex-col rounded-2xl bg-academic-ivory/30 p-5 border border-academic-gold/5 transition-all group-hover:bg-academic-ivory/50">
                      <Users className="h-4 w-4 text-academic-gold mb-2 opacity-50" />
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-academic-slate/60">Alumnos</p>
                      <p className="text-2xl font-black text-academic-navy mt-1">{subject.assigned_students_count}</p>
                    </div>
                    <div className="flex flex-col rounded-2xl bg-academic-ivory/30 p-5 border border-academic-gold/5 transition-all group-hover:bg-academic-ivory/50">
                      <BarChart3 className="h-4 w-4 text-academic-gold mb-2 opacity-50" />
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-academic-slate/60">Avance</p>
                      <p className="text-2xl font-black text-academic-navy mt-1">{percent(subject.progress_average)}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-academic-gold/5 p-8 bg-academic-ivory/10 group-hover:bg-academic-ivory/20 transition-all">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex gap-4 w-full sm:w-auto">
                      <Link href={`/docente/materias/${subject.id}/modulos` as Route} className="w-full sm:w-auto">
                        <Button className="h-14 rounded-xl px-8 font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 border-none text-white w-full sm:w-auto" style={{ backgroundColor: subjectColor }}>
                          <Layers3 className="mr-2 h-5 w-5" /> Gestionar Contenidos
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                      <Link href={`/docente/materias/${subject.id}/editar` as Route}>
                        <Button variant="ghost" className="h-14 w-14 rounded-xl font-black text-academic-navy/40 hover:text-academic-navy hover:bg-white border border-academic-gold/5 transition-all">
                          <Pencil className="h-5 w-5" />
                        </Button>
                      </Link>
                      <form action={deleteSubjectAction}>
                        <input name="subject_id" type="hidden" value={subject.id} />
                        <Button variant="ghost" className="h-14 w-14 rounded-xl font-black text-rose-600/40 hover:bg-rose-50 hover:text-rose-600 border border-rose-100/50 transition-all" type="submit">
                          <Trash2 className="h-5 w-5" />
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
