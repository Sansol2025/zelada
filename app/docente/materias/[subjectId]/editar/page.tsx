import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Save, Trash2 } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
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
        color: String(formData.get("color") ?? "#43b8f4"),
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
      title="Editar materia"
      description="Actualiza nombre, descripción e identidad de la materia."
      navItems={teacherNavItems}
      currentPath="/docente/materias"
    >
      <Card className="border-none shadow-card rounded-[2rem] p-8 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-3 border-b border-brand-50 pb-4">
          <CardTitle className="text-2xl font-black text-brand-950">Configuración de Materia</CardTitle>
        </div>
        
        <form action={updateSubjectAction} className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-brand-900 text-left">Nombre de la materia</label>
              <input className="h-14 w-full rounded-2xl border border-brand-200 bg-soft-sky px-5 text-lg font-bold text-brand-900 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none text-left" defaultValue={subject.title} name="title" required />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-brand-900 text-left">Color de identidad</label>
              <input className="h-14 w-full cursor-pointer rounded-2xl border border-brand-200 bg-white px-2 py-1 transition-colors focus:border-brand-500 focus:outline-none" defaultValue={subject.color || "#43b8f4"} name="color" type="color" />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4 transition-colors hover:bg-emerald-100 border border-emerald-100">
              <input defaultChecked={subject.is_active} name="is_active" type="checkbox" className="h-5 w-5 accent-emerald-500" />
              <span className="font-bold text-emerald-900 text-sm">Materia Activa (Visible para alumnos)</span>
            </label>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-brand-900 text-left">Misión o descripción</label>
              <textarea
                className="min-h-32 w-full resize-none rounded-2xl border border-brand-200 bg-soft-sky p-5 text-base text-brand-900 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none text-left leading-relaxed"
                defaultValue={subject.description || ""}
                name="description"
                placeholder="Describe la aventura..."
              />
            </div>
            
            <FileUploader 
              name="icon" 
              accept="image/*" 
              label="Cambiar Icono o Imagen"
              initialUrl={subject.icon || ""}
            />
          </div>

          <div className="md:col-span-2 pt-6 border-t border-brand-50 flex flex-wrap gap-4 justify-between items-center">
            <Button className="h-14 px-10 rounded-2xl bg-brand-600 text-lg font-bold tracking-wide hover:bg-brand-500 shadow-xl shadow-brand-500/30 transition-all hover:-translate-y-1" type="submit">
              <Save className="mr-2 h-6 w-6" />
              Guardar Cambios
            </Button>
            
            <form action={deleteSubjectAction}>
              <Button className="h-12 px-6 rounded-xl font-bold text-rose-600 hover:bg-rose-50 border-none bg-transparent" type="submit">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Materia
              </Button>
            </form>
          </div>
        </form>
      </Card>
    </RoleLayout>
  );
}
