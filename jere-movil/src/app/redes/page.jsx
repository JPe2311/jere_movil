'use client';

import { useEffect, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { redes } from '@/lib/redes';
import { useI18n } from '@/lib/i18n';

function Counter({ to }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const controls = animate(0, to, { duration: 1.6, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [to]);
  return <>{new Intl.NumberFormat('es-AR').format(n)}</>;
}

export default function RedesPage() {
  const { t, lang } = useI18n();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 sm:px-12 lg:px-[150px] py-10">
      <header className="text-center">
        <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="mb-2 text-6xl" aria-hidden>
          📲
        </motion.div>
        <h1 className="page-title">{t('social_title')}</h1>
        <p className="mt-1 font-semibold">{t('social_subtitle')}</p>
      </header>

      <ul className="space-y-4">
        {redes.map((r, i) => (
          <motion.li
            key={r.id}
            initial={{ opacity: 0, x: i % 2 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', damping: 16 }}
          >
            <motion.a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03, rotate: i % 2 ? 1 : -1 }}
              whileTap={{ scale: 0.97 }}
              className={`card-comic group flex items-center gap-4 p-4 text-white ${r.color}`}
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[3px] border-noche bg-white text-3xl group-hover:animate-wiggle">
                {r.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-2xl font-extrabold leading-none">{r.nombre}</span>
                <span className="block text-sm font-bold opacity-90">{r.handle}</span>
                <span className="block truncate text-xs font-semibold opacity-90">{lang === 'en' ? r.texto_en : r.texto}</span>
              </span>
              <span className="text-right">
                {r.seguidores != null && (
                  <span className="block font-display text-xl font-extrabold leading-none">
                    <Counter to={r.seguidores} />
                    <span className="block text-[10px] font-bold uppercase opacity-90">{t('social_followers')}</span>
                  </span>
                )}
                <span className="mt-1 inline-block rounded-full border-2 border-noche bg-white px-3 py-0.5 text-xs font-extrabold text-noche">
                  {t('social_go')} ↗
                </span>
              </span>
            </motion.a>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
