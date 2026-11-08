'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { useAuth } from './AuthProvider';

/** Muro de registro: se muestra cuando algo requiere sesión iniciada. */
export default function LoginWall({ compact = false }) {
  const { t } = useI18n();
  const { login, configured, error } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      className={`card-comic mx-auto flex max-w-xl flex-col items-center gap-3 bg-sol/30 text-center ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      <div className={compact ? 'text-3xl' : 'text-5xl'}>🔒🚐</div>
      <h3 className={compact ? 'text-lg font-extrabold' : 'text-2xl font-extrabold'}>{t('auth_title')}</h3>
      <p className="text-sm font-semibold">{t('auth_text')}</p>
      <button type="button" onClick={login} className="btn-sol">
        <span aria-hidden>🔑</span> {t('login')}
      </button>
      {!configured && <p className="text-xs font-bold text-atardecer">{t('auth_demo')}</p>}
      {error === 'error' && <p className="text-xs font-bold text-rosa">{t('auth_error')}</p>}
    </motion.div>
  );
}
