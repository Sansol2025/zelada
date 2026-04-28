import { revalidatePath } from "next/cache";
import { Save, UserRound, Sparkles, Layout } from "lucide-react";


import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { getCurrentSession, requireRole } from "@/features/auth/session";
import { PageHeader } from "@/components/page-header";
import { teacherNavItems } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherProfilePage() {
  const current = await getCurrentSession();

  async function updateProfileAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    const supabase = await createClient();
    await supabase
      .from("profiles")
      .update({
        full_name: String(formData.get("full_name") ?? ""),
        avatar_url: String(formData.get("avatar_url") ?? "") || null
      })
      .eq("id", activeSession.userId as string);

    revalidatePath("/docente/perfil");
  }

  return (
    <RoleLayout
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente/perfil"
    >
    >
      <div className="flex flex-col gap-4 animate-in">
        
        <PageHeader
          icon={<UserRound className="h-4 w-4" />}
          subtitle="Centro de Identidad"
          title="Mi Perfil Docente"
          description="Administra tu información institucional y personaliza tu presencia en la plataforma."
        />

        <Card className="border border-slate-200 shadow-sm rounded-xl p-6 bg-white">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 text-academic-navy">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-academic-gold shadow-sm border border-slate-100">
              <Layout className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold uppercase tracking-tight">Datos Institucionales</CardTitle>
              <CardText className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Rol: {current.role === 'teacher' ? 'Docente' : current.role === 'admin' ? 'Administrador' : current.role}
              </CardText>
            </div>
          </div>

          <form action={updateProfileAction} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="full_name" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Nombre Completo</label>
              <input
                id="full_name"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm"
                defaultValue={current.fullName || ""}
                name="full_name"
                placeholder="Ej: Profe Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="avatar_url" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Imagen de Perfil (URL)</label>
              <input
                id="avatar_url"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:bg-white focus:outline-none transition-all shadow-sm"
                name="avatar_url"
                placeholder="https://..."
              />
            </div>
            
            <div className="md:col-span-2 pt-4">
              <Button className="h-12 w-full md:w-auto rounded-xl bg-academic-navy px-10 text-base font-bold tracking-tight hover:-translate-y-0.5 shadow-md transition-all text-white border-none">
                <Save className="mr-3 h-5 w-5 text-academic-gold" />
                Actualizar Identidad
                <Sparkles className="ml-2 h-4 w-4 text-academic-gold" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </RoleLayout>
  );
}
