import Link from "next/link";
import { type ReactNode } from "react";
import { LogOut, Menu } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { studentNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type StudentShellProps = {
  title: string;
  description?: string;
  currentPath?: string;
  children: ReactNode;
};

export function StudentShell({ title, description, currentPath, children }: StudentShellProps) {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-3 md:px-4 py-4 md:py-6 animate-in">
      <header className="rounded-2xl border border-academic-gold/10 bg-white/70 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:bg-white/90 flex items-center justify-between z-50 relative">
        <div>
          <p className="font-display text-xl md:text-2xl font-black tracking-tight text-academic-navy leading-tight">{APP_NAME}</p>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-academic-gold leading-tight">Espacio Estudiante</p>
        </div>

        {/* Responsive Navigation Dropdown */}
        <details className="group relative">
          <summary className="flex h-10 items-center gap-2 rounded-xl bg-academic-navy px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-academic-navy/90 cursor-pointer list-none select-none">
            <Menu className="h-4 w-4" />
            <span className="hidden sm:inline">Menú</span>
          </summary>
          
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-100 bg-white p-2 shadow-xl z-50">
            <nav className="flex flex-col gap-1">
              {studentNavItems.map((link) => {
                const isActive = currentPath === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold tracking-tight transition-all duration-200",
                      isActive
                        ? "bg-academic-navy/5 text-academic-navy"
                        : "text-slate-500 hover:bg-slate-50 hover:text-academic-navy"
                    )}
                  >
                    {link.icon && <link.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-academic-gold" : "text-slate-400")} />}
                    {link.label}
                  </Link>
                );
              })}
              
              <div className="my-1 h-px w-full bg-slate-100" />
              
              <form action="/api/auth/signout" method="POST">
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold tracking-tight text-rose-600 transition-all duration-200 hover:bg-rose-50">
                  <LogOut className="h-4 w-4 shrink-0" />
                  Salir
                </button>
              </form>
            </nav>
          </div>
        </details>
      </header>

      <section className="mt-4 md:mt-6 rounded-2xl border border-academic-gold/5 bg-white/50 p-5 md:p-8 shadow-sm backdrop-blur-sm">
        <h1 className="font-display text-2xl font-black tracking-tight text-academic-navy md:text-4xl leading-tight">{title}</h1>
        {description ? <p className="mt-2 text-sm md:text-base font-medium leading-relaxed text-academic-slate max-w-2xl">{description}</p> : null}
      </section>

      <section className="mt-4 md:mt-6 space-y-6">{children}</section>
    </main>
  );
}
