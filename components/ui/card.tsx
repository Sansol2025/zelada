import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "group rounded-xl border border-academic-gold/10 bg-white p-4 shadow-card transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 md:p-5",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-2xl font-extrabold tracking-tight text-academic-navy", className)} {...props} />;
}

export function CardText({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-base leading-relaxed text-academic-slate/90", className)} {...props} />;
}
