import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { Layers, Pencil, Plus, Sparkles, Trash2, Map, LayoutGrid, Video } from "lucide-react";
import type { Route } from "next";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { createModule, deleteModuleForTeacher } from "@/features/teacher/actions";
import { getTeacherModulesBySubject, getTeacherSubjectById } from "@/features/teacher/queries";
import { PageHeader } from "@/components/page-header";
import { teacherNavItems } from "@/lib/navigation";

type SubjectModulesPageProps = {
  params: Promise<{ subjectId: string }>;
};

export default async function SubjectModulesPage({ params }: SubjectModulesPageProps) {
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
        is_locked_by_default: formData.get("is_locked_by_default") === "on",
        intro_video_url: String(formData.get("intro_video_url") ?? "")
      },
      activeSession.userId as string
    );

    revalidatePath(`/docente/materias/${subjectId}/modulos`);
  }

  async function deleteModuleAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    const moduleId = String(formData.get("module_id") ?? "");
    if (!moduleId) return;

    await deleteModuleForTeacher(moduleId, activeSession.userId as string);
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

        <PageHeader
          icon={<Map className="h-4 w-4" />}
          subtitle="Mapa de Ruta Pedagógica"
          title={<>Módulos de <span className="text-academic-gold italic">{subject.title}</span></>}
          description="Organiza la aventura paso a paso. Agrega módulos como 'Niveles' secuenciales que tus estudiantes deberán conquistar para progresar."
        />

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          
          {/* LEFT: MODULES LIST */}
          <section className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-2xl font-black text-academic-navy tracking-tight uppercase flex items-center gap-3">
                <LayoutGrid className="h-6 w-6 text-academic-gold" />
                Niveles en curso
              </h2>
              <span className="rounded-full bg-academic-gold/10 px-4 py-1 text-[10px] font-black text-academic-navy uppercase tracking-widest border border-academic-gold/10">
                {modules.length} Capítulos
              </span>
            </div>

            {!modules.length ? (
              <div className="rounded-[3rem] border-2 border-dashed border-academic-gold/10 bg-academic-ivory/30 p-20 text-center flex flex-col items-center justify-center">
                <Layers className="h-16 w-16 text-academic-gold/20 mb-6" />
                <h3 className="font-display text-2xl font-black text-academic-navy/40 uppercase tracking-tight">Sin niveles asignados</h3>
                <p className="mt-4 text-academic-slate font-medium text-lg italic opacity-60">Empieza a construir el recorrido desde el panel de creación.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {modules.map((module) => (
                  <Card key={module.id} className="group overflow-hidden border border-academic-gold/5 shadow-premium transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl rounded-[2.5rem] p-0 flex flex-col sm:flex-row bg-white relative">
                    {/* Visual sequence marker */}
                    <div className="w-4 sm:w-6 shrink-0 bg-academic-gold/20 group-hover:bg-academic-gold transition-colors"></div>

                    <div className="flex flex-1 flex-col justify-between p-8">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="rounded-full bg-academic-navy px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                              Nivel {module.position}
                            </span>
                            {module.is_locked_by_default && (
                              <span className="rounded-full bg-academic-ivory px-3 py-1 text-[10px] font-black uppercase tracking-widest text-academic-gold border border-academic-gold/10">
                                <Sparkles className="h-3 w-3 mr-1 inline-block" /> Secuencial
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-2xl font-black text-academic-navy tracking-tight group-hover:text-academic-gold transition-colors">{module.title}</CardTitle>
                          <CardText className="text-academic-slate font-medium mt-3 leading-relaxed opacity-80">{module.description || "Un nuevo enigma pedagógico por descubrir."}</CardText>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-academic-gold/5 pt-6">
                        <Link href={`/docente/modulos/${module.id}/actividades` as Route} className="flex-1 sm:flex-none">
                          <Button size="sm" className="h-12 w-full sm:px-8 rounded-xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 bg-academic-navy text-white shadow-lg shadow-academic-navy/20 border-none">
                            <Sparkles className="mr-2 h-4 w-4 text-academic-gold" /> Configurar Juegos
                          </Button>
                        </Link>
                        <Link href={`/docente/modulos/${module.id}/editar` as Route}>
                          <Button size="sm" variant="ghost" className="h-12 rounded-xl px-6 font-black uppercase tracking-widest text-academic-navy/60 hover:bg-academic-ivory hover:text-academic-navy transition-all border border-transparent hover:border-academic-gold/10">
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </Button>
                        </Link>
                        <form action={deleteModuleAction}>
                          <input name="module_id" type="hidden" value={module.id} />
                          <Button size="sm" variant="ghost" className="h-12 rounded-xl px-6 font-black uppercase tracking-widest text-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all" type="submit">
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </Button>
                        </form>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* RIGHT: CREATOR */}
          <aside>
            <div className="sticky top-10">
              <Card className="border border-academic-gold/5 shadow-premium rounded-[3rem] p-10 bg-white relative overflow-hidden">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-academic-gold/5 border-l border-b border-academic-gold/10"></div>
                
                <div className="mb-10 flex items-center gap-4 border-b border-academic-gold/5 pb-8 text-academic-navy relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-navy text-white shadow-lg">
                    <Plus className="h-6 w-6 text-academic-gold" />
                  </div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tight">Expandir Reino</CardTitle>
                </div>

                <form action={createModuleAction} className="space-y-8 relative z-10">
                  <div className="space-y-3">
                    <label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Nombre del Nivel</label>
                    <input 
                      id="title"
                      className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 px-6 text-lg font-black text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm" 
                      name="title" 
                      placeholder="Ej: Los números locos" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label htmlFor="position" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Orden / Posición</label>
                    <input 
                      id="position"
                      className="h-14 w-full rounded-xl border border-academic-gold/10 bg-academic-ivory/30 px-6 text-sm font-bold text-academic-navy focus:border-academic-gold focus:outline-none" 
                      defaultValue={String(modules.length + 1)} 
                      min={1} 
                      name="position" 
                      type="number" 
                    />
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">¿Qué aprenderán hoy?</label>
                    <textarea 
                      id="description"
                      className="min-h-24 w-full resize-none rounded-2xl border border-academic-gold/10 bg-academic-ivory/30 p-5 text-sm font-medium text-academic-slate focus:border-academic-gold focus:bg-white focus:outline-none transition-all" 
                      name="description" 
                      placeholder="Define la misión pedagógica..." 
                    />
                  </div>

                  <div className="space-y-3 p-5 rounded-2xl bg-rose-50/30 border border-rose-100">
                    <div className="flex items-center gap-2 mb-3 text-rose-800">
                      <Video className="h-4 w-4" />
                      <label htmlFor="intro_video_url" className="text-[10px] font-black uppercase tracking-widest">Introducción Motivacional</label>
                    </div>
                    <input 
                      id="intro_video_url"
                      className="h-12 w-full rounded-xl border border-rose-100 bg-white px-4 text-xs font-bold focus:border-rose-300 focus:outline-none" 
                      name="intro_video_url" 
                      placeholder="URL de YouTube" 
                    />
                  </div>

                  <div className="pt-2">
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input name="is_locked_by_default" type="checkbox" className="sr-only peer" id="is_locked_toggle" />
                      <div className="w-12 h-7 bg-academic-ivory border-2 border-academic-gold/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-academic-gold after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-academic-navy peer-checked:border-academic-gold/30"></div>
                      <label htmlFor="is_locked_toggle" className="ml-4 text-[10px] font-black uppercase tracking-widest text-academic-navy cursor-pointer">Bloqueo Inicial</label>
                    </div>
                  </div>

                  <div className="pt-8 mt-4 border-t border-academic-gold/5">
                    <Button className="h-20 w-full rounded-2xl bg-academic-navy text-xl font-black tracking-tight hover:scale-105 active:scale-95 shadow-2xl shadow-academic-navy/30 transition-all text-white border-none">
                      Añadir Nivel
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </aside>
          
        </div>
      </div>
    </RoleLayout>
  );
}
