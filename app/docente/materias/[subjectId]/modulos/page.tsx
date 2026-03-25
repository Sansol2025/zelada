import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { Layers, Pencil, Plus, Sparkles, Trash2, Map, LayoutGrid } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { createModule, deleteModuleForTeacher } from "@/features/teacher/actions";
import { getTeacherModulesBySubject, getTeacherSubjectById } from "@/features/teacher/queries";
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
      <div className="flex flex-col gap-6">

        {/* HEADER MAGICO */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-400 p-8 text-white shadow-xl sm:p-12">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2 text-emerald-100 font-bold uppercase tracking-wider text-sm">
                <Map className="h-4 w-4" /> Mapa de Ruta
              </div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                Módulos de {subject.title}
              </h1>
              <p className="mt-4 text-lg font-medium text-emerald-50">
                Organiza el recorrido paso a paso. Agrega módulos como &quot;Niveles&quot; que tus estudiantes deberán superar.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,350px]">
          
          {/* COLUMNA IZQUIERDA: LISTA DE MÓDULOS */}
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-brand-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="h-6 w-6 text-brand-500" />
              Niveles Creados
            </h2>

            {!modules.length ? (
              <div className="rounded-[2rem] border-2 border-dashed border-brand-200 bg-brand-50 p-12 text-center h-[300px] flex flex-col items-center justify-center">
                <Layers className="h-12 w-12 text-brand-300 mb-4" />
                <h3 className="font-display text-xl font-bold text-brand-900">Aún no hay niveles</h3>
                <p className="mt-2 text-brand-700 font-medium">Crea tu primer módulo interactivo desde el panel derecho.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {modules.map((module) => (
                  <Card key={module.id} className="group overflow-hidden border-none shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-[2rem] p-0 flex flex-col sm:flex-row bg-white relative">
                    {/* Borde izquierdo de color para simular secuencia */}
                    <div className="w-4 sm:w-6 shrink-0 bg-emerald-400"></div>

                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-800">
                              Nivel {module.position}
                            </span>
                            {module.is_locked_by_default && (
                              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-800">
                                ⭐ Desbloqueable
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-2xl font-black text-brand-950 mt-2">{module.title}</CardTitle>
                          <CardText className="text-slate-600 font-medium mt-1">{module.description || "Nivel mágico sin descripción. ¡Descúbrelo jugando!"}</CardText>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                        <Link href={`/docente/modulos/${module.id}/actividades`} className="flex-1 sm:flex-none">
                          <Button size="sm" className="h-10 w-full sm:w-auto rounded-xl px-4 font-bold transition-transform hover:-translate-y-0.5 bg-brand-600 hover:bg-brand-500">
                            <Sparkles className="mr-2 h-4 w-4" /> Configurar Juegos
                          </Button>
                        </Link>
                        <Link href={`/docente/modulos/${module.id}/editar`}>
                          <Button size="sm" variant="secondary" className="h-10 rounded-xl px-4 font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </Button>
                        </Link>
                        <form action={deleteModuleAction}>
                          <input name="module_id" type="hidden" value={module.id} />
                          <Button size="sm" variant="ghost" className="h-10 rounded-xl font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-700">
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

          {/* COLUMNA DERECHA: CREADOR */}
          <div>
            <div className="sticky top-6">
              <Card className="border-none shadow-card rounded-[2rem] p-6 lg:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-brand-50 pb-4 text-brand-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <Plus className="h-5 w-5 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl font-bold">Crear Módulo</CardTitle>
                </div>

                <form action={createModuleAction} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-brand-900">Nombre del nivel</label>
                    <input className="h-14 w-full rounded-2xl border border-brand-200 bg-soft-sky px-5 text-lg font-bold text-brand-900 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none" name="title" placeholder="Ej: Los números locos" required />
                  </div>
                  
                  <div>
                    <label className="mb-2 block text-sm font-bold text-brand-900">Orden / Posición</label>
                    <input className="h-12 w-full rounded-xl border border-brand-200 bg-white px-4 text-sm focus:border-brand-500 focus:outline-none" defaultValue={String(modules.length + 1)} min={1} name="position" type="number" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-brand-900">¿Qué aprenderán aquí?</label>
                    <textarea className="min-h-24 w-full resize-none rounded-2xl border border-brand-200 bg-soft-sky p-5 text-sm text-brand-900 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none" name="description" placeholder="Aprenderán a reconocer los números del 1 al 5." />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-rose-600">Video Introductorio de Youtube (Inicio del nivel)</label>
                    <input className="h-12 w-full rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm focus:border-rose-500 focus:bg-white focus:outline-none" name="intro_video_url" placeholder="Ej: https://youtube.com/watch?v=..." />
                    <p className="mt-2 text-xs text-brand-600 font-medium">Este video se mostrará a pantalla completa antes de que el alumno empiece las actividades.</p>
                  </div>

                  <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 transition-colors hover:bg-amber-100 border border-amber-100">
                    <input name="is_locked_by_default" type="checkbox" className="h-4 w-4 accent-amber-500" />
                    <span className="font-bold text-amber-900 text-sm">Bloquear inicialmente (El alumno debe ganar el nivel anterior)</span>
                  </label>

                  <div className="pt-4 mt-2 border-t border-brand-100">
                    <Button className="h-14 w-full rounded-2xl bg-emerald-500 text-lg font-bold tracking-wide hover:bg-emerald-400 shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-1 text-white border-none">
                      Añadir Nivel
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
          
        </div>
      </div>
    </RoleLayout>
  );
}
