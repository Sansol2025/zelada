import Link from "next/link";
import type { Route } from "next";
import { BookOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { percent } from "@/lib/utils";

type SubjectCardProps = {
  title: string;
  description?: string | null;
  color?: string;
  progressPercent?: number;
  href?: Route;
  status?: string;
};

export function SubjectCard({
  title,
  description,
  color = "#43b8f4",
  progressPercent = 0,
  href,
  status = "pending"
}: SubjectCardProps) {
  const statusVariant =
    status === "completed" ? "success" : status === "in_progress" ? "default" : "warning";

  const content = (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
          {description ? <CardText className="line-clamp-2">{description}</CardText> : null}
        </div>
        <div className="rounded-2xl p-2 text-white" style={{ background: color }}>
          <BookOpen className="h-5 w-5" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-700">
          <span>Progreso</span>
          <span>{percent(progressPercent)}</span>
        </div>
        <div className="h-3 rounded-full bg-brand-50">
          <div
            className="h-3 rounded-full transition-all"
            style={{ width: `${Math.max(3, Math.min(100, progressPercent))}%`, background: color }}
          />
        </div>
      </div>
      <Badge variant={statusVariant}>{status.replace("_", " ")}</Badge>
    </Card>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
