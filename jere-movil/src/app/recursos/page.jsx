'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import LoginWall from '@/components/LoginWall';

export default function RecursosPage() {
  const { termsAccepted, youtubeSubscribed, instagramSubscribed } = useAuth();

  const puedeVer = useMemo(
    () => termsAccepted && youtubeSubscribed && instagramSubscribed,
    [termsAccepted, youtubeSubscribed, instagramSubscribed]
  );

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
      className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-12 lg:px-[150px]"
    >
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-2 text-6xl" aria-hidden>
          🎁
        </div>
        <h1 className="page-title">Recursos</h1>
        <p className="mt-2 font-semibold text-noche/70">
          Herramientas y archivos para tu próxima aventura.
        </p>
      </motion.header>

      <div className="card-comic p-8 text-center">
        <div className="mb-2 text-3xl" aria-hidden>🧰</div>
        <p className="font-display text-lg font-extrabold">Todavía no hay recursos publicados</p>
        <p className="mt-1 text-sm font-semibold text-noche/70">
          Cuando suba wallpapers, mapas o guías, los vas a encontrar acá.
        </p>
      </div>
    </motion.div>
  );
}
