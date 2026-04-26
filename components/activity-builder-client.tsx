"use client";

import { useState } from "react";
import { Plus, Trash2, HelpCircle, Check, X, ImageIcon, Volume2, Target, ChevronUp, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/file-uploader";
import { cn } from "@/lib/utils";

// Tipos disponibles para el docente (solo mouse — sin teclado ni micrófono)
const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  multiple_choice_visual: "🔵 Opción Múltiple",
  image_select: "🏞️ Señalar la imagen correcta",
  true_false: "⚖️ Verdadero o Falso",
  sequence: "🔄 Ordenar elementos",
  drag_drop: "✋ Seleccionar los correctos",
  classify_two_columns: "📂 Clasificar en dos columnas",
  match_pairs: "🔗 Unir pares",
  word_bank: "💬 Completar con banco de palabras",
  touch_activity: "👆 Exploración libre"
};

type OptionItem = {
  id: string;
  label: string;
  imageUrl?: string;
  isCorrect?: boolean;
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
  leftImageUrl?: string;
  right: string;
  rightImageUrl?: string;
};

type WordBankSettings = {
  sentence: string;
  words: string[];
  correct: string;
};

type ActivityBuilderProps = {
  initialType?: string;
  initialSettings?: Record<string, unknown> | null;
};

export function ActivityBuilderClient({ initialType = "multiple_choice_visual", initialSettings }: ActivityBuilderProps) {
  const [activityType, setActivityType] = useState(initialType);
  
  // Inicialización de opciones desde settings o default
  const [options, setOptions] = useState<OptionItem[]>(() => {
    if (initialSettings?.options && Array.isArray(initialSettings.options)) {
      return (initialSettings.options as Record<string, unknown>[]).map((o: Record<string, unknown>, idx: number) => ({
        id: String(o.id || `opt-${idx}-${Date.now()}`),
        label: String(o.label || ""),
        imageUrl: String(o.imageUrl || ""),
        isCorrect: Boolean(o.isCorrect)
      }));
    }
    return [
      { id: "opt-1", label: "Primera opción", isCorrect: true },
      { id: "opt-2", label: "Segunda opción", isCorrect: false },
    ];
  });

  // True/False específicos
  const [isStatementTrue, setIsStatementTrue] = useState(() => {
    if (initialSettings?.correct !== undefined) {
      return String(initialSettings.correct) === "true";
    }
    return true;
  });

  // Fill in blanks
  const [expectedWord, setExpectedWord] = useState(() => {
    return String(initialSettings?.expected || "");
  });

  // Classify two columns
  const [columnALabel, setColumnALabel] = useState(() => String(initialSettings?.columnA || "Columna A"));
  const [columnBLabel, setColumnBLabel] = useState(() => String(initialSettings?.columnB || "Columna B"));
  const [classifyItems, setClassifyItems] = useState<ClassifyItem[]>(() => {
    if (initialSettings?.items && Array.isArray(initialSettings.items)) {
      return (initialSettings.items as Record<string, unknown>[]).map((o, idx) => ({
        id: String(o.id || `ci-${idx}`),
        label: String(o.label || ""),
        imageUrl: o.imageUrl ? String(o.imageUrl) : undefined,
        correctColumn: (o.correctColumn === "B" ? "B" : "A") as "A" | "B"
      }));
    }
    return [
      { id: "ci-1", label: "Ítem 1", correctColumn: "A" },
      { id: "ci-2", label: "Ítem 2", correctColumn: "B" },
      { id: "ci-3", label: "Ítem 3", correctColumn: "A" },
      { id: "ci-4", label: "Ítem 4", correctColumn: "B" },
    ];
  });

  // Match pairs
  const [matchPairs, setMatchPairs] = useState<MatchPair[]>(() => {
    if (initialSettings?.pairs && Array.isArray(initialSettings.pairs)) {
      return (initialSettings.pairs as Record<string, unknown>[]).map((p, idx) => ({
        id: String(p.id || `mp-${idx}`),
        left: String(p.left || ""),
        leftImageUrl: p.leftImageUrl ? String(p.leftImageUrl) : undefined,
        right: String(p.right || ""),
        rightImageUrl: p.rightImageUrl ? String(p.rightImageUrl) : undefined,
      }));
    }
    return [
      { id: "mp-1", left: "Par A izquierda", right: "Par A derecha" },
      { id: "mp-2", left: "Par B izquierda", right: "Par B derecha" },
    ];
  });

  // Word bank
  const [wbSentence, setWbSentence] = useState(() => String(initialSettings?.sentence || ""));
  const [wbWords, setWbWords] = useState<string[]>(() => {
    if (initialSettings?.words && Array.isArray(initialSettings.words)) {
      return (initialSettings.words as unknown[]).map(String);
    }
    return ["palabra1", "palabra2", "palabra3"];
  });
  const [wbCorrect, setWbCorrect] = useState(() => String(initialSettings?.correct || ""));

  const addOption = () => {
    setOptions([
      ...options, 
      { id: `opt-${Date.now()}`, label: ``, isCorrect: false }
    ]);
  };

  const removeOption = (idToRemove: string) => {
    setOptions(options.filter(o => o.id !== idToRemove));
  };

  const moveOption = (index: number, direction: -1 | 1) => {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= options.length) return;
    const newOptions = [...options];
    [newOptions[index], newOptions[nextIdx]] = [newOptions[nextIdx], newOptions[index]];
    setOptions(newOptions);
  };

  // --- Helpers: Classify Two Columns ---
  const addClassifyItem = () => setClassifyItems(prev => [
    ...prev, { id: `ci-${Date.now()}`, label: "", correctColumn: "A" }
  ]);
  const removeClassifyItem = (id: string) => setClassifyItems(prev => prev.filter(i => i.id !== id));
  const updateClassifyItem = (id: string, field: keyof ClassifyItem, value: string) =>
    setClassifyItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  // --- Helpers: Match Pairs ---
  const addMatchPair = () => setMatchPairs(prev => [
    ...prev, { id: `mp-${Date.now()}`, left: "", right: "" }
  ]);
  const removeMatchPair = (id: string) => setMatchPairs(prev => prev.filter(p => p.id !== id));
  const updateMatchPair = (id: string, field: keyof MatchPair, value: string) =>
    setMatchPairs(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

  // --- Helpers: Word Bank ---
  const addWbWord = () => setWbWords(prev => [...prev, ""]);
  const removeWbWord = (idx: number) => setWbWords(prev => prev.filter((_, i) => i !== idx));
  const updateWbWord = (idx: number, val: string) =>
    setWbWords(prev => prev.map((w, i) => i === idx ? val : w));

  const updateOption = (id: string, field: keyof OptionItem, value: string | boolean) => {
    setOptions(options.map(o => {
      if (o.id === id) {
        if (field === 'isCorrect' && value === true && (activityType === 'multiple_choice_visual' || activityType === 'image_select' || activityType === 'true_false')) {
          return { ...o, [field]: value };
        }
        return { ...o, [field]: value };
      }
      
      if (field === 'isCorrect' && value === true && (activityType === 'multiple_choice_visual' || activityType === 'image_select' || activityType === 'true_false')) {
        return { ...o, isCorrect: false };
      }
      return o;
    }));
  };

  // Generar el JSON final según el tipo seleccionado
  let finalSettings = {};
  if (["multiple_choice_visual", "image_select", "drag_drop", "sequence"].includes(activityType)) {
    finalSettings = {
      options: options.map((opt, index) => ({ ...opt, order: index + 1 }))
    };
  } else if (activityType === "true_false") {
    finalSettings = { correct: isStatementTrue ? "true" : "false" };
  } else if (activityType === "fill_with_support") {
    finalSettings = { expected: expectedWord };
  } else if (activityType === "classify_two_columns") {
    finalSettings = { columnA: columnALabel, columnB: columnBLabel, items: classifyItems };
  } else if (activityType === "match_pairs") {
    finalSettings = { pairs: matchPairs };
  } else if (activityType === "word_bank") {
    finalSettings = { sentence: wbSentence, words: wbWords, correct: wbCorrect };
  } else {
    finalSettings = { mode: "free_touch" };
  }
  
  const jsonOutput = JSON.stringify(finalSettings);

  return (
    <div className="space-y-6">
      <div className="rounded-[2.5rem] border-4 border-brand-100 bg-brand-50/50 p-8 shadow-inner">
        <label className="mb-6 flex items-center gap-3 text-lg font-black text-brand-950">
          <HelpCircle className="h-6 w-6 text-brand-500" />
          ¿Qué dinámica usará el alumno?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(ACTIVITY_TYPE_LABELS).map(([key, label]) => (
            <label 
              key={key} 
              className={cn(
                "group relative flex cursor-pointer flex-col items-start justify-center rounded-2xl border-4 p-4 transition-all duration-300",
                activityType === key 
                  ? "border-brand-500 bg-white shadow-xl -translate-y-1" 
                  : "border-transparent bg-white/40 hover:bg-white/80"
              )}
            >
              <input 
                type="radio" 
                name="type" 
                value={key} 
                checked={activityType === key} 
                onChange={(e) => setActivityType(e.target.value)}
                className="sr-only" 
              />
              <span className={cn(
                "text-sm font-black transition-colors",
                activityType === key ? "text-brand-950" : "text-brand-700/60 group-hover:text-brand-700"
              )}>
                {label}
              </span>
              {activityType === key && (
                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm animate-in zoom-in-50">
                   <Check className="h-3 w-3" />
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      <input type="hidden" name="settings_json" value={jsonOutput} />

      <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-card overflow-hidden">
        <div className="mb-8 border-b border-brand-50 pb-6 flex items-center justify-between">
           <div>
             <h3 className="text-2xl font-black text-brand-950 tracking-tight">Tablero de Configuración</h3>
             <p className="text-slate-500 font-medium text-sm mt-1">Personaliza el comportamiento de la dinámica seleccionada.</p>
           </div>
           <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center">
              <Target className="h-6 w-6 text-brand-500" />
           </div>
        </div>
        
        {(["multiple_choice_visual", "image_select", "sequence", "drag_drop"].includes(activityType)) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <p className="text-sm font-bold text-brand-700 uppercase tracking-widest">
                  {activityType === "sequence" ? "Pasos de la secuencia" : "Opciones disponibles"}
               </p>
               <Badge className="bg-brand-100 text-brand-700 hover:bg-brand-100 border-none px-3 font-bold">
                  {options.length} {options.length === 1 ? 'elemento' : 'elementos'}
               </Badge>
            </div>
            
            <div className="grid gap-4">
              {options.map((opt, index) => (
                <div 
                  key={opt.id} 
                  className={cn(
                    "relative flex flex-col sm:flex-row items-center gap-6 rounded-[2rem] border-4 p-6 transition-all",
                    opt.isCorrect && activityType !== 'sequence' 
                      ? "border-emerald-200 bg-emerald-50/50" 
                      : "border-slate-50 bg-slate-50/30"
                  )}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-white text-lg font-black shadow-sm ring-4 ring-slate-100">
                    {activityType === "sequence" ? index + 1 : (
                      opt.isCorrect && activityType !== "sequence" ? <Check className="h-6 w-6 text-emerald-500" /> : index + 1
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex-1">
                        <label className="mb-2 block text-xs font-bold text-slate-400 uppercase tracking-wider">Texto de la carta</label>
                        <input 
                          value={opt.label} 
                          onChange={(e) => updateOption(opt.id, 'label', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-50" 
                          placeholder={activityType === 'image_select' ? "Nombre de la imagen" : `Ej: Opción ${index + 1}`}
                        />
                      </div>
                      
                      {(activityType === 'multiple_choice_visual' || activityType === 'image_select' || activityType === 'drag_drop') && (
                        <div className="flex flex-col items-center">
                            <label className="mb-2 block text-xs font-bold text-slate-400 uppercase tracking-wider">
                               {activityType === 'drag_drop' ? "¿Es arrastrado?" : "¿Es correcta?"}
                            </label>
                            <button
                              type="button"
                              onClick={() => updateOption(opt.id, 'isCorrect', !opt.isCorrect)}
                              className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-xl transition-all shadow-sm",
                                opt.isCorrect ? "bg-emerald-500 text-white scale-110" : "bg-white text-slate-300 hover:text-emerald-400"
                              )}
                            >
                              <Check className="h-6 w-6" />
                            </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="rounded-xl bg-white/50 p-4 border border-dashed border-slate-200">
                      <FileUploader 
                        name={`img_${opt.id}`} 
                        accept="image/*" 
                        label={activityType === "image_select" ? "Cargar Imagen Requerida" : "Imagen de Apoyo (Opcional)"}
                        initialUrl={opt.imageUrl}
                        onUploadSuccess={(url) => updateOption(opt.id, 'imageUrl', url)}
                        onClear={() => updateOption(opt.id, 'imageUrl', '')}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {options.length > 2 && (
                      <button 
                        type="button" 
                        onClick={() => removeOption(opt.id)} 
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-300 hover:text-rose-500 transition-all border border-rose-100"
                        title="Eliminar opción"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={() => moveOption(index, -1)} 
                      disabled={index === 0}
                      className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-brand-500 hover:text-white disabled:opacity-30 transition-all"
                    >
                      <ChevronUp strokeWidth={3} className="h-5 w-5" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => moveOption(index, 1)} 
                      disabled={index === options.length - 1}
                      className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-brand-500 hover:text-white disabled:opacity-30 transition-all"
                    >
                      <ChevronDown strokeWidth={3} className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              type="button" 
              variant="ghost" 
              onClick={addOption} 
              className="mt-6 border-4 border-dashed border-brand-100 bg-brand-50/30 text-brand-600 hover:bg-brand-50 hover:border-brand-200 rounded-2xl h-16 w-full font-black text-lg transition-all"
            >
              <Plus className="mr-2 h-6 w-6" /> Añadir Carta Visual
            </Button>
          </div>
        )}

        {activityType === "true_false" && (
          <div className="space-y-8 py-4">
            <div className="flex items-center justify-center gap-3">
               <div className="h-10 w-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <HelpCircle className="h-5 w-5" />
               </div>
               <p className="text-lg font-bold text-slate-700">La consigna escrita arriba es:</p>
            </div>
            <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
              <label 
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[2.5rem] border-4 p-8 transition-all duration-500 shadow-sm",
                  isStatementTrue 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 scale-105 shadow-xl" 
                    : "border-slate-50 bg-slate-50/50 text-slate-400 opacity-60 hover:opacity-100"
                )}
              >
                <input type="radio" checked={isStatementTrue} onChange={() => setIsStatementTrue(true)} className="sr-only" />
                <div className={cn("flex h-16 w-16 items-center justify-center rounded-3xl transition-colors", isStatementTrue ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400")}>
                    <Check className="h-10 w-10" />
                </div>
                <span className="text-2xl font-black uppercase tracking-tighter">¡Verdad!</span>
              </label>
              
              <label 
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[2.5rem] border-4 p-8 transition-all duration-500 shadow-sm",
                  !isStatementTrue 
                    ? "border-rose-500 bg-rose-50 text-rose-800 scale-105 shadow-xl" 
                    : "border-slate-50 bg-slate-50/50 text-slate-400 opacity-60 hover:opacity-100"
                )}
              >
                <input type="radio" checked={!isStatementTrue} onChange={() => setIsStatementTrue(false)} className="sr-only" />
                <div className={cn("flex h-16 w-16 items-center justify-center rounded-3xl transition-colors", !isStatementTrue ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-400")}>
                    <X className="h-10 w-10" />
                </div>
                <span className="text-2xl font-black uppercase tracking-tighter">Falso</span>
              </label>
            </div>
          </div>
        )}

        {activityType === "fill_with_support" && (
          <div className="space-y-6 max-w-2xl mx-auto py-4">
             <div className="rounded-[2rem] bg-indigo-50 p-8 border-2 border-indigo-100">
                <label className="mb-4 block text-sm font-black text-indigo-900 uppercase tracking-widest text-center">Respuesta Correcta Esperada</label>
                <input 
                  value={expectedWord}
                  onChange={(e) => setExpectedWord(e.target.value)}
                  className="w-full text-center rounded-3xl border-4 border-indigo-200 bg-white px-6 py-6 text-4xl font-black text-indigo-950 focus:border-indigo-500 focus:outline-none shadow-xl transition-all" 
                  placeholder="Escribe aquí..."
                />
             </div>
          </div>
        )}

        {activityType === "touch_activity" && (
          <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
             <div className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-brand-50 text-brand-500 shadow-inner">
                <ImageIcon className="h-12 w-12" />
             </div>
             <div className="max-w-md space-y-2">
               <h4 className="text-xl font-black text-brand-950">¡Configuración Simplificada!</h4>
               <p className="text-slate-500 font-medium">El alumno explorará la imagen y escuchará los sonidos. ¡Sube tu imagen principal arriba!</p>
             </div>
          </div>
        )}

        {/* ── CLASIFICAR EN DOS COLUMNAS ── */}
        {activityType === "classify_two_columns" && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-sky-50 p-5 border-2 border-sky-100">
                <label className="mb-2 block text-xs font-black text-sky-800 uppercase tracking-widest">Nombre Columna A</label>
                <input
                  value={columnALabel}
                  onChange={(e) => setColumnALabel(e.target.value)}
                  className="w-full rounded-xl border-2 border-sky-200 bg-white px-4 py-3 font-bold text-slate-800 focus:border-sky-500 focus:outline-none"
                  placeholder="Ej: Seres vivos"
                />
              </div>
              <div className="rounded-2xl bg-rose-50 p-5 border-2 border-rose-100">
                <label className="mb-2 block text-xs font-black text-rose-800 uppercase tracking-widest">Nombre Columna B</label>
                <input
                  value={columnBLabel}
                  onChange={(e) => setColumnBLabel(e.target.value)}
                  className="w-full rounded-xl border-2 border-rose-200 bg-white px-4 py-3 font-bold text-slate-800 focus:border-rose-500 focus:outline-none"
                  placeholder="Ej: Seres inertes"
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-black text-brand-700 uppercase tracking-widest">Ítems para clasificar</p>
              {classifyItems.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4">
                  <input
                    value={item.label}
                    onChange={(e) => updateClassifyItem(item.id, "label", e.target.value)}
                    className="flex-1 min-w-[140px] rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-800 focus:border-brand-400 focus:outline-none"
                    placeholder="Nombre del ítem"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateClassifyItem(item.id, "correctColumn", "A")}
                      className={cn(
                        "rounded-xl px-4 py-2 text-sm font-black transition-all",
                        item.correctColumn === "A" ? "bg-sky-500 text-white shadow-md" : "bg-white border-2 border-sky-200 text-sky-700 hover:bg-sky-50"
                      )}
                    >
                      → {columnALabel || "A"}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateClassifyItem(item.id, "correctColumn", "B")}
                      className={cn(
                        "rounded-xl px-4 py-2 text-sm font-black transition-all",
                        item.correctColumn === "B" ? "bg-rose-500 text-white shadow-md" : "bg-white border-2 border-rose-200 text-rose-700 hover:bg-rose-50"
                      )}
                    >
                      → {columnBLabel || "B"}
                    </button>
                  </div>
                  {classifyItems.length > 2 && (
                    <button type="button" onClick={() => removeClassifyItem(item.id)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-400 hover:text-rose-600 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" onClick={addClassifyItem}
              className="w-full border-4 border-dashed border-brand-100 bg-brand-50/30 text-brand-600 hover:bg-brand-50 rounded-2xl h-14 font-black transition-all">
              <Plus className="mr-2 h-5 w-5" /> Agregar ítem
            </Button>
          </div>
        )}

        {/* ── UNIR PARES ── */}
        {activityType === "match_pairs" && (
          <div className="space-y-4">
            <p className="text-sm font-black text-brand-700 uppercase tracking-widest">Pares a unir</p>
            {matchPairs.map((pair, index) => (
              <div key={pair.id} className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-black text-violet-700 shadow-sm">
                  {index + 1}
                </div>
                <input
                  value={pair.left}
                  onChange={(e) => updateMatchPair(pair.id, "left", e.target.value)}
                  className="flex-1 min-w-[120px] rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-800 focus:border-violet-400 focus:outline-none"
                  placeholder="Lado izquierdo"
                />
                <div className="text-slate-300 font-black text-xl">↔</div>
                <input
                  value={pair.right}
                  onChange={(e) => updateMatchPair(pair.id, "right", e.target.value)}
                  className="flex-1 min-w-[120px] rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-800 focus:border-violet-400 focus:outline-none"
                  placeholder="Lado derecho"
                />
                {matchPairs.length > 2 && (
                  <button type="button" onClick={() => removeMatchPair(pair.id)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-400 hover:text-rose-600 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <Button type="button" variant="ghost" onClick={addMatchPair}
              className="w-full border-4 border-dashed border-brand-100 bg-brand-50/30 text-brand-600 hover:bg-brand-50 rounded-2xl h-14 font-black transition-all">
              <Plus className="mr-2 h-5 w-5" /> Agregar par
            </Button>
          </div>
        )}

        {/* ── BANCO DE PALABRAS ── */}
        {activityType === "word_bank" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="rounded-2xl bg-amber-50 p-6 border-2 border-amber-100">
              <label className="mb-2 block text-sm font-black text-amber-900 uppercase tracking-widest">
                Frase (usá ___ donde va el espacio en blanco)
              </label>
              <input
                value={wbSentence}
                onChange={(e) => setWbSentence(e.target.value)}
                className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 font-bold text-slate-800 focus:border-amber-500 focus:outline-none"
                placeholder="Ej: El perro es un ser ___"
              />
              <p className="mt-2 text-xs font-bold text-amber-600">Usá exactamente tres guiones bajos: ___</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-black text-brand-700 uppercase tracking-widest">Palabras del banco</p>
              {wbWords.map((word, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    value={word}
                    onChange={(e) => updateWbWord(idx, e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-800 focus:border-brand-400 focus:outline-none"
                    placeholder={`Palabra ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => setWbCorrect(word)}
                    title="Marcar como correcta"
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl transition-all border-2",
                      wbCorrect === word ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-300 hover:text-emerald-400"
                    )}
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  {wbWords.length > 2 && (
                    <button type="button" onClick={() => removeWbWord(idx)} className="h-11 w-11 flex items-center justify-center rounded-xl bg-rose-50 text-rose-400 hover:text-rose-600 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {wbCorrect && (
                <p className="text-xs font-bold text-emerald-600 mt-1">✓ Respuesta correcta: <span className="bg-emerald-100 px-2 py-0.5 rounded-lg">{wbCorrect}</span></p>
              )}
            </div>
            <Button type="button" variant="ghost" onClick={addWbWord}
              className="w-full border-4 border-dashed border-brand-100 bg-brand-50/30 text-brand-600 hover:bg-brand-50 rounded-2xl h-14 font-black transition-all">
              <Plus className="mr-2 h-5 w-5" /> Agregar palabra
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span style={style} className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset", className)}>
      {children}
    </span>
  );
}


