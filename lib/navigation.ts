import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  BarChart2,
  BookOpen,
  ClipboardList,
  Home,
  LayoutDashboard,
  QrCode,
  Trophy,
  UserCircle,
  Users,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: Route;
  icon?: LucideIcon;
};

export const teacherNavItems: NavItem[] = [
  { label: "Dashboard", href: "/docente", icon: LayoutDashboard },
  { label: "Materias", href: "/docente/materias", icon: BookOpen },
  { label: "Asignaciones", href: "/docente/asignaciones", icon: ClipboardList },
  { label: "Alumnos", href: "/docente/alumnos" as Route, icon: Users },
  { label: "Seguimiento", href: "/docente/seguimiento", icon: BarChart2 },
  { label: "Accesos QR", href: "/docente/accesos", icon: QrCode },
  { label: "Perfil", href: "/docente/perfil", icon: UserCircle }
];

export const familyNavItems: NavItem[] = [
  { label: "Dashboard", href: "/familia", icon: LayoutDashboard },
  { label: "Perfil", href: "/familia/perfil", icon: UserCircle }
];

export const studentNavItems: NavItem[] = [
  { label: "Inicio", href: "/estudiante", icon: Home },
  { label: "Progreso", href: "/estudiante/progreso", icon: BarChart2 },
  { label: "Logros", href: "/estudiante/logros", icon: Trophy },
  { label: "Perfil", href: "/estudiante/perfil", icon: UserCircle }
];
