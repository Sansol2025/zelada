"use server";

import { z } from "zod";
import { read, utils } from "xlsx";

import { ACTIVITY_TYPES, SCHOOL_NAME } from "@/lib/constants";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { buildAccessUrl, generateAccessToken } from "@/services/access-links";

const subjectSchema = z.object({
  title: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres"),
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

const studentSchema = z.object({
  first_name: z.string().trim().min(1, "El primer nombre es obligatorio").max(80),
  second_name: z.string().trim().max(80).optional(),
  last_name: z.string().trim().min(1, "El apellido es obligatorio").max(80),
  age: z.coerce.number().int().min(3, "Edad inválida").max(120, "Edad inválida"),
  grade: z.string().trim().min(1, "El grado es obligatorio").max(40),
  dni: z
    .string()
    .trim()
    .regex(/^[0-9.\-\s]{6,20}$/, "DNI inválido")
});

type ParsedStudentInput = z.infer<typeof studentSchema>;
type ServiceClient = ReturnType<typeof createServiceClient>;

const csvHeaderAliases = {
  primer_nombre: ["primer_nombre", "first_name", "nombre"],
  segundo_nombre: ["segundo_nombre", "second_name", "segundo_nombre_opcional"],
  apellido: ["apellido", "last_name", "apellidos"],
  edad: ["edad", "age"],
  grado: ["grado", "grade"],
  dni: ["dni", "documento"]
} as const;

type CsvHeaderKey = keyof typeof csvHeaderAliases;
type CsvImportResult = {
  created: number;
  updated: number;
  failed: number;
  errors: string[];
};

const excelMimeTypes = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel"
]);

function normalizeHeaderValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

function toTitleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function normalizeDni(value: string) {
  return value.replace(/[.\-\s]/g, "");
}

function normalizeStudentInput(input: ParsedStudentInput) {
  const firstName = toTitleCase(input.first_name);
  const secondName = toTitleCase(input.second_name ?? "");
  const lastName = toTitleCase(input.last_name);
  const fullName = [firstName, secondName, lastName].filter(Boolean).join(" ");

  return {
    fullName,
    age: input.age,
    grade: input.grade.trim(),
    dni: normalizeDni(input.dni)
  };
}

function pickDelimiter(headerLine: string) {
  const commas = (headerLine.match(/,/g) ?? []).length;
  const semicolons = (headerLine.match(/;/g) ?? []).length;
  return semicolons > commas ? ";" : ",";
}

function parseCsvLine(line: string, delimiter: "," | ";") {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === "\"") {
      const nextChar = line[index + 1];
      if (inQuotes && nextChar === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function getCsvHeaderIndexes(headerCells: string[]) {
  const normalizedHeaders = headerCells.map((value) => normalizeHeaderValue(value));

  const indexes = {} as Record<CsvHeaderKey, number>;

  (Object.keys(csvHeaderAliases) as CsvHeaderKey[]).forEach((key) => {
    const aliases: readonly string[] = csvHeaderAliases[key];
    const index = normalizedHeaders.findIndex((header) => aliases.includes(header));
    if (index === -1) {
      throw new Error(`Falta la columna obligatoria: ${key}`);
    }
    indexes[key] = index;
  });

  return indexes;
}

function parseCsvStudents(content: string) {
  const lines = content
    .replace(/\uFEFF/g, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("El archivo debe incluir encabezado y al menos una fila.");
  }

  const delimiter = pickDelimiter(lines[0]) as "," | ";";
  const headerCells = parseCsvLine(lines[0], delimiter);
  const indexes = getCsvHeaderIndexes(headerCells);
  const rows: ParsedStudentInput[] = [];

  for (let rowIndex = 1; rowIndex < lines.length; rowIndex += 1) {
    const line = lines[rowIndex];
    const cells = parseCsvLine(line, delimiter);

    if (cells.every((cell) => cell.trim() === "")) {
      continue;
    }

    const rawStudent = {
      first_name: cells[indexes.primer_nombre] ?? "",
      second_name: cells[indexes.segundo_nombre] ?? "",
      last_name: cells[indexes.apellido] ?? "",
      age: cells[indexes.edad] ?? "",
      grade: cells[indexes.grado] ?? "",
      dni: cells[indexes.dni] ?? ""
    };

    try {
      rows.push(studentSchema.parse(rawStudent));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issue = error.issues[0];
        throw new Error(`Fila ${rowIndex + 1}: ${issue?.message ?? "Datos inválidos"}`);
      }
      throw error;
    }
  }

  if (!rows.length) {
    throw new Error("No se encontraron alumnos válidos en la planilla.");
  }

  return rows;
}

function parseExcelStudents(content: ArrayBuffer) {
  const workbook = read(content, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("El archivo Excel no contiene hojas.");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rawRows = utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    defval: ""
  });

  if (!rawRows.length || rawRows.length < 2) {
    throw new Error("El archivo Excel debe incluir encabezado y al menos una fila.");
  }

  const headerCells = rawRows[0].map((cell) => String(cell ?? "").trim());
  const indexes = getCsvHeaderIndexes(headerCells);
  const rows: ParsedStudentInput[] = [];

  for (let rowIndex = 1; rowIndex < rawRows.length; rowIndex += 1) {
    const cells = rawRows[rowIndex].map((cell) => String(cell ?? "").trim());

    if (cells.every((cell) => cell === "")) {
      continue;
    }

    const rawStudent = {
      first_name: cells[indexes.primer_nombre] ?? "",
      second_name: cells[indexes.segundo_nombre] ?? "",
      last_name: cells[indexes.apellido] ?? "",
      age: cells[indexes.edad] ?? "",
      grade: cells[indexes.grado] ?? "",
      dni: cells[indexes.dni] ?? ""
    };

    try {
      rows.push(studentSchema.parse(rawStudent));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issue = error.issues[0];
        throw new Error(`Fila ${rowIndex + 1}: ${issue?.message ?? "Datos inválidos"}`);
      }
      throw error;
    }
  }

  if (!rows.length) {
    throw new Error("No se encontraron alumnos válidos en la planilla.");
  }

  return rows;
}

