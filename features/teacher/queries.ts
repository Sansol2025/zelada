import { createClient, createServiceClient } from "@/lib/supabase/server";

function getProfileFullName(profileValue: unknown, fallback: string) {
  if (Array.isArray(profileValue)) {
    const first = profileValue[0] as { full_name?: string } | undefined;
    return first?.full_name ?? fallback;
  }

  if (profileValue && typeof profileValue === "object") {
    return ((profileValue as { full_name?: string }).full_name ?? fallback);
  }

  return fallback;
}

async function assertTeacherOwnsSubject(subjectId: string, teacherId: string) {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("subjects")
    .select("id")
    .eq("id", subjectId)
    .eq("teacher_id", teacherId)
    .single();

  if (!data) throw new Error("Materia no encontrada o sin permisos");
}

async function assertTeacherOwnsModule(moduleId: string, teacherId: string) {
  const supabase = await createServiceClient();
  const { data: moduleData } = await supabase
    .from("modules")
    .select("subject_id")
    .eq("id", moduleId)
    .single();

  if (!moduleData) throw new Error("Módulo no encontrado");
  await assertTeacherOwnsSubject(moduleData.subject_id, teacherId);
}

export async function getTeacherSubjects(teacherId: string) {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("id, title, description, color, icon, is_active, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getTeacherSubjectsOverview(teacherId: string) {
  const supabase = await createServiceClient();
  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("id, title, description, color, icon, is_active, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) return [];
  if (!subjects?.length) return [];

  const subjectIds = subjects.map((subject) => subject.id);

  const [{ data: modules, error: modulesError }, { data: assignments, error: assignmentsError }, { data: progressRows, error: progressError }] = await Promise.all([
    supabase.from("modules").select("id, subject_id").in("subject_id", subjectIds),
    supabase.from("student_subjects").select("subject_id, student_id").in("subject_id", subjectIds),
    supabase
      .from("student_subject_progress")
      .select("subject_id, progress_percent")
      .in("subject_id", subjectIds)
  ]);

  if (modulesError || assignmentsError || progressError) {
    return subjects.map((subject) => ({
      ...subject,
      modules_count: 0,
      assigned_students_count: 0,
      progress_average: 0
    }));
  }

  const modulesCountBySubject = new Map<string, number>();
  const studentsBySubject = new Map<string, Set<string>>();
  const progressBySubject = new Map<string, { sum: number; count: number }>();

  for (const row of modules ?? []) {
    modulesCountBySubject.set(row.subject_id, (modulesCountBySubject.get(row.subject_id) ?? 0) + 1);
  }

  for (const row of assignments ?? []) {
    const current = studentsBySubject.get(row.subject_id) ?? new Set<string>();
    current.add(row.student_id);
    studentsBySubject.set(row.subject_id, current);
  }

  for (const row of progressRows ?? []) {
    const current = progressBySubject.get(row.subject_id) ?? { sum: 0, count: 0 };
    current.sum += Number(row.progress_percent ?? 0);
    current.count += 1;
    progressBySubject.set(row.subject_id, current);
  }

  return subjects.map((subject) => {
    const progress = progressBySubject.get(subject.id);

    return {
      ...subject,
      modules_count: modulesCountBySubject.get(subject.id) ?? 0,
      assigned_students_count: studentsBySubject.get(subject.id)?.size ?? 0,
      progress_average: progress && progress.count ? progress.sum / progress.count : 0
    };
  });
}

export async function getTeacherSubjectById(subjectId: string, teacherId: string) {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("subjects")
    .select(
      "id, title, description, color, icon, is_active, created_at, modules ( id, title, description, position, is_locked_by_default, intro_video_url )"
    )
    .eq("id", subjectId)
    .eq("teacher_id", teacherId)
    .single();

  if (error) throw error;
  return data;
}

export async function getTeacherModulesBySubject(subjectId: string, teacherId: string) {
  await assertTeacherOwnsSubject(subjectId, teacherId);
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("modules")
    .select("id, subject_id, title, description, position, is_locked_by_default, intro_video_url, created_at")
    .eq("subject_id", subjectId)
    .order("position", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getTeacherModuleById(moduleId: string, teacherId: string) {
  await assertTeacherOwnsModule(moduleId, teacherId);
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("modules")
    .select("id, subject_id, title, description, position, is_locked_by_default, intro_video_url, created_at")
    .eq("id", moduleId)
    .single();

  if (error) throw error;
  return data;
}

export async function getTeacherModuleActivities(moduleId: string, teacherId: string) {
  await assertTeacherOwnsModule(moduleId, teacherId);
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("activities")
    .select(
      "id, module_id, type, title, prompt, instructions, audio_url, image_url, settings_json, position, created_at"
    )
    .eq("module_id", moduleId)
    .order("position", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getTeacherActivityById(activityId: string, teacherId: string) {
  const supabase = await createServiceClient();
  const { data: activity } = await supabase
    .from("activities")
    .select("id, module_id, type, title, prompt, instructions, audio_url, image_url, settings_json, position, created_at")
    .eq("id", activityId)
    .single();

  if (!activity) throw new Error("Actividad no encontrada");
  await assertTeacherOwnsModule(activity.module_id, teacherId);
  return activity;
}

// Backward-compatible aliases.
export async function getTeacherModules(subjectId: string, teacherId: string) {
  return getTeacherModulesBySubject(subjectId, teacherId);
}

// Backward-compatible aliases.
export async function getModuleActivities(moduleId: string, teacherId: string) {
  return getTeacherModuleActivities(moduleId, teacherId);
}

export async function getTeacherDashboardMetrics(teacherId: string) {
  const supabase = await createServiceClient();

  const { count: subjectsCount } = await supabase
    .from("subjects")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", teacherId);

  const { data: teacherSubjects } = await supabase
    .from("subjects")
    .select("id")
    .eq("teacher_id", teacherId);

  const subjectIds = (teacherSubjects ?? []).map((item) => item.id);

  const modulesQuery = subjectIds.length
    ? supabase.from("modules").select("id", { count: "exact", head: true }).in("subject_id", subjectIds)
    : Promise.resolve({ count: 0 } as { count: number | null });

  const moduleResult = await modulesQuery;

  let activitiesCount = 0;
  if (subjectIds.length) {
    const { data: moduleIds } = await supabase.from("modules").select("id").in("subject_id", subjectIds);
    const ids = (moduleIds ?? []).map((item) => item.id);
    if (ids.length) {
      const { count } = await supabase
        .from("activities")
        .select("*", { count: "exact", head: true })
        .in("module_id", ids);
      activitiesCount = count ?? 0;
    }
  }

  const { count: assignedCount } = await supabase
    .from("student_subjects")
    .select("*", { count: "exact", head: true })
    .in("subject_id", subjectIds.length ? subjectIds : ["00000000-0000-0000-0000-000000000000"]);

  const { data: subjectProgressRows } = await supabase
    .from("student_subject_progress")
    .select("progress_percent, status")
    .in("subject_id", subjectIds.length ? subjectIds : ["00000000-0000-0000-0000-000000000000"]);

  const progressRows = subjectProgressRows ?? [];
  const progressAverage = progressRows.length
    ? progressRows.reduce((acc, row) => acc + Number(row.progress_percent || 0), 0) / progressRows.length
    : 0;

  const blockedStudents = progressRows.filter((row) => row.status === "blocked").length;
  const completedStudents = progressRows.filter((row) => row.status === "completed").length;

  return {
    subjectsCount: subjectsCount ?? 0,
    modulesCount: moduleResult?.count ?? 0,
    activitiesCount,
    assignedStudents: assignedCount ?? 0,
    progressAverage,
    blockedStudents,
    completedStudents
  };
}

export async function getStudentsProgressForTeacher(teacherId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("teacher_student_progress_overview", {
    p_teacher_id: teacherId
  });

  if (error) {
    // Safe fallback if RPC is not installed yet.
    return [];
  }

  return data ?? [];
}

export async function getTeacherStudents(teacherId: string) {
  const supabase = await createClient();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id")
    .eq("teacher_id", teacherId);

  const subjectIds = (subjects ?? []).map((row) => row.id);
  if (!subjectIds.length) return [];

  const { data: assignments } = await supabase
    .from("student_subjects")
    .select("student_id, subject_id")
    .in("subject_id", subjectIds);

  const studentIds = [...new Set((assignments ?? []).map((row) => row.student_id))];
  if (!studentIds.length) return [];

  const { data: students } = await supabase
    .from("students")
    .select("id, profile_id, grade, section, active, profiles ( full_name )")
    .in("id", studentIds);

  return (students ?? []).map((student) => ({
    id: student.id,
    profile_id: student.profile_id,
    full_name: getProfileFullName((student as { profiles?: unknown }).profiles, "Estudiante"),
    grade: student.grade ?? "Sin grado",
    section: student.section ?? "-",
    active: student.active
  }));
}

export async function getStudentsCatalogForTeacher() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, profile_id, grade, section, age, dni, active, created_at, profiles ( full_name )")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((student) => ({
    id: student.id,
    profile_id: student.profile_id,
    full_name: getProfileFullName((student as { profiles?: unknown }).profiles, "Estudiante"),
    grade: student.grade ?? "Sin grado",
    section: student.section ?? "-",
    age: student.age ?? null,
    dni: student.dni ?? null,
    active: student.active,
    created_at: student.created_at
  }));
}

export async function getTeacherFamilies(teacherId: string) {
  const supabase = await createClient();
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id")
    .eq("teacher_id", teacherId);

  const subjectIds = (subjects ?? []).map((row) => row.id);
  if (!subjectIds.length) return [];

  const { data: studentSubjects } = await supabase
    .from("student_subjects")
    .select("student_id")
    .in("subject_id", subjectIds);

  const studentIds = [...new Set((studentSubjects ?? []).map((row) => row.student_id))];
  if (!studentIds.length) return [];

  const { data, error } = await supabase
    .from("family_students")
    .select("id, family_id, student_id, families!inner(id, profile_id, relation_type, profiles(full_name))")
    .in("student_id", studentIds);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const family = Array.isArray(row.families) ? row.families[0] : row.families;

    return {
      relation_id: row.id,
      family_id: row.family_id,
      student_id: row.student_id,
      family_name: getProfileFullName(family?.profiles, "Familia"),
      relation_type: family?.relation_type ?? "Tutor/a"
    };
  });
}

