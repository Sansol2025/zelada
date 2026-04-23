import { ArrowRight, QrCode, School, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Metadata, Route } from "next";

import { BigActionButton } from "@/components/big-action-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME, SCHOOL_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Acceso | ${APP_NAME}`,
  description: "Portal de ingreso seguro para estudiantes, docentes y familias."
};

interface AccesoPageProps {
  searchParams: Promise<{ error?: string; mode?: string }>;
}

export default async function AccesoPage({ searchParams }: AccesoPageProps) {
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
      
      {/* ERROR MESSAGE */}
      {errorMessage && (
        <section className="mx-auto mb-8 max-w-xl w-full animate-in rounded-2xl border-l-4 border-red-500 bg-red-50 px-6 py-4 text-sm font-bold text-red-900 shadow-sm">
          {errorMessage === "CredentialsSignin" 
            ? "El acceso falló. Por favor verifica tus datos."
            : "Hubo un problema al intentar ingresar. Revisa tu conexión."}
        </section>
      )}

      <Card className="animate-in mx-auto w-full max-w-xl overflow-hidden border-academic-gold/10 bg-white/80 p-8 shadow-premium backdrop-blur-md sm:p-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-academic-navy text-academic-gold shadow-lg rotate-3">
            <School className="h-12 w-12" />
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight text-academic-navy sm:text-5xl lg:text-[clamp(2.5rem,5vw,3.5rem)]">
            ¡Hola de nuevo!
          </h1>
          <p className="mt-4 text-lg font-medium text-academic-slate leading-relaxed">
            Selecciona cómo quieres ingresar hoy para comenzar tu recorrido escolar.
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-full bg-academic-forest/10 px-4 py-1.5 border border-academic-forest/10">
            <ShieldCheck className="h-4 w-4 text-academic-forest" />
            <span className="text-[10px] font-black uppercase tracking-widest text-academic-forest">Conexión Segura & Privada</span>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4">
          <Link href="/acceso?mode=qr" className="group">
            <BigActionButton 
              icon={<QrCode className="h-7 w-7" />} 
              subtitle="Escanear mi tarjeta escolar"
              className="bg-academic-navy transition-all duration-300 group-hover:shadow-premium group-hover:scale-[1.02]"
            >
              Acceso por QR
            </BigActionButton>
          </Link>
          
          <Link href="/acceso?mode=link" className="group">
            <BigActionButton 
              variant="secondary"
              icon={<Sparkles className="h-7 w-7" />} 
              subtitle="Usar mi enlace mágico"
              className="bg-academic-gold transition-all duration-300 group-hover:shadow-premium group-hover:scale-[1.02]"
            >
              Enlace Mágico
            </BigActionButton>
          </Link>

          <div className="mt-8 flex flex-col gap-3">
            <div className="relative h-px bg-academic-gold/10 w-full mb-4">
               <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-academic-gold/40">O ACCESO PERSONAL</span>
            </div>
            
            <Link href={"/acceso/login" as Route}>
              <Button variant="ghost" className="w-full text-academic-navy font-bold hover:bg-academic-ivory h-14 rounded-2xl group border border-transparent hover:border-academic-gold/10">
                Panel Administrativo <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
