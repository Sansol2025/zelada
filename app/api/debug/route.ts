import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  
  if (!studentId) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: students } = await supabase.from("students").select("id, profiles(full_name)").limit(5);
    return NextResponse.json({ students });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const { data, error } = await supabase
    .from("student_subjects")
    .select(
      "subject_id, subjects ( id, title, description, color, icon, is_active ), student_subject_progress ( progress_percent, status, completed_modules, total_modules )"
    )
    .eq("student_id", studentId);

  return NextResponse.json({ data, error });
}
