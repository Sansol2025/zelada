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
  variant = "primary",
  ...props
}: BigActionButtonProps) {
  const subtitleColor = variant === "primary" ? "text-white/90" : "text-academic-slate/80";

  return (
    <Button
      size="xl"
      variant={variant}
      className={cn(
        "group h-auto min-h-24 w-full flex-col items-start gap-1.5 rounded-[2rem] p-6 text-left shadow-lg transition-all duration-400 hover:shadow-premium hover:-translate-y-1 hover:scale-[1.02] border border-transparent hover:border-academic-gold/10",
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-3 text-xl font-extrabold tracking-tight">
        {icon && <span className="transition-transform group-hover:scale-110">{icon}</span>}
        {children}
      </span>
      {subtitle ? (
        <span className={cn("text-sm font-medium leading-tight", subtitleColor)}>
          {subtitle}
        </span>
      ) : null}
    </Button>
  );
}
