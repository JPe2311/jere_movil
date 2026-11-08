'use client';

import { useState } from 'react';
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from '@/lib/useCollection';
import { useI18n } from '@/lib/i18n';
import { formatDate, toMillis } from '@/lib/utils';
import { useAuth } from './AuthProvider';
import LoginWall from './LoginWall';

/** Comentarios de un video: se leen sin sesión, para escribir hace falta Google Auth. */
export default function Comments({ videoId }) {
  const { t, lang } = useI18n();
  const { user, isAdmin } = useAuth();
  const { items, loading } = useCollection(`videos/${videoId}/comentarios`, 'creado', 'desc');
  const [texto, setTexto] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(e) {
    e.preventDefault();
    const clean = texto.trim();
    if (!clean || !user || !db) return;
    setBusy(true);
    try {
      await addDoc(collection(db, 'videos', videoId, 'comentarios'), {
        uid: user.uid,
        nombre: user.displayName || 'Viajero',
        foto: user.photoURL || '',
        texto: clean.slice(0, 1000),
        creado: serverTimestamp(),
      });
      setTexto('');
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'videos', videoId, 'comentarios', id));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-3 border-t-[3px] border-dashed border-noche/30 pt-3">
      <h4 className="font-display text-lg font-extrabold">💬 {t('videos_comments')}</h4>

      {user ? (
        <form onSubmit={send} className="flex gap-2">
          <input
            className="input"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={t('videos_comment_ph')}
            maxLength={1000}
          />
          <button className="btn-sol shrink-0" disabled={busy || !texto.trim()}>
            {t('videos_send')}
          </button>
        </form>
      ) : (
        <LoginWall compact />
      )}

      {loading && <p className="text-sm font-semibold">{t('loading')}</p>}
      {!loading && items.length === 0 && <p className="text-sm font-semibold">{t('videos_no_comments')}</p>}

      <ul className="space-y-2">
        {items.map((c) => (
          <li key={c.id} className="flex items-start gap-3 rounded-2xl border-2 border-noche bg-crema p-3">
            {c.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.foto} alt="" referrerPolicy="no-referrer" className="h-9 w-9 shrink-0 rounded-full border-2 border-noche" />
            ) : (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-noche bg-cielo font-bold text-white">
                {(c.nombre || '?')[0]}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold">
                {c.nombre}
                <span className="ml-2 text-xs font-semibold text-noche/60">{formatDate(toMillis(c.creado), lang, { dateStyle: 'medium' })}</span>
              </p>
              <p className="whitespace-pre-line break-words text-sm font-semibold">{c.texto}</p>
            </div>
            {user && (c.uid === user.uid || isAdmin) && (
              <button type="button" onClick={() => remove(c.id)} className="text-xs font-extrabold text-rosa hover:underline">
                {t('videos_delete')}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
