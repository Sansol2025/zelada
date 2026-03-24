import { createClient } from "@/lib/supabase/server";

export async function getApiSession() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  return {
    supabase,
    user,
    role: profile?.role ?? null,
    fullName: profile?.full_name ?? null
  };
}
