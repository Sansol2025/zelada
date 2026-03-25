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
        "group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white transition-all duration-300 shadow-sm border-4",
        "hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02]",
        isCompleted ? "border-emerald-200" : "border-brand-100/80"
      )}
    >
      {/* Fondo de color interactivo superior */}
      <div 
        className="absolute inset-x-0 top-0 h-32 opacity-10 transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: color }}
      />
      <div 
        className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative flex flex-col p-6 sm:p-8 z-10 flex-1">
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-display text-3xl font-black text-slate-800 tracking-tight mb-2 group-hover:text-brand-950 transition-colors">
              {title}
            </h3>
            {description ? (
              <p className="text-lg font-medium text-slate-500 line-clamp-2 leading-tight">
                {description}
              </p>
            ) : null}
          </div>
          
          <div 
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] shadow-lg shadow-black/5 rotate-3 group-hover:rotate-12 transition-transform duration-500 overflow-hidden"
            style={{ backgroundColor: color }}
          >
            {icon && icon.startsWith("http") ? (
              <Image src={icon} alt={title} width={64} height={64} className="h-full w-full object-cover" />
            ) : isCompleted ? (
              <Star className="h-8 w-8 text-white fill-white" />
            ) : (
              <BookOpen className="h-8 w-8 text-white" />
            )}
          </div>
        </div>

        <div className="mt-auto pt-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-black uppercase tracking-widest text-slate-400">
              {isCompleted ? "¡Aventura Completada!" : "Progreso de aventura"}
            </span>
            <span className="text-lg font-black" style={{ color: isCompleted ? '#10b981' : color }}>
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
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2 text-emerald-700 font-bold border border-emerald-100">
            <Sparkles className="h-4 w-4" /> Eres un campeón
          </div>
        )}
      </div>
    </div>
  );

  if (!href) return content;
  return (
    <Link href={href} className="block outline-none focus-visible:ring-4 rounded-[2.5rem] focus-visible:ring-brand-400 font-sans">
      {content}
    </Link>
  );
}
