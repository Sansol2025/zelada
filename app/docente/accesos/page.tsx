import { revalidatePath } from "next/cache";
import { KeyRound, QrCode, Wand2 } from "lucide-react";

import { QRAccessCard } from "@/components/qr-access-card";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
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

  // We keep magic links individually. QRs will be by grade.
  const magicLinks = links.filter(l => l.type === "magic_link");

  const previewLinks = await Promise.all(
    magicLinks.slice(0, 12).map(async (link) => {
      const accessUrl = buildAccessUrl(link.token);
      return {
        ...link,
        accessUrl,
        qrDataUrl: "" // Not used for magic links visually anymore if only grades have QR
      };
    })
  );

  // Generate Grade QRs dynamically
  const uniqueGrades = Array.from(new Set(students.map(s => s.grade).filter(Boolean))) as string[];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const gradeQRs = await Promise.all(
    uniqueGrades.map(async (grade) => {
      const accessUrl = `${baseUrl.replace(/\/$/, "")}/ingreso/alumnos?grado=${encodeURIComponent(grade)}`;
      const qrDataUrl = await buildQRCodeDataUrl(accessUrl);
      return { grade, accessUrl, qrDataUrl };
    })
  );

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
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente/accesos"
    >
      <div className="flex flex-col gap-6">

        {/* HEADER MAGICO */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-500 p-8 text-white shadow-xl sm:p-12">
          {/* PURPLE BAN OVERRIDE: Using brand-600 and cyan-400 instead */}
        </div>
        
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 to-cyan-400 p-8 text-white shadow-xl sm:p-12 lg:col-span-2">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-cyan-100 font-bold uppercase tracking-wider text-sm">
              <KeyRound className="h-4 w-4" /> Entradas directas
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Llaves Mágicas (QR)
            </h1>
            <p className="mt-4 text-lg font-medium text-cyan-50">
              Genera Códigos QR o enlaces para que tus alumnos entren a la plataforma con un solo click. Sin usar teclado.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          
          <Card className="border-none shadow-card rounded-[2rem] p-6 lg:p-8 bg-white relative overflow-hidden flex flex-col justify-center">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-amber-50 opacity-50 border-l border-b border-amber-100"></div>
            <div className="mb-6 flex items-center gap-3 border-b border-brand-50 pb-4 text-brand-900 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                <QrCode className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-bold">QRs Automáticos por Grado</CardTitle>
            </div>
            <p className="text-brand-700 relative z-10 font-medium">
              El sistema generó automáticamente un QR general para cada grado de tus alumnos. Ya no necesitas crear uno por uno.
              Los chicos escanearán el QR de su grado y solo ingresarán su nombre y DNI.
            </p>
          </Card>

          <Card className="border-none shadow-card rounded-[2rem] p-6 lg:p-8 bg-white relative overflow-hidden">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-cyan-50 opacity-50 border-l border-b border-cyan-100"></div>
            <div className="mb-6 flex items-center gap-3 border-b border-brand-50 pb-4 text-brand-900 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100">
                <Wand2 className="h-6 w-6 text-cyan-600" />
              </div>
              <CardTitle className="text-xl font-bold">Generar Enlace Directo</CardTitle>
            </div>
            <form action={createMagicLinkAction} className="space-y-4 relative z-10">
              <div>
                <label className="mb-2 block text-sm font-bold text-brand-900">¿Para quién es el enlace?</label>
                <select className="h-14 w-full rounded-2xl border border-brand-200 bg-soft-sky px-4 font-semibold text-brand-900 focus:border-cyan-500 focus:bg-white focus:outline-none transition-colors" name="student_id" required>
                  <option value="">Selecciona un estudiante</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} - {student.grade} {student.section}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-brand-900">Validez del enlace (días)</label>
                <div className="flex items-center gap-3">
                  <input
                    className="h-14 w-full rounded-2xl border border-brand-200 bg-white px-5 text-lg font-bold text-brand-900 focus:border-cyan-500 focus:outline-none"
                    defaultValue={7} min={1} max={365} name="expires_in_days" type="number"
                  />
                  <span className="font-bold text-brand-500">días</span>
                </div>
              </div>
              <Button type="submit" variant="secondary" className="h-14 w-full rounded-2xl text-lg font-bold tracking-wide transition-all hover:-translate-y-1 mt-2 border-none">
                <KeyRound className="mr-2 h-5 w-5" /> Crear Enlace
              </Button>
            </form>
          </Card>
        </div>

        <section className="mt-4">
          <h2 className="font-display text-2xl font-bold text-brand-900 mb-6 flex items-center gap-2">
            <QrCode className="h-6 w-6 text-brand-500" />
            Códigos QR por Grado
          </h2>
          
          {!gradeQRs.length ? (
            <div className="rounded-[2rem] border-2 border-dashed border-brand-200 bg-brand-50 p-12 text-center flex flex-col items-center justify-center">
              <QrCode className="h-12 w-12 text-brand-300 mb-4" />
              <h3 className="font-display text-xl font-bold text-brand-900">No hay grados</h3>
              <p className="mt-2 text-brand-700 font-medium">Asigna alumnos con su grado primero.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {gradeQRs.map((g) => (
                <div key={g.grade} className="group relative transition-all duration-300 hover:-translate-y-1">
                  <QRAccessCard
                    studentName={`Ingreso de Grado: ${g.grade}`}
                    accessUrl={g.accessUrl}
                    qrDataUrl={g.qrDataUrl}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-4 border-t border-brand-100 pt-8 mt-8">
          <h2 className="font-display text-2xl font-bold text-brand-900 mb-6 flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-brand-500" />
            Enlaces Mágicos Activos (Individuales)
          </h2>
          
          {!previewLinks.length ? (
            <div className="rounded-[2rem] border-2 border-dashed border-brand-200 bg-brand-50 p-12 text-center flex flex-col items-center justify-center">
              <KeyRound className="h-12 w-12 text-brand-300 mb-4" />
              <h3 className="font-display text-xl font-bold text-brand-900">Sin enlaces mágicos</h3>
              <p className="mt-2 text-brand-700 font-medium">Usa los paneles de arriba para crear uno individual.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {previewLinks.map((link) => (
                <div key={link.id} className="group relative transition-all duration-300">
                  <Card className="flex flex-col rounded-2xl border border-brand-100 p-4">
                    <div className="font-bold text-brand-900">{link.student_name}</div>
                    <div className="text-xs text-brand-600 truncate my-2 p-2 bg-brand-50 rounded">
                      {link.accessUrl}
                    </div>
                    <div className="flex gap-2 justify-between items-center mt-2">
                      <form action={toggleLinkAction} className="">
                        <input name="link_id" type="hidden" value={link.id} />
                        <input name="is_active" type="hidden" value={String(link.is_active)} />
                        <Button 
                          size="sm" 
                          variant={link.is_active ? "ghost" : "primary"} 
                          className={`rounded-full shadow bg-white border h-8 px-3 text-xs font-bold ${link.is_active ? "border-rose-200 text-rose-700" : ""}`}
                        >
                          {link.is_active ? "Desactivar" : "Reactivar"}
                        </Button>
                      </form>
                      {link.expires_at ? <span className="text-xs text-brand-500 border border-brand-100 px-2 py-1 rounded-full">Expira: {new Date(link.expires_at).toLocaleDateString()}</span> : null}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </RoleLayout>
  );
}
