'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Muestra el último video cargado de la última temporada con su fecha.
 * Los datos pueden venir de Firestore o de una API de YouTube.
 */
export default function UltimoVideo() {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const demoVideo = {
      id: 'dQw4w9WgXcQ',
      titulo: 'La Bebi cruzando los Andes - Capítulo final',
      temporada: 3,
      episodio: 12,
      fecha: '12 nov 2026',
      descripcion:
        'Llegamos a San Pedro de Atacama después de cruzar el altiplano. Las carreteras de altura y los paisajes únicos de Bolivia y Chile.',
    };

    setLoading(false);
    setVideo(demoVideo);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-noche border-dashed animate-pulse"></div>
          <span className="text-sm font-bold text-noche/60">Cargando último video…</span>
        </div>
      </div>
    );
  }

  if (!video) return null;

  const youtubeUrl = `https://www.youtube.com/watch?v=${video.id}`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.id}`;

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-extrabold text-noche">
            Último video
          </h2>
          <span className="rounded-full border-2 border-noche bg-sol px-3 py-1 text-[10px] font-extrabold text-white shadow-comic-sm">
            Temporada {video.temporada} · Episodio {video.episodio}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 aspect-video rounded-2xl border-[3px] border-noche shadow-comic overflow-hidden bg-noche">
            <iframe
              src={`${embedUrl}?rel=0`}
              title={video.titulo}
              className="w-full h-full"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div className="rounded-2xl border-[3px] border-noche bg-white shadow-comic p-4 sm:p-6">
              <h3 className="font-display text-xl font-extrabold text-noche mb-2">
                {video.titulo}
              </h3>
              <p className="text-sm font-semibold text-noche/70 leading-relaxed mb-4">
                {video.descripcion}
              </p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-full border-2 border-noche bg-crema">
              <span className="text-xs font-bold text-noche">📅</span>
              <span className="text-sm font-bold text-noche">{video.fecha}</span>
            </div>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full border-2 border-noche bg-rosa text-white font-extrabold shadow-comic-sm hover:bg-rosa/90 transition-transform active:scale-95"
            >
              <span aria-hidden>▶️</span> Ver en YouTube
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
