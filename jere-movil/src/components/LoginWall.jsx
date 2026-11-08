'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { useAuth } from './AuthProvider';
import WelcomeFlow from './WelcomeFlow';

export default function LoginWall({ compact = false }) {
  const { t } = useI18n();
  const {
    user,
    termsAccepted,
    youtubeSubscribed,
    instagramSubscribed,
    login,
  } = useAuth();

  const isAuthorized = termsAccepted && youtubeSubscribed && instagramSubscribed;

  // Si ya aceptó todo, no mostramos nada (deja pasar al contenido)
  if (isAuthorized) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      className={`card-comic mx-auto flex max-w-md flex-col items-center gap-3 bg-sol/30 text-center p-8 sm:p-10 border-[3px] border-noche shadow-comic`}
    >
      <div className="text-5xl mb-2" aria-hidden>🔒🚐</div>
      <h3 className={compact ? 'text-lg font-extrabold' : 'text-2xl font-extrabold'}>
        {t('auth_title')}
      </h3>
      <p className="text-sm font-semibold text-noche/70 mb-6">
        {t('auth_text')}
      </p>

      {/* Si no hay usuario aún, mostramos botón de login */}
      {!user && (
        <div>
          <button
            type="button"
            onClick={login}
            className="btn-sol"
          >
            <span aria-hidden>🔑</span> Entrá!
          </button>
          <p className="mt-2 text-xs font-bold text-noche/60">
            Iniciá sesión para continuar.
          </p>
        </div>
      )}

      {/* Si ya hay usuario pero falta aceptar Términos o seguir redes, mostramos el flujo de bienvenida */}
      {user && !isAuthorized && (
        <WelcomeFlow />
      )}
    </motion.div>
  );
}