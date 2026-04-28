import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ icon, title, subtitle, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-academic-navy p-4 text-white shadow-md md:p-5",
      className
    )}>
      {/* Decorative Glow */}
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-academic-gold/15 blur-2xl"></div>
      <div className="absolute -left-10 bottom-10 h-16 w-16 rounded-full bg-academic-gold/5 blur-xl"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {subtitle && (
            <div className="mb-1 flex items-center gap-1.5 text-academic-gold font-bold uppercase tracking-wider text-[9px] opacity-80">
              {icon} {subtitle}
            </div>
          )}
          <h1 className="font-display text-lg font-bold tracking-tight sm:text-xl leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-xs font-medium text-white/60 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
