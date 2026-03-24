import { notFound } from "next/navigation";
import { BookOpen, ChartBar, CircleCheckBig } from "lucide-react";

import { RoleLayout } from "@/components/layout/role-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/features/auth/session";
import { getFamilyStudentReport } from "@/features/family/queries";
import { familyNavItems } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";
import { percent } from "@/lib/utils";

type FamilyStudentReportPageProps = {
  params: Promise<{ studentId: string }>;
};

export default async function FamilyStudentReportPage({ params }: FamilyStudentReportPageProps) {
  const session = await requireRole(["family"]);
  const { studentId } = await params;

  const report = await getFamilyStudentReport(session.userId as string, studentId);
  if (!report) notFound();

  const subjectIds = (report.progressRows ?? []).map((row) => row.subject_id);
  const supabase = await createClient();
  const { data: subjects } = subjectIds.length
    ? await supabase
        .from("subjects")
        .select("id, title")
        .in("id", subjectIds)
    : { data: [] as Array<{ id: string; title: string }> };

  const subjectMap = new Map((subjects ?? []).map((subject) => [subject.id, subject.title]));
  const profile = report.student?.profiles
    ? Array.isArray(report.student.profiles)
      ? report.student.profiles[0]
      : report.student.profiles
    : null;

  return (
    <RoleLayout
      title={`Reporte de ${profile?.full_name || "Estudiante"}`}
      description="Detalle por materia para acompañamiento en el hogar."
      navItems={familyNavItems}
      currentPath="/familia"
    >
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-brand-900">
          <ChartBar className="h-5 w-5" />
          <CardTitle className="text-lg">Resumen general</CardTitle>
        </div>
        <CardText>
          Curso: {report.student?.grade || "Sin grado"} {report.student?.section || ""}
        </CardText>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        {(report.progressRows ?? []).map((row) => (
          <Card key={row.subject_id} className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">{subjectMap.get(row.subject_id) || "Materia"}</CardTitle>
                <CardText>Avance: {percent(Number(row.progress_percent || 0))}</CardText>
              </div>
              <Badge variant={row.status === "completed" ? "success" : "default"}>
                {row.status}
              </Badge>
            </div>
            <div className="grid gap-2 text-sm text-brand-700">
              <p className="inline-flex items-center gap-2">
                <CircleCheckBig className="h-4 w-4 text-emerald-600" />
                Módulos completados: {row.completed_modules}/{row.total_modules}
              </p>
              <p className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand-500" />
                Estado actual: {row.status}
              </p>
            </div>
          </Card>
        ))}
      </section>
    </RoleLayout>
  );
}
