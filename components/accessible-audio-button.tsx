"use client";

import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/use-speech";

type AccessibleAudioButtonProps = {
  text: string;
  label?: string;
};

export function AccessibleAudioButton({ text, label = "Escuchar" }: AccessibleAudioButtonProps) {
  const { isSupported, isSpeaking, speak, stop } = useSpeech();

  if (!isSupported) return null;

  return (
    <Button
      aria-label={isSpeaking ? "Detener lectura en voz alta" : "Escuchar en voz alta"}
      onClick={() => (isSpeaking ? stop() : speak(text))}
      size="lg"
      variant="secondary"
      className="gap-2"
      type="button"
    >
      {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      {isSpeaking ? "Detener" : label}
    </Button>
  );
}
