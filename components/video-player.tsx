"use client";

import { useState } from "react";
import { Play } from "lucide-react";

type VideoPlayerProps = {
  url: string;
};

/**
 * Extrae el ID de video de una URL de YouTube 
 */
function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = getYouTubeId(url);

  if (!videoId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-500 italic">
        Video no disponible o enlace inválido
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-[2.5rem] bg-black shadow-2xl ring-4 ring-brand-100 ring-offset-4">
      {!isPlaying ? (
        <div 
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)` }}
          onClick={() => setIsPlaying(true)}
        >
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Botón Play Gigante */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-brand-500 text-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-400">
            <Play className="ml-2 h-12 w-12 fill-current" />
          </div>
          
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <span className="rounded-full bg-white/20 px-6 py-2 text-sm font-black uppercase tracking-widest text-white backdrop-blur-md">
              Toca para empezar la aventura
            </span>
          </div>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
}
