import { revalidatePath } from "next/cache";
import { Plus, BookOpen, Sparkles, Layout } from "lucide-react";

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
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <div className="flex flex-col gap-4 animate-in">
        
        {/* HEADER PREMIUM */}
        <div className="relative overflow-hidden rounded-xl bg-academic-navy p-4 text-white shadow-md md:p-5">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-academic-gold/20 blur-2xl"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-academic-gold font-bold uppercase tracking-wider text-[10px]">
              <Layout className="h-3.5 w-3.5" /> Diseño Curricular
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl leading-tight">
              Nueva Materia
            </h1>
            <p className="mt-3 text-sm font-medium text-white/70 max-w-prose leading-relaxed">
              Crea un nuevo universo de aprendizaje. Define la identidad visual y el enfoque pedagógico de tu materia.
            </p>
          </div>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-xl p-4 bg-white">
          <div className="mb-3 flex items-center gap-3 border-b border-slate-100 pb-3 text-academic-navy">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-academic-gold shadow-sm border border-slate-100">
              <BookOpen className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-bold tracking-tight uppercase">Datos de la Materia</CardTitle>
          </div>

          <form action={createSubjectAction} className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="title" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Título de la Materia</label>
              <input 
                id="title"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm" 
                name="title" 
                placeholder="Ej: Exploradores del Espacio" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="icon" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Icono (Lucide name o emoji)</label>
              <input 
                id="icon"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:outline-none transition-all shadow-sm" 
                name="icon" 
                placeholder="Ej: Rocket, 🚀" 
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label htmlFor="description" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Descripción Pedagógica</label>
              <textarea
                id="description"
                className="min-h-20 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium text-slate-600 focus:border-academic-navy focus:outline-none transition-all shadow-sm"
                name="description"
                placeholder="Describe el viaje de aprendizaje para tus estudiantes..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-8 lg:col-span-2 pt-4">
              <div className="space-y-2">
                <label htmlFor="color" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block ml-1">Color de Identidad</label>
                <div className="flex items-center gap-3">
                  <input 
                    id="color"
                    className="h-10 w-24 rounded-lg cursor-pointer border border-slate-200 bg-white p-1" 
                    defaultValue="#43b8f4" 
                    name="color" 
                    type="color" 
                  />
                  <span className="text-xs font-medium text-slate-400 italic">Se usará en las tarjetas del alumno</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked name="is_active" type="checkbox" className="sr-only peer" id="is_active_toggle" />
                  <div className="w-10 h-6 bg-slate-100 border-2 border-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-academic-navy peer-checked:border-academic-navy after:peer-checked:bg-white"></div>
                  <label htmlFor="is_active_toggle" className="ml-3 text-[10px] font-bold uppercase tracking-wider text-academic-navy cursor-pointer">Materia Activa</label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 pt-4 border-t border-slate-100 mt-2">
              <Button className="h-10 w-full sm:w-auto rounded-lg bg-academic-navy px-8 text-sm font-bold tracking-tight hover:-translate-y-0.5 shadow-md transition-all text-white border-none">
                <Plus className="mr-2 h-4 w-4 text-academic-gold" />
                Crear Materia
                <Sparkles className="ml-2 h-3 w-3 text-academic-gold" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </RoleLayout>
  );
}
