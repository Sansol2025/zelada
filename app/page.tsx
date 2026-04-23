import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { ArrowRight, CheckCircle2, HeartHandshake, School, ShieldCheck, Sparkles } from "lucide-react";

import { AccessibilityPanel } from "@/components/accessibility-panel";
import { BigActionButton } from "@/components/big-action-button";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_SUBTITLE, SCHOOL_NAME } from "@/lib/constants";

const pillars = [
  {
    title: "Accesibilidad real",
    description: "Lectura asistida, alto contraste, texto grande y navegación guiada por pasos."
  },
  {
    title: "Autonomía docente",
    description: "Creación libre de materias, módulos y actividades sin currícula rígida."
  },
  {
    title: "Seguimiento familiar",
    description: "Visualización simple del avance para acompañar desde el hogar."
  }
];

const highlights = [
  "Ingreso sin barreras por QR o enlace mágico",
  "Avance secuencial con módulos bloqueados/desbloqueados",
  "Experiencia infantil clara, visual y con feedback positivo",
  "Arquitectura moderna lista para escalar con Next.js + Supabase"
];

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${APP_NAME} | Educación Inclusiva Digital`,
  description: `Plataforma educativa moderna para la ${SCHOOL_NAME}. Diseñada para la inclusión, autonomía docente y seguimiento familiar efectivo.`
};

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <div className="animate-in mx-auto max-w-7xl px-4 py-8 md:py-12">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[2.5rem] border border-academic-gold/10 bg-white/70 px-6 py-4 shadow-sm backdrop-blur-xl transition-all duration-500 hover:bg-white/90">
          <div>
            <p className="font-display text-3xl font-extrabold tracking-tight text-academic-navy">{APP_NAME}</p>
            <p className="text-sm font-medium text-academic-gold/80">{APP_SUBTITLE}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/acceso">
              <Button className="rounded-full bg-academic-navy px-8 py-6 text-base font-bold shadow-md hover:translate-y-[-2px]" size="lg">
                Ingresar
              </Button>
            </Link>
            <Link href="/proyecto">
              <Button className="rounded-full border-2 border-academic-gold/20 bg-white px-8 py-6 text-base font-bold text-academic-navy hover:bg-academic-ivory" variant="outline" size="lg">
                El Proyecto
              </Button>
            </Link>
          </div>
        </header>

        <section className="mt-12 grid gap-10 rounded-[3rem] border border-academic-gold/5 bg-gradient-to-br from-white/80 to-academic-ivory/30 p-8 shadow-card ring-1 ring-black/5 backdrop-blur-sm lg:grid-cols-[1.1fr,0.9fr] lg:p-12">
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-academic-gold/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#a8863a]">
                <Sparkles className="h-4 w-4" />
                Innovación Pedagógica Inclusiva
              </span>
              <h1 className="mt-6 font-display text-4xl font-black leading-[1.05] tracking-tight text-academic-navy md:text-6xl lg:text-7xl xl:text-[clamp(3.5rem,8vw,5.5rem)]">
                Educación sin <br />
                <span className="text-academic-gold">barreras.</span>
              </h1>
            </div>
            
            <p className="max-w-prose text-lg font-medium leading-relaxed text-academic-slate md:text-xl">
              Un entorno digital diseñado para que cada estudiante avance a su ritmo, desapareciendo las dificultades técnicas y priorizando el aprendizaje continuo.
            </p>

            <div className="flex flex-wrap items-center gap-6 py-4">
              <div className="flex items-center -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 w-12 rounded-full border-4 border-white bg-academic-ivory flex items-center justify-center text-academic-navy font-bold text-xs ring-1 ring-academic-gold/20 shadow-sm overflow-hidden relative">
                    <Image 
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 10}`} 
                      alt="Student" 
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xl font-black text-academic-navy tracking-tight">+500 Estudiantes</p>
                <p className="text-sm font-bold text-academic-gold uppercase tracking-widest">Aprendiendo hoy</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 border-l-4 border-academic-gold bg-academic-gold/5 py-4 pl-6 pr-8 rounded-r-2xl">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-academic-gold">Institución de Referencia</p>
                <p className="font-display text-lg font-bold text-academic-navy tracking-tight">{SCHOOL_NAME}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/acceso" className="group">
                <BigActionButton 
                  icon={<ArrowRight className="h-6 w-6" />} 
                  subtitle="Comenzar mi recorrido"
                  className="bg-academic-navy transition-all duration-300 group-hover:shadow-premium group-hover:scale-105"
                >
                  Plataforma
                </BigActionButton>
              </Link>
              <Link href="/acceso?mode=qr" className="group">
                <BigActionButton
                  variant="secondary"
                  icon={<ShieldCheck className="h-6 w-6" />}
                  subtitle="Acceso por código QR"
                  className="bg-academic-gold transition-all duration-300 group-hover:shadow-premium group-hover:scale-105"
                >
                  Ingreso Rápido
                </BigActionButton>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <AccessibilityPanel />
            <div className="relative group overflow-hidden rounded-[2.5rem] bg-academic-navy p-10 text-white shadow-2xl transition-all hover:shadow-premium">
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-academic-gold/20 blur-3xl transition-all group-hover:bg-academic-gold/40"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                    <CheckCircle2 className="h-6 w-6 text-academic-gold" />
                  </div>
                  <p className="font-display text-2xl font-black tracking-tight">Metodología Secuencial</p>
                </div>
                <p className="text-white/70 text-lg font-medium leading-relaxed">
                  Nuestra arquitectura permite un aprendizaje fluido y predecible, donde el contenido se adapta al progreso real, evitando la frustración y premiando el esfuerzo.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-8 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="group flex flex-col justify-between rounded-[2.5rem] border border-academic-gold/5 bg-white p-10 shadow-card transition-all duration-500 hover:shadow-premium hover:-translate-y-2">
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-academic-ivory text-academic-gold transition-all duration-300 group-hover:bg-academic-navy group-hover:text-white">
                  <School className="h-7 w-7" />
                </div>
                <h2 className="font-display text-3xl font-black tracking-tight text-academic-navy">{pillar.title}</h2>
                <p className="mt-4 text-lg font-medium leading-relaxed text-academic-slate">{pillar.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-24 rounded-[3.5rem] border border-academic-gold/5 bg-white p-10 shadow-premium md:p-16 lg:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <School className="h-64 w-64" />
          </div>
          
          <div className="relative z-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-academic-gold mb-4">
                <HeartHandshake className="h-6 w-6" />
                <span className="text-sm font-black uppercase tracking-widest">Nuestro Compromiso</span>
              </div>
              <h3 className="font-display text-4xl font-black text-academic-navy leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">Acompañamiento pedagógico integral</h3>
            </div>
            <Link href="/proyecto" className="shrink-0">
              <Button variant="outline" className="h-16 rounded-2xl border-academic-gold/20 bg-academic-ivory text-academic-navy px-8 font-black shadow-sm transition-all hover:bg-academic-gold hover:text-white hover:border-academic-gold" size="lg">
                El Proyecto <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <ul className="grid gap-8 md:grid-cols-2">
            {highlights.map((item) => (
              <li className="flex items-start gap-5 text-xl font-medium text-academic-slate transition-all hover:translate-x-2" key={item}>
                <div className="mt-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-academic-forest/10 text-academic-forest shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-24 flex flex-col items-center gap-12 overflow-hidden rounded-[3rem] border border-academic-navy/5 bg-academic-navy p-12 lg:p-16 text-white text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-10">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-academic-gold text-academic-navy shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                <School className="h-8 w-8" />
              </div>
              <div>
                <p className="font-display text-3xl font-black tracking-tight">{SCHOOL_NAME}</p>
                <p className="text-sm font-bold uppercase tracking-widest text-academic-gold">Escuela Primaria N° 361 • La Rioja</p>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
               <div className="flex gap-4">
                  <div className="rounded-xl bg-white/5 px-4 py-2 border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-tighter text-white/40">Iniciativa</p>
                    <p className="text-xs font-bold">Ministerio de Educación</p>
                  </div>
                  <div className="rounded-xl bg-white/5 px-4 py-2 border border-white/10 backdrop-blur-md text-academic-gold">
                    <p className="text-[10px] font-black uppercase tracking-tighter text-white/40">Certificado</p>
                    <p className="text-xs font-bold">Inclusión Digital 2025</p>
                  </div>
               </div>
               <p className="max-w-md text-sm font-medium leading-relaxed text-white/60">
                Educar es incluir. Una plataforma de alto impacto de la <span className="text-white font-black">Provincia de La Rioja</span> para transformar el futuro de cada riojano.
              </p>
            </div>
          </div>
          
          <div className="w-full h-px bg-white/10"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6 text-xs font-bold uppercase tracking-widest text-white/30">
            <p>&copy; 2025 {APP_NAME}. Todos los derechos reservados.</p>
            <div className="flex gap-8">
              <Link href={"/privacy" as Route} className="hover:text-white transition-colors">Privacidad</Link>
              <Link href={"/terms" as Route} className="hover:text-white transition-colors">Términos</Link>
              <Link href={"/contacto" as Route} className="hover:text-white transition-colors">Soporte</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
