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
      <div className="flex flex-col gap-4 animate-in">

        <PageHeader
          icon={<Map className="h-4 w-4" />}
          subtitle="Mapa de Ruta Pedagógica"
          title={<>Módulos de <span className="text-academic-gold italic">{subject.title}</span></>}
          description="Organiza la aventura paso a paso. Agrega módulos como 'Niveles' secuenciales que tus estudiantes deberán conquistar para progresar."
        />

        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          
          {/* LEFT: MODULES LIST */}
          <section className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-lg font-bold text-academic-navy tracking-tight uppercase flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-academic-gold" />
                Niveles en curso
              </h2>
              <span className="rounded-full bg-academic-gold/10 px-3 py-0.5 text-[9px] font-bold text-academic-navy uppercase tracking-wider border border-academic-gold/10">
                {modules.length} Capítulos
              </span>
            </div>

            {!modules.length ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center flex flex-col items-center justify-center">
                <Layers className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="font-display text-xl font-bold text-slate-400 uppercase tracking-tight">Sin niveles asignados</h3>
                <p className="mt-2 text-slate-500 font-medium text-sm italic">Empieza a construir el recorrido desde el panel de creación.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {modules.map((module) => (
                  <Card key={module.id} className="group overflow-hidden border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md rounded-xl p-0 flex flex-col sm:flex-row bg-white relative">
                    {/* Visual sequence marker */}
                    <div className="w-3 sm:w-4 shrink-0 bg-slate-100 group-hover:bg-academic-gold transition-colors"></div>

                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="rounded-full bg-academic-navy px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
                              Nivel {module.position}
                            </span>
                            {module.is_locked_by_default && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-academic-gold border border-slate-200">
                                <Sparkles className="h-2.5 w-2.5 mr-1 inline-block" /> Secuencial
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-xl font-bold text-academic-navy tracking-tight group-hover:text-academic-gold transition-colors">{module.title}</CardTitle>
                          <CardText className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">{module.description || "Un nuevo enigma pedagógico por descubrir."}</CardText>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                        <Link href={`/docente/modulos/${module.id}/actividades` as Route} className="flex-1 sm:flex-none">
                          <Button size="sm" className="h-10 w-full sm:px-6 rounded-lg font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 bg-academic-navy text-white shadow-md border-none text-[11px]">
                            <Sparkles className="mr-2 h-3.5 w-3.5 text-academic-gold" /> Configurar Juegos
                          </Button>
                        </Link>
                        <Link href={`/docente/modulos/${module.id}/editar` as Route}>
                          <Button size="sm" variant="ghost" className="h-10 rounded-lg px-4 font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-50 hover:text-academic-navy transition-all border border-transparent hover:border-slate-200 text-[11px]">
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
                          </Button>
                        </Link>
                        <form action={deleteModuleAction}>
                          <input name="module_id" type="hidden" value={module.id} />
                          <Button size="sm" variant="ghost" className="h-10 rounded-lg px-4 font-bold uppercase tracking-wider text-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all text-[11px]" type="submit">
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar
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
              <Card className="border border-slate-200 shadow-sm rounded-2xl p-6 bg-white relative overflow-hidden">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-slate-50 border-l border-b border-slate-100"></div>
                
                <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 text-academic-navy relative z-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-academic-navy text-white shadow-md">
                    <Plus className="h-5 w-5 text-academic-gold" />
                  </div>
                  <CardTitle className="text-lg font-bold uppercase tracking-tight">Expandir Reino</CardTitle>
                </div>

                <form action={createModuleAction} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Nombre del Nivel</label>
                    <input 
                      id="title"
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm" 
                      name="title" 
                      placeholder="Ej: Los números locos" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="position" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Orden / Posición</label>
                    <input 
                      id="position"
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:outline-none" 
                      defaultValue={String(modules.length + 1)} 
                      min={1} 
                      name="position" 
                      type="number" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">¿Qué aprenderán hoy?</label>
                    <textarea 
                      id="description"
                      className="min-h-20 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600 focus:border-academic-navy focus:bg-white focus:outline-none transition-all" 
                      name="description" 
                      placeholder="Define la misión pedagógica..." 
                    />
                  </div>

                  <div className="space-y-2 p-4 rounded-lg bg-rose-50/50 border border-rose-100">
                    <div className="flex items-center gap-2 mb-2 text-rose-800">
                      <Video className="h-3.5 w-3.5" />
                      <label htmlFor="intro_video_url" className="text-[9px] font-bold uppercase tracking-wider">Introducción Motivacional</label>
                    </div>
                    <input 
                      id="intro_video_url"
                      className="h-9 w-full rounded-md border border-rose-100 bg-white px-3 text-[11px] font-semibold focus:border-rose-300 focus:outline-none" 
                      name="intro_video_url" 
                      placeholder="URL de YouTube" 
                    />
                  </div>

                  <div className="pt-2">
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input name="is_locked_by_default" type="checkbox" className="sr-only peer" id="is_locked_toggle" />
                      <div className="w-12 h-7 bg-academic-ivory border-2 border-academic-gold/20 group-hover:border-academic-gold/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-academic-gold after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-academic-navy peer-checked:border-academic-gold/30 shadow-inner"></div>
                      <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-academic-navy">Bloqueo Inicial</span>
                    </label>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-100">
                    <Button className="h-12 w-full rounded-xl bg-academic-navy text-base font-bold tracking-tight hover:-translate-y-0.5 shadow-md transition-all text-white border-none">
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
