import { createServiceClient } from "@/lib/supabase/server";

type SubjectPathModule = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  is_locked_by_default: boolean;
  progress_percent: number;
  status: string;
  is_locked: boolean;
  activities_count: number;
  intro_video_url: string | null;
};

export async function getStudentAssignedSubjects(studentId: string) {
  const supabase = await createServiceClient();

  // 1. Obtenemos las asignaciones y los detalles de las materias
  const { data: assignments, error: assignmentsError } = await supabase
    .from("student_subjects")
    .select("subject_id, subjects ( id, title, description, color, icon, is_active )")
    .eq("student_id", studentId);

  if (assignmentsError) throw assignmentsError;
  if (!assignments || assignments.length === 0) return [];

  // 2. Obtenemos el progreso para estas materias
  const subjectIds = assignments.map((a) => a.subject_id);
  const { data: progressRows, error: progressError } = await supabase
    .from("student_subject_progress")
    .select("subject_id, progress_percent, status, completed_modules, total_modules")
    .eq("student_id", studentId)
    .in("subject_id", subjectIds);

  if (progressError) throw progressError;

  const progressMap = new Map(
    (progressRows ?? []).map((row) => [row.subject_id, row])
  );

  // 3. Combinamos los datos
  return assignments.map((item) => {
    const subject = Array.isArray(item.subjects) ? item.subjects[0] : item.subjects;
    const progressRow = progressMap.get(item.subject_id);

    return {
      subject,
      progress: progressRow ?? {
        progress_percent: 0,
        status: "pending",
        completed_modules: 0,
        total_modules: 0
      }
    };
  });
}

export async function getSubjectLearningPath(subjectId: string, studentId: string) {
  const supabase = await createServiceClient();

  const { data: modules, error: modulesError } = await supabase
    .from("modules")
    .select("id, title, description, position, is_locked_by_default, intro_video_url")
    .eq("subject_id", subjectId)
    .order("position", { ascending: true });

  if (modulesError) throw modulesError;

  const moduleIds = (modules ?? []).map((module) => module.id);

  const [{ data: moduleProgress }, { data: activityTotals }] = await Promise.all([
    moduleIds.length
      ? supabase
          .from("student_module_progress")
          .select("module_id, progress_percent, status")
          .eq("student_id", studentId)
          .in("module_id", moduleIds)
      : Promise.resolve({ data: [] as Array<{ module_id: string; progress_percent: number; status: string }> }),
    moduleIds.length
      ? supabase
          .from("activities")
          .select("module_id, id")
          .in("module_id", moduleIds)
      : Promise.resolve({ data: [] as Array<{ module_id: string; id: string }> })
  ]);

  const progressMap = new Map(
    (moduleProgress ?? []).map((entry) => [entry.module_id, entry])
  );
  const activitiesCountMap = (activityTotals ?? []).reduce((acc, row) => {
    acc.set(row.module_id, (acc.get(row.module_id) ?? 0) + 1);
    return acc;
  }, new Map<string, number>());

  const path: SubjectPathModule[] = [];

  (modules ?? []).forEach((module, index) => {
    const progress = progressMap.get(module.id);
    const previous = path[index - 1];
    const previousUnlocked = !previous || previous.status === "completed";
    const isLocked = progress ? progress.status === "blocked" : (module.is_locked_by_default || !previousUnlocked);

    path.push({
      id: module.id,
      title: module.title,
      description: module.description,
      position: module.position,
      is_locked_by_default: module.is_locked_by_default,
      progress_percent: Number(progress?.progress_percent ?? 0),
      status: progress?.status ?? "pending",
      is_locked: isLocked,
      activities_count: activitiesCountMap.get(module.id) ?? 0,
      intro_video_url: module.intro_video_url
    });
  });

  return path;
}

export async function getStudentModuleActivities(moduleId: string, studentId: string) {
  const supabase = await createServiceClient();
  const { data: activities, error } = await supabase
    .from("activities")
    .select(
      "id, module_id, type, title, prompt, instructions, audio_url, image_url, settings_json, position"
    )
    .eq("module_id", moduleId)
    .order("position", { ascending: true });

  if (error) throw error;

  const activityIds = (activities ?? []).map((activity) => activity.id);

  const { data: progressRows } = activityIds.length
    ? await supabase
        .from("student_activity_progress")
        .select("activity_id, status, score, attempts")
        .eq("student_id", studentId)
        .in("activity_id", activityIds)
    : {
        data: [] as Array<{
          activity_id: string;
          status: string;
          score: number | null;
          attempts: number;
        }>
      };

  const progressByActivity = new Map(
    (progressRows ?? []).map((row) => [row.activity_id, row])
  );

  return (activities ?? []).map((activity) => ({
    ...activity,
    progress: progressByActivity.get(activity.id) ?? null
  }));
}

export async function getStudentGlobalProgress(studentId: string) {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("student_subject_progress")
    .select("progress_percent, status")
    .eq("student_id", studentId);

  if (error) throw error;

  const rows = data ?? [];
  const total = rows.length;
  const average = total
    ? rows.reduce((acc, row) => acc + Number(row.progress_percent || 0), 0) / total
    : 0;

  const completed = rows.filter((row) => row.status === "completed").length;

  return {
    averageProgress: average,
    totalSubjects: total,
    completedSubjects: completed
  };
}
