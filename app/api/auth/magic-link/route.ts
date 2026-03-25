import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function redirectAfterPost(url: URL) {
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/familia");
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=${encodeURIComponent(
    redirectTo
  )}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl
    }
  });

  if (error) {
    return redirectAfterPost(new URL(`/acceso?error=${encodeURIComponent(error.message)}`, request.url));
  }

  return redirectAfterPost(new URL("/acceso?success=link_enviado", request.url));
}
