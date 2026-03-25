"use client";

import { useState, useEffect } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Music } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type FileUploaderProps = {
  name: string;
  accept?: "image/*" | "audio/*";
  initialUrl?: string;
  label?: string;
  onUploadSuccess?: (url: string) => void;
  onClear?: () => void;
};

export function FileUploader({ name, accept = "image/*", initialUrl, label, onUploadSuccess, onClear }: FileUploaderProps) {
  const [url, setUrl] = useState(initialUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Sincronizar estado interno si initialUrl cambia externamente
  useEffect(() => {
    if (initialUrl !== undefined && initialUrl !== url && !isUploading) {
      setUrl(initialUrl);
    }
  }, [initialUrl, url, isUploading]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError("");
    setIsUploading(true);

    try {
      const supabase = createClient();
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload the file to the 'media' bucket
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error("No pudimos subir el archivo. Vuelve a intentarlo.");
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;
      setUrl(publicUrl);
      if (typeof onUploadSuccess === 'function') {
        onUploadSuccess(publicUrl);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado al subir el archivo.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setUrl("");
    setError("");
    if (typeof onClear === 'function') {
      onClear();
    }
  };

  const isAudio = accept === "audio/*";
  const Icon = isAudio ? Music : ImageIcon;

  return (
    <div className="w-full">
      <input type="hidden" name={name} value={url} />
      
      {label && (
        <label className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-900">
          <Icon className="h-4 w-4 text-brand-500" /> {label}
        </label>
      )}

      {url ? (
        <div className="relative overflow-hidden rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <Icon className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-emerald-800">Archivo listo</p>
              <a href={url} target="_blank" rel="noopener noreferrer" className="truncate text-xs text-emerald-600 hover:underline">
                Ver actual
              </a>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-white px-4 py-6 transition-all hover:border-brand-500 hover:bg-brand-50">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                <span className="text-sm font-bold text-brand-700">Subiendo...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-soft-sky text-brand-500 transition-transform group-hover:scale-110 group-hover:bg-white group-hover:shadow-sm">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-bold text-brand-900">Buscar en PC</span>
                </div>
              </div>
            )}
            <input
              type="file"
              accept={accept}
              onChange={handleUpload}
              disabled={isUploading}
              className="sr-only"
            />
          </label>
          {error && <p className="mt-2 text-xs font-bold text-rose-500">{error}</p>}
        </div>
      )}
    </div>
  );
}

