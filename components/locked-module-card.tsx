import { Lock } from "lucide-react";

import { Card, CardText, CardTitle } from "@/components/ui/card";

type LockedModuleCardProps = {
  title: string;
  description?: string | null;
  reason?: string;
};

export function LockedModuleCard({
  title,
  description,
  reason = "Completa el módulo anterior para desbloquear este contenido."
}: LockedModuleCardProps) {
  return (
    <Card className="border-dashed border-brand-300 bg-brand-50/60">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-brand-100 p-3 text-brand-700">
          <Lock className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          {description ? <CardText>{description}</CardText> : null}
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{reason}</p>
        </div>
      </div>
    </Card>
  );
}
