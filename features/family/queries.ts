import { createClient } from "@/lib/supabase/server";

export async function getFamilyDashboard(profileId: string) {
  const supabase = await createClient();

  const { data: family } = await supabase
    .from("families")
    .select("id")
    .eq("profile_id", profileId)
    .single();

  if (!family) {
    return {
      linkedStudents: [],
      overallProgress: 0
    };
  }

  const { data: linkedStudents } = await supabase
    .from("family_students")
    .select(
      "student_id, students!inner ( id, profile_id, grade, section, profiles ( full_name ) )"
    )
    .eq("family_id", family.id);

  const studentIds = (linkedStudents ?? []).map((item) => item.student_id);

  const { data: progressRows } = studentIds.length
    ? await supabase
        .from("student_subject_progress")
        .select("student_id, progress_percent, status, completed_modules, total_modules")
        .in("student_id", studentIds)
    : { data: [] as Array<{ student_id: string; progress_percent: number; status: string; completed_modules: number; total_modules: number }> };

  const progressByStudent = new Map<string, typeof progressRows>();

  (progressRows ?? []).forEach((row) => {
    const rows = progressByStudent.get(row.student_id) ?? [];
    rows.push(row);
    progressByStudent.set(row.student_id, rows);
  });

  const rows = (linkedStudents ?? []).map((entry) => {
    const student = Array.isArray(entry.students) ? entry.students[0] : entry.students;
    const profile = student?.profiles
      ? Array.isArray(student.profiles)
        ? student.profiles[0]
        : student.profiles
      : null;
    const subjectProgress = progressByStudent.get(entry.student_id) ?? [];
    const avg = subjectProgress.length
      ? subjectProgress.reduce((acc, item) => acc + Number(item.progress_percent || 0), 0) /
        subjectProgress.length
      : 0;

    return {
      studentId: entry.student_id,
      studentName: profile?.full_name ?? "Estudiante",
      grade: student?.grade ?? "Sin grado",
      section: student?.section ?? "-",
      progressPercent: avg,
      subjectsCount: subjectProgress.length,
      completedSubjects: subjectProgress.filter((item) => item.status === "completed").length
    };
  });

  const overallProgress = rows.length
    ? rows.reduce((acc, row) => acc + row.progressPercent, 0) / rows.length
    : 0;

  return {
    linkedStudents: rows,
    overallProgress
  };
}

export async function getFamilyStudentReport(profileId: string, studentId: string) {
  const supabase = await createClient();

  const { data: family } = await supabase
    .from("families")
    .select("id")
    .eq("profile_id", profileId)
    .single();
  if (!family) return null;

  const { data: relation } = await supabase
    .from("family_students")
    .select("student_id")
    .eq("family_id", family.id)
    .eq("student_id", studentId)
    .single();

  if (!relation) return null;

  const [{ data: profile }, { data: progressRows }] = await Promise.all([
    supabase
      .from("students")
      .select("id, grade, section, profiles ( full_name )")
      .eq("id", studentId)
      .single(),
    supabase
      .from("student_subject_progress")
      .select("subject_id, progress_percent, status, completed_modules, total_modules")
      .eq("student_id", studentId)
  ]);

  return {
    student: profile,
    progressRows: progressRows ?? []
  };
}
