import { BookMarked, ChartNoAxesCombined, ShieldCheck, Sparkles, Users } from "lucide-react";

import { APP_NAME, APP_SUBTITLE, SCHOOL_NAME } from "@/lib/constants";

export default function ProjectInfoPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <header className="rounded-3xl border border-brand-100 bg-white p-8 shadow-card">
        <h1 className="font-display text-4xl font-extrabold text-brand-950">{APP_NAME}</h1>
        <p className="mt-2 text-brand-700">{APP_SUBTITLE}</p>
        <p className="mt-2 text-sm text-brand-600">{SCHOOL_NAME}</p>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
          <h2 className="mb-2 flex items-center gap-2 font-display text-2xl font-bold text-brand-900">
            <Users className="h-5 w-5" />
            Enfoque inclusivo
          </h2>
          <p className="text-sm text-brand-700">
            La plataforma está diseñada para estudiantes de primaria con diferentes capacidades, priorizando navegación
            guiada, consignas cortas, audio de apoyo y lectura accesible.
          </p>
        </article>
        <article className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
          <h2 className="mb-2 flex items-center gap-2 font-display text-2xl font-bold text-brand-900">
            <BookMarked className="h-5 w-5" />
            Autonomía pedagógica
          </h2>
          <p className="text-sm text-brand-700">
            Docentes crean materias, módulos y actividades personalizadas según objetivos reales del aula, con avance
            secuencial configurable.
          </p>
        </article>
        <article className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
          <h2 className="mb-2 flex items-center gap-2 font-display text-2xl font-bold text-brand-900">
            <ChartNoAxesCombined className="h-5 w-5" />
            Seguimiento transparente
          </h2>
          <p className="text-sm text-brand-700">
            Familias y docentes visualizan progreso por actividad, módulo y materia, además de bloqueos y tiempo de
            dedicación.
          </p>
        </article>
        <article className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
          <h2 className="mb-2 flex items-center gap-2 font-display text-2xl font-bold text-brand-900">
            <ShieldCheck className="h-5 w-5" />
            Acceso sin barreras
          </h2>
          <p className="text-sm text-brand-700">
            Ingreso por QR y enlaces mágicos para estudiantes, evitando contraseñas complejas y reduciendo la fricción
            tecnológica.
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-brand-100 bg-soft-mint p-6">
        <h3 className="mb-2 flex items-center gap-2 font-display text-2xl font-bold text-emerald-900">
          <Sparkles className="h-5 w-5" />
          Resultado esperado
        </h3>
        <p className="text-sm text-emerald-900/90">
          Un MVP serio y escalable para educación primaria inclusiva, listo para integrar IA de apoyo pedagógico en
          fases posteriores.
        </p>
      </section>
    </main>
  );
}
