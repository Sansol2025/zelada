"use client";

import NextImage from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  MoveRight, 
  Sparkles, 
  WandSparkles, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Trophy, 
  Star, 
  Lightbulb, 
  Mic,
  Loader2
} from "lucide-react";
import confetti from "canvas-confetti";

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
  initialStatus?: string | null;
  initialResponse?: Record<string, unknown> | null;
  onCompleted?: () => void;
};

type OptionItem = {
  id: string;
  label: string;
  imageUrl?: string;
  audioUrl?: string;
  isCorrect?: boolean;
  order?: number;
};

type ClassifyItem = {
  id: string;
  label: string;
  imageUrl?: string;
  correctColumn: "A" | "B";
};

type MatchPair = {
  id: string;
  left: string;
  right: string;
};

// Mezcla un array sin mutar el original
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

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
          audioUrl: value.audioUrl ? String(value.audioUrl) : undefined,
          isCorrect: Boolean(value.isCorrect),
          order: value.order ? Number(value.order) : idx + 1
        };
      }
      return null;
    })
    .filter(Boolean) as OptionItem[];
}

export function ActivityRenderer({ activity, studentId, initialStatus, initialResponse, onCompleted }: ActivityRendererProps) {
  const router = useRouter();
  const startedAt = useMemo(() => Date.now(), []);
  
  // Initialize states from initialResponse if available
  const [selected, setSelected] = useState<string | null>(() => {
    if (initialResponse?.selected) return String(initialResponse.selected);
    return null;
  });
  const [multiSelected, setMultiSelected] = useState<string[]>(() => {
    if (Array.isArray(initialResponse?.selectedIds)) return initialResponse.selectedIds.map(String);
    return [];
  });
  const [textAnswer, setTextAnswer] = useState(() => {
    if (initialResponse?.textAnswer) return String(initialResponse.textAnswer);
    return "";
  });

  const [options, setOptions] = useState<OptionItem[]>(() => parseOptions(activity.settings_json));
  const [pending, setPending] = useState(false);
  const [completed, setCompleted] = useState(() => {
    return initialStatus === "completed";
  });
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // classify_two_columns
  const classifyItems = useMemo<ClassifyItem[]>(() => {
    const raw = activity.settings_json?.items;
    if (!Array.isArray(raw)) return [];
    return shuffle(raw.map((i: Record<string, unknown>, idx: number) => ({
      id: String(i.id ?? idx),
      label: String(i.label ?? ""),
      imageUrl: i.imageUrl ? String(i.imageUrl) : undefined,
      correctColumn: (i.correctColumn === "B" ? "B" : "A") as "A" | "B"
    })));
  }, [activity.settings_json]);
  const [classifyAssigned, setClassifyAssigned] = useState<Record<string, "A" | "B" | null>>({});
  const [classifySelected, setClassifySelected] = useState<string | null>(null);

  // match_pairs
  const matchPairs = useMemo<MatchPair[]>(() => {
    const raw = activity.settings_json?.pairs;
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((p, idx) => ({
      id: String(p.id ?? idx),
      left: String(p.left ?? ""),
      right: String(p.right ?? "")
    }));
  }, [activity.settings_json]);
  const shuffledRights = useMemo(() => shuffle(matchPairs.map(p => ({ id: p.id, label: p.right }))), [matchPairs]);
  const [matchSelectedLeft, setMatchSelectedLeft] = useState<string | null>(null);
  const [matchConnections, setMatchConnections] = useState<Record<string, string>>({}); // leftId → rightId

  // word_bank
  const wbSentence = String(activity.settings_json?.sentence ?? "");
  const wbWords = useMemo<string[]>(() => {
    const raw = activity.settings_json?.words;
    return Array.isArray(raw) ? shuffle(raw.map(String)) : [];
  }, [activity.settings_json]);
  const wbCorrect = String(activity.settings_json?.correct ?? "");
  const [wbSelected, setWbSelected] = useState<string | null>(() => {
    if (initialResponse?.selected) return String(initialResponse.selected);
    return null;
  });

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
    setError(null);
    try {
      const timeSpent = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      const res = await fetch(`/api/student/activities/${activity.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          response_json: response,
          time_spent_seconds: timeSpent
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo guardar el progreso");
      }

      setCompleted(true);
      onCompleted?.();
      router.refresh();
    } catch (err) {
      console.error("Error saving progress:", err);
      setError(err instanceof Error ? err.message : "Error al guardar el progreso");
    } finally {
      setPending(false);
    }
  };

  const playOptionAudio = (id: string) => {
    const opt = options.find(o => o.id === id);
    if (opt?.audioUrl) {
      const audio = new Audio(opt.audioUrl);
      audio.play().catch(e => console.error("Error playing option audio:", e));
    }
  };

  const celebrate = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#43b8f4", "#facc15", "#f43f5e", "#10b981"]
    });
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
      const correctIds = options.filter(o => o.isCorrect).map(o => o.id).sort();
      const selectedIds = [...multiSelected].sort();
      isCorrect = correctIds.length === selectedIds.length && correctIds.every((id, i) => id === selectedIds[i]);
      responseData.selectedIds = multiSelected;
    } else if (activity.type === "classify_two_columns") {
      isCorrect = classifyItems.every(item => classifyAssigned[item.id] === item.correctColumn);
      responseData.assigned = classifyAssigned;
    } else if (activity.type === "match_pairs") {
      isCorrect = matchPairs.every(pair => matchConnections[pair.id] === pair.id);
      responseData.connections = matchConnections;
    } else if (activity.type === "word_bank") {
      isCorrect = wbSelected?.trim().toLowerCase() === wbCorrect.trim().toLowerCase();
      responseData.selected = wbSelected;
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
    if (completed) return;
    if (!multiSelected.includes(id)) {
      playOptionAudio(id);
    }
    setMultiSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSingleSelect = (id: string) => {
    if (completed) return;
    setSelected(id);
    playOptionAudio(id);
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
                  onClick={() => handleSingleSelect(option.id)}
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

          {/* SEQUENCE (Ordering) */}
          {activity.type === "sequence" && (
            <div className="space-y-4 max-w-2xl mx-auto px-2">
              <div className="flex items-center gap-3 text-slate-400 font-bold mb-6 text-lg sm:text-xl px-2">
                 <MoveRight className="h-5 w-5 sm:h-6 sm:w-6" />
                 <span>Ordená los pasos de arriba hacia abajo:</span>
              </div>
              <div className="flex flex-col gap-4">
                {options.map((opt, index) => (
                  <div 
                    key={opt.id} 
                    className={cn(
                      "flex items-center gap-3 sm:gap-6 rounded-[1.5rem] sm:rounded-[2rem] border-4 bg-white p-3 sm:p-5 shadow-sm transition-all relative overflow-hidden",
                      completed ? "border-slate-100 opacity-80" : "border-slate-50 hover:border-brand-200 hover:shadow-md"
                    )}
                  >
                    {/* Visual Number Badge */}
                    <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-brand-950 text-lg sm:text-2xl font-black text-white shadow-md z-10">
                      {index + 1}
                    </div>

                    {/* Item Content Area */}
                    <div className="flex flex-1 items-center gap-3 min-w-0">
                      {opt.imageUrl && (
                        <div className="h-14 w-14 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 border-slate-100 bg-slate-50">
                          <NextImage 
                            src={opt.imageUrl} 
                            alt={opt.label} 
                            width={100} 
                            height={100} 
                            className="object-cover h-full w-full" 
                          />
                        </div>
                      )}
                      <span className="flex-1 text-base sm:text-xl font-black text-slate-800 tracking-tight leading-tight break-words line-clamp-2">
                        {opt.label}
                      </span>
                    </div>

                    {/* Reordering Controls */}
                    {!completed && (
                      <div className="flex flex-col gap-1.5 sm:gap-2 z-10">
                        <button 
                          onClick={() => moveOption(index, -1)} 
                          disabled={index === 0}
                          className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-brand-500 hover:text-white disabled:opacity-30 transition-all font-bold shadow-sm"
                          aria-label="Subir"
                        >
                          <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} />
                        </button>
                        <button 
                          onClick={() => moveOption(index, 1)} 
                          disabled={index === options.length - 1}
                          className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-brand-500 hover:text-white disabled:opacity-30 transition-all font-bold shadow-sm"
                          aria-label="Bajar"
                        >
                          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} />
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

          {/* ── CLASIFICAR EN DOS COLUMNAS ── */}
          {activity.type === "classify_two_columns" && (() => {
            const colA = String(activity.settings_json?.columnA ?? "Columna A");
            const colB = String(activity.settings_json?.columnB ?? "Columna B");
            const unassigned = classifyItems.filter(i => classifyAssigned[i.id] == null);
            const inA = classifyItems.filter(i => classifyAssigned[i.id] === "A");
            const inB = classifyItems.filter(i => classifyAssigned[i.id] === "B");

            const handleItemClick = (id: string) => {
              if (completed) return;
              setClassifySelected(prev => prev === id ? null : id);
            };
            const handleColumnClick = (col: "A" | "B") => {
              if (!classifySelected || completed) return;
              setClassifyAssigned(prev => ({ ...prev, [classifySelected]: col }));
              setClassifySelected(null);
            };
            const resetItem = (id: string) => {
              if (completed) return;
              setClassifyAssigned(prev => { const n = { ...prev }; delete n[id]; return n; });
            };

            const ItemCard = ({ item, inColumn }: { item: ClassifyItem; inColumn?: boolean }) => (
              <button
                type="button"
                onClick={() => inColumn ? resetItem(item.id) : handleItemClick(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-4 px-4 py-3 font-black text-lg transition-all duration-200",
                  classifySelected === item.id
                    ? "border-brand-500 bg-brand-50 scale-105 shadow-lg"
                    : inColumn
                    ? "border-slate-100 bg-white hover:border-rose-200 hover:bg-rose-50"
                    : "border-slate-100 bg-white hover:border-brand-300 hover:bg-brand-50/30"
                )}
              >
                {item.imageUrl && (
                  <NextImage src={item.imageUrl} alt={item.label} width={48} height={48} className="h-12 w-12 rounded-xl object-cover" />
                )}
                <span className="text-slate-800">{item.label}</span>
                {inColumn && <span className="ml-auto text-xs text-slate-300 font-medium">✕</span>}
              </button>
            );

            return (
              <div className="space-y-6">
                {/* Instrucción contextual */}
                {classifySelected ? (
                  <p className="text-center text-lg font-black text-brand-600 animate-pulse">
                    ¿Dónde va <span className="bg-brand-100 px-2 py-1 rounded-xl">{classifyItems.find(i => i.id === classifySelected)?.label}</span>? Hacé click en una columna.
                  </p>
                ) : (
                  <p className="text-center text-base font-bold text-slate-400">Hacé click en una tarjeta y luego en la columna correcta.</p>
                )}

                {/* Columnas destino */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {(["A", "B"] as const).map((col) => {
                    const isCol = col === "A";
                    const items = isCol ? inA : inB;
                    const label = isCol ? colA : colB;
                    return (
                      <div
                        key={col}
                        onClick={() => handleColumnClick(col)}
                        className={cn(
                          "min-h-[140px] rounded-[2rem] border-4 p-4 transition-all duration-200 cursor-pointer",
                          classifySelected
                            ? isCol ? "border-sky-400 bg-sky-50 shadow-lg scale-[1.01]" : "border-rose-400 bg-rose-50 shadow-lg scale-[1.01]"
                            : isCol ? "border-sky-200 bg-sky-50/50" : "border-rose-200 bg-rose-50/50"
                        )}
                      >
                        <p className={cn("mb-3 text-center text-sm font-black uppercase tracking-widest", isCol ? "text-sky-700" : "text-rose-700")}>{label}</p>
                        <div className="flex flex-wrap gap-2">
                          {items.map(item => <ItemCard key={item.id} item={item} inColumn />)}
                          {items.length === 0 && (
                            <p className="w-full text-center text-sm text-slate-300 font-medium py-4">
                              {classifySelected ? "← Hacé click acá" : "Vacío"}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Baraja sin asignar */}
                {unassigned.length > 0 && (
                  <div className="rounded-[2rem] border-4 border-dashed border-slate-200 bg-slate-50/30 p-4">
                    <p className="mb-3 text-center text-xs font-black uppercase tracking-widest text-slate-400">Por clasificar</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {unassigned.map(item => <ItemCard key={item.id} item={item} />)}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── UNIR PARES ── */}
          {activity.type === "match_pairs" && (() => {
            const handleLeftClick = (id: string) => {
              if (completed) return;
              setMatchSelectedLeft(prev => prev === id ? null : id);
            };
            const handleRightClick = (id: string) => {
              if (!matchSelectedLeft || completed) return;
              setMatchConnections(prev => ({ ...prev, [matchSelectedLeft]: id }));
              setMatchSelectedLeft(null);
            };
            const disconnectPair = (leftId: string) => {
              if (completed) return;
              setMatchConnections(prev => { const n = { ...prev }; delete n[leftId]; return n; });
            };

            return (
              <div className="space-y-4 max-w-3xl mx-auto">
                {matchSelectedLeft ? (
                  <p className="text-center text-base font-black text-violet-600 animate-pulse">Ahora hacé click en el par correcto de la derecha →</p>
                ) : (
                  <p className="text-center text-base font-bold text-slate-400">Hacé click en un ítem de la izquierda y luego en su par.</p>
                )}

                <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-start">
                  {/* Columna izquierda */}
                  <div className="space-y-3">
                    {matchPairs.map((pair) => {
                      const isConnected = matchConnections[pair.id] != null;
                      const isActive = matchSelectedLeft === pair.id;
                      return (
                        <button
                          key={pair.id}
                          type="button"
                          onClick={() => isConnected ? disconnectPair(pair.id) : handleLeftClick(pair.id)}
                          className={cn(
                            "w-full rounded-2xl border-4 px-5 py-4 text-left font-black text-lg transition-all duration-200",
                            isActive ? "border-violet-500 bg-violet-50 scale-105 shadow-lg" :
                            isConnected ? "border-emerald-400 bg-emerald-50" :
                            "border-slate-100 bg-white hover:border-violet-300"
                          )}
                        >
                          {pair.left}
                          {isConnected && <span className="ml-2 text-emerald-500 text-sm">✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Línea central */}
                  <div className="flex flex-col items-center gap-3 pt-2">
                    {matchPairs.map((pair) => (
                      <div key={pair.id} className={cn(
                        "h-14 w-1 rounded-full transition-all duration-300",
                        matchConnections[pair.id] != null ? "bg-emerald-400" : "bg-slate-100"
                      )} />
                    ))}
                  </div>

                  {/* Columna derecha (mezclada) */}
                  <div className="space-y-3">
                    {shuffledRights.map((right) => {
                      const isConnected = Object.values(matchConnections).includes(right.id);
                      return (
                        <button
                          key={right.id}
                          type="button"
                          onClick={() => handleRightClick(right.id)}
                          className={cn(
                            "w-full rounded-2xl border-4 px-5 py-4 text-left font-black text-lg transition-all duration-200",
                            isConnected ? "border-emerald-400 bg-emerald-50 opacity-60" :
                            matchSelectedLeft ? "border-violet-200 bg-violet-50/50 hover:border-violet-500 hover:scale-105" :
                            "border-slate-100 bg-white"
                          )}
                        >
                          {right.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── BANCO DE PALABRAS ── */}
          {activity.type === "word_bank" && (() => {
            const parts = wbSentence.split("___");
            return (
              <div className="flex flex-col items-center gap-10 max-w-2xl mx-auto py-4">
                {/* Frase con hueco */}
                <div className="rounded-[2rem] border-4 border-slate-100 bg-slate-50 px-8 py-8 text-3xl font-black text-slate-800 text-center leading-relaxed shadow-inner w-full">
                  {parts[0]}
                  <span className={cn(
                    "inline-block mx-2 min-w-[120px] rounded-2xl border-b-4 px-4 py-1 text-center transition-all duration-300",
                    wbSelected ? "border-amber-400 bg-amber-50 text-amber-900" : "border-slate-300 bg-white text-slate-300"
                  )}>
                    {wbSelected ?? "_ _ _"}
                  </span>
                  {parts[1]}
                </div>

                {/* Banco de palabras */}
                <div className="flex flex-wrap justify-center gap-4">
                  {wbWords.map((word) => (
                    <button
                      key={word}
                      type="button"
                      disabled={completed}
                      onClick={() => setWbSelected(prev => prev === word ? null : word)}
                      className={cn(
                        "rounded-2xl border-4 px-6 py-4 text-2xl font-black transition-all duration-200",
                        wbSelected === word
                          ? "border-amber-400 bg-amber-400 text-white scale-110 shadow-xl"
                          : "border-slate-100 bg-white text-slate-700 hover:border-amber-300 hover:-translate-y-1 hover:shadow-md"
                      )}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

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
              (selected || multiSelected.length > 0 || textAnswer || wbSelected ||
               Object.keys(classifyAssigned).length === classifyItems.length && classifyItems.length > 0 ||
               Object.keys(matchConnections).length === matchPairs.length && matchPairs.length > 0 ||
               ["sequence", "touch_activity", "audio_guided_response"].includes(activity.type))
                ? "bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/40 hover:-translate-y-2 hover:scale-105"
                : "bg-slate-100 text-slate-300 opacity-50 cursor-not-allowed",
              error && "bg-rose-600 text-white"
            )}
            disabled={(() => {
            if (completed || pending) return true;
            const t = activity.type;
            if (t === "multiple_choice_visual" || t === "image_select" || t === "true_false") return !selected;
            if (t === "drag_drop") return multiSelected.length === 0;
            if (t === "fill_with_support") return !textAnswer;
            if (t === "classify_two_columns") return Object.keys(classifyAssigned).length < classifyItems.length;
            if (t === "match_pairs") return Object.keys(matchConnections).length < matchPairs.length;
            if (t === "word_bank") return !wbSelected;
            return false; // sequence, touch_activity, audio_guided_response siempre habilitado
          })()}
            onClick={handleValidation}
          >
            {pending ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : completed ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8" />
                ¡Completado!
              </div>
            ) : error ? (
              "Reintentar"
            ) : "Comprobar"}
          </Button>
          
          {error && (
            <p className="mt-4 text-center font-bold text-rose-600 animate-bounce">
              ⚠️ {error}. Por favor intenta de nuevo.
            </p>
          )}
          
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

