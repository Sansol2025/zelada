import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { BookOpen, Sparkles, Star } from "lucide-react";

import { percent } from "@/lib/utils";
import { cn } from "@/lib/utils";

type SubjectCardProps = {
  title: string;
  description?: string | null;
  color?: string;
  progressPercent?: number;
  href?: Route;
  status?: string;
  icon?: string | null;
};

export function SubjectCard({
  title,
  description,
  color = "#43b8f4",
  progressPercent = 0,
  href,
  status = "pending",
  icon
}: SubjectCardProps) {
  const isCompleted = status === "completed";

  const content = (
    <div 
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 shadow-sm border-2",
        "hover:-translate-y-1 hover:shadow-lg hover:scale-[1.01]",
        isCompleted ? "border-emerald-200" : "border-brand-100/80"
      )}
    >
      {/* Fondo de color interactivo superior */}
      <div 
        className="absolute inset-x-0 top-0 h-24 opacity-10 transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: color }}
      />
      <div 
        className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-20 blur-xl"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative flex flex-col p-4 sm:p-6 z-10 flex-1">
        
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-display text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-1 group-hover:text-brand-950 transition-colors">
              {title}
            </h3>
            {description ? (
              <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-tight">
                {description}
              </p>
            ) : null}
          </div>
          
          <div 
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md shadow-black/5 rotate-3 group-hover:rotate-12 transition-transform duration-500 overflow-hidden"
            style={{ backgroundColor: color }}
          >
            {icon && icon.startsWith("http") ? (
              <Image src={icon} alt={title} width={48} height={48} className="h-full w-full object-cover" />
            ) : isCompleted ? (
              <Star className="h-6 w-6 text-white fill-white" />
            ) : (
              <BookOpen className="h-6 w-6 text-white" />
            )}
          </div>
        </div>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {isCompleted ? "¡Completada!" : "Progreso"}
            </span>
            <span className="text-sm font-black" style={{ color: isCompleted ? '#10b981' : color }}>
              {percent(progressPercent)}
            </span>
          </div>
          
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
                isCompleted ? "bg-emerald-500" : ""
              )}
              style={!isCompleted ? { backgroundColor: color, width: `${Math.max(3, progressPercent)}%` } : { width: '100%' }}
            />
            {isCompleted && (
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            )}
          </div>
        </div>

        {isCompleted && (
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 py-1.5 text-xs text-emerald-700 font-bold border border-emerald-100">
            <Sparkles className="h-3 w-3" /> Eres un campeón
          </div>
        )}
      </div>
    </div>
  );

  if (!href) return content;
  return (
    <Link href={href} className="block outline-none focus-visible:ring-2 rounded-2xl focus-visible:ring-brand-400 font-sans">
      {content}
    </Link>
  );
}
