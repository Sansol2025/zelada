"use client";

import { Eye, Type, Volume2 } from "lucide-react";

import { useAccessibleMode } from "@/hooks/use-accessible-mode";

type ToggleProps = {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
};

function ToggleItem({ label, description, enabled, onToggle, icon }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      type="button"
      className="flex w-full items-start justify-between gap-3 rounded-xl border border-brand-100 bg-white px-4 py-3 text-left hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-brand-100 p-2 text-brand-700">{icon}</div>
        <div>
          <p className="text-sm font-semibold text-brand-900">{label}</p>
          <p className="text-xs text-brand-700">{description}</p>
        </div>
      </div>
      <span
        className={`mt-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
          enabled ? "bg-emerald-100 text-emerald-700" : "bg-brand-100 text-brand-700"
        }`}
      >
        {enabled ? "Activo" : "Inactivo"}
      </span>
    </button>
  );
}

export function AccessibilityPanel() {
  const { mode, toggleEnabled, toggleContrast, toggleLargeText, toggleAutoRead } = useAccessibleMode();

  return (
    <div className="space-y-3 rounded-2xl border border-brand-100 bg-soft-sky p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-brand-900">Modo Accesible</p>
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            mode.enabled ? "bg-emerald-500 text-white" : "bg-brand-100 text-brand-700"
          }`}
          onClick={toggleEnabled}
        >
          {mode.enabled ? "Encendido" : "Apagado"}
        </button>
      </div>
      <ToggleItem
        label="Alto contraste"
        description="Aumenta contraste para lectura más clara."
        enabled={mode.highContrast}
        onToggle={toggleContrast}
        icon={<Eye className="h-4 w-4" />}
      />
      <ToggleItem
        label="Texto grande"
        description="Aumenta el tamaño general de letra."
        enabled={mode.largeText}
        onToggle={toggleLargeText}
        icon={<Type className="h-4 w-4" />}
      />
      <ToggleItem
        label="Lectura automática"
        description="Permite lectura asistida de consignas."
        enabled={mode.autoRead}
        onToggle={toggleAutoRead}
        icon={<Volume2 className="h-4 w-4" />}
      />
    </div>
  );
}
