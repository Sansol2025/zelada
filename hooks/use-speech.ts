"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export function useSpeech(defaultRate = 0.95) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return;
      stop();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-AR";
      utterance.rate = defaultRate;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [defaultRate, isSupported, stop]
  );

  useEffect(() => stop, [stop]);

  return useMemo(
    () => ({
      isSupported,
      isSpeaking,
      speak,
      stop
    }),
    [isSupported, isSpeaking, speak, stop]
  );
}
