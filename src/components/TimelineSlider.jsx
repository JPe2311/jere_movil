'use client';

import { useMemo, useState } from 'react';
import { motion, useMotionValueEvent } from 'framer-motion';
import { CATEGORIAS_PUNTOS } from '@/lib/categories';
import { useI18n } from '@/lib/i18n';
import { formatDate, loc } from '@/lib/utils';

export default function TimelineSlider({ progress, puntos, visibles, numeros, velocidad, velocidades, onVelocidad, start, end, current, playing, onPlay, onScrub, onPick }) {
  const { t, lang } = useI18n();
  const [val, setVal] = useState(() => Math.round(progress.get() * 1000));
  useMotionValueEvent(progress, 'change', (v) => setVal(Math.round(v * 1000)));

  // Cicla la velocidad: 0.5× → 1× → 2× → 4× → 0.5×…
  const ciclarVelocidad = () => {
    const lista = velocidades || [0.5, 1, 2, 4];
    const i = lista.indexOf(velocidad);
    onVelocidad?.(lista[(i + 1) % lista.length]);
  };

  const span = end - start || 1;
  const here = puntos[current.idx];

  // Solo se dibujan los nodos visibles según el filtro de categorías
  const visiblesSet = useMemo(
    () => new Set((visibles || puntos).map((p) => p.id)),
    [visibles, puntos]
  );

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 18 }}
      className="card-comic absolute inset-x-3 bottom-3 z-[1000] p-3 sm:inset-x-8 sm:bottom-6 sm:p-4"
    >
      <div className="mb-1 flex items-center gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onPlay}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-[3px] border-noche bg-sol text-lg shadow-comic-sm"
          aria-label={playing ? t('map_pause') : t('map_play')}
          title={playing ? t('map_pause') : t('map_play')}
        >
          {playing ? '⏸' : '▶'}
        </motion.button>

        <div className="min-w-0 flex-1 leading-tight">
          <div className="font-display text-base font-extrabold sm:text-lg">
            {t('map_day')} {current.day}
            <span className="ml-2 text-sm font-semibold text-noche/70">{formatDate(current.ts, lang)}</span>
          </div>
          {here && (
            <div className="truncate text-xs font-bold text-atardecer sm:text-sm">
              📍 {here.ciudad || loc(here, 'titulo', lang)}
              {here.pais ? `, ${here.pais}` : ''}
            </div>
          )}
        </div>

        {/* Velocidad del recorrido: clic para cambiar (0.5× … 4×) */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={ciclarVelocidad}
          className="shrink-0 rounded-full border-[3px] border-noche bg-white px-2.5 py-1.5 font-display text-xs font-black text-noche shadow-comic-sm sm:text-sm"
          aria-label={t('map_speed')}
          title={t('map_speed')}
        >
          ⚡ {velocidad}×
        </motion.button>
      </div>

      <div className="relative h-10">
        {/* pista */}
        <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full border-2 border-noche bg-white">
          <motion.div className="h-full origin-left bg-gradient-to-r from-sol via-atardecer to-rosa" style={{ scaleX: progress }} />
        </div>

        {/* nodos de los hitos */}
        {puntos.map((p, i) => {
          if (!visiblesSet.has(p.id)) return null;
          const cat = CATEGORIAS_PUNTOS[p.categoria] || CATEGORIAS_PUNTOS.importante;
          const n = numeros?.get(p.id) ?? i + 1;
          const pct = ((p.ts - start) / span) * 100;
          const passed = i <= current.idx;
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => onPick(p.id)}
              whileHover={{ scale: 1.5, y: -3 }}
              whileTap={{ scale: 0.9 }}
              style={{ left: `${pct}%`, backgroundColor: passed ? cat.pinBg : '#FFFFFF' }}
              className="absolute top-1/2 z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-noche"
              aria-label={`${t('map_stop')} ${n}: ${p.ciudad || p.titulo}`}
              title={`${n}. ${cat.emoji} ${p.ciudad || loc(p, 'titulo', lang)}`}
            />
          );
        })}

        {/* slider arrastrable */}
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={val}
          onChange={(e) => onScrub(Number(e.target.value) / 1000)}
          className="timeline-range absolute inset-0 z-10"
          aria-label="Timeline"
        />
      </div>
    </motion.div>
  );
}
