'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from './AuthProvider';
import TermsConditions from './TermsConditions';

export default function LoginWall({ compact = false }) {
  const { t } = useI18n();
  const { termsAccepted, youtubeSubscribed, instagramSubscribed, login } = useAuth();

  // Calculamos isAuthorized dentro del componente a partir de los valores del contexto
  const isAuthorized = termsAccepted && youtubeSubscribed && instagramSubscribed;

  useEffect(() => {
    // Si ya está autorizado, no volvemos a pedir nada
    if (isAuthorized) return;
    // Si aceptó T&C pero aún no siguió, preguntamos para completar
    if (termsAccepted && !youtubeSubscribed && !instagramSubscribed) {
      const completed = window.confirm(
        '¡Aceptaste los Términos! ¿Seguimos con el canal de YouTube e Instagram para desbloquear todo el contenido?'
      );
      if (completed) {
        // En un caso real aquí llamaríamos a marcarYoutube/marcarInstagram
        // Por ahora solo actualizamos el estado local
      }
    }
  }, [termsAccepted, youtubeSubscribed, instagramSubscribed]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      className={`card-comic mx-auto flex max-w-xl flex-col items-center gap-3 bg-sol/30 text-center ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      {!isAuthorized && (
        <div className="mb-4">
          <motion.div
            whileHover={{ rotate: [-1, 1]}}
            whileTap={{ scale: 0.95 }}
            className="text-5xl" aria-hidden
          >
            🔒🚐
          </motion.div>
          <h3 className={compact ? 'text-lg font-extrabold' : 'text-2xl font-extrabold'}>
            {t('auth_title')}
          </h3>
          <p className="text-sm font-semibold">{t('auth_text')}</p>
        </div>
      )}

      {isAuthorized && (
        <TermsConditions />
      )}

      {!isAuthorized && !termsAccepted && (
        <div>
          <button
            type="button"
            onClick={login}
            className="btn-sol"
          >
            <span aria-hidden>🔑</span> {t('login')}
          </button>
          {!termsAccepted && (
            <p className="mt-2 text-xs font-bold text-atardecer">
              {t('auth_demo')}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}