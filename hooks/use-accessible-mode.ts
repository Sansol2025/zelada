"use client";

import { createContext, useContext } from "react";

export type AccessibleMode = {
  enabled: boolean;
  highContrast: boolean;
  largeText: boolean;
  autoRead: boolean;
};

export type AccessibleModeContextValue = {
  mode: AccessibleMode;
  toggleEnabled: () => void;
  toggleContrast: () => void;
  toggleLargeText: () => void;
  toggleAutoRead: () => void;
  simplifyUi: boolean;
};

export const AccessibleModeContext = createContext<AccessibleModeContextValue | null>(null);

export function useAccessibleMode() {
  const context = useContext(AccessibleModeContext);
  if (!context) {
    throw new Error("useAccessibleMode debe usarse dentro de AccessibilityProvider");
  }
  return context;
}
