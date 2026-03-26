-- Add age and DNI fields for student registration workflows.
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS dni text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'students_age_check'
  ) THEN
    ALTER TABLE public.students
    ADD CONSTRAINT students_age_check CHECK (age IS NULL OR (age >= 3 AND age <= 120));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_dni_unique
ON public.students (dni)
WHERE dni IS NOT NULL;
