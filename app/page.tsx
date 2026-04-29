import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { ArrowRight, BookOpen, CheckCircle2, Eye, HeartHandshake, School, Sparkles } from "lucide-react";

import { BigActionButton } from "@/components/big-action-button";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_SUBTITLE, SCHOOL_NAME } from "@/lib/constants";

const pillars = [
  {
    title: "Accesibilidad real",
    description: "Lectura asistida, alto contraste, texto grande y navegación guiada por pasos.",
    Icon: Eye,
    iconClass: "bg-sky-100 text-sky-600 group-hover:bg-sky-500 group-hover:text-white",
    topBorder: "border-t-4 border-t-sky-300"
  },
  {
    title: "Autonomía docente",
    description: "Creación libre de materias, módulos y actividades sin currícula rígida.",
    Icon: BookOpen,
    iconClass: "bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
    topBorder: "border-t-4 border-t-amber-300"
  },
  {
    title: "Seguimiento familiar",
    description: "Visualización simple del avance para acompañar desde el hogar.",
    Icon: HeartHandshake,
    iconClass: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
    topBorder: "border-t-4 border-t-emerald-300"
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
      <div className="animate-in mx-auto max-w-7xl px-4 py-4 md:py-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[2.5rem] border border-academic-gold/10 bg-white/70 px-5 py-3 shadow-sm backdrop-blur-xl transition-all duration-500 hover:bg-white/90">
          <div className="flex items-center gap-4">
            <Image 
              src="/logo1.png" 
              alt="Logo Escuela" 
              width={48} 
              height={48} 
              className="rounded-xl shadow-sm"
            />
            <div>
              <p className="font-display text-xl font-extrabold tracking-tight text-academic-navy">{APP_NAME}</p>
              <p className="text-[10px] font-medium text-academic-gold/80">{APP_SUBTITLE}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/acceso/login">
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

        <section className="mt-8 grid gap-6 rounded-[2.5rem] border border-academic-gold/5 bg-gradient-to-br from-white/80 to-academic-ivory/30 p-6 shadow-card ring-1 ring-black/5 backdrop-blur-sm lg:grid-cols-[1.1fr,0.9fr] lg:p-8">
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-academic-gold/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#a8863a]">
                <Sparkles className="h-4 w-4" />
                Innovación Pedagógica Inclusiva
              </span>
              <h1 className="mt-4 font-display text-3xl font-black leading-[1.05] tracking-tight text-academic-navy md:text-5xl lg:text-6xl xl:text-[clamp(3rem,6vw,4.5rem)]">
                Educación sin <br />
                <span className="text-academic-gold">barreras.</span>
              </h1>
            </div>
            
            <p className="max-w-prose text-lg font-medium leading-relaxed text-academic-slate md:text-xl">
              Un entorno digital diseñado para que cada estudiante avance a su ritmo, desapareciendo las dificultades técnicas y priorizando el aprendizaje continuo.
            </p>

            <div className="flex items-center gap-4 border-l-4 border-academic-gold bg-academic-gold/5 py-4 pl-6 pr-8 rounded-r-2xl">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-academic-gold">Institución de Referencia</p>
                <p className="font-display text-lg font-bold text-academic-navy tracking-tight">{SCHOOL_NAME}</p>
              </div>
            </div>

            <div className="max-w-md">
              <Link href="/acceso/login" className="group">
                <BigActionButton 
                  icon={<ArrowRight className="h-6 w-6" />} 
                  className="bg-academic-navy transition-all duration-300 group-hover:shadow-premium group-hover:scale-105"
                >
                  Plataforma
                </BigActionButton>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-6 justify-center">
            <div className="relative group overflow-hidden rounded-[2.5rem] bg-academic-navy p-6 text-white shadow-2xl transition-all hover:shadow-premium h-full flex flex-col justify-center">
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-academic-gold/20 blur-3xl transition-all group-hover:bg-academic-gold/40"></div>
              <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-sky-500/10 blur-2xl"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white p-3 shadow-xl ring-4 ring-white/10">
                  <Image src="/logo1.png" alt="Logo" fill className="object-contain p-1.5" />
                </div>
                <h3 className="font-display text-2xl font-black tracking-tight mb-4">Metodología Secuencial</h3>
                <p className="text-white/70 text-base font-medium leading-relaxed max-w-xs">
                  Nuestra arquitectura permite un aprendizaje fluido y predecible, donde el contenido se adapta al progreso real, evitando la frustración y premiando el esfuerzo.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className={`animate-up stagger-${index + 1} group flex flex-col justify-between overflow-hidden rounded-[2rem] border border-academic-gold/5 bg-white shadow-card transition-all duration-500 hover:shadow-premium hover:-translate-y-1 ${pillar.topBorder}`}
            >
              <div className="p-6">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-[1rem] transition-all duration-300 ${pillar.iconClass}`}>
                  <pillar.Icon className="h-6 w-6" />
                </div>
                <h2 className="font-display text-2xl font-black tracking-tight text-academic-navy">{pillar.title}</h2>
                <p className="mt-3 text-base font-medium leading-relaxed text-academic-slate">{pillar.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-16 rounded-[2.5rem] border border-academic-gold/5 bg-white p-8 shadow-premium md:p-10 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <School className="h-48 w-48" />
          </div>
          
          <div className="relative z-10 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 text-academic-gold mb-3">
                <HeartHandshake className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">Nuestro Compromiso</span>
              </div>
              <h3 className="font-display text-3xl font-black text-academic-navy leading-[1.1] tracking-tight md:text-4xl lg:text-5xl">Acompañamiento pedagógico integral</h3>
            </div>
            <Link href="/proyecto" className="shrink-0">
              <Button variant="outline" className="h-14 rounded-xl border-academic-gold/20 bg-academic-ivory text-academic-navy px-6 font-black shadow-sm transition-all hover:bg-academic-gold hover:text-white hover:border-academic-gold" size="lg">
                El Proyecto <ArrowRight className="ml-3 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <ul className="grid gap-8 md:grid-cols-2">
            {highlights.map((item, index) => (
              <li className={`animate-up stagger-${index + 1} flex items-start gap-5 text-xl font-medium text-academic-slate transition-all hover:translate-x-2`} key={item}>
                <div className="mt-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-academic-forest/10 text-academic-forest shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-16 flex flex-col items-center gap-8 overflow-hidden rounded-[2.5rem] border border-academic-navy/5 bg-academic-navy p-8 lg:p-10 text-white text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-10">
            <div className="flex items-center gap-6">
              <div className="relative h-16 w-16 overflow-hidden rounded-[1.5rem] bg-white p-2 shadow-lg rotate-3 group-hover:rotate-0 transition-transform flex items-center justify-center">
                <Image 
                  src="/logo1.png" 
                  alt="Logo Escuela" 
                  fill
                  className="object-contain p-2"
                />
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
