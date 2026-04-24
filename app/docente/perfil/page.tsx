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
      <div className="flex flex-col gap-8 animate-in">
        
        <PageHeader
          icon={<UserRound className="h-4 w-4" />}
          subtitle="Centro de Identidad"
          title="Mi Perfil Docente"
          description="Administra tu información institucional y personaliza tu presencia en la plataforma."
        />

        <Card className="border border-academic-gold/5 shadow-premium rounded-[3rem] p-10 bg-white">
          <div className="mb-10 flex items-center gap-4 border-b border-academic-gold/5 pb-8 text-academic-navy">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-ivory text-academic-gold shadow-sm border border-academic-gold/10">
              <Layout className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Datos Institucionales</CardTitle>
              <CardText className="text-sm font-bold text-academic-gold uppercase tracking-[0.1em] mt-1">
                Rol: {current.role === 'teacher' ? 'Docente' : current.role === 'admin' ? 'Administrador' : current.role}
              </CardText>
            </div>
          </div>

          <form action={updateProfileAction} className="grid gap-10 md:grid-cols-2">
            <div className="space-y-3">
              <label htmlFor="full_name" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Nombre Completo</label>
              <input
                id="full_name"
                className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 px-6 text-lg font-black text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm"
                defaultValue={current.fullName || ""}
                name="full_name"
                placeholder="Ej: Profe Juan Pérez"
              />
            </div>
            <div className="space-y-3">
              <label htmlFor="avatar_url" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Imagen de Perfil (URL)</label>
              <input
                id="avatar_url"
                className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 px-6 text-lg font-black text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm"
                name="avatar_url"
                placeholder="https://..."
              />
            </div>
            
            <div className="md:col-span-2 pt-6">
              <Button className="h-20 w-full md:w-auto rounded-[2rem] bg-academic-navy px-16 text-xl font-black tracking-tight hover:scale-105 active:scale-95 shadow-2xl shadow-academic-navy/30 transition-all text-white border-none">
                <Save className="mr-4 h-8 w-8 text-academic-gold" />
                Actualizar Identidad
                <Sparkles className="ml-2 h-5 w-5 text-academic-gold" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </RoleLayout>
  );
}
