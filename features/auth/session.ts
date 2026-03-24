import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/domain";

export type CurrentSession = {
  userId: string | null;
  role: Role | null;
  fullName: string | null;
};

export async function getCurrentSession(): Promise<CurrentSession> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, role: null, fullName: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    role: (profile?.role as Role | null) ?? null,
    fullName: profile?.full_name ?? null
  };
}

export async function requireRole(roles: Role[]) {
  const session = await getCurrentSession();

  if (!session.userId || !session.role || !roles.includes(session.role)) {
    redirect("/acceso");
  }

  return session;
}

export async function getStudentAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}
