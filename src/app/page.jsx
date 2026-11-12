'use client';

import { motion } from 'framer-motion';
import MapSection from '@/components/MapSection';

export default function HomePage() {
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