export async function getAvailableFamilies() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("families")
    .select("id, relation_type, profiles(full_name)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((family) => {
    return {
      id: family.id,
      full_name: getProfileFullName(family?.profiles, "Familia"),
      relation_type: family.relation_type ?? "Tutor/a"
    };
  });
}

export async function getTeacherAssignments(teacherId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_subjects")
    .select(
      "id, assigned_at, student_id, subject_id, subjects!inner(id, title, teacher_id), students!inner(id, profile_id, grade, section, profiles(full_name))"
    )
    .eq("subjects.teacher_id", teacherId)
    .order("assigned_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((item) => {
    const subject = Array.isArray(item.subjects) ? item.subjects[0] : item.subjects;
    const student = Array.isArray(item.students) ? item.students[0] : item.students;

    return {
      assignment_id: item.id,
      assigned_at: item.assigned_at,
      subject_id: item.subject_id,
      subject_title: subject?.title ?? "Materia",
      student_id: item.student_id,
      student_name: getProfileFullName(student?.profiles, "Estudiante"),
      grade: student?.grade ?? "Sin grado",
      section: student?.section ?? "-"
    };
  });
}

export async function getTeacherAccessLinks(teacherId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("access_links")
    .select(
      "id, student_id, type, token, expires_at, is_active, created_at, students!inner(id, profile_id, profiles(full_name))"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []).map((item) => {
    const student = Array.isArray(item.students) ? item.students[0] : item.students;

    return {
      id: item.id,
      student_id: item.student_id,
      student_name: getProfileFullName(student?.profiles, "Estudiante"),
      type: item.type,
      token: item.token,
      expires_at: item.expires_at,
      is_active: item.is_active,
      created_at: item.created_at
    };
  });

  // Filter links to students that belong to this teacher.
  const { data: teacherSubjects } = await supabase
    .from("subjects")
    .select("id")
    .eq("teacher_id", teacherId);
  const subjectIds = (teacherSubjects ?? []).map((row) => row.id);

  if (!subjectIds.length) return [];

  const { data: ownership } = await supabase
    .from("student_subjects")
    .select("student_id")
    .in("subject_id", subjectIds);

  const ownedStudentIds = new Set((ownership ?? []).map((row) => row.student_id));
  return rows.filter((row) => ownedStudentIds.has(row.student_id));
}

