import { BookCheck, School } from "lucide-react";

import { Card, CardText, CardTitle } from "@/components/ui/card";
import { percent } from "@/lib/utils";

type FamilyProgressCardProps = {
  studentName: string;
  grade: string;
  section: string;
  progressPercent: number;
  subjectsCount: number;
  completedSubjects: number;
};

export function FamilyProgressCard({
  studentName,
  grade,
  section,
  progressPercent,
  subjectsCount,
  completedSubjects
}: FamilyProgressCardProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-lg">{studentName}</CardTitle>
          <CardText>
            {grade} • {section}
          </CardText>
        </div>
        <div className="rounded-xl bg-brand-100 p-2 text-brand-700">
          <School className="h-5 w-5" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-brand-800">
          <span>Avance general</span>
          <strong>{percent(progressPercent)}</strong>
        </div>
        <div className="h-3 rounded-full bg-brand-50">
          <div
            className="h-3 rounded-full bg-emerald-400"
            style={{ width: `${Math.max(3, Math.min(100, progressPercent))}%` }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-brand-700">
        <BookCheck className="h-4 w-4" />
        {completedSubjects}/{subjectsCount} materias completadas
      </div>
    </Card>
  );
}
