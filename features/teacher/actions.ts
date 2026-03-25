import { z } from "zod";

import { ACTIVITY_TYPES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { buildAccessUrl, generateAccessToken } from "@/services/access-links";

const subjectSchema = z.object({
  title: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  color: z.string().default("#43b8f4"),
  icon: z.string().optional(),
  is_active: z.boolean().default(true)
});

const moduleSchema = z.object({
  subject_id: z.string().uuid("Materia inválida"),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  position: z.coerce.number().int().min(1),
  is_locked_by_default: z.boolean().default(false),
  intro_video_url: z.string().url().optional().or(z.literal("")),
});

const activitySchema = z.object({
  module_id: z.string().uuid("Módulo inválido"),
  type: z.enum(ACTIVITY_TYPES),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  prompt: z.string().min(5, "La consigna debe tener al menos 5 caracteres"),
  instructions: z.string().optional(),
  audio_url: z.string().url().optional().or(z.literal("")),
  image_url: z.string().url().optional().or(z.literal("")),
  settings_json: z.record(z.string(), z.unknown()).optional(),
  position: z.coerce.number().int().min(1)
});

const subjectAssignSchema = z.object({
  subject_id: z.string().uuid("Materia inválida"),
  student_id: z.string().uuid("Estudiante inválido")
});

const accessLinkSchema = z.object({
  student_id: z.string().uuid("Estudiante inválido"),
  type: z.enum(["qr", "magic_link"]).default("qr"),
  expires_in_days: z.coerce.number().int().min(1).max(365).default(90)
});

const familyLinkSchema = z.object({
  family_id: z.string().uuid("Familia inválida"),
  student_id: z.string().uuid("Estudiante inválido")
});

async function ensureTeacherOwnsSubject(subjectId: string, teacherId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("id")
    .eq("id", subjectId)
    .eq("teacher_id", teacherId)
    .single();

  if (error || !data) {
    throw new Error("No autorizado para operar esta materia");
  }

  return data.id;
}

async function getModuleSubjectId(moduleId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .select("subject_id")
    .eq("id", moduleId)
    .single();

  if (error || !data) throw new Error("Módulo no encontrado");
  return data.subject_id;
}

async function getActivityModuleId(activityId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("module_id")
    .eq("id", activityId)
    .single();

  if (error || !data) throw new Error("Actividad no encontrada");
  return data.module_id;
}

async function ensureTeacherHasStudent(studentId: string, teacherId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("student_subjects")
    .select("student_id, subjects!inner(teacher_id)")
    .eq("student_id", studentId)
    .eq("subjects.teacher_id", teacherId)
    .limit(1);

  if (!data?.length) {
    throw new Error("El estudiante no está vinculado a materias de este docente");
  }
}

export async function createSubject(input: unknown, teacherId: string) {
  const parsed = subjectSchema.parse(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subjects")
    .insert({
      ...parsed,
      teacher_id: teacherId,
      description: parsed.description || null,
      icon: parsed.icon || null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubject(subjectId: string, input: unknown, teacherId: string) {
  const parsed = subjectSchema.partial().parse(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subjects")
    .update({
      ...parsed,
      description: parsed.description ?? undefined,
      icon: parsed.icon ?? undefined
    })
    .eq("id", subjectId)
    .eq("teacher_id", teacherId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubject(subjectId: string, teacherId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", subjectId)
    .eq("teacher_id", teacherId);
  if (error) throw error;
}

export async function createModule(input: unknown, teacherId: string) {
  const parsed = moduleSchema.parse(input);
  await ensureTeacherOwnsSubject(parsed.subject_id, teacherId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("modules")
    .insert({
      ...parsed,
      description: parsed.description || null,
      intro_video_url: parsed.intro_video_url || null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateModule(moduleId: string, input: unknown, teacherId: string) {
  const parsed = moduleSchema.partial().parse(input);
  const subjectId = parsed.subject_id ?? (await getModuleSubjectId(moduleId));
  await ensureTeacherOwnsSubject(subjectId, teacherId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("modules")
    .update({
      ...parsed,
      description: parsed.description ?? undefined,
      intro_video_url: parsed.intro_video_url ?? undefined
    })
    .eq("id", moduleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteModuleForTeacher(moduleId: string, teacherId: string) {
  const subjectId = await getModuleSubjectId(moduleId);
  await ensureTeacherOwnsSubject(subjectId, teacherId);
  const supabase = await createClient();
  const { error } = await supabase.from("modules").delete().eq("id", moduleId);
  if (error) throw error;
}

export async function createActivity(input: unknown, teacherId: string) {
  const parsed = activitySchema.parse(input);
  const subjectId = await getModuleSubjectId(parsed.module_id);
  await ensureTeacherOwnsSubject(subjectId, teacherId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activities")
    .insert({
      ...parsed,
      instructions: parsed.instructions || null,
      audio_url: parsed.audio_url || null,
      image_url: parsed.image_url || null,
      settings_json: parsed.settings_json ?? {}
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateActivity(activityId: string, input: unknown, teacherId: string) {
  const parsed = activitySchema.partial().parse(input);
  const moduleId = parsed.module_id ?? (await getActivityModuleId(activityId));
  const subjectId = await getModuleSubjectId(moduleId);
  await ensureTeacherOwnsSubject(subjectId, teacherId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activities")
    .update({
      ...parsed,
      instructions: parsed.instructions ?? undefined,
      audio_url: parsed.audio_url ?? undefined,
      image_url: parsed.image_url ?? undefined,
      settings_json: parsed.settings_json ?? undefined
    })
    .eq("id", activityId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteActivityForTeacher(activityId: string, teacherId: string) {
  const moduleId = await getActivityModuleId(activityId);
  const subjectId = await getModuleSubjectId(moduleId);
  await ensureTeacherOwnsSubject(subjectId, teacherId);
  const supabase = await createClient();
  const { error } = await supabase.from("activities").delete().eq("id", activityId);
  if (error) throw error;
}

export async function assignSubjectToStudent(input: unknown, teacherId: string) {
  const parsed = subjectAssignSchema.parse(input);
  await ensureTeacherOwnsSubject(parsed.subject_id, teacherId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_subjects")
    .upsert(
      {
        student_id: parsed.student_id,
        subject_id: parsed.subject_id
      },
      { onConflict: "student_id,subject_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unassignSubjectFromStudent(assignmentId: string, teacherId: string) {
  const supabase = await createClient();
  const { data: assignment, error: assignmentError } = await supabase
    .from("student_subjects")
    .select("id, subject_id")
    .eq("id", assignmentId)
    .single();

  if (assignmentError || !assignment) throw new Error("Asignación no encontrada");
  await ensureTeacherOwnsSubject(assignment.subject_id, teacherId);

  const { error } = await supabase
    .from("student_subjects")
    .delete()
    .eq("id", assignmentId);

  if (error) throw error;
}

export async function createAccessLinkForStudent(input: unknown, teacherId: string) {
  const parsed = accessLinkSchema.parse(input);
  const supabase = await createClient();

  const { data: ownership } = await supabase
    .from("student_subjects")
    .select("student_id, subjects!inner(teacher_id)")
    .eq("student_id", parsed.student_id)
    .eq("subjects.teacher_id", teacherId)
    .limit(1);

  if (!ownership?.length) {
    throw new Error("No autorizado para generar acceso a este estudiante");
  }

  const token = generateAccessToken();
  const expiresAt = new Date(Date.now() + parsed.expires_in_days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("access_links")
    .insert({
      student_id: parsed.student_id,
      type: parsed.type,
      token,
      expires_at: expiresAt,
      is_active: true
    })
    .select("id, student_id, type, token, expires_at, is_active, created_at")
    .single();

  if (error) throw error;

  return {
    ...data,
    access_url: buildAccessUrl(token)
  };
}

export async function linkFamilyToStudent(input: unknown, teacherId: string) {
  const parsed = familyLinkSchema.parse(input);
  await ensureTeacherHasStudent(parsed.student_id, teacherId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("family_students")
    .upsert(
      {
        family_id: parsed.family_id,
        student_id: parsed.student_id
      },
      { onConflict: "family_id,student_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unlinkFamilyFromStudent(relationId: string, teacherId: string) {
  const supabase = await createClient();
  const { data: relation, error: relationError } = await supabase
    .from("family_students")
    .select("id, student_id")
    .eq("id", relationId)
    .single();

  if (relationError || !relation) {
    throw new Error("Relación familia-estudiante no encontrada");
  }

  await ensureTeacherHasStudent(relation.student_id, teacherId);

  const { error } = await supabase
    .from("family_students")
    .delete()
    .eq("id", relationId);

  if (error) throw error;
}
