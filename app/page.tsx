import Link from "next/link";
import { ArrowRight, CheckCircle2, HeartHandshake, School, ShieldCheck, Sparkles } from "lucide-react";

import { AccessibilityPanel } from "@/components/accessibility-panel";
import { BigActionButton } from "@/components/big-action-button";
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

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,#d7f2ff_0,#f2fbff_34%,#ffffff_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-white/80 px-4 py-3 backdrop-blur">
          <div>
            <p className="font-display text-2xl font-bold text-brand-900">{APP_NAME}</p>
            <p className="text-sm text-brand-700">{APP_SUBTITLE}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/acceso">
              <BigActionButton className="w-auto px-6 py-3" size="md">
                Ingresar
              </BigActionButton>
            </Link>
            <Link href="/proyecto">
              <BigActionButton className="w-auto bg-white text-brand-900" size="md" variant="secondary">
                Ver proyecto
              </BigActionButton>
            </Link>
          </div>
        </header>

        <section className="mt-8 grid gap-6 rounded-3xl border border-brand-100 bg-white p-8 shadow-card lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-soft-mint px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
              <Sparkles className="h-4 w-4" />
              Inclusión con tecnología útil
            </span>
            <h1 className="font-display text-4xl font-extrabold text-brand-950 md:text-5xl">
              Plataforma educativa inclusiva para primaria, simple para estudiantes y potente para docentes.
            </h1>
            <p className="max-w-2xl text-lg text-brand-700">
              {APP_NAME} combina diseño infantil accesible, seguimiento pedagógico secuencial y acceso sin fricción para
              estudiantes con diferentes capacidades.
            </p>
            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800">
              <p className="font-semibold">Institución</p>
              <p>{SCHOOL_NAME}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Link href="/acceso" className="inline-flex">
                <BigActionButton icon={<ArrowRight className="h-5 w-5" />} subtitle="Docentes, estudiantes y familias">
                  Entrar a la plataforma
                </BigActionButton>
              </Link>
              <Link href="/acceso?mode=qr" className="inline-flex">
                <BigActionButton
                  className="bg-emerald-500 hover:bg-emerald-600"
                  icon={<ShieldCheck className="h-5 w-5" />}
                  subtitle="Ingreso inmediato"
                >
                  Acceso por QR / enlace
                </BigActionButton>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <AccessibilityPanel />
            <div className="rounded-2xl border border-brand-100 bg-soft-sun p-4">
              <p className="mb-2 text-sm font-bold text-amber-900">Metodología secuencial</p>
              <p className="text-sm text-amber-900/90">
                Cada módulo se habilita cuando el anterior se completa. El recorrido es claro, predecible y motivador.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
              <h2 className="font-display text-2xl font-bold text-brand-900">{pillar.title}</h2>
              <p className="mt-2 text-sm text-brand-700">{pillar.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-brand-100 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2 text-brand-900">
            <HeartHandshake className="h-5 w-5" />
            <h3 className="font-display text-2xl font-bold">Acceso sin barreras y acompañamiento pedagógico</h3>
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {highlights.map((item) => (
              <li className="flex items-center gap-2 text-sm text-brand-700" key={item}>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-white p-4 text-sm text-brand-700">
          <span className="inline-flex items-center gap-2">
            <School className="h-4 w-4" />
            {SCHOOL_NAME}
          </span>
          <span>Educación inclusiva, moderna y centrada en cada estudiante.</span>
        </footer>
      </div>
    </main>
  );
}
