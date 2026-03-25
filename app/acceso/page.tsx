import fs from "node:fs";
import path from "node:path";

import Image from "next/image";
import Link from "next/link";
import { Card, CardText, CardTitle } from "@/components/ui/card";

type AccessPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    success?: string | string[];
  }>;
};

const SCHOOL_LOGO_CANDIDATES = [
  "/logo-escuela.png",
  "/logo-escuela.jpg",
  "/logo-escuela.jpeg",
  "/logo-escuela.webp",
  "/logo-escuela.svg"
] as const;

function getSchoolLogoSrc() {
  for (const candidate of SCHOOL_LOGO_CANDIDATES) {
    const filePath = path.join(process.cwd(), "public", candidate.slice(1));
    if (fs.existsSync(filePath)) return candidate;
  }
  return null;
}

function readQueryValue(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "";
  try {
    return decodeURIComponent(raw).replace(/\+/g, " ");
  } catch {
    return raw;
  }
}

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = readQueryValue(resolvedSearchParams?.error);
  const successValue = readQueryValue(resolvedSearchParams?.success);
  const successMessage = successValue === "link_enviado" ? "Enlace enviado. Revisa tu correo." : successValue;
  const logoSrc = getSchoolLogoSrc();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      <section className="mx-auto mb-8 max-w-xl text-center">
        {logoSrc ? (
          <div className="mx-auto mb-5 w-44 sm:w-52">
            <Image
              src={logoSrc}
              alt="Logo de la Escuela N° 361 Expedicion Auxiliar Zelada Davila"
              width={420}
              height={420}
              className="h-auto w-full"
              priority
            />
          </div>
        ) : (
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-center text-xs font-bold text-brand-900">
            ESC. 361
          </div>
        )}

        <h1 className="font-display text-4xl font-extrabold text-brand-950">Ingreso a Aprender Sin Barreras</h1>
        <p className="mt-3 text-brand-700">
          Docentes y familias ingresan con su correo y contraseña.
        </p>
        <p className="mt-1 text-sm text-brand-600">Los estudiantes ingresan directamente desde su QR o enlace.</p>
      </section>

      {errorMessage ? (
        <section className="mx-auto mb-6 max-w-xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </section>
      ) : null}

      {successMessage ? (
        <section className="mx-auto mb-6 max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </section>
      ) : null}

      <section className="mx-auto max-w-xl">
        <Card className="space-y-4">
          <div>
            <CardTitle className="text-lg">Ingreso único</CardTitle>
            <CardText>
              Usa el correo y contraseña de tu cuenta. El sistema te enviará automáticamente al panel correcto según tu rol.
            </CardText>
          </div>
          <form action="/api/auth/signin" className="space-y-3" method="POST">
            <input
              className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm"
              name="email"
              placeholder="correo@escuela.edu.ar"
              required
              type="email"
            />
            <input
              className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm"
              name="password"
              placeholder="Contraseña"
              required
              type="password"
            />
            <input name="redirectTo" type="hidden" value="/acceso" />
            <button className="h-12 w-full rounded-xl bg-brand-500 font-semibold text-white" type="submit">
              Ingresar
            </button>
          </form>
          <p className="text-xs text-brand-600">
            Estudiantes: ingresan escaneando el QR o abriendo su enlace de acceso directo.
          </p>
          <Link className="inline-block text-sm font-semibold text-brand-700 underline" href="/">
            Volver al inicio
          </Link>
        </Card>
      </section>
    </main>
  );
}
