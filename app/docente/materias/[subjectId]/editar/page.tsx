import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Save, Trash2, BookOpen, Sparkles, Layout } from "lucide-react";


import { RoleLayout } from "@/components/layout/role-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardText } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { deleteSubject, updateSubject } from "@/features/teacher/actions";
import { getTeacherSubjectById } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";

type EditSubjectPageProps = {
  params: Promise<{ subjectId: string }>;
};

export default async function EditSubjectPage({ params }: EditSubjectPageProps) {
  const session = await requireRole(["teacher", "admin"]);
  const { subjectId } = await params;
  const subject = await getTeacherSubjectById(subjectId, session.userId as string).catch(() => null);

  if (!subject) notFound();

  async function updateSubjectAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await updateSubject(
      subjectId,
      {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        color: String(formData.get("color") ?? "#C6A24E"),
        icon: String(formData.get("icon") ?? ""),
        is_active: formData.get("is_active") === "on"
      },
      activeSession.userId as string
    );
    revalidatePath("/docente/materias");
    revalidatePath(`/docente/materias/${subjectId}/editar`);
  }

  async function deleteSubjectAction() {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await deleteSubject(subjectId, activeSession.userId as string);
    revalidatePath("/docente/materias");
    redirect("/docente/materias");
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
              <BookOpen className="h-3.5 w-3.5" /> Restauración Pedagógica
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl leading-tight">
              Editar Materia
            </h1>
            <p className="mt-2 text-xs font-medium text-white/70 max-w-prose leading-relaxed">
              Estás modificando <span className="text-academic-gold font-bold">&quot;{subject.title}&quot;</span>. Ajusta la identidad visual y los objetivos del reino.
            </p>
          </div>
        </div>

        <Card className="border border-academic-gold/5 shadow-sm rounded-xl p-4 bg-white">
          <div className="mb-4 flex items-center gap-3 border-b border-academic-gold/5 pb-4 text-academic-navy">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-academic-ivory text-academic-gold shadow-sm border border-academic-gold/10">
              <Layout className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold uppercase tracking-tight">Datos del Reino</CardTitle>
              <CardText className="text-[10px] font-medium text-academic-slate italic opacity-60">Configura la esencia de tu materia.</CardText>
            </div>
          </div>
          
          <form action={updateSubjectAction} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-academic-gold ml-2">Nombre de la Materia</label>
                <input 
                  id="title"
                  className="h-10 w-full rounded-lg border border-academic-gold/10 bg-academic-ivory/50 px-4 text-sm font-bold text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm" 
                  defaultValue={subject.title} 
                  name="title" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="color" className="text-[10px] font-bold uppercase tracking-widest text-academic-gold ml-2">Color de Identidad</label>
                <div className="flex items-center gap-4">
                  <input 
                    id="color"
                    className="h-10 w-24 cursor-pointer rounded-lg border border-academic-gold/10 bg-white p-1 transition-all focus:ring-4 focus:ring-academic-gold/10" 
                    defaultValue={subject.color || "#C6A24E"} 
                    name="color" 
                    type="color" 
                  />
                  <span className="text-[10px] font-bold text-academic-navy/40 italic">Usa colores que faciliten la distinción visual</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked={subject.is_active} name="is_active" type="checkbox" className="sr-only peer" id="is_active_toggle" />
                  <div className="w-10 h-6 bg-academic-ivory border-2 border-academic-gold/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-academic-gold after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-academic-navy peer-checked:border-academic-gold/30"></div>
                  <label htmlFor="is_active_toggle" className="ml-3 text-[10px] font-bold uppercase tracking-widest text-academic-navy cursor-pointer">Materia Visible para Alumnos</label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-academic-gold ml-2">Misión o Descripción</label>
                <textarea
                  id="description"
                  className="min-h-24 w-full resize-none rounded-lg border border-academic-gold/10 bg-academic-ivory/50 p-4 text-sm font-medium text-academic-slate focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm leading-relaxed"
                  defaultValue={subject.description || ""}
                  name="description"
                  placeholder="Describe la aventura..."
                />
              </div>
              
              <div className="space-y-2">
                <FileUploader 
                  name="icon" 
                  accept="image/*" 
                  label="Icono o Ilustración"
                  initialUrl={subject.icon || ""}
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-6 border-t border-academic-gold/5 flex flex-wrap gap-4 justify-between items-center">
              <Button className="h-10 px-8 rounded-lg bg-academic-navy text-sm font-bold tracking-tight hover:-translate-y-0.5 shadow-md transition-all text-white border-none" type="submit">
                <Save className="mr-2 h-4 w-4 text-academic-gold" />
                Guardar Reformas
                <Sparkles className="ml-2 h-4 w-4 text-academic-gold" />
              </Button>
              
              <form action={deleteSubjectAction}>
                <Button className="h-10 px-6 rounded-lg font-bold text-rose-600/40 hover:bg-rose-50 hover:text-rose-600 border border-rose-100/50 bg-white transition-all text-[10px] uppercase tracking-widest" type="submit">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Borrar Materia
                </Button>
              </form>
            </div>
          </form>
        </Card>
      </div>
    </RoleLayout>
  );
}
