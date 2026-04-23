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
        <div className="relative overflow-hidden rounded-[3rem] bg-academic-navy p-10 text-white shadow-2xl md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-academic-gold/20 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-academic-gold font-black uppercase tracking-[0.2em] text-xs">
              <BookOpen className="h-4 w-4" /> Evolución Pedagógica
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl leading-[1.1]">
              Editar Módulo
            </h1>
            <p className="mt-6 text-xl font-medium text-white/70 max-w-prose leading-relaxed">
              Estás optimizando el módulo <span className="text-academic-gold font-black">&quot;{currentModule.title}&quot;</span>. Refina la narrativa y estructura secuencial.
            </p>
          </div>
        </div>

        <Card className="border border-academic-gold/5 shadow-premium rounded-[3rem] p-10 bg-white">
          <div className="mb-10 flex items-center gap-4 border-b border-academic-gold/5 pb-8 text-academic-navy">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-ivory text-academic-gold shadow-sm border border-academic-gold/10">
              <Layout className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Arquitectura del Módulo</CardTitle>
              <CardText className="text-sm font-medium text-academic-slate italic opacity-60">Ajusta la configuración técnica y didáctica.</CardText>
            </div>
          </div>

          <form action={updateModuleAction} className="grid md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Título del Módulo</label>
                <input 
                  id="title"
                  className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 px-6 text-lg font-black text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm" 
                  defaultValue={currentModule.title} 
                  name="title" 
                  required 
                />
              </div>
              
              <div className="space-y-3">
                <label htmlFor="position" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Posición en la Secuencia</label>
                <input
                  id="position"
                  className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 px-6 text-lg font-black text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm"
                  defaultValue={String(currentModule.position)}
                  min={1}
                  name="position"
                  type="number"
                />
              </div>

              <div className="pt-4">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked={currentModule.is_locked_by_default} name="is_locked_by_default" type="checkbox" className="sr-only peer" id="is_locked_toggle" />
                  <div className="w-14 h-8 bg-academic-ivory border-2 border-academic-gold/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-academic-gold after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-academic-navy peer-checked:border-academic-gold/30"></div>
                  <label htmlFor="is_locked_toggle" className="ml-4 text-xs font-black uppercase tracking-widest text-academic-navy cursor-pointer">Bloqueado por Defecto</label>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Descripción Pedagógica</label>
                <textarea
                  id="description"
                  className="min-h-32 w-full resize-none rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 p-6 text-base font-medium text-academic-slate focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm leading-relaxed"
                  defaultValue={currentModule.description || ""}
                  name="description"
                />
              </div>

              <div className="space-y-3 p-6 rounded-3xl bg-rose-50/30 border border-rose-100">
                <div className="flex items-center gap-2 mb-4 text-rose-800">
                  <Video className="h-5 w-5" />
                  <label htmlFor="intro_video_url" className="text-[10px] font-black uppercase tracking-widest">Video Introductorio (YouTube)</label>
                </div>
                <input 
                  id="intro_video_url"
                  className="h-14 w-full rounded-xl border border-rose-100 bg-white px-5 text-sm font-bold text-rose-900 focus:border-rose-300 focus:outline-none" 
                  defaultValue={currentModule.intro_video_url || ""} 
                  name="intro_video_url" 
                  placeholder="https://youtube.com/watch?v=..." 
                />
                <p className="mt-3 text-[10px] font-medium text-rose-700/60 leading-tight">Este video motivacional se proyectará antes de habilitar las actividades del módulo.</p>
              </div>
            </div>

            <div className="md:col-span-2 pt-10 border-t border-academic-gold/5 flex flex-wrap gap-6 justify-between items-center">
              <Button className="h-20 px-16 rounded-[2rem] bg-academic-navy text-xl font-black tracking-tight hover:scale-105 active:scale-95 shadow-2xl shadow-academic-navy/30 transition-all text-white border-none" type="submit">
                <Save className="mr-4 h-8 w-8 text-academic-gold" />
                Sellar Cambios
                <Sparkles className="ml-2 h-5 w-5 text-academic-gold" />
              </Button>
              
              <form action={deleteModuleAction}>
                <Button className="h-14 px-8 rounded-xl font-black text-rose-600/40 hover:bg-rose-50 hover:text-rose-600 border border-rose-100/50 bg-white transition-all text-[10px] uppercase tracking-widest" type="submit">
                  <Trash2 className="mr-3 h-5 w-5" />
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
