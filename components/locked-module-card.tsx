import { Lock } from "lucide-react";

type LockedModuleCardProps = {
  title: string;
  description?: string | null;
  reason?: string;
};

export function LockedModuleCard({
  title,
  description,
  reason = "Completa el módulo anterior para desbloquear este contenido."
}: LockedModuleCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-slate-50 border-4 border-dashed border-slate-200 p-6 sm:p-8 opacity-70">
       <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-display text-2xl font-black text-slate-400 tracking-tight mb-2">
              {title}
            </h3>
            {description ? (
              <p className="text-base font-medium text-slate-400 line-clamp-1">
                {description}
              </p>
            ) : null}
          </div>
          
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-slate-200">
             <Lock className="h-7 w-7 text-slate-400" />
          </div>
       </div>

       <div className="mt-6 flex items-center gap-2 rounded-xl bg-slate-100/50 py-2 px-4 text-slate-500 font-bold border border-slate-200 text-xs uppercase tracking-wider">
          {reason}
       </div>
    </div>
  );
}
