'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useAuth } from '@/components/AuthProvider';
import LoginWall from '@/components/LoginWall';
import MapSection from '@/components/MapSection';

export default function MapaPage() {
  const { termsAccepted, youtubeSubscribed, instagramSubscribed } = useAuth();

  // Solo habilitado si acepta Términos y sigue YouTube + Instagram
  const puedeVer = useMemo(
    () => termsAccepted && youtubeSubscribed && instagramSubscribed,
    [termsAccepted, youtubeSubscribed, instagramSubscribed]
  );

  if (!puedeVer) return <LoginWall />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 15 }}
      className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-crema"
    >
      <MapSection />
    </motion.div>
  );
}
