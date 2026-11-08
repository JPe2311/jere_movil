'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function RecursosPage() {
  const { user, termsAccepted, youtubeSubscribed, instagramSubscribed } = useAuth();

  // useMemo para evitar recomputaciones
  const puedeVer = useMemo(() => termsAccepted && youtubeSubscribed && instagramSubscribed, [
    termsAccepted,
    youtubeSubscribed,
    instagramSubscribed,
  ]);

  const router = useRouter();

  useEffect(() => {
    if (!puedeVer) {
      const authorized = window.confirm(
        'Para ver los recursos necesitás estar registrado, aceptar los Términos y Condiciones, y seguí nuestro canal de YouTube e Instagram.'
      );
      if (authorized) {
        router.push('/');
      } else {
        router.push('/');
      }
    }
  }, [puedeVer, router]);

  if (!puedeVer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 15 }}
      className="mx-auto max-w-3xl space-y-8 px-4 py-10"
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
      </motion.header>

      <div className="prose max-w-prose mx-auto">
        <h2 className="font-display text-2xl font-extrabold">Recursos disponibles</h2>
        <p className="text-lg">
          Aquí estarían tus recursos para tu próxima aventura. Para acceder a esta sección necesitás:
        </p>
        <ul className="list-disc list-inside text-noche/70">
          <li>✅ Estar registrado</li>
          <li>✅ Aceptar los Términos y Condiciones</li>
          <li>✅ Seguí nuestro canal de YouTube</li>
          <li>✅ Seguí nuestra cuenta de Instagram</li>
        </ul>
      </div>
    </motion.div>
  );
}