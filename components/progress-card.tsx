import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { percent } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ProgressCardProps = {
  title: string;
  description?: string | null;
  progress: number;
  href?: Route;
  accent?: string;
};

export function ProgressCard({ title, description, progress, href, accent = "#43b8f4" }: ProgressCardProps) {
  const isCompleted = progress >= 100;
  
  const body = (
    <Card 
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white transition-all duration-300 shadow-sm border-4",
        "hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02]",
        isCompleted ? "border-emerald-200" : "border-brand-100/80"
      )}
    >
      <div 
        className="absolute inset-x-0 top-0 h-24 opacity-5 transition-opacity duration-300 group-hover:opacity-10"
        style={{ backgroundColor: accent }}
      />
      
      <div className="relative flex flex-col p-6 sm:p-8 z-10 flex-1 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-display text-2xl font-black text-slate-800 tracking-tight mb-2 group-hover:text-brand-950 transition-colors">
              {title}
            </h3>
            {description ? (
              <p className="text-base font-medium text-slate-500 line-clamp-2 leading-tight">
                {description}
              </p>
            ) : null}
          </div>
          
          <div 
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] shadow-lg shadow-black/5 rotate-3 group-hover:rotate-12 transition-transform duration-500"
            style={{ backgroundColor: accent }}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-7 w-7 text-white" />
            ) : (
              <PlayCircle className="h-7 w-7 text-white" />
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              {isCompleted ? "¡Reto Superado!" : "Tu camino"}
            </span>
            <span className="text-base font-black" style={{ color: isCompleted ? '#10b981' : accent }}>
              {percent(progress)}
            </span>
          </div>
          
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
                isCompleted ? "bg-emerald-500" : ""
              )}
              style={!isCompleted ? { backgroundColor: accent, width: `${Math.max(3, progress)}%` } : { width: '100%' }}
            />
          </div>
        </div>
        
        {href && (
          <div className="flex items-center text-sm font-black uppercase tracking-wider transition-colors pt-2" style={{ color: isCompleted ? '#10b981' : accent }}>
            {isCompleted ? "Ver otra vez" : "¡Ir a jugar!"} 
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        )}
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link className="block outline-none focus-visible:ring-4 rounded-[2.5rem] focus-visible:ring-brand-400" href={href}>
        {body}
      </Link>
    );
  }

  return body;
}