async function parseStudentsFile(file: File) {
  const filename = file.name.toLowerCase();
  const isExcelFile =
    filename.endsWith(".xlsx") ||
    filename.endsWith(".xls") ||
    excelMimeTypes.has(file.type);

  if (isExcelFile) {
    const content = await file.arrayBuffer();
    return parseExcelStudents(content);
  }

  const content = await file.text();
  return parseCsvStudents(content);
}

async function assertTeacherCanManageStudents(teacherId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", teacherId)
    .single();

  if (error || !data || !["teacher", "admin"].includes(data.role)) {
    throw new Error("No autorizado para gestionar alumnos");
  }
}

function getServiceClientOrThrow() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Falta configurar SUPABASE_SERVICE_ROLE_KEY para crear alumnos.");
  }

  return createServiceClient();
}

async function createStudentAuthUser(serviceClient: ServiceClient, dni: string, fullName: string) {
  const { data, error } = await serviceClient.auth.admin.createUser({
    email: `alumno.${dni}.${crypto.randomUUID()}@asb.local`,
    password: `${crypto.randomUUID()}Aa1!`,
    email_confirm: true,
    user_metadata: {
      role: "student",
      full_name: fullName
    }
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "No se pudo crear el usuario del alumno");
  }

  return data.user.id;
}

async function upsertStudentByDni(serviceClient: ServiceClient, input: ParsedStudentInput) {
  const normalized = normalizeStudentInput(input);

  const { data: existingStudent, error: existingError } = await serviceClient
    .from("students")
    .select("id, profile_id")
    .eq("dni", normalized.dni)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existingStudent) {
    const [{ error: profileError }, { error: studentError }] = await Promise.all([
      serviceClient
        .from("profiles")
        .update({
          full_name: normalized.fullName,
          role: "student"
        })
        .eq("id", existingStudent.profile_id),
      serviceClient
        .from("students")
        .update({
          age: normalized.age,
          grade: normalized.grade,
          school_name: SCHOOL_NAME,
          dni: normalized.dni,
          active: true
        })
        .eq("id", existingStudent.id)
    ]);

    if (profileError) throw profileError;
    if (studentError) throw studentError;
    return "updated" as const;
  }

  const profileId = await createStudentAuthUser(serviceClient, normalized.dni, normalized.fullName);

  const { error: profileInsertError } = await serviceClient.from("profiles").upsert(
    {
      id: profileId,
      full_name: normalized.fullName,
      role: "student"
    },
    { onConflict: "id" }
  );

  if (profileInsertError) {
    await serviceClient.auth.admin.deleteUser(profileId);
    throw profileInsertError;
  }

  const { error: studentInsertError } = await serviceClient.from("students").insert({
    profile_id: profileId,
    school_name: SCHOOL_NAME,
    grade: normalized.grade,
    age: normalized.age,
    dni: normalized.dni,
    active: true
  });

  if (studentInsertError) {
    await serviceClient.auth.admin.deleteUser(profileId);
    throw studentInsertError;
  }

  return "created" as const;
}

export async function createStudentForTeacher(input: unknown, teacherId: string) {
  await assertTeacherCanManageStudents(teacherId);
  const parsed = studentSchema.parse(input);
  const serviceClient = getServiceClientOrThrow();
  const status = await upsertStudentByDni(serviceClient, parsed);

  return { status };
}

export async function importStudentsFromCsv(file: File, teacherId: string): Promise<CsvImportResult> {
  await assertTeacherCanManageStudents(teacherId);

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("El archivo supera el límite de 2MB.");
  }

  const students = await parseStudentsFile(file);
  const serviceClient = getServiceClientOrThrow();
  const result: CsvImportResult = {
    created: 0,
    updated: 0,
    failed: 0,
    errors: []
  };

  for (let index = 0; index < students.length; index += 1) {
    try {
      const status = await upsertStudentByDni(serviceClient, students[index]);
      if (status === "created") {
        result.created += 1;
      } else {
        result.updated += 1;
      }
    } catch (error) {
      result.failed += 1;
      const message = error instanceof Error ? error.message : "Error inesperado";
      result.errors.push(`Fila ${index + 2}: ${message}`);
    }
  }

  return result;
}

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
