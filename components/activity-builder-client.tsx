"use client";

import { useState } from "react";
import { Plus, Trash2, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  multiple_choice_visual: "🔵 Opción Múltiple (Recomendado)",
  image_select: "🏞️ Señalar la imagen correcta",
  true_false: "⚖️ Verdadero o Falso",
  sequence: "🔄 Ordenar elementos (Secuencia)",
  fill_with_support: "✍️ Completar palabra/frase",
  drag_drop: "✋ Arrastrar y Soltar",
  touch_activity: "👆 Tocar libremente (Sensorial)",
  audio_guided_response: "🎙️ Responder grabando voz"
};

type OptionItem = {
  id: string;
  label: string;
  imageUrl?: string;
  isCorrect?: boolean;
};

export function ActivityBuilderClient({ initialType = "multiple_choice_visual" }) {
  const [activityType, setActivityType] = useState(initialType);
  const [options, setOptions] = useState<OptionItem[]>([
    { id: "opt-1", label: "Primera opción", isCorrect: true },
    { id: "opt-2", label: "Segunda opción", isCorrect: false },
  ]);

  // True/False específicos
  const [isStatementTrue, setIsStatementTrue] = useState(true);

  // Fill in blanks
  const [expectedWord, setExpectedWord] = useState("");

  const addOption = () => {
    setOptions([
      ...options, 
      { id: `opt-${Date.now()}`, label: `Opción ${options.length + 1}`, isCorrect: false }
    ]);
  };

  const removeOption = (idToRemove: string) => {
    setOptions(options.filter(o => o.id !== idToRemove));
  };

  const updateOption = (id: string, field: keyof OptionItem, value: string | boolean) => {
    setOptions(options.map(o => {
      if (o.id === id) {
        if (field === 'isCorrect' && value === true) {
          // Si es true/false (radio button behavior), desmarcar las demás
          return { ...o, [field]: value };
        }
        return { ...o, [field]: value };
      }
      if (field === 'isCorrect' && value === true) {
        return { ...o, isCorrect: false }; // Single correct answer for now for simplicity
      }
      return o;
    }));
  };

  // Generar el JSON final oculto según el tipo
  let finalSettings = {};
  if (activityType === "multiple_choice_visual" || activityType === "image_select" || activityType === "drag_drop" || activityType === "sequence") {
    finalSettings = { options };
  } else if (activityType === "true_false") {
    finalSettings = { correct: isStatementTrue ? "true" : "false" };
  } else if (activityType === "fill_with_support") {
    finalSettings = { expected: expectedWord };
  }
  
  const jsonOutput = JSON.stringify(finalSettings);

  return (
    <div className="space-y-6">
      {/* Selector de Tipo */}
      <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-6">
        <label className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-900">
          <HelpCircle className="h-5 w-5 text-brand-500" />
          ¿Qué regla o dinámica de juego usarán los alumnos?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(ACTIVITY_TYPE_LABELS).map(([key, label]) => (
            <label 
              key={key} 
              className={`flex cursor-pointer items-center rounded-xl border-2 p-3 transition-all hover:bg-white ${
                activityType === key 
                  ? "border-brand-500 bg-white shadow-md ring-2 ring-brand-200" 
                  : "border-transparent bg-white/50 opacity-80"
              }`}
            >
              <input 
                type="radio" 
                name="type" 
                value={key} 
                checked={activityType === key} 
                onChange={(e) => setActivityType(e.target.value)}
                className="sr-only" 
              />
              <span className={`text-sm font-bold ${activityType === key ? "text-brand-900" : "text-brand-700"}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Input JSON Oculto que consume el Action nativo */}
      <input type="hidden" name="settings_json" value={jsonOutput} />

      {/* Constructor Visual Específico */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-black text-brand-950">Configura el tablero de la actividad</h3>
        
        {(activityType === "multiple_choice_visual" || activityType === "image_select" || activityType === "sequence" || activityType === "drag_drop") && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-500">Agrega las "cartas" u opciones que verá el alumno. Marca la correcta.</p>
            
            <div className="space-y-3">
              {options.map((opt, index) => (
                <div key={opt.id} className={`flex items-start gap-4 rounded-xl border-2 p-4 transition-colors ${opt.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
                  
                  {activityType !== "sequence" && activityType !== "drag_drop" && (
                    <div className="pt-2">
                      <label className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-emerald-500 bg-white">
                        <input 
                          type="radio" 
                          name="correct_option" 
                          checked={opt.isCorrect} 
                          onChange={() => updateOption(opt.id, 'isCorrect', true)}
                          className="h-3 w-3 appearance-none rounded-full checked:bg-emerald-500" 
                        />
                      </label>
                    </div>
                  )}

                  <div className="flex-1 space-y-3">
                    <input 
                      value={opt.label} 
                      onChange={(e) => updateOption(opt.id, 'label', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-700 focus:border-brand-500 focus:outline-none" 
                      placeholder={`Texto Opción ${index + 1}`}
                    />
                    
                    {activityType === "image_select" && (
                      <input 
                        value={opt.imageUrl || ""} 
                        onChange={(e) => updateOption(opt.id, 'imageUrl', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 focus:border-brand-500 focus:outline-none" 
                        placeholder="🔗 Enlace/URL de la imagen (Ej: https://.../gato.jpg)"
                      />
                    )}
                  </div>

                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(opt.id)} className="pt-2 text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button type="button" variant="secondary" onClick={addOption} className="mt-4 border-2 border-dashed border-brand-200 bg-white text-brand-600 hover:bg-brand-50 rounded-xl h-12 w-full font-bold">
              <Plus className="mr-2 h-5 w-5" /> Añadir otra opción visual
            </Button>
          </div>
        )}

        {activityType === "true_false" && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-500">¿La consigna que diste es Verdadera o Falsa?</p>
            <div className="flex gap-4">
              <label className={`flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-2xl border-4 p-6 transition-all ${isStatementTrue ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-400 opacity-60 hover:opacity-100'}`}>
                <input type="radio" checked={isStatementTrue} onChange={() => setIsStatementTrue(true)} className="sr-only" />
                <span className="text-xl font-black uppercase">Es Verdadera</span>
              </label>
              
              <label className={`flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-2xl border-4 p-6 transition-all ${!isStatementTrue ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-100 bg-white text-slate-400 opacity-60 hover:opacity-100'}`}>
                <input type="radio" checked={!isStatementTrue} onChange={() => setIsStatementTrue(false)} className="sr-only" />
                <span className="text-xl font-black uppercase">Es Falsa</span>
              </label>
            </div>
          </div>
        )}

        {activityType === "fill_with_support" && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-500">Escribe la palabra o frase exacta que el alumno debe adivinar/completar.</p>
            <input 
              value={expectedWord}
              onChange={(e) => setExpectedWord(e.target.value)}
              className="w-full rounded-2xl border-2 border-brand-200 px-5 py-4 text-xl font-black text-brand-900 focus:border-brand-500 focus:outline-none bg-soft-sky" 
              placeholder="Ej: perro"
            />
          </div>
        )}

        {activityType === "touch_activity" || activityType === "audio_guided_response" ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500 font-medium">
            ¡Todo listo! Este tipo de actividad no requiere opciones técnicas adicionales. Solo asegúrate de haber cargado el Audio/Imagen arriba.
          </div>
        ) : null}

      </div>
    </div>
  );
}
