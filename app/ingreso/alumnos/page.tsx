import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { QrCode, User } from "lucide-react";

import { Card, CardText, CardTitle } from "@/components/ui/card";
import { studentLoginAction } from "./actions";

type IngresoAlumnosPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    grado?: string | string[];
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

export default async function IngresoAlumnosPage({ searchParams }: IngresoAlumnosPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorMessage = readQueryValue(resolvedSearchParams?.error);
  const grado = readQueryValue(resolvedSearchParams?.grado);
  const logoSrc = getSchoolLogoSrc();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-soft-sky">
      <section className="mx-auto mb-8 max-w-xl text-center">
        {logoSrc ? (
          <div className="mx-auto mb-5 w-44 sm:w-52">
            <Image
              src={logoSrc}
              alt="Logo de la Escuela"
              width={420}
              height={420}
              className="h-auto w-full drop-shadow-xl transition-transform hover:scale-105"
              priority
            />
          </div>
        ) : (
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 shadow-lg text-center text-xs font-bold text-brand-900">
            Escuela
          </div>
        )}

        <h1 className="font-display text-4xl font-extrabold text-brand-950">¡Hola, Estudiante! 👋</h1>
        <p className="mt-3 text-lg font-medium text-brand-700">
          Ingresa tus datos para empezar a jugar y aprender.
        </p>
        {grado && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-bold text-brand-800">
            <QrCode className="h-4 w-4" /> Estás ingresando al grado {grado}
          </div>
        )}
      </section>

      {errorMessage ? (
        <section className="mx-auto mb-6 w-full max-w-md rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 text-center shadow-sm">
          {errorMessage}
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-md">
        <Card className="space-y-6 rounded-[2rem] border-none shadow-xl bg-white/80 p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 text-brand-900 justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
              <User className="h-6 w-6 text-brand-600" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold text-brand-900">Tus datos</CardTitle>
            <CardText className="text-brand-600">Escribe tu primer nombre y número de DNI</CardText>
          </div>
          
          <form action={studentLoginAction} className="space-y-5">
            {grado && <input type="hidden" name="grado" value={grado} />}
            <div>
              <label className="mb-1.5 block text-sm font-bold text-brand-900 pl-1">Primer Nombre</label>
              <input
                className="h-14 w-full rounded-2xl border border-brand-200 bg-brand-50/50 px-5 text-lg font-semibold text-brand-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                name="first_name"
                placeholder="Ejemplo: Juan"
                required
                autoComplete="off"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-brand-900 pl-1">DNI</label>
              <input
                className="h-14 w-full rounded-2xl border border-brand-200 bg-brand-50/50 px-5 text-lg font-semibold text-brand-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                name="dni"
                placeholder="Sin puntos ni espacios"
                required
                type="text"
                autoComplete="off"
              />
            </div>
            
            <button className="h-14 w-full rounded-2xl bg-brand-600 text-lg font-bold tracking-wide hover:bg-brand-500 shadow-xl shadow-brand-500/20 transition-all hover:-translate-y-1 text-white border-none mt-4" type="submit">
              Entrar a mi perfil
            </button>
          </form>
        </Card>
      </section>
    </main>
  );
}
