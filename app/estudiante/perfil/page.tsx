import { BookOpenCheck, UserRound } from "lucide-react";

import { StudentShell } from "@/components/layout/student-shell";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { getStudentContextOrRedirect } from "@/features/student/access";
import { createClient } from "@/lib/supabase/server";

export default async function StudentProfilePage() {
  const student = await getStudentContextOrRedirect();
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("students")
    .select("grade, section, school_name")
    .eq("id", student.studentId)
    .single();

  return (
    <StudentShell
      title="Mi perfil"
      description="Información básica de tu espacio de aprendizaje."
      currentPath="/estudiante/perfil"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-2">
          <div className="inline-flex rounded-xl bg-brand-100 p-2 text-brand-700">
            <UserRound className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">{student.fullName || "Estudiante"}</CardTitle>
          <CardText>Perfil de aprendizaje activo.</CardText>
        </Card>
        <Card className="space-y-2">
          <div className="inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">Datos escolares</CardTitle>
          <CardText>Escuela: {row?.school_name || "Escuela N° 361"}</CardText>
          <CardText>
            Curso: {row?.grade || "Sin grado"} {row?.section || ""}
          </CardText>
        </Card>
      </div>
    </StudentShell>
  );
}
