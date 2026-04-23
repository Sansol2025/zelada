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
      <div className="flex flex-col gap-8 animate-in">
        
        {/* HEADER PREMIUM */}
        <div className="relative overflow-hidden rounded-[3rem] bg-academic-navy p-10 text-white shadow-2xl md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-academic-gold/20 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-academic-gold font-black uppercase tracking-[0.2em] text-xs">
              <Layout className="h-4 w-4" /> Diseño Curricular
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl leading-[1.1]">
              Nueva Materia
            </h1>
            <p className="mt-6 text-xl font-medium text-white/70 max-w-prose leading-relaxed">
              Crea un nuevo universo de aprendizaje. Define la identidad visual y el enfoque pedagógico de tu materia.
            </p>
          </div>
        </div>

        <Card className="border border-academic-gold/5 shadow-premium rounded-[3rem] p-10 bg-white">
          <div className="mb-10 flex items-center gap-4 border-b border-academic-gold/5 pb-8 text-academic-navy">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-ivory text-academic-gold shadow-sm border border-academic-gold/10">
              <BookOpen className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight uppercase">Datos de la Materia</CardTitle>
          </div>

          <form action={createSubjectAction} className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              <label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-academic-gold">Título de la Materia</label>
              <input 
                id="title"
                className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 px-6 text-lg font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm" 
                name="title" 
                placeholder="Ej: Exploradores del Espacio" 
                required 
              />
            </div>
            
            <div className="space-y-3">
              <label htmlFor="icon" className="text-xs font-black uppercase tracking-widest text-academic-gold">Icono (Lucide name o emoji)</label>
              <input 
                id="icon"
                className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-white px-6 font-bold text-academic-navy focus:border-academic-gold focus:outline-none transition-all shadow-sm" 
                name="icon" 
                placeholder="Ej: Rocket, 🚀" 
              />
            </div>

            <div className="space-y-3 lg:col-span-2">
              <label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-academic-gold">Descripción Pedagógica</label>
              <textarea
                id="description"
                className="min-h-32 w-full resize-none rounded-2xl border border-academic-gold/10 bg-white p-6 text-base font-medium text-academic-slate focus:border-academic-gold focus:outline-none transition-all shadow-sm"
                name="description"
                placeholder="Describe el viaje de aprendizaje para tus estudiantes..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-10 lg:col-span-2 pt-6">
              <div className="space-y-3">
                <label htmlFor="color" className="text-xs font-black uppercase tracking-widest text-academic-gold block">Color de Identidad</label>
                <div className="flex items-center gap-4">
                  <input 
                    id="color"
                    className="h-14 w-28 rounded-xl cursor-pointer border border-academic-gold/10 bg-white p-1" 
                    defaultValue="#43b8f4" 
                    name="color" 
                    type="color" 
                  />
                  <span className="text-sm font-bold text-academic-navy/60 italic">Este color se usará en las tarjetas del alumno</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked name="is_active" type="checkbox" className="sr-only peer" id="is_active_toggle" />
                  <div className="w-14 h-8 bg-academic-ivory border-2 border-academic-gold/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-academic-gold after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-academic-navy peer-checked:border-academic-gold/30"></div>
                  <label htmlFor="is_active_toggle" className="ml-4 text-sm font-black uppercase tracking-widest text-academic-navy cursor-pointer">Materia Activa</label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 pt-10 border-t border-academic-gold/5 mt-4">
              <Button className="h-20 w-full sm:w-auto rounded-[2rem] bg-academic-navy px-16 text-xl font-black tracking-tight hover:scale-105 active:scale-95 shadow-2xl shadow-academic-navy/30 transition-all text-white border-none">
                <Plus className="mr-4 h-8 w-8 text-academic-gold" />
                Crear Universo de Aprendizaje
                <Sparkles className="ml-2 h-5 w-5 text-academic-gold" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </RoleLayout>
  );
}
