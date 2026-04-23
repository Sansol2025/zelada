import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { Plus, Sparkles, BookOpen } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardText } from "@/components/ui/card";
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
              <Plus className="h-4 w-4" /> Construcción de Módulo
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl leading-[1.1]">
              Nuevo Módulo
            </h1>
            <p className="mt-6 text-xl font-medium text-white/70 max-w-prose leading-relaxed">
              Expande el reino de <span className="text-academic-gold font-black">&quot;{subject.title}&quot;</span>. Define un nuevo capítulo en el viaje del aprendiz.
            </p>
          </div>
        </div>

        <Card className="border border-academic-gold/5 shadow-premium rounded-[3rem] p-10 bg-white">
          <div className="mb-10 flex items-center gap-4 border-b border-academic-gold/5 pb-8 text-academic-navy">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-ivory text-academic-gold shadow-sm border border-academic-gold/10">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Detalles del Capítulo</CardTitle>
              <CardText className="text-sm font-medium text-academic-slate italic opacity-60">Configura la estructura secuencial del módulo.</CardText>
            </div>
          </div>

          <form action={createModuleAction} className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Título del Módulo</label>
                <input 
                  id="title"
                  className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 px-6 text-lg font-black text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm" 
                  name="title" 
                  placeholder="Ej: Fundamentos de la Aventura" 
                  required 
                />
              </div>
              
              <div className="space-y-3">
                <label htmlFor="position" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Posición Secuencial</label>
                <input
                  id="position"
                  className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 px-6 text-lg font-black text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm"
                  defaultValue={String(modules.length + 1)}
                  min={1}
                  name="position"
                  type="number"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Descripción Pedagógica</label>
                <textarea 
                  id="description"
                  className="min-h-[148px] w-full resize-none rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 p-6 text-base font-medium text-academic-slate focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm leading-relaxed" 
                  name="description" 
                  placeholder="¿Qué descubrirán los alumnos en este capítulo?"
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <div className="relative inline-flex items-center cursor-pointer">
                <input name="is_locked_by_default" type="checkbox" className="sr-only peer" id="is_locked_toggle" />
                <div className="w-14 h-8 bg-academic-ivory border-2 border-academic-gold/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-academic-gold after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-academic-navy peer-checked:border-academic-gold/30"></div>
                <label htmlFor="is_locked_toggle" className="ml-4 text-xs font-black uppercase tracking-widest text-academic-navy cursor-pointer">Bloqueado por Defecto (Habilitar manualmente)</label>
              </div>
            </div>

            <div className="md:col-span-2 pt-10 border-t border-academic-gold/5">
              <Button className="h-20 w-full md:w-auto rounded-[2rem] bg-academic-navy px-16 text-xl font-black tracking-tight hover:scale-105 active:scale-95 shadow-2xl shadow-academic-navy/30 transition-all text-white border-none">
                <Plus className="mr-4 h-8 w-8 text-academic-gold" />
                Sellar Módulo
                <Sparkles className="ml-2 h-5 w-5 text-academic-gold" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </RoleLayout>
  );
}
