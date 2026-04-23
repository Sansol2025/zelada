import Link from "next/link";
import { type ReactNode } from "react";
import { LogOut } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { studentNavItems } from "@/lib/navigation";

type StudentShellProps = {
  title: string;
  description?: string;
  currentPath?: string;
  children: ReactNode;
};

export function StudentShell({ title, description, currentPath, children }: StudentShellProps) {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 animate-in">
      <header className="rounded-[2.5rem] border border-academic-gold/10 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:bg-white/90">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-2xl font-black tracking-tight text-academic-navy">{APP_NAME}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-academic-gold">Espacio Estudiante</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button className="inline-flex h-12 items-center gap-2 rounded-2xl border border-academic-gold/20 bg-white px-5 py-2 text-sm font-black text-academic-navy shadow-sm transition-all hover:bg-academic-ivory active:scale-95">
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </form>
        </div>
        <nav className="mt-6 flex flex-wrap gap-2">
          {studentNavItems.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold tracking-tight transition-all ${
                  isActive 
                    ? "bg-academic-navy text-white shadow-md scale-105" 
                    : "bg-academic-ivory text-academic-navy hover:bg-academic-gold/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <section className="mt-8 rounded-[2rem] border border-academic-gold/5 bg-white/50 p-8 shadow-card backdrop-blur-sm lg:p-10">
        <h1 className="font-display text-4xl font-black tracking-tight text-academic-navy md:text-5xl">{title}</h1>
        {description ? <p className="mt-4 text-lg font-medium leading-relaxed text-academic-slate max-w-2xl">{description}</p> : null}
      </section>

      <section className="mt-8 space-y-8">{children}</section>
    </main>
  );
}
