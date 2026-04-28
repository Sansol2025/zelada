import { getStudentAssignedSubjects, getStudentGlobalProgress } from "./features/student/queries";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: students } = await supabase.from("students").select("id").limit(1);
  const studentId = students![0].id;
  
  const assigned = await getStudentAssignedSubjects(studentId);
  console.log("Assigned:", JSON.stringify(assigned, null, 2));
  
  const global = await getStudentGlobalProgress(studentId);
  console.log("Global:", global);
}
main();
