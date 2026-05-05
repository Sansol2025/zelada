import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const activityCompletionSchema = z.object({
  student_id: z.string().uuid(),
  activity_id: z.string().uuid(),
  score: z.coerce.number().min(0).max(100).optional(),
  time_spent_seconds: z.coerce.number().int().min(0).default(0),
  response_json: z.record(z.string(), z.unknown()).optional()
});

export async function completeStudentActivity(payload: unknown) {
  const parsed = activityCompletionSchema.parse(payload);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("complete_activity_and_recalculate_progress", {
    p_student_id: parsed.student_id,
    p_activity_id: parsed.activity_id,
    p_score: parsed.score ?? null,
    p_time_spent_seconds: parsed.time_spent_seconds,
    p_response_json: parsed.response_json ?? {}
  });

  if (error) throw error;
  
  // Revalidar las páginas del estudiante para asegurar progreso actualizado
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/estudiante", "layout");
  
  return data;
}
