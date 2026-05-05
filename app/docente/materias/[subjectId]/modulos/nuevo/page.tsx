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
        <div className="relative overflow-hidden rounded-xl bg-academic-navy p-4 text-white shadow-md md:p-6">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-academic-gold/20 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-academic-gold font-bold uppercase tracking-[0.2em] text-[10px]">
              <Plus className="h-3.5 w-3.5" /> Construcción de Módulo
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl leading-tight">
              Nuevo Módulo
            </h1>
            <p className="mt-2 text-xs font-medium text-white/70 max-w-prose leading-relaxed">
              Expande el reino de <span className="text-academic-gold font-bold">&quot;{subject.title}&quot;</span>. Define un nuevo capítulo en el viaje del aprendiz.
            </p>
          </div>
        </div>

        <Card className="border border-academic-gold/5 shadow-sm rounded-xl p-4 bg-white">
          <div className="mb-4 flex items-center gap-3 border-b border-academic-gold/5 pb-4 text-academic-navy">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-academic-ivory text-academic-gold shadow-sm border border-academic-gold/10">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold uppercase tracking-tight">Detalles del Capítulo</CardTitle>
              <CardText className="text-[10px] font-medium text-academic-slate italic opacity-60">Configura la estructura secuencial del módulo.</CardText>
            </div>
          </div>

          <form action={createModuleAction} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-academic-gold ml-2">Título del Módulo</label>
                <input 
                  id="title"
                  className="h-10 w-full rounded-lg border border-academic-gold/10 bg-academic-ivory/50 px-4 text-sm font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm" 
                  name="title" 
                  placeholder="Ej: Fundamentos de la Aventura" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="position" className="text-[10px] font-bold uppercase tracking-widest text-academic-gold ml-2">Posición Secuencial</label>
                <input
                  id="position"
                  className="h-10 w-full rounded-lg border border-academic-gold/10 bg-academic-ivory/50 px-4 text-sm font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm"
                  defaultValue={String(modules.length + 1)}
                  min={1}
                  name="position"
                  type="number"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-academic-gold ml-2">Descripción Pedagógica</label>
                <textarea 
                  id="description"
                  className="min-h-24 w-full resize-none rounded-lg border border-academic-gold/10 bg-academic-ivory/50 p-4 text-sm font-medium text-academic-slate focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm leading-relaxed" 
                  name="description" 
                  placeholder="¿Qué descubrirán los alumnos en este capítulo?"
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input name="is_locked_by_default" type="checkbox" className="sr-only peer" />
                <div className="w-10 h-6 bg-academic-ivory border-2 border-academic-gold/20 group-hover:border-academic-gold/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-academic-gold after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-academic-navy peer-checked:border-academic-gold/30"></div>
                <span className="ml-3 text-[10px] font-bold uppercase tracking-widest text-academic-navy">Bloqueo Inicial</span>
              </label>
            </div>

            <div className="md:col-span-2 pt-6 border-t border-academic-gold/5">
              <Button className="h-10 w-full md:w-auto rounded-lg bg-academic-navy px-10 text-sm font-bold tracking-tight hover:-translate-y-0.5 shadow-md transition-all text-white border-none">
                <Plus className="mr-2 h-4 w-4 text-academic-gold" />
                Sellar Módulo
                <Sparkles className="ml-2 h-4 w-4 text-academic-gold" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </RoleLayout>
  );
}
