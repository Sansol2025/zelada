import fs from "fs";
import path from "path";
import Image from "next/image";
import { QrCode, User, School } from "lucide-react";

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
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 flex flex-col items-center justify-center bg-academic-ivory">
      <section className="mx-auto mb-10 max-w-xl text-center">
        {logoSrc ? (
          <div className="mx-auto mb-8 w-44 sm:w-52">
            <Image
              src={logoSrc}
              alt="Logo de la Escuela"
              width={420}
              height={420}
              className="h-auto w-full drop-shadow-2xl transition-transform hover:scale-105"
              priority
            />
          </div>
        ) : (
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-academic-navy text-academic-gold shadow-lg rotate-3">
             <School className="h-12 w-12" />
          </div>
        )}

        <h1 className="font-display text-4xl font-black text-academic-navy tracking-tight md:text-6xl">¡Hola, Estudiante! 👋</h1>
        <p className="mt-4 text-xl font-medium text-academic-slate leading-relaxed">
          Ingresa tus datos para empezar a jugar y aprender.
        </p>
        {grado && (
          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-academic-gold/10 px-6 py-2 text-sm font-black uppercase tracking-widest text-[#a8863a] border border-academic-gold/10">
            <QrCode className="h-5 w-5" /> Estás ingresando al grado {grado}
          </div>
        )}
      </section>

      {errorMessage ? (
        <section className="mx-auto mb-8 w-full max-w-md rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-black text-rose-800 uppercase tracking-widest text-center shadow-sm">
          {errorMessage}
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-md">
        <Card className="space-y-8 rounded-[3rem] border border-academic-gold/5 shadow-premium bg-white p-10">
          <div className="flex items-center gap-4 text-academic-navy justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-academic-ivory text-academic-gold border border-academic-gold/10">
              <User className="h-8 w-8" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-black text-academic-navy tracking-tight uppercase">Tus datos</CardTitle>
            <CardText className="text-academic-slate font-medium italic mt-2 opacity-60">Escribe tu primer nombre y número de DNI</CardText>
          </div>
          
          <form action={studentLoginAction} className="space-y-6">
            {grado && <input type="hidden" name="grado" value={grado} />}
            <div className="space-y-2">
              <label htmlFor="first_name" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">Primer Nombre</label>
              <input
                id="first_name"
                className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 px-6 text-xl font-black text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm"
                name="first_name"
                placeholder="Ejemplo: Juan"
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="dni" className="text-[10px] font-black uppercase tracking-widest text-academic-gold ml-2">DNI</label>
              <input
                id="dni"
                className="h-16 w-full rounded-2xl border border-academic-gold/10 bg-academic-ivory/50 px-6 text-xl font-black text-academic-navy focus:border-academic-gold focus:bg-white focus:outline-none transition-all shadow-sm"
                name="dni"
                placeholder="Sin puntos ni espacios"
                required
                type="text"
                autoComplete="off"
              />
            </div>
            
            <button className="h-20 w-full rounded-[2rem] bg-academic-navy text-xl font-black tracking-tight hover:scale-105 active:scale-95 shadow-2xl shadow-academic-navy/30 transition-all text-white border-none mt-6" type="submit">
              Entrar a mi perfil
            </button>
          </form>
        </Card>
      </section>
    </main>
  );
}
