'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from './AuthProvider';

const STEPS = 3;

export default function WelcomeFlow() {
  const { t } = useI18n();
  const {
    termsAccepted,
    youtubeSubscribed,
    instagramSubscribed,
    aceptarTerminos,
    marcarYoutube,
    marcarInstagram,
  } = useAuth();

  // Paso actual: 1 = Términos, 2 = YouTube, 3 = Instagram
  const [step, setStep] = useState(1);

  const isComplete = termsAccepted && youtubeSubscribed && instagramSubscribed;

  const nextStep = () => {
    if (step < STEPS) setStep((s) => s + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-noche/85 p-4 sm:p-6"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card-comic p-6 sm:p-8 max-w-md w-full border-[3px] border-noche shadow-2xl overflow-hidden"
      >
        {/* Header con progreso */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-noche/60 uppercase tracking-wider">
              Paso {step} de {STEPS}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-4 rounded-full transition-colors ${
                    i <= step ? 'bg-sol' : 'bg-noche/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Paso 1: Términos y Condiciones */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="text-4xl text-center mb-3" aria-hidden>📄</div>
            <h2 className="font-display text-2xl font-extrabold text-center text-noche">
              {t('about_title')}
            </h2>
            <p className="text-sm text-noche/70 leading-relaxed text-center mb-6">
              {t('terms_text')}
            </p>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={() => aceptarTerminos(!termsAccepted)}
                className="w-5 h-5 rounded border-2 border-noche accent-sol"
              />
              <label htmlFor="terms" className="text-sm font-bold text-noche cursor-pointer select-none">
                {t('terms_accept')}
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={!termsAccepted}
                onClick={nextStep}
                className={`px-6 py-2 rounded-full border-2 border-noche font-bold text-sm transition ${
                  termsAccepted ? 'bg-sol text-white shadow-comic-sm' : 'bg-white text-noche/40 cursor-not-allowed'
                }`}
              >
                Siguiente →
              </button>
            </div>
          </motion.div>
        )}

        {/* Paso 2: YouTube */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="text-4xl text-center mb-3" aria-hidden>▶️</div>
            <h2 className="font-display text-2xl font-extrabold text-center text-noche">
              Suscribite a YouTube
            </h2>
            <p className="text-sm text-noche/70 leading-relaxed text-center mb-6">
              Seguinos en <span className="font-bold text-rosa">@JereMovil</span> para ver los
              capítulos completos del viaje.
            </p>

            <div className="flex flex-col items-center gap-3">
              <a
                href="https://www.youtube.com/@JereMovil"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 rounded-full border-2 border-noche bg-rosa text-white font-bold shadow-comic-sm hover:bg-rosa/90 transition-transform active:scale-95"
              >
                <span className="text-2xl" aria-hidden>▶️</span>
                <span>Suscribirse a YouTube</span>
              </a>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="youtube"
                checked={youtubeSubscribed}
                onChange={() => marcarYoutube(!youtubeSubscribed)}
                className="w-5 h-5 rounded border-2 border-noche accent-sol"
              />
              <label htmlFor="youtube" className="text-sm font-bold text-noche cursor-pointer select-none">
                Ya me suscribí
              </label>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 rounded-full border-2 border-noche text-noche font-bold text-sm hover:bg-noche/10"
              >
                ← Atrás
              </button>
              <button
                type="button"
                disabled={!youtubeSubscribed}
                onClick={nextStep}
                className={`px-6 py-2 rounded-full border-2 border-noche font-bold text-sm transition ${
                  youtubeSubscribed ? 'bg-sol text-white shadow-comic-sm' : 'bg-white text-noche/40 cursor-not-allowed'
                }`}
              >
                Siguiente →
              </button>
            </div>
          </motion.div>
        )}

        {/* Paso 3: Instagram */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="text-4xl text-center mb-3" aria-hidden>📸</div>
            <h2 className="font-display text-2xl font-extrabold text-center text-noche">
              Seguinos en Instagram
            </h2>
            <p className="text-sm text-noche/70 leading-relaxed text-center mb-6">
              Seguinos en <span className="font-bold text-rosa">@jerefijo</span> para ver fotos y
              stories del camino.
            </p>

            <div className="flex flex-col items-center gap-3">
              <a
                href="https://www.instagram.com/jerefijo/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 rounded-full border-2 border-noche bg-atardecer text-white font-bold shadow-comic-sm hover:bg-atardecer/90 transition-transform active:scale-95"
              >
                <span className="text-2xl" aria-hidden>📸</span>
                <span>Seguir en Instagram</span>
              </a>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="instagram"
                checked={instagramSubscribed}
                onChange={() => marcarInstagram(!instagramSubscribed)}
                className="w-5 h-5 rounded border-2 border-noche accent-sol"
              />
              <label htmlFor="instagram" className="text-sm font-bold text-noche cursor-pointer select-none">
                Ya te seguimos
              </label>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 rounded-full border-2 border-noche text-noche font-bold text-sm hover:bg-noche/10"
              >
                ← Atrás
              </button>
              <button
                type="button"
                disabled={!instagramSubscribed}
                onClick={() => {}}
                className={`px-6 py-2 rounded-full border-2 border-noche font-bold text-sm transition ${
                  instagramSubscribed ? 'bg-sol text-white shadow-comic-sm' : 'bg-white text-noche/40 cursor-not-allowed'
                }`}
              >
                ¡Listo! →
              </button>
            </div>
          </motion.div>
        )}

        {/* Paso completo */}
        {isComplete && step > STEPS && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="text-6xl mb-3" aria-hidden>🎉</div>
            <h2 className="font-display text-2xl font-extrabold text-noche">¡Listo!</h2>
            <p className="text-sm text-noche/70">
              Ya podés ver todo el contenido de Jere Móvil.
            </p>
            <button
              type="button"
              onClick={() => {
                // Forzar re-render para salir del LoginWall
                window.location.reload();
              }}
              className="px-8 py-3 rounded-full border-2 border-noche bg-sol text-white font-bold shadow-comic-sm hover:bg-sol/90"
            >
              Ir al mapa
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}