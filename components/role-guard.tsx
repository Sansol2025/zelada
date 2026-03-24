import type { ReactNode } from "react";

import type { Role } from "@/types/domain";

type RoleGuardProps = {
  currentRole: Role | null;
  allow: Role[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function RoleGuard({ currentRole, allow, fallback = null, children }: RoleGuardProps) {
  if (!currentRole || !allow.includes(currentRole)) return fallback;
  return children;
}
