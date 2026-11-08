'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/components/AuthProvider';

export default function TermsConditions() {
  const { t } = useI18n();
  const { user, termsAccepted, aceptarTerminos, marcarYoutube, marcarInstagram } = useAuth();
  const [show, setShow] = useState(false);

  const handleAccept = async () => {
    setShow(false);
    await aceptarTerminos(true);
    await marcarYoutube(true);
    await marcarInstagram(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-noche/80 p-6"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="card-comic p-8 sm:p-10 max-w-2xl w-full border-[3px] border-noche shadow-2xl"
      >
        <h2 className="font-display text-3xl font-extrabold text-center mb-6">
          {t('terms_title')}
        </h2>

        <p className="text-sm text-noche/70 leading-relaxed mb-6">
          {t('terms_text')}
        </p>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShow(false)}
            className="flex-1 btn-ghost py-2 rounded-full text-sm font-bold text-noche/60"
          >
            {t('terms_decline')}
          </button>
          <button
            onClick={() => handleAccept()}
            className="flex-1 btn btn-rosa py-2 rounded-full text-sm font-bold"
          >
            {t('terms_accept')}
          </button>
        </div>

        {termsAccepted && (
          <div className="mt-6 p-4 rounded-2xl border-2 border-noche/50 bg-crema/60 text-sm">
            <p className="font-semibold text-noche">¡Gracias! Ahora podés:</p>
            <ul className="list-disc list-inside mt-1 text-noche/70">
              <li>Ver 'Mi Viaje', 'Videos' y 'Recursos'</li>
              <li>Seguinos en YouTube e Instagram</li>
            </ul>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}