import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Save, Trash2, Layout, Sparkles, BookOpen, Video } from "lucide-react";


import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardText } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { deleteModuleForTeacher, updateModule } from "@/features/teacher/actions";
import { getTeacherModuleById } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";

type EditModulePageProps = {
  params: Promise<{ moduleId: string }>;
};

export default async function EditModulePage({ params }: EditModulePageProps) {
  const session = await requireRole(["teacher", "admin"]);
  const { moduleId } = await params;
  const moduleData = await getTeacherModuleById(moduleId, session.userId as string).catch(() => null);

  if (!moduleData) notFound();
  const currentModule = moduleData;

  async function updateModuleAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await updateModule(
      moduleId,
      {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        position: Number(formData.get("position") ?? currentModule.position),
        is_locked_by_default: formData.get("is_locked_by_default") === "on",
        intro_video_url: String(formData.get("intro_video_url") ?? "")
      },
      activeSession.userId as string
    );
    revalidatePath(`/docente/materias/${currentModule.subject_id}/modulos`);
    revalidatePath(`/docente/modulos/${moduleId}/editar`);
  }

  async function deleteModuleAction() {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await deleteModuleForTeacher(moduleId, activeSession.userId as string);
    revalidatePath(`/docente/materias/${currentModule.subject_id}/modulos`);
    redirect(`/docente/materias/${currentModule.subject_id}/modulos`);
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
              <BookOpen className="h-3.5 w-3.5" /> Evolución Pedagógica
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl leading-tight">
              Editar Módulo
            </h1>
            <p className="mt-2 text-xs font-medium text-white/70 max-w-prose leading-relaxed">
              Estás optimizando el módulo <span className="text-academic-gold font-bold">&quot;{currentModule.title}&quot;</span>. Refina la narrativa y estructura secuencial.
            </p>
          </div>
        </div>

        <Card className="border border-academic-gold/5 shadow-sm rounded-xl p-4 bg-white">
          <div className="mb-4 flex items-center gap-3 border-b border-academic-gold/5 pb-4 text-academic-navy">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-academic-ivory text-academic-gold shadow-sm border border-academic-gold/10">
              <Layout className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold uppercase tracking-tight">Arquitectura del Módulo</CardTitle>
              <CardText className="text-[10px] font-medium text-academic-slate italic opacity-60">Ajusta la configuración técnica y didáctica.</CardText>
            </div>
          </div>

          <form action={updateModuleAction} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-academic-gold ml-2">Título del Módulo</label>
                <input 
                  id="title"
                  className="h-10 w-full rounded-lg border border-academic-gold/10 bg-academic-ivory/50 px-4 text-sm font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm" 
                  defaultValue={currentModule.title} 
                  name="title" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="position" className="text-[10px] font-bold uppercase tracking-widest text-academic-gold ml-2">Posición en la Secuencia</label>
                <input
                  id="position"
                  className="h-10 w-full rounded-lg border border-academic-gold/10 bg-academic-ivory/50 px-4 text-sm font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm"
                  defaultValue={String(currentModule.position)}
                  min={1}
                  name="position"
                  type="number"
                />
              </div>

              <div className="pt-2">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked={currentModule.is_locked_by_default} name="is_locked_by_default" type="checkbox" className="sr-only peer" id="is_locked_toggle" />
                  <div className="w-10 h-6 bg-academic-ivory border-2 border-academic-gold/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-academic-gold after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-academic-navy peer-checked:border-academic-gold/30"></div>
                  <label htmlFor="is_locked_toggle" className="ml-3 text-[10px] font-bold uppercase tracking-widest text-academic-navy cursor-pointer">Bloqueado por Defecto</label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-academic-gold ml-2">Descripción Pedagógica</label>
                <textarea
                  id="description"
                  className="min-h-24 w-full resize-none rounded-lg border border-academic-gold/10 bg-academic-ivory/50 p-4 text-sm font-medium text-academic-slate focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm leading-relaxed"
                  defaultValue={currentModule.description || ""}
                  name="description"
                />
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-rose-50/30 border border-rose-100">
                <div className="flex items-center gap-2 mb-2 text-rose-800">
                  <Video className="h-4 w-4" />
                  <label htmlFor="intro_video_url" className="text-[10px] font-bold uppercase tracking-widest">Video Introductorio (YouTube)</label>
                </div>
                <input 
                  id="intro_video_url"
                  className="h-10 w-full rounded-lg border border-rose-100 bg-white px-4 text-xs font-bold text-rose-900 focus:border-rose-300 focus:outline-none" 
                  defaultValue={currentModule.intro_video_url || ""} 
                  name="intro_video_url" 
                  placeholder="https://youtube.com/watch?v=..." 
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-6 border-t border-academic-gold/5 flex flex-wrap gap-4 justify-between items-center">
              <Button className="h-10 px-8 rounded-lg bg-academic-navy text-sm font-bold tracking-tight hover:-translate-y-0.5 shadow-md transition-all text-white border-none" type="submit">
                <Save className="mr-2 h-4 w-4 text-academic-gold" />
                Sellar Cambios
                <Sparkles className="ml-2 h-4 w-4 text-academic-gold" />
              </Button>
              
              <form action={deleteModuleAction}>
                <Button className="h-10 px-6 rounded-lg font-bold text-rose-600/40 hover:bg-rose-50 hover:text-rose-600 border border-rose-100/50 bg-white transition-all text-[10px] uppercase tracking-widest" type="submit">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Módulo
                </Button>
              </form>
            </div>
          </form>
        </Card>
      </div>
    </RoleLayout>
  );
}
