-- Agregar columna de video inicial a los módulos
ALTER TABLE public.modules ADD COLUMN intro_video_url text;

-- Asegurar que existe el bucket 'media' para uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true) 
ON CONFLICT (id) DO NOTHING;

-- Crear políticas para el bucket 'media' si no existen
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access'
    ) THEN
        CREATE POLICY "Public Access" 
        ON storage.objects FOR SELECT 
        USING ( bucket_id = 'media' );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Auth Insert'
    ) THEN
        CREATE POLICY "Auth Insert" 
        ON storage.objects FOR INSERT 
        WITH CHECK ( bucket_id = 'media' AND auth.role() = 'authenticated' );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Auth Update'
    ) THEN
        CREATE POLICY "Auth Update" 
        ON storage.objects FOR UPDATE 
        USING ( bucket_id = 'media' AND auth.role() = 'authenticated' );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Auth Delete'
    ) THEN
        CREATE POLICY "Auth Delete" 
        ON storage.objects FOR DELETE 
        USING ( bucket_id = 'media' AND auth.role() = 'authenticated' );
    END IF;
END $$;
