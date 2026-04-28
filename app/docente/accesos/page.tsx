import { revalidatePath } from "next/cache";
import { KeyRound, QrCode, Wand2, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import { QRAccessCard } from "@/components/qr-access-card";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { requireRole } from "@/features/auth/session";
import { createAccessLinkForStudent } from "@/features/teacher/actions";
import { getTeacherAccessLinks, getTeacherStudents } from "@/features/teacher/queries";
import { PageHeader } from "@/components/page-header";
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

  const magicLinks = links.filter(l => l.type === "magic_link");

  const previewLinks = await Promise.all(
    magicLinks.slice(0, 12).map(async (link) => {
      const accessUrl = buildAccessUrl(link.token);
      return {
        ...link,
        accessUrl,
        qrDataUrl: "" 
      };
    })
  );

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
      <div className="flex flex-col gap-4 animate-in">

        <PageHeader
          icon={<KeyRound className="h-4 w-4" />}
          subtitle="Seguridad y Accesibilidad"
          title="Llaves Mágicas (QR)"
          description="Elimina las barreras de entrada. Genera Códigos QR de acceso directo para que tus alumnos ingresen a su aventura sin necesidad de contraseñas complejas."
        />

        <div className="grid gap-4 md:grid-cols-2">
          
          <Card className="border border-slate-200 shadow-sm rounded-xl p-6 bg-white relative overflow-hidden flex flex-col justify-center min-h-[200px]">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-slate-50 border-l border-b border-slate-100"></div>
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3 text-academic-navy relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-academic-gold shadow-sm border border-slate-100">
                <QrCode className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold tracking-tight">QRs por Grado</CardTitle>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed mb-4 relative z-10 text-sm">
              Optimiza el tiempo en el aula. Hemos generado un <span className="font-bold text-academic-navy uppercase tracking-tight">QR General</span> por cada nivel.
            </p>
            <div className="relative z-10 mt-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 border border-slate-100">
                <Sparkles className="h-2.5 w-2.5" /> Generación Automática
              </span>
            </div>
          </Card>

          <Card className="border border-slate-200 shadow-sm rounded-xl p-6 bg-slate-50 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-slate-100 border-l border-b border-slate-200"></div>
            <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-3 text-academic-navy relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-academic-navy text-white shadow-md">
                <Wand2 className="h-5 w-5 text-academic-gold" />
              </div>
              <CardTitle className="text-lg font-bold tracking-tight">Generar Enlace Directo</CardTitle>
            </div>
            <form action={createMagicLinkAction} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label htmlFor="student_id" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">¿Para quién es el enlace?</label>
                <select 
                  id="student_id"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-academic-navy focus:border-academic-navy focus:outline-none transition-all shadow-sm" 
                  name="student_id" 
                  required
                >
                  <option value="">Selecciona un alumno</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} • {student.grade}{student.section}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="expires_in_days" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Validez del Enlace (días)</label>
                <input
                  id="expires_in_days"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-academic-navy focus:border-academic-navy focus:outline-none transition-all shadow-sm"
                  defaultValue={7} min={1} max={365} name="expires_in_days" type="number"
                />
              </div>
              <Button type="submit" className="h-10 w-full rounded-xl bg-academic-navy text-sm font-bold tracking-tight transition-all hover:-translate-y-0.5 shadow-md border-none text-white mt-2">
                <KeyRound className="mr-2 h-4 w-4 text-academic-gold" /> Crear Nueva Llave
              </Button>
            </form>
          </Card>
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold tracking-tight text-academic-navy uppercase">Códigos QR por Grado</h2>
            <div className="h-px flex-1 mx-6 bg-slate-100 hidden md:block"></div>
          </div>
          
          {!gradeQRs.length ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <EmptyState
                title="No se detectaron grados"
                description="Asegúrate de que tus alumnos tengan un grado y sección asignados para generar sus llaves de acceso."
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gradeQRs.map((g) => (
                <div key={g.grade} className="group relative transition-all duration-200 hover:-translate-y-1">
                  <QRAccessCard
                    studentName={`Grado: ${g.grade}`}
                    accessUrl={g.accessUrl}
                    qrDataUrl={g.qrDataUrl}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 border-t border-slate-100 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold tracking-tight text-academic-navy uppercase">Llaves Individuales Activas</h2>
            <div className="h-px flex-1 mx-6 bg-slate-100 hidden md:block"></div>
          </div>
          
          {!previewLinks.length ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <EmptyState
                title="Sin llaves activas"
                description="Los accesos individuales que generes aparecerán aquí para su gestión y reenvío."
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {previewLinks.map((link) => (
                <Card key={link.id} className="flex flex-col border border-slate-200 bg-white shadow-sm rounded-xl p-6 transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-lg text-academic-navy tracking-tight">{link.student_name}</span>
                    {link.expires_at && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 border border-slate-100 px-2.5 py-0.5 rounded-full">
                        Expira: {new Date(link.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-[10px] font-medium text-slate-400 truncate mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono">
                    {link.accessUrl}
                  </div>
                  
                  <div className="flex gap-3 items-center justify-between mt-auto">
                    <form action={toggleLinkAction} className="flex-1">
                      <input name="link_id" type="hidden" value={link.id} />
                      <input name="is_active" type="hidden" value={String(link.is_active)} />
                      <Button 
                        size="sm" 
                        variant={link.is_active ? "ghost" : "outline"} 
                        className={`w-full h-10 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${
                          link.is_active 
                            ? "text-rose-400/80 hover:bg-rose-50 hover:text-rose-600" 
                            : "bg-academic-navy text-white border-none hover:bg-academic-navy/90"
                        }`}
                      >
                        {link.is_active ? "Desactivar Llave" : "Reactivar Llave"}
                      </Button>
                    </form>
                    <Link 
                      href={link.accessUrl as Route} 
                      target="_blank"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-academic-gold border border-slate-200 hover:bg-academic-gold hover:text-white transition-all shadow-sm"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </RoleLayout>
  );
}