export async function getTeacherStudentDetail(teacherId: string, studentId: string) {
  const supabase = await createClient();
  const { data: teacherSubjects } = await supabase
    .from("subjects")
    .select("id, title")
    .eq("teacher_id", teacherId);

  const subjectIds = (teacherSubjects ?? []).map((row) => row.id);
  if (!subjectIds.length) return null;

  const { data: assignment } = await supabase
    .from("student_subjects")
    .select("id")
    .eq("student_id", studentId)
    .in("subject_id", subjectIds)
    .limit(1);

  if (!assignment?.length) return null;

  const [{ data: student }, { data: subjectProgress }, { data: moduleProgress }, { data: activityProgress }] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, grade, section, profiles(full_name)")
        .eq("id", studentId)
        .single(),
      supabase
        .from("student_subject_progress")
        .select("subject_id, progress_percent, status, completed_modules, total_modules")
        .eq("student_id", studentId)
        .in("subject_id", subjectIds),
      supabase
        .from("student_module_progress")
        .select("module_id, status, progress_percent, completed_at")
        .eq("student_id", studentId),
      supabase
        .from("student_activity_progress")
        .select("activity_id, status, score, attempts, time_spent_seconds")
        .eq("student_id", studentId)
    ]);

  return {
    student: {
      id: student?.id ?? studentId,
      full_name: getProfileFullName(student?.profiles, "Estudiante"),
      grade: student?.grade ?? "Sin grado",
      section: student?.section ?? "-"
    },
    subjectProgress: subjectProgress ?? [],
    moduleProgress: moduleProgress ?? [],
    activityProgress: activityProgress ?? []
  };
}
