import { Inbox } from "lucide-react";

import { Card, CardText, CardTitle } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="rounded-2xl bg-brand-100 p-3 text-brand-700">
        <Inbox className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardText>{description}</CardText>
      </div>
      {action}
    </Card>
  );
}
