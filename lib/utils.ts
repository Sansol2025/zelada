import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function percent(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

export function formatSeconds(totalSeconds: number) {
  if (!totalSeconds || totalSeconds < 1) return "0 min";

  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} h ${remainingMinutes} min`;
}
