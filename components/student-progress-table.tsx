import { AlertTriangle, CircleCheckBig, Clock3, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { formatSeconds, percent } from "@/lib/utils";
import type { StudentSummary } from "@/types/domain";

type StudentProgressTableProps = {
  rows: StudentSummary[];
};

export function StudentProgressTable({ rows }: StudentProgressTableProps) {
  return (
    <Card className="overflow-x-auto">
      <CardTitle className="mb-4 text-lg">Seguimiento por estudiante</CardTitle>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-brand-100 text-left text-brand-700">
            <th className="pb-3 pr-4 font-semibold">Estudiante</th>
            <th className="pb-3 pr-4 font-semibold">Avance</th>
            <th className="pb-3 pr-4 font-semibold">Módulos bloqueados</th>
            <th className="pb-3 pr-4 font-semibold">Completados</th>
            <th className="pb-3 pr-4 font-semibold">Tiempo invertido</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-brand-50 last:border-b-0" key={row.student_id}>
              <td className="py-3 pr-4 font-semibold text-brand-900">{row.student_name}</td>
              <td className="py-3 pr-4">{percent(row.progress_percent)}</td>
              <td className="py-3 pr-4">
                <Badge variant={row.blocked_modules > 0 ? "warning" : "success"}>
                  {row.blocked_modules > 0 ? (
                    <Lock className="mr-1 h-3.5 w-3.5" />
                  ) : (
                    <CircleCheckBig className="mr-1 h-3.5 w-3.5" />
                  )}
                  {row.blocked_modules}
                </Badge>
              </td>
              <td className="py-3 pr-4">
                <span className="inline-flex items-center gap-1">
                  <CircleCheckBig className="h-4 w-4 text-emerald-600" />
                  {row.completed_modules}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-4 w-4 text-brand-500" />
                  {formatSeconds(row.total_time_seconds)}
                </span>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-10 text-center text-brand-600">
                <span className="inline-flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Aún no hay datos de progreso disponibles.
                </span>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </Card>
  );
}
