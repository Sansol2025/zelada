"use client";

import NextImage from "next/image";
import { useMemo, useState, useEffect } from "react";
import { CheckCircle2, MoveRight, Sparkles, WandSparkles, X, ChevronUp, ChevronDown, Trophy, Star, Lightbulb, Mic } from "lucide-react";

import { AccessibleAudioButton } from "@/components/accessible-audio-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ActivityRendererProps = {
  activity: {
    id: string;
    type: string;
    title: string;
    prompt: string;
    instructions?: string | null;
    image_url?: string | null;
    audio_url?: string | null;
    settings_json?: Record<string, unknown> | null;
  };
  studentId?: string;
  onCompleted?: () => void;
};

type OptionItem = {
  id: string;
  label: string;
  imageUrl?: string;
  isCorrect?: boolean;
  order?: number;
};

function parseOptions(settings: Record<string, unknown> | null | undefined): OptionItem[] {
  const options = settings?.options;
  if (!Array.isArray(options)) return [];

  return options
    .map((item, idx) => {
      if (typeof item === "string") {
        return { id: `o-${idx}`, label: item };
      }
      if (typeof item === "object" && item) {
        const value = item as Record<string, unknown>;
        return {
          id: String(value.id ?? `o-${idx}`),
          label: String(value.label ?? `Opción ${idx + 1}`),
          imageUrl: value.imageUrl ? String(value.imageUrl) : undefined,
          isCorrect: Boolean(value.isCorrect),
          order: value.order ? Number(value.order) : idx + 1
        };
      }
      return null;
    })
    .filter(Boolean) as OptionItem[];
}

