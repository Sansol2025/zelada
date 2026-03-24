import { LoaderCircle } from "lucide-react";

import { Card } from "@/components/ui/card";

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Cargando información..." }: LoadingStateProps) {
  return (
    <Card className="flex items-center justify-center gap-3 py-12 text-brand-700">
      <LoaderCircle className="h-5 w-5 animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </Card>
  );
}
