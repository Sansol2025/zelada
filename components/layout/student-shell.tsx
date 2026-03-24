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
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6">
      <header className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-xl font-bold text-brand-900">{APP_NAME}</p>
            <p className="text-sm text-brand-700">Espacio estudiante</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button className="inline-flex items-center gap-2 rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700">
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </form>
        </div>
        <nav className="mt-4 flex flex-wrap gap-2">
          {studentNavItems.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                currentPath === link.href ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="mt-5 rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
        <h1 className="font-display text-3xl font-extrabold text-brand-950">{title}</h1>
        {description ? <p className="mt-1 text-sm text-brand-700">{description}</p> : null}
      </section>

      <section className="mt-5 space-y-4">{children}</section>
    </main>
  );
}
