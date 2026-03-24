import { NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL("/acceso", request.url));
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  return response;
}
