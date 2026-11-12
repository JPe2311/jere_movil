'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CATEGORIAS_PUNTOS } from '@/lib/categories';
import { useI18n } from '@/lib/i18n';
import { loc } from '@/lib/utils';

const norm = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Autocompletado sobre los puntos del viaje. Al elegir uno el mapa hace flyTo. */
export default function CitySearch({ puntos, onSelect }) {
  const { t, lang } = useI18n();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return [];
    return puntos
      .filter((p) => norm(`${p.ciudad} ${p.pais} ${p.titulo} ${p.titulo_en || ''}`).includes(n))
      .slice(0, 6);
  }, [q, puntos]);

  const choose = (p) => {
    setQ(p.ciudad || loc(p, 'titulo', lang));
    setOpen(false);
    onSelect(p);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-full border-[3px] border-noche bg-white px-4 py-2 shadow-comic">
        <span aria-hidden>🔎</span>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) choose(results[0]);
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder={t('map_search')}
          className="w-full bg-transparent text-sm font-bold outline-none placeholder:font-semibold placeholder:text-noche/50"
          aria-label={t('map_search')}
          autoComplete="off"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ('');
              setOpen(false);
            }}
            className="text-sm font-extrabold"
            aria-label={t('map_close')}
          >
            ✕
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && q.trim() && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="card-comic absolute inset-x-0 top-full mt-2 overflow-hidden p-1"
          >
            {results.length === 0 && <li className="px-4 py-2 text-sm font-semibold text-noche/60">{t('map_no_results')}</li>}
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => choose(p)}
                  className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-bold hover:bg-sol/40"
                >
                  <span aria-hidden>
                    {(CATEGORIAS_PUNTOS[p.categoria] || CATEGORIAS_PUNTOS.importante).emoji}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {p.ciudad || loc(p, 'titulo', lang)}
                    {p.pais ? <span className="font-semibold text-noche/60">, {p.pais}</span> : null}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