export function ActivityRenderer({ activity, studentId, onCompleted }: ActivityRendererProps) {
  const startedAt = useMemo(() => Date.now(), []);
  const [selected, setSelected] = useState<string | null>(null);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [options, setOptions] = useState<OptionItem[]>(() => parseOptions(activity.settings_json));
  const [pending, setPending] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Sync options if settings change
  useEffect(() => {
    setOptions(parseOptions(activity.settings_json));
  }, [activity.settings_json]);

  const completeActivity = async (score = 100, response: Record<string, unknown> = {}) => {
    if (!studentId) {
      setCompleted(true);
      onCompleted?.();
      return;
    }

    setPending(true);
    try {
      const timeSpent = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      await fetch(`/api/student/activities/${activity.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          response_json: response,
          time_spent_seconds: timeSpent
        })
      });
      setCompleted(true);
      onCompleted?.();
    } finally {
      setPending(false);
    }
  };

  const celebrate = () => {
     // Aquí se podría disparar confeti o sonido de victoria
  };

  const handleValidation = () => {
    let isCorrect = true;
    let score = 100;
    const responseData: Record<string, unknown> = {};

    if (activity.type === "multiple_choice_visual" || activity.type === "image_select") {
      const chosen = options.find((opt) => opt.id === selected);
      const hasCorrectDef = options.some((opt) => opt.isCorrect);
      isCorrect = hasCorrectDef ? Boolean(chosen?.isCorrect) : true;
      responseData.selected = selected;
    } else if (activity.type === "true_false") {
      const expected = String(activity.settings_json?.correct ?? "true");
      isCorrect = selected === expected;
      responseData.selected = selected;
    } else if (activity.type === "fill_with_support") {
      const expected = String(activity.settings_json?.expected ?? "").trim().toLowerCase();
      const normalized = textAnswer.trim().toLowerCase();
      isCorrect = expected ? normalized === expected : normalized.length > 0;
      responseData.textAnswer = textAnswer;
    } else if (activity.type === "sequence") {
      // El orden actual de 'options' vs el orden original de creación
      // Si el docente los creó en orden 1, 2, 3...
      const currentOrder = options.map(o => o.label).join("|");
      const originalOrder = [...options].sort((a,b) => (a.order || 0) - (b.order || 0)).map(o => o.label).join("|");
      isCorrect = currentOrder === originalOrder;
      responseData.finalOrder = options.map(o => o.id);
    } else if (activity.type === "drag_drop") {
      // Simulamos drag drop como selección múltiple de los elementos correctos
      const correctIds = options.filter(o => o.isCorrect).map(o => o.id).sort();
      const selectedIds = [...multiSelected].sort();
      isCorrect = correctIds.length === selectedIds.length && correctIds.every((id, i) => id === selectedIds[i]);
      responseData.selectedIds = multiSelected;
    }

    if (isCorrect) {
      celebrate();
      setFeedback({ message: "¡Increíble! Lo hiciste de maravilla 🌟", type: "success" });
      score = 100;
    } else {
      setFeedback({ message: "¡Buen intento! Sigue practicando 💪", type: "error" });
      score = 50;
    }

    void completeActivity(score, { ...responseData, isCorrect });
  };

  const moveOption = (index: number, direction: -1 | 1) => {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= options.length) return;
    const newOptions = [...options];
    [newOptions[index], newOptions[nextIdx]] = [newOptions[nextIdx], newOptions[index]];
    setOptions(newOptions);
  };

  const toggleMultiSelect = (id: string) => {
    setMultiSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const baseHeader = (
    <div className="flex flex-col items-center justify-center space-y-8 text-center pb-8 border-b-2 border-brand-50 mb-8">
      <div className="space-y-4 max-w-3xl">
        <h2 className="font-display text-4xl font-black uppercase tracking-tight text-brand-950 sm:text-5xl leading-tight">
          {activity.title}
        </h2>
        <div className="flex items-center justify-center gap-4">
           <div className="h-1 bg-brand-200 w-12 rounded-full" />
           <p className="text-2xl font-bold text-brand-700 sm:text-3xl leading-snug">
            {activity.prompt}
           </p>
           <div className="h-1 bg-brand-200 w-12 rounded-full" />
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 w-full">
        <AccessibleAudioButton 
          text={`${activity.title}. ${activity.prompt}`} 
          audioUrl={activity.audio_url}
          autoPlay={true}
        />
        {activity.instructions && (
           <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-6 py-3 border-2 border-amber-100 shadow-sm animate-bounce-slow">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <span className="text-base font-black text-amber-900">{activity.instructions}</span>
           </div>
        )}
      </div>

      {activity.image_url && (
        <div className="mx-auto max-w-xl overflow-hidden rounded-[2.5rem] border-8 border-white shadow-2xl transition-transform hover:scale-[1.02]">
          <NextImage 
            src={activity.image_url} 
            alt="Actividad" 
            width={800} 
            height={450} 
            className="w-full object-cover aspect-video" 
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      <Card className="overflow-hidden border-none bg-white p-8 shadow-card sm:p-12 rounded-[3rem]">
        {baseHeader}

        <div className="mt-8 transition-all duration-500">
          
          {/* MULTIPLE CHOICE / IMAGE SELECT */}
          {(activity.type === "multiple_choice_visual" || activity.type === "image_select") && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {options.map((option) => (
                <button
                  key={option.id}
                  disabled={completed}
                  className={cn(
                    "group relative flex flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border-4 p-6 transition-all duration-300",
                    selected === option.id 
                      ? "border-emerald-500 bg-emerald-50/50 shadow-xl -translate-y-2" 
                      : "border-slate-50 bg-slate-50/30 hover:border-brand-300 hover:bg-white"
                  )}
                  onClick={() => setSelected(option.id)}
                  type="button"
                >
                  {option.imageUrl && (
                    <div className="mb-4 aspect-square w-full overflow-hidden rounded-3xl border-2 border-white bg-white shadow-sm">
                        <NextImage
                          src={option.imageUrl}
                          alt={option.label}
                          width={300}
                          height={300}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                    </div>
                  )}
                  <div className="flex w-full items-center justify-center gap-4">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 transition-all",
                      selected === option.id ? "border-emerald-500 bg-emerald-500 text-white animate-in zoom-in-50" : "border-slate-200"
                    )}>
                      {selected === option.id && <CheckCircle2 className="h-6 w-6" />}
                    </div>
                    <span className={cn(
                      "text-2xl font-black text-center leading-tight tracking-tight",
                      selected === option.id ? "text-emerald-950" : "text-slate-700"
                    )}>
                      {option.label || (!option.imageUrl && "Opción sin texto")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* TRUE / FALSE */}
          {activity.type === "true_false" && (
            <div className="grid gap-8 max-w-3xl mx-auto md:grid-cols-2">
              <button
                disabled={completed}
                onClick={() => setSelected("true")}
                className={cn(
                   "flex flex-col items-center gap-6 rounded-[3rem] border-8 p-12 transition-all duration-500",
                   selected === "true" 
                    ? "border-emerald-500 bg-emerald-50 scale-105 shadow-2xl" 
                    : "border-slate-50 bg-slate-50/30 grayscale-[0.8] opacity-60 hover:opacity-100 hover:grayscale-0"
                )}
              >
                <div className={cn("flex h-24 w-24 items-center justify-center rounded-[2rem] shadow-lg", selected === "true" ? "bg-emerald-500 text-white" : "bg-white text-slate-300")}>
                    <CheckCircle2 className="h-14 w-14" />
                </div>
                <span className="text-4xl font-black tracking-tighter text-emerald-900 uppercase">¡Verdad!</span>
              </button>

              <button
                disabled={completed}
                onClick={() => setSelected("false")}
                className={cn(
                   "flex flex-col items-center gap-6 rounded-[3rem] border-8 p-12 transition-all duration-500",
                   selected === "false" 
                    ? "border-rose-500 bg-rose-50 scale-105 shadow-2xl" 
                    : "border-slate-50 bg-slate-50/50 grayscale-[0.8] opacity-60 hover:opacity-100 hover:grayscale-0"
                )}
              >
                <div className={cn("flex h-24 w-24 items-center justify-center rounded-[2rem] shadow-lg", selected === "false" ? "bg-rose-500 text-white" : "bg-white text-slate-300")}>
                    <X className="h-14 w-14" />
                </div>
                <span className="text-4xl font-black tracking-tighter text-rose-900 uppercase">Falso</span>
              </button>
            </div>
          )}

          {/* FILL IN THE BLANKS */}
          {activity.type === "fill_with_support" && (
            <div className="flex flex-col items-center justify-center space-y-8 max-w-2xl mx-auto py-6">
               <div className="relative w-full">
                  <input
                    disabled={completed}
                    className="h-24 w-full text-center rounded-[2.5rem] border-8 border-indigo-100 bg-indigo-50/30 px-8 text-4xl font-black text-brand-950 placeholder:text-indigo-200 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all shadow-inner"
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Escribe aquí..."
                    value={textAnswer}
                  />
                  <div className="absolute -top-4 -left-4 h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg">
                     <WandSparkles className="h-6 w-6" />
                  </div>
               </div>
               <p className="text-xl font-bold text-slate-400">¿Cuál es la palabra correcta?</p>
            </div>
          )}

          {/* SEQUENCE */}
          {activity.type === "sequence" && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 text-slate-400 font-bold mb-6 text-xl">
                 <MoveRight className="h-6 w-6" />
                 <span>Usa las flechas para ordenar los pasos:</span>
              </div>
              <div className="grid gap-3">
                {options.map((opt, index) => (
                  <div key={opt.id} className="flex items-center gap-6 rounded-[2rem] border-4 border-slate-50 bg-white p-6 shadow-sm transition-all hover:border-brand-200">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-2xl font-black text-white shadow-md">
                      {index + 1}
                    </div>
                    {opt.imageUrl && (
                       <div className="h-20 w-20 overflow-hidden rounded-xl border-2 border-slate-100 bg-slate-50">
                          <NextImage src={opt.imageUrl} alt={opt.label} width={100} height={100} className="object-cover h-full w-full" />
                       </div>
                    )}
                    <span className="flex-1 text-2xl font-black text-slate-800 tracking-tight">{opt.label}</span>
                    {!completed && (
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => moveOption(index, -1)} 
                          disabled={index === 0}
                          className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-brand-500 hover:text-white disabled:opacity-30 transition-all font-bold"
                        >
                          <ChevronUp strokeWidth={3} />
                        </button>
                        <button 
                          onClick={() => moveOption(index, 1)} 
                          disabled={index === options.length - 1}
                          className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-brand-500 hover:text-white disabled:opacity-30 transition-all font-bold"
                        >
                          <ChevronDown strokeWidth={3} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DRAG & DROP (Simplified as Collection) */}
          {activity.type === "drag_drop" && (
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    disabled={completed}
                    onClick={() => toggleMultiSelect(opt.id)}
                    className={cn(
                      "group relative flex flex-col items-center justify-center rounded-[2.5rem] border-8 p-8 transition-all duration-300",
                      multiSelected.includes(opt.id)
                        ? "border-amber-400 bg-amber-50 scale-105 shadow-xl"
                        : "border-slate-50 bg-slate-50 opacity-80 hover:opacity-100"
                    )}
                  >
                     <div className={cn(
                       "absolute -top-4 -right-4 h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform",
                       multiSelected.includes(opt.id) ? "bg-amber-500 text-white scale-110 rotate-12" : "bg-white text-slate-200"
                     )}>
                        <Star className="h-6 w-6" />
                     </div>
                     {opt.imageUrl && (
                       <div className="mb-4 h-32 w-full overflow-hidden rounded-2xl">
                          <NextImage src={opt.imageUrl} alt={opt.label} width={200} height={200} className="object-cover h-full w-full" />
                       </div>
                     )}
                     <span className="text-2xl font-black text-slate-800 tracking-tight">{opt.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-center font-bold text-slate-400">Toca para seleccionar todos los elementos correctos.</p>
            </div>
          )}

          {/* SENSORIAL / AUDIO GUIDED */}
          {(activity.type === "touch_activity" || activity.type === "audio_guided_response") && (
             <div className="flex flex-col items-center justify-center space-y-8 py-12 text-center">
                <div className={cn(
                  "flex h-40 w-40 items-center justify-center rounded-[3.5rem] bg-amber-100 text-amber-600 shadow-inner ring-8 ring-amber-50",
                  activity.type === "audio_guided_response" && "animate-pulse"
                )}>
                   {activity.type === "touch_activity" ? <Sparkles className="h-20 w-20" /> : <Mic className="h-20 w-20" />}
                </div>
                <div className="max-w-md space-y-4">
                  <h4 className="text-3xl font-black text-brand-950">¡Interacción Especial!</h4>
                  <p className="text-xl font-bold text-slate-600 leading-relaxed">
                    {activity.type === "touch_activity" 
                      ? "Explora la imagen superior y escucha los sonidos que el docente preparó para ti." 
                      : "¡Dinos qué piensas! El docente escuchará tu respuesta para darte tu medalla."
                    }
                  </p>
                </div>
             </div>
          )}

        </div>

        {/* FEEDBACK & CONFIRMATION AREA */}
        <div className="flex flex-col items-center justify-center pt-12 mt-12 border-t-2 border-slate-50">
          
          {feedback && (
             <div className={cn(
              "mb-12 flex flex-col items-center gap-4 animate-in zoom-in-50 slide-in-from-bottom-6 rounded-[3rem] px-12 py-8 text-center shadow-2xl transition-all",
              feedback.type === "success" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
            )}>
              {feedback.type === "success" ? <Trophy className="h-16 w-16" /> : <Star className="h-16 w-16" />}
              <span className="text-3xl font-black tracking-tighter leading-none">{feedback.message}</span>
            </div>
          )}

          <Button
            className={cn(
              "h-24 w-full md:w-auto md:min-w-[20rem] rounded-[2.5rem] px-16 text-3xl font-black uppercase tracking-tighter transition-all duration-300 shadow-2xl",
              (selected || multiSelected.length > 0 || textAnswer || ["sequence", "touch_activity", "audio_guided_response"].includes(activity.type))
                ? "bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/40 hover:-translate-y-2 hover:scale-105"
                : "bg-slate-100 text-slate-300 opacity-50 cursor-not-allowed"
            )}
            disabled={(!selected && multiSelected.length === 0 && !textAnswer && !["sequence", "touch_activity", "audio_guided_response"].includes(activity.type)) || pending || completed}
            onClick={handleValidation}
          >
            {completed ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8" />
                ¡Completado!
              </div>
            ) : "Comprobar"}
          </Button>
          
          {completed && (
             <p className="mt-8 text-xl font-black text-brand-500 tracking-widest uppercase animate-pulse">
                🌟 ¡Puntos Ganados! 🌟
             </p>
          )}
        </div>
      </Card>
    </div>
  );
}

