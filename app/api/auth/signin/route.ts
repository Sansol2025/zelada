import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/acceso");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return NextResponse.redirect(new URL(`/acceso?error=${encodeURIComponent(error.message)}`, request.url));
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
