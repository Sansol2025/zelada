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
      <div className="flex flex-col gap-8 animate-in">

        {/* HEADER PREMIUM */}
        <div className="relative overflow-hidden rounded-[3rem] bg-academic-navy p-10 text-white shadow-2xl md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-academic-gold/20 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-academic-gold font-black uppercase tracking-[0.2em] text-xs">
              <KeyRound className="h-4 w-4" /> Seguridad y Accesibilidad
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl leading-[1.1]">
              Llaves Mágicas (QR)
            </h1>
            <p className="mt-6 text-xl font-medium text-white/70 max-w-prose leading-relaxed">
              Elimina las barreras de entrada. Genera Códigos QR de acceso directo para que tus alumnos ingresen a su aventura sin necesidad de contraseñas complejas.
            </p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          
          <Card className="border border-academic-gold/5 shadow-premium rounded-[3rem] p-10 bg-white relative overflow-hidden flex flex-col justify-center min-h-[320px]">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-academic-gold/5 border-l border-b border-academic-gold/10"></div>
            <div className="mb-8 flex items-center gap-4 border-b border-academic-gold/5 pb-6 text-academic-navy relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-ivory text-academic-gold shadow-sm border border-academic-gold/10">
                <QrCode className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">QRs por Grado</CardTitle>
            </div>
            <p className="text-academic-slate font-medium leading-relaxed mb-6 relative z-10 text-lg">
              Optimiza el tiempo en el aula. Hemos generado un <span className="font-black text-academic-navy uppercase tracking-tighter">QR General</span> por cada nivel. Los estudiantes solo deberán escanear el código de su grado para listar sus nombres.
            </p>
            <div className="relative z-10 mt-auto">
              <span className="inline-flex items-center gap-2 rounded-full bg-academic-navy/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-academic-navy/60 border border-academic-navy/5">
                <Sparkles className="h-3 w-3" /> Generación Automática Activa
              </span>
            </div>
          </Card>

          <Card className="border border-academic-gold/5 shadow-premium rounded-[3rem] p-10 bg-academic-ivory/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-academic-gold/5 border-l border-b border-academic-gold/10"></div>
            <div className="mb-8 flex items-center gap-4 border-b border-academic-gold/5 pb-6 text-academic-navy relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-academic-navy text-white shadow-lg">
                <Wand2 className="h-6 w-6 text-academic-gold" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">Generar Enlace Directo</CardTitle>
            </div>
            <form action={createMagicLinkAction} className="space-y-6 relative z-10">
              <div className="space-y-3">
                <label htmlFor="student_id" className="text-xs font-black uppercase tracking-widest text-academic-gold">¿Para quién es el enlace?</label>
                <select 
                  id="student_id"
                  className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-white px-6 font-bold text-academic-navy focus:border-academic-gold focus:outline-none transition-all shadow-sm" 
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
                <label htmlFor="expires_in_days" className="text-xs font-black uppercase tracking-widest text-academic-gold">Validez del Enlace</label>
                <div className="flex items-center gap-4">
                  <input
                    id="expires_in_days"
                    className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-white px-6 text-lg font-black text-academic-navy focus:border-academic-gold focus:outline-none transition-all shadow-sm"
                    defaultValue={7} min={1} max={365} name="expires_in_days" type="number"
                  />
                  <span className="font-black text-academic-navy uppercase tracking-widest text-xs opacity-40">días</span>
                </div>
              </div>
              <Button type="submit" className="h-16 w-full rounded-2xl bg-academic-navy text-lg font-black tracking-tighter transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-academic-navy/30 border-none text-white">
                <KeyRound className="mr-3 h-6 w-6 text-academic-gold" /> Crear Nueva Llave
              </Button>
            </form>
          </Card>
        </div>

        <section className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-black tracking-tight text-academic-navy">Códigos QR por Grado</h2>
            <div className="h-px flex-1 mx-8 bg-academic-gold/10 hidden md:block"></div>
          </div>
          
          {!gradeQRs.length ? (
            <div className="rounded-[3rem] border-2 border-dashed border-academic-gold/10 bg-academic-ivory/30 p-20 text-center">
              <EmptyState
                title="No se detectaron grados"
                description="Asegúrate de que tus alumnos tengan un grado y sección asignados para generar sus llaves de acceso."
              />
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {gradeQRs.map((g) => (
                <div key={g.grade} className="group relative transition-all duration-500 hover:-translate-y-2">
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

        <section className="mt-12 border-t border-academic-gold/5 pt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-black tracking-tight text-academic-navy">Llaves Individuales Activas</h2>
            <div className="h-px flex-1 mx-8 bg-academic-gold/10 hidden md:block"></div>
          </div>
          
          {!previewLinks.length ? (
            <div className="rounded-[3rem] border-2 border-dashed border-academic-gold/10 bg-academic-ivory/30 p-20 text-center">
              <EmptyState
                title="Sin llaves activas"
                description="Los accesos individuales que generes aparecerán aquí para su gestión y reenvío."
              />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {previewLinks.map((link) => (
                <Card key={link.id} className="flex flex-col border border-academic-gold/5 bg-white shadow-premium rounded-[2.5rem] p-8 transition-all hover:shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-black text-xl text-academic-navy tracking-tight">{link.student_name}</span>
                    {link.expires_at && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-academic-slate/40 border border-academic-gold/10 px-3 py-1 rounded-full">
                        Expira: {new Date(link.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-[10px] font-medium text-academic-navy/40 truncate mb-6 bg-academic-ivory/50 p-4 rounded-xl border border-academic-gold/5 font-mono">
                    {link.accessUrl}
                  </div>
                  
                  <div className="flex gap-4 items-center justify-between mt-auto">
                    <form action={toggleLinkAction} className="flex-1">
                      <input name="link_id" type="hidden" value={link.id} />
                      <input name="is_active" type="hidden" value={String(link.is_active)} />
                      <Button 
                        size="sm" 
                        variant={link.is_active ? "ghost" : "outline"} 
                        className={`w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          link.is_active 
                            ? "text-rose-600/60 hover:bg-rose-50 hover:text-rose-600" 
                            : "bg-academic-navy text-white border-none hover:bg-academic-navy/90"
                        }`}
                      >
                        {link.is_active ? "Desactivar Llave" : "Reactivar Llave"}
                      </Button>
                    </form>
                    <Link 
                      href={link.accessUrl as Route} 
                      target="_blank"
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-academic-ivory text-academic-gold border border-academic-gold/10 hover:bg-academic-gold hover:text-white transition-all shadow-sm"
                    >
                      <Sparkles className="h-5 w-5" />
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
