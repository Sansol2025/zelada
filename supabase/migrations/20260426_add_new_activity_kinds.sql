-- Agrega los nuevos tipos de actividad mouse-only al enum activity_kind
-- classify_two_columns: clasificar ítems en dos columnas arrastrando/clickeando
-- match_pairs: unir pares conectando columna izquierda con derecha
-- word_bank: completar frase eligiendo palabra de un banco (sin teclado)

ALTER TYPE public.activity_kind ADD VALUE IF NOT EXISTS 'classify_two_columns';
ALTER TYPE public.activity_kind ADD VALUE IF NOT EXISTS 'match_pairs';
ALTER TYPE public.activity_kind ADD VALUE IF NOT EXISTS 'word_bank';
