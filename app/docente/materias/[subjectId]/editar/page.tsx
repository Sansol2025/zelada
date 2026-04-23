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
        <div className="relative overflow-hidden rounded-[3rem] bg-academic-navy p-10 text-white shadow-2xl md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-academic-gold/20 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-academic-gold font-black uppercase tracking-[0.2em] text-xs">
              <BookOpen className="h-4 w-4" /> Restauración Pedagógica
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl leading-[1.1]">
              Editar Materia
            </h1>
            <p className="mt-6 text-xl font-medium text-white/70 max-w-prose leading-relaxed">
              Estás modificando <span className="text-academic-gold font-black">&quot;{subject.title}&quot;</span>. Ajusta la identidad visual y los objetivos del reino.
            </p>
          </div>
        </div>

        <Card className="border border-academic-gold/5 shadow-premium rounded-[3rem] p-10 bg-white">
          <div className="mb-10 flex items-center gap-4 border-b border-academic-gold/5 pb-8 text-academic-navy">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-ivory text-academic-gold shadow-sm border border-academic-gold/10">
              <Layout className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Datos del Reino</CardTitle>
              <CardText className="text-sm font-medium text-academic-slate italic opacity-60">Configura la esencia de tu materia.</CardText>
            </div>
          </div>
          
          <form action={updateSubjectAction} className="grid md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Nombre de la Materia</label>
                <input 
                  id="title"
                  className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 px-6 text-lg font-black text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm" 
                  defaultValue={subject.title} 
                  name="title" 
                  required 
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="color" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Color de Identidad</label>
                <div className="flex items-center gap-4">
                  <input 
                    id="color"
                    className="h-14 w-32 cursor-pointer rounded-xl border border-academic-gold/10 bg-white p-1 transition-all focus:ring-4 focus:ring-academic-gold/10" 
                    defaultValue={subject.color || "#C6A24E"} 
                    name="color" 
                    type="color" 
                  />
                  <span className="text-xs font-bold text-academic-navy/40 italic">Usa colores que faciliten la distinción visual</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked={subject.is_active} name="is_active" type="checkbox" className="sr-only peer" id="is_active_toggle" />
                  <div className="w-14 h-8 bg-academic-ivory border-2 border-academic-gold/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-academic-gold after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-academic-navy peer-checked:border-academic-gold/30"></div>
                  <label htmlFor="is_active_toggle" className="ml-4 text-xs font-black uppercase tracking-widest text-academic-navy cursor-pointer">Materia Visible para Alumnos</label>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Misión o Descripción</label>
                <textarea
                  id="description"
                  className="min-h-32 w-full resize-none rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 p-6 text-base font-medium text-academic-slate focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm leading-relaxed"
                  defaultValue={subject.description || ""}
                  name="description"
                  placeholder="Describe la aventura..."
                />
              </div>
              
              <div className="space-y-3">
                <FileUploader 
                  name="icon" 
                  accept="image/*" 
                  label="Cambiar Icono o Ilustración"
                  initialUrl={subject.icon || ""}
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-10 border-t border-academic-gold/5 flex flex-wrap gap-6 justify-between items-center">
              <Button className="h-20 px-16 rounded-[2rem] bg-academic-navy text-xl font-black tracking-tight hover:scale-105 active:scale-95 shadow-2xl shadow-academic-navy/30 transition-all text-white border-none" type="submit">
                <Save className="mr-4 h-8 w-8 text-academic-gold" />
                Guardar Reformas
                <Sparkles className="ml-2 h-5 w-5 text-academic-gold" />
              </Button>
              
              <form action={deleteSubjectAction}>
                <Button className="h-14 px-8 rounded-xl font-black text-rose-600/40 hover:bg-rose-50 hover:text-rose-600 border border-rose-100/50 bg-white transition-all text-[10px] uppercase tracking-widest" type="submit">
                  <Trash2 className="mr-3 h-5 w-5" />
                  Borrar Permanentemente
                </Button>
              </form>
            </div>
          </form>
        </Card>
      </div>
    </RoleLayout>
  );
}
