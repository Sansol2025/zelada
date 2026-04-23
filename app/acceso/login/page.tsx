import { ArrowLeft, Lock, Mail, School, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { APP_NAME, SCHOOL_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Ingreso Administrativo | ${APP_NAME}`,
  description: "Acceso seguro para docentes y personal administrativo."
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = params.error;

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col justify-center py-12 md:py-20 px-4 bg-academic-ivory">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-[45vh] bg-academic-navy rounded-b-[4rem] shadow-2xl">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-academic-gold/30 blur-3xl"></div>
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-academic-gold/10 blur-3xl"></div>
      </div>

      <div className="mx-auto w-full max-w-4xl relative z-10 flex flex-col justify-center">
      
      <Link href="/acceso" className="mb-8 self-center">
        <Button variant="ghost" className="rounded-full text-white/60 font-bold hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
        </Button>
      </Link>

      {errorMessage && (
        <section className="mx-auto mb-8 max-w-md w-full animate-in rounded-2xl border-l-4 border-red-500 bg-red-50 px-6 py-4 text-sm font-bold text-red-900 shadow-sm">
          Fallo de ingreso. Verifica tu correo y contraseña.
        </section>
      )}

      <Card className="animate-in mx-auto w-full max-w-md overflow-hidden border-academic-gold/10 bg-white/80 p-8 shadow-premium backdrop-blur-md">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-academic-navy text-academic-gold shadow-lg">
            <Lock className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-academic-navy">Administración</CardTitle>
          <CardText className="mt-2 text-sm font-medium text-academic-slate">
            Ingreso para docentes de la {SCHOOL_NAME}
          </CardText>
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
                placeholder="nombre@escuela.com"
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

          <Button type="submit" className="h-16 w-full rounded-2xl bg-academic-navy text-white font-black text-lg shadow-lg hover:translate-y-[-2px] transition-all">
            Ingresar ahora
          </Button>
        </form>
        
        <div className="mt-8 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-academic-forest" />
          <span className="text-[10px] font-black uppercase tracking-widest text-academic-forest">Sesión Encriptada</span>
        </div>
      </Card>

      <footer className="mt-12 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-academic-slate/40 flex items-center justify-center gap-2">
          <School className="h-4 w-4" /> {SCHOOL_NAME} • 2025
        </p>
      </footer>
      </div>
    </main>
  );
}
