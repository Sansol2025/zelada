"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CheckCircle2, Circle, CircleSlash2, MoveRight, Sparkles, WandSparkles } from "lucide-react";

import { AccessibleAudioButton } from "@/components/accessible-audio-button";
import { BigActionButton } from "@/components/big-action-button";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
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
          isCorrect: Boolean(value.isCorrect)
        };
      }
      return null;
    })
    .filter(Boolean) as OptionItem[];
}

export function ActivityRenderer({ activity, studentId, onCompleted }: ActivityRendererProps) {
  const startedAt = useMemo(() => Date.now(), []);
  const [selected, setSelected] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [voiceAnswer, setVoiceAnswer] = useState("");
  const [sequence, setSequence] = useState<string[]>(
    () =>
      (Array.isArray(activity.settings_json?.steps)
        ? activity.settings_json?.steps
        : []
      ).map((step) => String(step))
  );
  const [pending, setPending] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const options = parseOptions(activity.settings_json);

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

  const baseCard = (
    <Card className="border-none bg-white p-6 shadow-card sm:p-10 rounded-[2rem] space-y-8">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="space-y-4 max-w-3xl">
          <h2 className="font-display text-4xl font-extrabold uppercase tracking-tight text-brand-950 sm:text-5xl">
            {activity.title}
          </h2>
          <p className="text-2xl font-semibold text-brand-700 sm:text-3xl leading-snug">
            {activity.prompt}
          </p>
        </div>
        
        <div className="flex justify-center w-full">
          <AccessibleAudioButton 
            text={`${activity.title}. ${activity.prompt}`} 
            audioUrl={activity.audio_url}
            autoPlay={true}
          />
        </div>

        {activity.instructions ? (
          <div className="mt-4 rounded-2xl bg-amber-50 px-6 py-4 border-2 border-amber-200">
            <span className="text-xl font-bold text-amber-900">
              💡 {activity.instructions}
            </span>
          </div>
        ) : null}
      </div>

      {activity.image_url ? (
        <div className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border-4 border-brand-100 shadow-lg">
          <Image src={activity.image_url} alt={activity.title} width={900} height={400} className="w-full object-cover" />
        </div>
      ) : null}
    </Card>
  );

  if (activity.type === "multiple_choice_visual" || activity.type === "image_select") {
    return (
      <div className="space-y-8">
        {baseCard}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.id}
              className={cn(
                "group relative flex min-h-48 flex-col items-center justify-center overflow-hidden rounded-[2rem] border-4 p-6 transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-400 hover:-translate-y-2 hover:shadow-xl",
                selected === option.id 
                  ? "border-emerald-500 bg-emerald-50 shadow-emerald-500/30 shadow-xl scale-105" 
                  : "border-brand-100 bg-white hover:border-brand-300"
              )}
              onClick={() => setSelected(option.id)}
              type="button"
            >
              {option.imageUrl ? (
                <Image
                  src={option.imageUrl}
                  alt={option.label}
                  width={280}
                  height={280}
                  className="mb-6 h-48 w-full rounded-2xl object-cover transition-transform group-hover:scale-105"
                />
              ) : null}
              <div className="flex w-full items-center justify-center gap-3">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-4 transition-colors",
                  selected === option.id ? "border-emerald-500 bg-emerald-500 text-white" : "border-brand-200"
                )}>
                  {selected === option.id && <CheckCircle2 className="h-5 w-5" />}
                </div>
                <span className={cn(
                  "text-2xl font-black text-center leading-tight",
                  selected === option.id ? "text-emerald-900" : "text-brand-900"
                )}>
                  {option.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center pt-8">
          <Button
            className={cn(
              "h-20 rounded-[2rem] px-16 text-2xl font-black uppercase tracking-wider transition-all duration-300 shadow-xl",
              selected
                ? "bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/40 hover:-translate-y-2 hover:scale-105"
                : "bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed"
            )}
            disabled={!selected || pending || completed}
            onClick={() => {
              const chosen = options.find((option) => option.id === selected);
              const hasCorrect = options.some((option) => option.isCorrect);
              const isCorrect = hasCorrect ? Boolean(chosen?.isCorrect) : true;
              setFeedback(isCorrect ? "¡Excelente! Lo hiciste de maravilla 🌟" : "¡Casi! Sigue intentándolo 💪");
              void completeActivity(isCorrect ? 100 : 50, { selected, isCorrect });
            }}
          >
            {completed ? "🌟 Actividad Completada" : "Confirmar Respuesta"}
          </Button>
          
          {feedback ? (
            <div className={cn(
              "mt-8 animate-in slide-in-from-bottom-4 rounded-[2rem] px-8 py-6 text-center text-2xl font-black shadow-lg",
              feedback.includes("Excelente") ? "bg-emerald-100 text-emerald-800 border-4 border-emerald-300" : "bg-amber-100 text-amber-800 border-4 border-amber-300"
            )}>
              {feedback}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (activity.type === "true_false") {
    return (
      <div className="space-y-4">
        {baseCard}
        <div className="grid gap-3 md:grid-cols-2">
          <BigActionButton
            icon={<CheckCircle2 className="h-5 w-5" />}
            onClick={() => setSelected("true")}
            variant={selected === "true" ? "success" : "primary"}
            subtitle="La afirmación es correcta"
          >
            Verdadero
          </BigActionButton>
          <BigActionButton
            icon={<CircleSlash2 className="h-5 w-5" />}
            onClick={() => setSelected("false")}
            variant={selected === "false" ? "secondary" : "primary"}
            subtitle="La afirmación no es correcta"
          >
            Falso
          </BigActionButton>
        </div>
        <Button
          size="lg"
          disabled={!selected || pending || completed}
          onClick={() => {
            const expected = String(activity.settings_json?.correct ?? "true");
            const isCorrect = selected === expected;
            setFeedback(isCorrect ? "¡Excelente!" : "Intento guardado.");
            void completeActivity(isCorrect ? 100 : 50, { selected, expected, isCorrect });
          }}
        >
          {completed ? "Actividad completada" : "Confirmar respuesta"}
        </Button>
        {feedback ? <p className="text-sm font-semibold text-brand-700">{feedback}</p> : null}
      </div>
    );
  }

  if (activity.type === "fill_with_support") {
    return (
      <div className="space-y-4">
        {baseCard}
        <Card className="space-y-3">
          <p className="text-sm text-brand-700">Completa la frase usando pistas visuales o auditivas.</p>
          <input
            className="h-11 w-full rounded-xl border border-brand-200 px-4 text-sm"
            onChange={(event) => setTextAnswer(event.target.value)}
            placeholder="Escribe tu respuesta"
            value={textAnswer}
          />
          <Button
            size="lg"
            onClick={() => {
              const expected = String(activity.settings_json?.expected ?? "").trim().toLowerCase();
              const normalized = textAnswer.trim().toLowerCase();
              const isCorrect = expected ? normalized === expected : normalized.length > 0;
              setFeedback(isCorrect ? "Respuesta guardada." : "Respuesta registrada para revisión.");
              void completeActivity(isCorrect ? 100 : 60, { textAnswer, expected, isCorrect });
            }}
            disabled={!textAnswer.trim() || pending || completed}
          >
            Enviar respuesta
          </Button>
          {feedback ? <p className="text-sm font-semibold text-brand-700">{feedback}</p> : null}
        </Card>
      </div>
    );
  }

  if (activity.type === "sequence" || activity.type === "drag_drop" || activity.type === "touch_activity") {
    const moveItem = (index: number, direction: -1 | 1) => {
      setSequence((prev) => {
        const next = [...prev];
        const target = index + direction;
        if (target < 0 || target >= next.length) return prev;
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      });
    };

    return (
      <div className="space-y-4">
        {baseCard}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-brand-700">
            <MoveRight className="h-4 w-4" />
            Ordena o interactúa con los elementos.
          </div>
          <div className="space-y-2">
            {(sequence.length ? sequence : options.map((option) => option.label)).map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50 px-3 py-2">
                <span className="text-sm font-semibold text-brand-900">{item}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => moveItem(index, -1)} type="button">
                    ↑
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => moveItem(index, 1)} type="button">
                    ↓
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            size="lg"
            onClick={() => {
              const expected = Array.isArray(activity.settings_json?.correct_order)
                ? activity.settings_json?.correct_order.map((value) => String(value))
                : [];
              const current = sequence.length ? sequence : options.map((option) => option.label);
              const isCorrect = expected.length
                ? expected.join("|").toLowerCase() === current.join("|").toLowerCase()
                : true;
              setFeedback(isCorrect ? "¡Orden correcto!" : "Orden guardado.");
              void completeActivity(isCorrect ? 100 : 60, { order: current, expected, isCorrect });
            }}
            disabled={pending || completed}
          >
            {completed ? "Actividad completada" : "Completar actividad"}
          </Button>
          {feedback ? <p className="text-sm font-semibold text-brand-700">{feedback}</p> : null}
        </Card>
      </div>
    );
  }

  if (activity.type === "audio_guided_response") {
    return (
      <div className="space-y-4">
        {baseCard}
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-brand-700">
            <WandSparkles className="h-4 w-4" />
            Respuesta guiada: escucha, piensa y responde.
          </div>
          <textarea
            className="min-h-24 w-full rounded-xl border border-brand-200 px-4 py-3 text-sm"
            onChange={(event) => setVoiceAnswer(event.target.value)}
            placeholder="Escribe o describe tu respuesta"
            value={voiceAnswer}
          />
          <Button
            size="lg"
            onClick={() => {
              setFeedback("Respuesta registrada para revisión.");
              void completeActivity(80, { voiceAnswer });
            }}
            disabled={!voiceAnswer.trim() || pending || completed}
          >
            Finalizar respuesta
          </Button>
          {feedback ? <p className="text-sm font-semibold text-brand-700">{feedback}</p> : null}
        </Card>
      </div>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2 text-brand-700">
        <Sparkles className="h-4 w-4" />
        Tipo de actividad personalizado
      </div>
      <CardText>{activity.prompt}</CardText>
      <Button size="lg" onClick={() => completeActivity(100, { selected })} disabled={pending || completed}>
        Completar
      </Button>
    </Card>
  );
}
