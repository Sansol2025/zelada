import Link from "next/link";
import Image from "next/image";
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
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Logo Escuela Zelada Dávila"
                width={44}
                height={44}
                className="h-11 w-11 rounded-lg object-contain"
                priority
              />
              <div>
                <p className="font-display text-lg font-bold text-brand-900">{APP_NAME}</p>
                <p className="text-xs text-brand-700">Proyecto Educativo Digital Inclusivo</p>
              </div>
            </div>
          </Link>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <Link
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-brand-50 hover:text-brand-900",
                    isActive
                      ? "bg-academic-navy text-white shadow-sm"
                      : "text-brand-700"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.icon && (
                    <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-academic-gold" : "text-brand-400")} />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 border-t border-brand-100 pt-4">
            <form action="/api/auth/signout" method="POST">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-700 transition-all hover:bg-red-50 hover:text-red-600" type="submit">
                <LogOut className="h-4 w-4 shrink-0" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </aside>

        <main className="space-y-4">
          {title && title.trim() !== "" && (
            <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
              <h1 className="font-display text-3xl font-bold text-brand-950">{title}</h1>
              <p className="mt-2 text-sm text-brand-700">{description}</p>
            </section>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
