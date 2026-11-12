'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { obtenerUltimoVideo } from '@/lib/ultimoVideo';

/**
 * Muestra el último video cargado de la colección de videos de Firestore.
 * Se sincroniza con la solapa Videos.
 */
export default function UltimoVideo() {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarVideo() {
      try {
        const v = await obtenerUltimoVideo();
        setVideo(v);
      } catch (err) {
        console.error('[ultimoVideo] error:', err);
        setError(err.message || 'Error al cargar el video');
      } finally {
        setLoading(false);
      }
    }
    cargarVideo();
  }, []);

  if (loading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-noche border-dashed animate-pulse"></div>
          <span className="text-sm font-bold text-noche/60">Cargando último video…</span>
        </div>
      </div>
    );
  }

  if (error || !video || !video.youtubeId) {
    return (
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-extrabold text-noche">
              Último video
            </h2>
            <span className="rounded-full border-2 border-noche bg-sol px-3 py-1 text-[10px] font-extrabold text-white shadow-comic-sm">
              Temporada
            </span>
          </div>
          <div className="rounded-2xl border-[3px] border-noche bg-crema/50 p-8 text-center">
            <div className="text-2xl mb-2" aria-hidden>🎬</div>
            <p className="text-sm font-semibold text-noche/70">
              Todavía no hay videos publicados.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.youtubeId}`;

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
