import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

import { Card, CardText, CardTitle } from "@/components/ui/card";
import { percent } from "@/lib/utils";

type ProgressCardProps = {
  title: string;
  description?: string | null;
  progress: number;
  href?: Route;
  accent?: string;
};

export function ProgressCard({ title, description, progress, href, accent = "#43b8f4" }: ProgressCardProps) {
  const body = (
    <Card className="space-y-4">
      <div className="space-y-2">
        <CardTitle>{title}</CardTitle>
        {description ? <CardText>{description}</CardText> : null}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-semibold text-brand-900">
          <span>Avance</span>
          <span>{percent(progress)}</span>
        </div>
        <div className="h-3 rounded-full bg-brand-50">
          <div
            className="h-3 rounded-full transition-all"
            style={{ width: `${Math.max(3, Math.min(100, progress))}%`, background: accent }}
          />
        </div>
      </div>
      {href ? (
        <div className="flex items-center text-sm font-semibold text-brand-700">
          Abrir recorrido <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      ) : null}
    </Card>
  );

  if (href) {
    return (
      <Link className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400" href={href}>
        {body}
      </Link>
    );
  }

  return body;
}
