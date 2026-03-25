"use client";

import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/use-speech";

type AccessibleAudioButtonProps = {
  text: string;
  label?: string;
  audioUrl?: string | null;
  autoPlay?: boolean;
};

export function AccessibleAudioButton({ 
  text, 
  label = "Escuchar la instrucción", 
  audioUrl,
  autoPlay = false
}: AccessibleAudioButtonProps) {
  const { isSupported, isSpeaking: isBrowserSpeaking, speak, stop } = useSpeech();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Si hay una URL de audio, la pre-cargamos. No usamos autoPlay directamente en el render para cumplir reglas de navegadores.
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      
      const handleEnded = () => setIsPlayingAudio(false);
      const handlePlaying = () => {
        setIsLoading(false);
        setIsPlayingAudio(true);
      };
      const handleWaiting = () => setIsLoading(true);

      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('playing', handlePlaying);
      audioRef.current.addEventListener('waiting', handleWaiting);

      if (autoPlay) {
        audioRef.current.play().catch(e => console.warn("Auto-play prevented by browser policy", e));
      }

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleEnded);
          audioRef.current.removeEventListener('playing', handlePlaying);
          audioRef.current.removeEventListener('waiting', handleWaiting);
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [audioUrl, autoPlay]);

  const toggleSpeech = () => {
    // Si tenemos URL manual, controlamos el elemento de audio HTML5
    if (audioUrl && audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reiniciar al detener
        setIsPlayingAudio(false);
      } else {
        setIsLoading(true);
        // Detener la API de Speech nativa si estuviera loca reproduciendo algo
        stop();
        audioRef.current.play().catch(err => {
          console.error("Error reproduciendo audio:", err);
          setIsLoading(false);
        });
      }
      return;
    }

    // Si NO hay URL, caemos en el sintetizador de voz nativo (TTS)
    if (isBrowserSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  const isActive = isPlayingAudio || isBrowserSpeaking;
  const isActuallySupported = !!audioUrl || isSupported;

  if (!isActuallySupported) return null;

  return (
    <Button
      aria-label={isActive ? "Detener lectura en voz alta" : "Escuchar en voz alta"}
      onClick={toggleSpeech}
      className={`h-16 rounded-[1.5rem] px-8 text-xl font-bold shadow-md transition-all sm:h-20 sm:w-auto sm:px-10 sm:text-2xl ${
        isActive 
          ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30 ring-4 ring-rose-200" 
          : "bg-brand-500 hover:bg-brand-400 hover:-translate-y-1 text-white shadow-brand-500/30"
      }`}
      type="button"
    >
      {isLoading ? (
        <Loader2 className="mr-3 h-8 w-8 animate-spin" />
      ) : isActive ? (
        <VolumeX className="mr-3 h-8 w-8" />
      ) : (
        <Volume2 className="mr-3 h-8 w-8 animate-pulse" />
      )}
      {isActive ? "Detener audio" : label}
    </Button>
  );
}
