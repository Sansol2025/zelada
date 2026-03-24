import type { ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BigActionButtonProps = ButtonProps & {
  icon?: ReactNode;
  subtitle?: string;
};

export function BigActionButton({
  children,
  icon,
  subtitle,
  className,
  ...props
}: BigActionButtonProps) {
  return (
    <Button
      size="xl"
      className={cn("h-auto min-h-20 w-full flex-col items-start gap-1 rounded-2xl p-5 text-left", className)}
      {...props}
    >
      <span className="flex items-center gap-2 text-lg">
        {icon}
        {children}
      </span>
      {subtitle ? <span className="text-sm font-medium text-white/80">{subtitle}</span> : null}
    </Button>
  );
}
