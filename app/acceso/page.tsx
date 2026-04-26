import { Lock, Mail, QrCode, School, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME, SCHOOL_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Acceso | ${APP_NAME}`,
  description: "Portal de ingreso seguro para estudiantes, docentes y familias."
};

const SCHOOL_LOGO_CANDIDATES = [
  "/logo.png",
  "/logo-escuela.jpg",
  "/logo-escuela.jpeg",
  "/logo-escuela.webp",
  "/logo-escuela.svg"
] as const;

function getSchoolLogoSrc() {
  // In production (Vercel), using fs.existsSync with process.cwd() can be unreliable
  // for the public folder. We'll prioritize the known logo and fallback.
  try {
    for (const candidate of SCHOOL_LOGO_CANDIDATES) {
      const filePath = path.join(process.cwd(), "public", candidate.slice(1));
      if (fs.existsSync(filePath)) {
        console.log(`[DIAGNOSTIC] Logo found at: ${filePath}`);
        return candidate;
      }
    }
  } catch (error) {
    console.error("[DIAGNOSTIC] Error checking logo files:", error);
  }
  
  // Default fallback if we can't verify or none found
  return "/logo.png";
}

interface AccesoPageProps {
  searchParams: Promise<{ error?: string; success?: string; mode?: string }>;
}

export default async function AccesoPage({ searchParams }: AccesoPageProps) {
  const params = await searchParams;
  const errorMessage = params.error;
  const successMessage = params.success === "link_enviado" ? "Enlace enviado. Revisa tu correo." : params.success;

  console.log("[DIAGNOSTIC] AccesoPage Load - Error:", errorMessage);
  console.log("[DIAGNOSTIC] Supabase Config:", {
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });

  const logoSrc = getSchoolLogoSrc();

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col justify-center py-12 md:py-20 px-4 bg-academic-ivory">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-[45vh] bg-academic-navy rounded-b-[4rem] shadow-2xl">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-academic-gold/30 blur-3xl"></div>
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-academic-gold/10 blur-3xl"></div>
      </div>

      <div className="mx-auto w-full max-w-4xl relative z-10 flex flex-col justify-center">
      
      {/* ERROR & SUCCESS MESSAGES */}
      <div className="mx-auto mb-8 max-w-md w-full gap-4 flex flex-col">
        {errorMessage && (
          <section className="animate-in rounded-2xl border-l-4 border-red-500 bg-red-50 px-6 py-4 text-sm font-bold text-red-900 shadow-sm">
            {errorMessage === "CredentialsSignin" 
              ? "El acceso falló. Por favor verifica tus datos."
              : errorMessage}
          </section>
        )}
        {successMessage && (
          <section className="animate-in rounded-2xl border-l-4 border-academic-gold bg-academic-gold/10 px-6 py-4 text-sm font-bold text-academic-navy shadow-sm">
            {successMessage}
          </section>
        )}
      </div>

      <Card className="animate-in mx-auto w-full max-w-md overflow-hidden border-academic-gold/10 bg-white/90 p-8 shadow-premium backdrop-blur-md sm:p-10">
        <div className="flex flex-col items-center text-center">
          {logoSrc ? (
            <div className="mb-6 w-32 sm:w-40 flex justify-center">
              <img
                src={logoSrc}
                alt={SCHOOL_NAME}
                className="h-auto w-full drop-shadow-xl"
                loading="eager"
              />
            </div>
          ) : (
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-academic-navy text-academic-gold shadow-lg rotate-3">
              <School className="h-10 w-10" />
            </div>
          )}
          
          <h1 className="font-display text-3xl font-black tracking-tight text-academic-navy">
            Portal Académico
          </h1>
          <p className="mt-2 text-sm font-medium text-academic-slate">
            Docentes y Familias
          </p>

          <div className="mt-4 flex items-center gap-2 rounded-full bg-academic-forest/10 px-3 py-1 border border-academic-forest/10">
            <ShieldCheck className="h-3 w-3 text-academic-forest" />
            <span className="text-[9px] font-black uppercase tracking-widest text-academic-forest">Acceso Encriptado</span>
          </div>
        </div>

        <form action="/api/auth/signin" className="mt-8 space-y-5" method="POST">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-academic-navy/70 ml-2" htmlFor="email">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-academic-gold/50" />
              <input
                id="email"
                name="email"
                type="email"
                required
                className="h-14 w-full rounded-2xl border border-academic-navy/10 bg-academic-ivory/30 pl-11 pr-5 text-sm font-medium transition-all focus:border-academic-gold focus:bg-white focus:outline-none focus:ring-4 focus:ring-academic-gold/10"
                placeholder="nombre@correo.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-academic-navy/70 ml-2" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-academic-gold/50" />
              <input
                id="password"
                name="password"
                type="password"
                required
                className="h-14 w-full rounded-2xl border border-academic-navy/10 bg-academic-ivory/30 pl-11 pr-5 text-sm font-medium transition-all focus:border-academic-gold focus:bg-white focus:outline-none focus:ring-4 focus:ring-academic-gold/10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <input name="redirectTo" type="hidden" value="/acceso" />
          
          <Button type="submit" className="h-16 w-full rounded-2xl bg-academic-navy text-white font-black text-lg shadow-lg hover:translate-y-[-2px] transition-all hover:bg-academic-navy/90 active:scale-[0.98] border-none">
            Ingresar ahora
          </Button>
        </form>
        
        <div className="mt-8 flex flex-col gap-4">
          <div className="relative h-px bg-academic-gold/10 w-full">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[9px] font-black uppercase tracking-widest text-academic-gold/40">O ACCESO ESTUDIANTE</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link href="/acceso?mode=qr" className="w-full">
              <Button variant="ghost" className="w-full h-14 rounded-xl border border-academic-gold/10 bg-academic-ivory/50 text-academic-navy font-black text-[10px] uppercase tracking-widest hover:bg-white hover:border-academic-gold transition-all">
                <QrCode className="mr-2 h-4 w-4 text-academic-gold" /> Por QR
              </Button>
            </Link>
            <Link href="/acceso?mode=link" className="w-full">
              <Button variant="ghost" className="w-full h-14 rounded-xl border border-academic-gold/10 bg-academic-ivory/50 text-academic-navy font-black text-[10px] uppercase tracking-widest hover:bg-white hover:border-academic-gold transition-all">
                <Sparkles className="mr-2 h-4 w-4 text-academic-gold" /> Enlace
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <footer className="animate-in mt-16 flex flex-col items-center gap-6 text-center" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-academic-gold/40" />
          <School className="h-5 w-5 text-academic-gold opacity-50" />
          <div className="h-px w-12 bg-academic-gold/40" />
        </div>
        <p className="max-w-md text-sm font-medium leading-relaxed text-academic-slate">
          Una iniciativa de la <span className="text-academic-navy font-black">{SCHOOL_NAME}</span> para garantizar el derecho a la educación inclusiva en la <span className="text-academic-navy font-bold">Provincia de La Rioja</span>.
        </p>
        
        <div className="flex gap-4">
           <div className="rounded-lg bg-academic-navy/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-academic-navy/40 border border-academic-navy/5">
              Certificación 2025
           </div>
           <div className="rounded-lg bg-academic-navy/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-academic-navy/40 border border-academic-navy/5">
              SSL Protegido
           </div>
        </div>
      </footer>
      </div>
    </main>
  );
}
