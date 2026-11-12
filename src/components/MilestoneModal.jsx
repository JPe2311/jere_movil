'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CATEGORIAS_PUNTOS } from '@/lib/categories';
import { useI18n } from '@/lib/i18n';
import { formatDateTime, loc, youtubeId } from '@/lib/utils';

export default function MilestoneModal({ punto, onClose }) {
  const { t, lang } = useI18n();
  const [photo, setPhoto] = useState(0);

  useEffect(() => {
    setPhoto(0);
  }, [punto?.id]);

  useEffect(() => {
    if (!punto) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [punto, onClose]);

  const fotos = punto?.fotos || [];
  const yt = punto?.videoUrl ? youtubeId(punto.videoUrl) : null;
  const cat = CATEGORIAS_PUNTOS[punto?.categoria] || CATEGORIAS_PUNTOS.importante;
  const numero = punto?.numero ?? (Number.isFinite(punto?.orden) ? punto.orden : null);

  return (
    <AnimatePresence>
      {punto && (
        <motion.div
          key={punto.id}
          className="fixed inset-0 z-[2000] grid place-items-center bg-noche/60 p-3 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={loc(punto, 'titulo', lang)}
            className="card-comic max-h-[88dvh] w-full max-w-2xl overflow-y-auto"
            initial={{ y: 60, scale: 0.9, rotate: -2 }}
            animate={{ y: 0, scale: 1, rotate: 0 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b-[3px] border-noche bg-sol p-4">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
                  <span>{formatDateTime(punto.ts, lang)}</span>
                  <span
                    className="rounded-full border-2 border-noche px-2 py-0.5 text-[11px] font-black normal-case"
                    style={{ backgroundColor: cat.pinBg, color: cat.textColor }}
                  >
                    {numero ? `#${numero} · ` : ''}
                    {cat.emoji} {lang === 'en' ? cat.nombre_en : cat.nombre}
                  </span>
                </p>
                <h2 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">{loc(punto, 'titulo', lang)}</h2>
                <p className="text-sm font-bold">
                  📍 {punto.ciudad}
                  {punto.pais ? `, ${punto.pais}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-[3px] border-noche bg-white font-extrabold shadow-comic-sm"
                aria-label={t('map_close')}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-4">
              {loc(punto, 'descripcion', lang) && (
                <p className="whitespace-pre-line text-base font-semibold leading-relaxed">{loc(punto, 'descripcion', lang)}</p>
              )}

              {fotos.length > 0 && (
                <section>
                  <h3 className="mb-2 font-display text-lg font-extrabold">📷 {t('map_photos')}</h3>
                  <div className="overflow-hidden rounded-2xl border-[3px] border-noche bg-noche/5">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={fotos[photo]}
                        src={fotos[photo]}
                        alt=""
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-h-[50dvh] w-full object-cover"
                      />
                    </AnimatePresence>
                  </div>
                  {fotos.length > 1 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                      {fotos.map((src, i) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setPhoto(i)}
                          className={`h-14 w-20 shrink-0 overflow-hidden rounded-xl border-[3px] ${
                            i === photo ? 'border-atardecer' : 'border-noche'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {punto.videoUrl && (
                <section>
                  <h3 className="mb-2 font-display text-lg font-extrabold">🎬 {t('map_video')}</h3>
                  <div className="aspect-video overflow-hidden rounded-2xl border-[3px] border-noche bg-noche">
                    {yt ? (
                      <iframe
                        className="h-full w-full"
                        src={`https://www.youtube-nocookie.com/embed/${yt}`}
                        title={loc(punto, 'titulo', lang)}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video className="h-full w-full" src={punto.videoUrl} controls playsInline />
                    )}
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
