import Link from "next/link";
import { KeyRound, QrCode, Users } from "lucide-react";

import { Card, CardText, CardTitle } from "@/components/ui/card";

export default function AccessPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      <section className="mb-8 text-center">
        <h1 className="font-display text-4xl font-extrabold text-brand-950">Ingreso a Aprender Sin Barreras</h1>
        <p className="mt-3 text-brand-700">
          Acceso simple para docentes, familias y estudiantes con distintos niveles de autonomía digital.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-4">
          <div className="rounded-2xl bg-brand-100 p-3 text-brand-700 w-fit">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Docentes y Familias</CardTitle>
            <CardText>Ingresan con correo y contraseña para acceder a su panel personalizado.</CardText>
          </div>
          <form action="/api/auth/signin" className="space-y-3" method="POST">
            <input
              className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm"
              name="email"
              placeholder="correo@escuela.edu.ar"
              required
              type="email"
            />
            <input
              className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm"
              name="password"
              placeholder="Contraseña"
              required
              type="password"
            />
            <input name="redirectTo" type="hidden" value="/docente" />
            <button className="h-12 w-full rounded-xl bg-brand-500 font-semibold text-white" type="submit">
              Ingresar como docente
            </button>
          </form>
          <form action="/api/auth/signin" className="space-y-3" method="POST">
            <input
              className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm"
              name="email"
              placeholder="correo@familia.com"
              required
              type="email"
            />
            <input
              className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm"
              name="password"
              placeholder="Contraseña"
              required
              type="password"
            />
            <input name="redirectTo" type="hidden" value="/familia" />
            <button className="h-12 w-full rounded-xl border border-brand-200 bg-white font-semibold text-brand-900" type="submit">
              Ingresar como familia
            </button>
          </form>
        </Card>

        <Card className="space-y-4">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 w-fit">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Ingreso estudiante por QR o enlace</CardTitle>
            <CardText>
              El docente genera un código QR único por estudiante. También se puede ingresar pegando el enlace.
            </CardText>
          </div>
          <form action="/api/access/open-link" className="space-y-3" method="POST">
            <input
              className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm"
              name="token_or_url"
              placeholder="Pega token o URL"
              required
              type="text"
            />
            <button className="h-12 w-full rounded-xl bg-emerald-500 font-semibold text-white" type="submit">
              Entrar al espacio del estudiante
            </button>
          </form>
          <p className="text-xs text-brand-600">
            Tip: si escaneas el QR desde celular/tablet, abrirá automáticamente el recorrido asignado.
          </p>
        </Card>

        <Card className="space-y-4">
          <div className="rounded-2xl bg-soft-sun p-3 text-amber-700 w-fit">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Enlace mágico para familias</CardTitle>
            <CardText>Se puede habilitar envío de enlace seguro por WhatsApp o correo desde el panel docente.</CardText>
          </div>
          <form action="/api/auth/magic-link" className="space-y-3" method="POST">
            <input
              className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm"
              name="email"
              placeholder="correo de familia"
              required
              type="email"
            />
            <input name="redirectTo" type="hidden" value="/familia" />
            <button className="h-12 w-full rounded-xl bg-amber-400 font-semibold text-amber-900" type="submit">
              Enviar enlace mágico
            </button>
          </form>
          <Link className="inline-block text-sm font-semibold text-brand-700 underline" href="/">
            Volver al inicio
          </Link>
        </Card>
      </section>
    </main>
  );
}
