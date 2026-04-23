import type { Metadata } from "next";
import Link from "next/link";
import { BookMarked, ChartNoAxesCombined, School, ShieldCheck, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_NAME, APP_SUBTITLE, SCHOOL_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Sobre el Proyecto | ${APP_NAME}`,
  description: `Conoce la visión y metodología pedagógica detrás de Aprender Sin Barreras en la ${SCHOOL_NAME}.`
};

export default function ProjectInfoPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-12 md:py-16">
      <header className="animate-in rounded-[3rem] border border-academic-gold/10 bg-white p-10 shadow-card md:p-16 lg:p-20">
        <div className="flex items-center gap-3 text-academic-gold mb-6">
          <Sparkles className="h-6 w-6" />
          <span className="text-sm font-black uppercase tracking-widest text-[#a8863a]">Nuestra Visión Pedagógica</span>
        </div>
        <h1 className="font-display text-4xl font-black tracking-tight text-academic-navy md:text-6xl lg:text-[clamp(3rem,7vw,5rem)] leading-[1.05]">
          {APP_NAME}
        </h1>
        <p className="mt-6 text-xl font-medium text-academic-slate max-w-prose leading-relaxed">
          {APP_SUBTITLE}
        </p>
        <div className="mt-10 inline-flex items-center gap-4 rounded-2xl bg-academic-ivory border border-academic-gold/10 px-6 py-3 text-base font-bold text-academic-navy shadow-sm">
          <School className="h-5 w-5 text-academic-gold" />
          {SCHOOL_NAME}
        </div>
      </header>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <article className="animate-in rounded-[2.5rem] border border-academic-gold/5 bg-white p-10 shadow-card transition-all duration-500 hover:shadow-premium hover:-translate-y-2" style={{ animationDelay: "0.1s" }}>
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-academic-ivory text-academic-gold">
            <Users className="h-7 w-7" />
          </div>
          <h2 className="mb-4 font-display text-3xl font-black tracking-tight text-academic-navy">
            Enfoque inclusivo
          </h2>
          <p className="text-lg font-medium leading-relaxed text-academic-slate">
            La plataforma está diseñada para estudiantes con diferentes capacidades, priorizando navegación guiada, consignas cortas, audio de apoyo y legibilidad optimizada.
          </p>
        </article>

        <article className="animate-in rounded-[2.5rem] border border-academic-gold/5 bg-white p-10 shadow-card transition-all duration-500 hover:shadow-premium hover:-translate-y-2" style={{ animationDelay: "0.2s" }}>
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-academic-ivory text-academic-gold">
            <BookMarked className="h-7 w-7" />
          </div>
          <h2 className="mb-4 font-display text-3xl font-black tracking-tight text-academic-navy">
            Autonomía docente
          </h2>
          <p className="text-lg font-medium leading-relaxed text-academic-slate">
            Docentes crean materias, módulos y actividades personalizadas según objetivos reales del aula, sin currículas rígidas y con total libertad creativa.
          </p>
        </article>

        <article className="animate-in rounded-[2.5rem] border border-academic-gold/5 bg-white p-10 shadow-card transition-all duration-500 hover:shadow-premium hover:-translate-y-2" style={{ animationDelay: "0.3s" }}>
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-academic-ivory text-academic-gold">
            <ChartNoAxesCombined className="h-7 w-7" />
          </div>
          <h2 className="mb-4 font-display text-3xl font-black tracking-tight text-academic-navy">
            Seguimiento dinámico
          </h2>
          <p className="text-lg font-medium leading-relaxed text-academic-slate">
            Familias y docentes visualizan el progreso por actividad y módulo de forma clara, permitiendo una intervención temprana y positiva.
          </p>
        </article>

        <article className="animate-in rounded-[2.5rem] border border-academic-gold/5 bg-white p-10 shadow-card transition-all duration-500 hover:shadow-premium hover:-translate-y-2" style={{ animationDelay: "0.4s" }}>
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-academic-ivory text-academic-gold">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="mb-4 font-display text-3xl font-black tracking-tight text-academic-navy">
            Identidad riojana
          </h2>
          <p className="text-lg font-medium leading-relaxed text-academic-slate">
            Una plataforma desarrollada íntegramente en la provincia, para riojanos, con valores de inclusión local y excelencia técnica global.
          </p>
        </article>
      </section>

      <section className="mt-16 animate-in rounded-[3.5rem] bg-academic-navy p-10 text-white shadow-2xl md:p-16 relative overflow-hidden" style={{ animationDelay: "0.5s" }}>
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Sparkles className="h-64 w-64 text-academic-gold" />
        </div>
        <div className="relative z-10">
          <h3 className="mb-8 flex items-center gap-4 font-display text-4xl font-black tracking-tight">
            <Sparkles className="h-10 w-10 text-academic-gold" />
            Impacto Futuro
          </h3>
          <p className="text-xl font-medium leading-relaxed text-white/70 max-w-prose">
            Buscamos crear un estándar en educación primaria inclusiva, integrando lo mejor de la tecnología moderna con las necesidades reales de alumnos en La Rioja. Próximamente incorporaremos inteligencia artificial para soporte pedagógico personalizado.
          </p>
          <div className="mt-12 flex gap-6">
            <Link href="/acceso">
               <Button className="h-14 rounded-2xl bg-academic-gold text-academic-navy font-black shadow-lg hover:bg-white transition-all px-8">
                  Comenzar ahora
               </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <footer className="mt-20 text-center animate-in mb-12" style={{ animationDelay: "0.6s" }}>
        <Link href="/">
          <Button variant="ghost" className="text-academic-navy/60 hover:text-academic-navy hover:bg-academic-ivory font-black h-14 rounded-2xl px-8">
            ← Regresar al portal principal
          </Button>
        </Link>
        <div className="mt-8 flex items-center justify-center gap-2 opacity-30 grayscale">
           <School className="h-5 w-5" />
           <span className="text-xs font-black uppercase tracking-[0.2em]">{SCHOOL_NAME} • 2025</span>
        </div>
      </footer>
    </main>
  );
}
