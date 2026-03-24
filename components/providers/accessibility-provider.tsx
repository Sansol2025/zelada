"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { AccessibleModeContext, type AccessibleMode } from "@/hooks/use-accessible-mode";

const STORAGE_KEY = "asb_accessibility_mode";

const initialMode: AccessibleMode = {
  enabled: false,
  highContrast: false,
  largeText: false,
  autoRead: false
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AccessibleMode>(initialMode);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AccessibleMode;
      setMode({ ...initialMode, ...parsed });
    } catch {
      setMode(initialMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mode));

    document.documentElement.dataset.accessible = mode.enabled ? "true" : "false";
    document.documentElement.dataset.highContrast = mode.highContrast ? "true" : "false";
    document.documentElement.dataset.largeText = mode.largeText ? "true" : "false";
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      simplifyUi: mode.enabled,
      toggleEnabled: () => setMode((prev) => ({ ...prev, enabled: !prev.enabled })),
      toggleContrast: () => setMode((prev) => ({ ...prev, highContrast: !prev.highContrast })),
      toggleLargeText: () => setMode((prev) => ({ ...prev, largeText: !prev.largeText })),
      toggleAutoRead: () => setMode((prev) => ({ ...prev, autoRead: !prev.autoRead }))
    }),
    [mode]
  );

  return <AccessibleModeContext.Provider value={value}>{children}</AccessibleModeContext.Provider>;
}
