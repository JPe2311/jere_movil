'use client';

import { motion } from 'framer-motion';
import BlockRenderer from '@/components/BlockRenderer';
import { useCollection } from '@/lib/useCollection';
import { demoBloques } from '@/lib/demoData';
import { useI18n } from '@/lib/i18n';

export default function QuienSoyPage() {
  const { t } = useI18n();
  const { items, loading } = useCollection('quien_soy_bloques', 'orden', 'asc');
  const bloques = !loading && items.length === 0 ? demoBloques : items;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="mb-2 text-6xl" aria-hidden>
          🙋
        </div>
        <h1 className="page-title">{t('about_title')}</h1>
      </motion.header>

      {loading && <p className="text-center font-bold">{t('loading')}</p>}

      {!loading && bloques.length === 0 && <p className="text-center font-bold">{t('about_empty')}</p>}

      {bloques.map((b) => (
        <BlockRenderer key={b.id} bloque={b} />
      ))}
    </div>
  );
}
