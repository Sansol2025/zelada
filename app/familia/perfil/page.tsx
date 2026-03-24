import { revalidatePath } from "next/cache";
import { Save, UserRound } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { getCurrentSession, requireRole } from "@/features/auth/session";
import { familyNavItems } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function FamilyProfilePage() {
  await requireRole(["family"]);
  const session = await getCurrentSession();

  async function updateProfileAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["family"]);
    const supabase = await createClient();
    await supabase
      .from("profiles")
      .update({
        full_name: String(formData.get("full_name") ?? ""),
        avatar_url: String(formData.get("avatar_url") ?? "") || null
      })
      .eq("id", activeSession.userId as string);
    revalidatePath("/familia/perfil");
  }

  return (
    <RoleLayout
      title="Perfil familiar"
      description="Actualiza tus datos para recibir seguimiento y comunicaciones."
      navItems={familyNavItems}
      currentPath="/familia/perfil"
    >
      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-brand-900">
          <UserRound className="h-5 w-5" />
          <CardTitle className="text-lg">Datos de perfil</CardTitle>
        </div>
        <CardText>Rol actual: {session.role}</CardText>
        <form action={updateProfileAction} className="grid gap-3 md:grid-cols-2">
          <input
            className="h-11 rounded-xl border border-brand-200 px-4 text-sm"
            defaultValue={session.fullName || ""}
            name="full_name"
            placeholder="Nombre completo"
          />
          <input
            className="h-11 rounded-xl border border-brand-200 px-4 text-sm"
            name="avatar_url"
            placeholder="URL de avatar (opcional)"
          />
          <div className="md:col-span-2">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>
    </RoleLayout>
  );
}
