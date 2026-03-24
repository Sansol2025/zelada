import { NextResponse } from "next/server";

function parseToken(value: string) {
  if (!value) return null;
  try {
    if (value.startsWith("http")) {
      const url = new URL(value);
      const parts = url.pathname.split("/").filter(Boolean);
      return parts[parts.length - 1] ?? null;
    }
  } catch {
    // Ignore parse error and fallback.
  }
  return value.trim();
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const raw = String(formData.get("token_or_url") ?? "");
  const token = parseToken(raw);

  if (!token) {
    return NextResponse.redirect(new URL("/acceso?error=token_invalido", request.url));
  }

  return NextResponse.redirect(new URL(`/api/access/activate?token=${encodeURIComponent(token)}`, request.url));
}
