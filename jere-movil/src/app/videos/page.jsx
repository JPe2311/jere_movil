'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import LoginWall from '@/components/LoginWall';
import { obtenerVideos } from '@/lib/ultimoVideo';

export default function VideosPage() {
  const { termsAccepted, youtubeSubscribed, instagramSubscribed } = useAuth();

  const puedeVer = useMemo(
    () => termsAccepted && youtubeSubscribed && instagramSubscribed,
    [termsAccepted, youtubeSubscribed, instagramSubscribed]
  );

  const [videos, setVideos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!puedeVer) return undefined;
    let activo = true;
    setCargando(true);
    obtenerVideos()
      .then((lista) => {
        if (activo) setVideos(lista);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [puedeVer]);

  if (!puedeVer) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <LoginWall />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 15 }}
      className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-12 lg:px-[150px]"
    >
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-2 text-6xl" aria-hidden>
          🎬
        </div>
        <h1 className="page-title">Videos</h1>
        <p className="mt-2 font-semibold text-noche/70">
          Todos los capítulos del viaje, de la ruta a la pantalla.
        </p>
      </motion.header>

      {cargando && (
        <div className="flex items-center justify-center gap-2 py-10">
          <div className="h-8 w-8 animate-pulse rounded-full border-2 border-dashed border-noche" />
          <span className="text-sm font-bold text-noche/60">Cargando videos…</span>
        </div>
      )}

      {!cargando && videos.length === 0 && (
        <div className="card-comic p-8 text-center">
          <div className="mb-2 text-3xl" aria-hidden>📼</div>
          <p className="font-display text-lg font-extrabold">Todavía no hay videos</p>
          <p className="mt-1 text-sm font-semibold text-noche/70">
            Cuando suba un capítulo nuevo, va a aparecer acá.
          </p>
        </div>
      )}

      {!cargando && videos.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {videos.map((v) => (
            <motion.a
              key={v.id}
              href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group overflow-hidden rounded-2xl border-[3px] border-noche bg-white shadow-comic transition-transform hover:-translate-y-0.5"
            >
              <div className="relative aspect-video overflow-hidden bg-noche">
                <img
                  src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`}
                  alt={v.titulo}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute inset-0 grid place-items-center text-4xl drop-shadow" aria-hidden>
                  ▶️
                </span>
              </div>
              <div className="space-y-1 p-4">
                <span className="inline-block rounded-full border-2 border-noche bg-sol px-2 py-0.5 text-[10px] font-extrabold text-white">
                  T{v.temporada} · E{v.episodio}
                </span>
                <h2 className="font-display text-lg font-extrabold leading-tight text-noche">{v.titulo}</h2>
                {v.fecha && <p className="text-xs font-bold text-noche/50">{v.fecha}</p>}
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </motion.div>
  );
}
