import { QrCode, Sparkles } from "lucide-react";

import { QRAccessCard } from "@/components/qr-access-card";
import { RoleLayout } from "@/components/layout/role-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { requireRole } from "@/features/auth/session";
import { getTeacherStudents } from "@/features/teacher/queries";
import { PageHeader } from "@/components/page-header";
import { teacherNavItems } from "@/lib/navigation";
import { buildQRCodeDataUrl } from "@/services/access-links";

export default async function TeacherAccessLinksPage() {
  const session = await requireRole(["teacher", "admin"]);
  const teacherId = session.userId as string;

  const students = await getTeacherStudents(teacherId);

  const uniqueGrades = Array.from(new Set(students.map(s => s.grade).filter(Boolean))) as string[];

  // Usar siempre la URL pública configurada o el dominio público de producción
  // Esto evita caer en las URLs *.vercel.app de los preview deployments que piden login a Vercel
  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
    "https://zelada.vercel.app";

  // Asegurar que baseUrl tenga el protocolo correcto si viene de VERCEL_URL (que no lo trae)
  if (!baseUrl.startsWith("http")) {
    const protocol = baseUrl.includes("localhost") ? "http" : "https";
    baseUrl = `${protocol}://${baseUrl}`;
  }

  const gradeQRs = await Promise.all(
    uniqueGrades.map(async (grade) => {
      const accessUrl = `${baseUrl.replace(/\/$/, "")}/ingreso/alumnos?grado=${encodeURIComponent(grade)}`;
      const qrDataUrl = await buildQRCodeDataUrl(accessUrl);
      return { grade, accessUrl, qrDataUrl };
    })
  );



  return (
    <RoleLayout
      title=" "
      description=" "
      navItems={teacherNavItems}
      currentPath="/docente/accesos"
    >
      <div className="flex flex-col gap-4 animate-in">

        <PageHeader
          icon={<QrCode className="h-4 w-4" />}
          subtitle="Seguridad y Accesibilidad"
          title="Llaves Mágicas (QR)"
          description="Elimina las barreras de entrada. Genera Códigos QR de acceso directo para que tus alumnos ingresen a su aventura sin necesidad de contraseñas complejas."
        />

        <div className="grid gap-4">

          <Card className="border border-slate-200 shadow-sm rounded-xl p-4 bg-white relative overflow-hidden flex flex-col justify-center min-h-[160px]">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-slate-50 border-l border-b border-slate-100"></div>
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3 text-academic-navy relative z-10">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-academic-gold shadow-sm border border-slate-100">
                <QrCode className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold tracking-tight uppercase">QRs por Grado</CardTitle>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed mb-4 relative z-10 text-[11px]">
              Optimiza el tiempo en el aula. Hemos generado un <span className="font-bold text-academic-navy uppercase tracking-tight">QR General</span> por cada nivel.
            </p>
            <div className="relative z-10 mt-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400 border border-slate-100">
                <Sparkles className="h-2 w-2" /> Generación Automática
              </span>
            </div>
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


      </div>
    </RoleLayout>
  );
}
