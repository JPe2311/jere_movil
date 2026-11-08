'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useCollection } from '@/lib/useCollection';
import { demoRecursos } from '@/lib/demoData';
import { useI18n } from '@/lib/i18n';
import { cn, loc } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import LoginWall from '@/components/LoginWall';

const tipoEmoji = { wallpaper: '🖼️', video: '🎞️', curso: '🧭' };

function ResourceCard({ recurso, demo }) {
  const { t, lang } = useI18n();
  const { user, login } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function access() {
    setMsg('');
    if (demo) return setMsg(t('res_demo_note'));
    if (!user) return login();
    setBusy(true);
    try {
      // El enlace/archivo real vive en recursos_privados: solo se puede leer con sesión iniciada.
      const snap = await getDoc(doc(db, 'recursos_privados', recurso.id));
      const d = snap.data();
      const url = d?.storagePath ? await getDownloadURL(ref(storage, d.storagePath)) : d?.url;
      if (!url) throw new Error('sin url');
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(err);
      setMsg(t('res_error'));
    } finally {
      setBusy(false);
    }
  }

  const isDownload = recurso.tipo === 'wallpaper';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, rotate: -0.6 }}
      className="card-comic flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] border-b-[3px] border-noche bg-gradient-to-br from-sol via-atardecer to-rosa">
        {recurso.miniatura ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recurso.miniatura} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-6xl">{tipoEmoji[recurso.tipo] || '🎁'}</div>
        )}
        {!user && !demo && (
          <span className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full border-[3px] border-noche bg-white" title={t('res_login_to')}>
            🔒
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-2">
          <span className="chip">
            {tipoEmoji[recurso.tipo]} {t(`res_${recurso.tipo}`)}
          </span>
          {recurso.formato && (
            <span className="chip bg-cielo text-white">{recurso.formato === 'movil' ? `📱 ${t('res_mobile')}` : `🖥️ ${t('res_desktop')}`}</span>
          )}
        </div>
        <h3 className="font-display text-xl font-extrabold leading-tight">{loc(recurso, 'titulo', lang)}</h3>
        {loc(recurso, 'descripcion', lang) && <p className="text-sm font-semibold">{loc(recurso, 'descripcion', lang)}</p>}
        <button type="button" onClick={access} disabled={busy} className={cn('mt-auto self-start', user || demo ? 'btn-sol' : 'btn-cielo')}>
          {user || demo ? (isDownload ? `⬇️ ${t('res_download')}` : `↗️ ${t('res_open')}`) : `🔑 ${t('res_login_to')}`}
        </button>
        {msg && <p className="text-xs font-bold text-rosa">{msg}</p>}
      </div>
    </motion.article>
  );
}

export default function RecursosPage() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { items, loading } = useCollection('recursos', 'creado', 'desc');
  const [tab, setTab] = useState('all');

  const demo = !loading && items.length === 0;
  const lista = demo ? demoRecursos : items;
  const visibles = lista.filter((r) => tab === 'all' || r.tipo === tab);
  const tabs = ['all', 'wallpaper', 'video', 'curso'];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <header className="text-center">
        <div className="mb-2 text-6xl" aria-hidden>
          🎁
        </div>
        <h1 className="page-title">{t('res_title')}</h1>
        <p className="mt-1 font-semibold">{t('res_subtitle')}</p>
      </header>

      {!user && !authLoading && <LoginWall />}

      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              'rounded-full border-[3px] border-noche px-4 py-1 font-display font-bold transition',
              tab === k ? 'bg-sol shadow-comic-sm' : 'bg-white hover:bg-crema'
            )}
          >
            {k === 'all' ? t('res_all') : `${tipoEmoji[k]} ${t(`res_${k}`)}`}
          </button>
        ))}
      </div>

      {loading && <p className="text-center font-bold">{t('loading')}</p>}
      {!loading && visibles.length === 0 && <p className="text-center font-bold">{t('res_empty')}</p>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((r) => (
          <ResourceCard key={r.id} recurso={r} demo={demo} />
        ))}
      </div>
    </div>
  );
}
