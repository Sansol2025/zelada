"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAccessibleMode } from "@/hooks/use-accessible-mode";

export function useSpeech(
  text: string | null | undefined,
  options?: {
    autoReadIfEnabled?: boolean;
    delay?: number;
  }
) {
  const { mode } = useAccessibleMode();
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  const { autoReadIfEnabled = true, delay = 500 } = options || {};

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const play = useCallback(
    (customText?: string) => {
      const textToRead = customText || text;
      if (!textToRead || !synthRef.current) return;

      synthRef.current.cancel(); 
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "es-ES";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      synthRef.current.speak(utterance);
    },
    [text]
  );

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (!text || !mode.autoRead || !autoReadIfEnabled) return;

    const timer = setTimeout(() => {
      play(text);
    }, delay);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [text, mode.autoRead, autoReadIfEnabled, delay, play, stop]);

  return { play, stop, isPlaying };
}
