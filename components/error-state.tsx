import { TriangleAlert } from "lucide-react";

import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  message: string;
  retryHref?: string;
};

export function ErrorState({
  title = "Ocurrió un problema",
  message,
  retryHref = "/acceso"
}: ErrorStateProps) {
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
        <TriangleAlert className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardText>{message}</CardText>
      </div>
      <a href={retryHref}>
        <Button variant="secondary">Volver</Button>
      </a>
    </Card>
  );
}
