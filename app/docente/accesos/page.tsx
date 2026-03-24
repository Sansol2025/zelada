import { revalidatePath } from "next/cache";
import { KeyRound, QrCode } from "lucide-react";

import { QRAccessCard } from "@/components/qr-access-card";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { createAccessLinkForStudent } from "@/features/teacher/actions";
import { getTeacherAccessLinks, getTeacherStudents } from "@/features/teacher/queries";
import { teacherNavItems } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildAccessUrl, buildQRCodeDataUrl } from "@/services/access-links";

export default async function TeacherAccessLinksPage() {
  const session = await requireRole(["teacher", "admin"]);
  const teacherId = session.userId as string;

  const [students, links] = await Promise.all([
    getTeacherStudents(teacherId),
    getTeacherAccessLinks(teacherId)
  ]);

  const previewLinks = await Promise.all(
    links.slice(0, 12).map(async (link) => {
      const accessUrl = buildAccessUrl(link.token);
      const qrDataUrl = await buildQRCodeDataUrl(accessUrl);
      return {
        ...link,
        accessUrl,
        qrDataUrl
      };
    })
  );

  async function createQrAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await createAccessLinkForStudent(
      {
        student_id: String(formData.get("student_id") ?? ""),
        type: "qr",
        expires_in_days: Number(formData.get("expires_in_days") ?? 90)
      },
      activeSession.userId as string
    );
    revalidatePath("/docente/accesos");
  }

  async function createMagicLinkAction(formData: FormData) {
    "use server";
    const activeSession = await requireRole(["teacher", "admin"]);
    await createAccessLinkForStudent(
      {
        student_id: String(formData.get("student_id") ?? ""),
        type: "magic_link",
        expires_in_days: Number(formData.get("expires_in_days") ?? 7)
      },
      activeSession.userId as string
    );
    revalidatePath("/docente/accesos");
  }

  async function toggleLinkAction(formData: FormData) {
    "use server";
    await requireRole(["teacher", "admin"]);
    const linkId = String(formData.get("link_id") ?? "");
    const isActive = formData.get("is_active") === "true";
    if (!linkId) return;

    const supabase = await createClient();
    await supabase
      .from("access_links")
      .update({ is_active: !isActive })
      .eq("id", linkId);

    revalidatePath("/docente/accesos");
  }

  return (
    <RoleLayout
      title="Generación de QR y enlaces"
      description="Crea accesos inmediatos para estudiantes sin fricción tecnológica."
      navItems={teacherNavItems}
      currentPath="/docente/accesos"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-brand-900">
            <QrCode className="h-5 w-5" />
            <CardTitle className="text-lg">Generar acceso QR</CardTitle>
          </div>
          <form action={createQrAction} className="space-y-3">
            <select className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm" name="student_id" required>
              <option value="">Seleccionar estudiante</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} - {student.grade} {student.section}
                </option>
              ))}
            </select>
            <input
              className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm"
              defaultValue={90}
              min={1}
              max={365}
              name="expires_in_days"
              type="number"
            />
            <Button className="w-full">Generar QR</Button>
          </form>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-brand-900">
            <KeyRound className="h-5 w-5" />
            <CardTitle className="text-lg">Generar enlace mágico</CardTitle>
          </div>
          <form action={createMagicLinkAction} className="space-y-3">
            <select className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm" name="student_id" required>
              <option value="">Seleccionar estudiante</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} - {student.grade} {student.section}
                </option>
              ))}
            </select>
            <input
              className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm"
              defaultValue={7}
              min={1}
              max={365}
              name="expires_in_days"
              type="number"
            />
            <Button className="w-full" variant="secondary">
              Generar enlace
            </Button>
          </form>
        </Card>
      </div>

      <section className="grid gap-4">
        {previewLinks.map((link) => (
          <div key={link.id} className="space-y-2">
            <QRAccessCard
              studentName={link.student_name}
              accessUrl={link.accessUrl}
              qrDataUrl={link.qrDataUrl}
              expiresAt={link.expires_at}
            />
            <form action={toggleLinkAction}>
              <input name="link_id" type="hidden" value={link.id} />
              <input name="is_active" type="hidden" value={String(link.is_active)} />
              <Button size="sm" variant="ghost">
                {link.is_active ? "Desactivar enlace" : "Reactivar enlace"}
              </Button>
            </form>
          </div>
        ))}
        {!previewLinks.length ? (
          <Card>
            <CardText>No hay accesos generados todavía.</CardText>
          </Card>
        ) : null}
      </section>
    </RoleLayout>
  );
}
