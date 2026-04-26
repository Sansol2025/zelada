export const APP_NAME = "Aprender Sin Barreras";
export const APP_SUBTITLE = "Proyecto Educativo Digital Inclusivo";
export const SCHOOL_NAME =
  "Escuela N° 361 “Expedición Auxiliar Zelada Dávila” – Provincia de La Rioja";

export const ACCESS_TOKEN_COOKIE = "student_access_token";

export const ROLE_ROUTES = {
  teacher: "/docente",
  student: "/estudiante",
  family: "/familia",
  admin: "/docente"
} as const;

export const ACTIVITY_TYPES = [
  "multiple_choice_visual",
  "true_false",
  "drag_drop",
  "image_select",
  "fill_with_support",
  "sequence",
  "audio_guided_response",
  "touch_activity",
  "classify_two_columns",
  "match_pairs",
  "word_bank"
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];
