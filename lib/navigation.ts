import type { Route } from "next";

export type NavItem = {
  label: string;
  href: Route;
};

export const teacherNavItems: NavItem[] = [
  { label: "Dashboard", href: "/docente" },
  { label: "Materias", href: "/docente/materias" },
  { label: "Asignaciones", href: "/docente/asignaciones" },
  { label: "Familias", href: "/docente/familias" },
  { label: "Seguimiento", href: "/docente/seguimiento" },
  { label: "Accesos QR", href: "/docente/accesos" },
  { label: "Perfil", href: "/docente/perfil" }
];

export const familyNavItems: NavItem[] = [
  { label: "Dashboard", href: "/familia" },
  { label: "Perfil", href: "/familia/perfil" }
];

export const studentNavItems: NavItem[] = [
  { label: "Inicio", href: "/estudiante" },
  { label: "Progreso", href: "/estudiante/progreso" },
  { label: "Logros", href: "/estudiante/logros" },
  { label: "Perfil", href: "/estudiante/perfil" }
];
