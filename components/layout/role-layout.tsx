import Link from "next/link";
import { type ReactNode } from "react";
import { LogOut } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type RoleLayoutProps = {
  title: string;
  description: string;
  navItems: NavItem[];
  children: ReactNode;
  currentPath?: string;
};

export function RoleLayout({ title, description, navItems, children, currentPath }: RoleLayoutProps) {
  return (
    <div className="min-h-screen bg-soft-sky">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[270px,1fr]">
        <aside className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
          <Link href="/" className="mb-6 block">
            <p className="font-display text-lg font-bold text-brand-900">{APP_NAME}</p>
            <p className="text-xs text-brand-700">Proyecto Educativo Digital Inclusivo</p>
          </Link>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                className={cn(
                  "block rounded-xl px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50",
                  currentPath === item.href && "bg-brand-100 text-brand-900"
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action="/api/auth/signout" className="mt-6" method="POST">
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700" type="submit">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </aside>

        <main className="space-y-4">
          <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
            <h1 className="font-display text-3xl font-bold text-brand-950">{title}</h1>
            <p className="mt-2 text-sm text-brand-700">{description}</p>
          </section>
          {children}
        </main>
      </div>
    </div>
  );
}
