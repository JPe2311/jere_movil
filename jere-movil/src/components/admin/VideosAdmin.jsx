'use client';

import { useState } from 'react';
import { addDoc, collection, deleteDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from '@/lib/useCollection';
import { nuevoVideo } from '@/lib/schemas';
import { formatDate, toDateInput, toMillis, youtubeId, youtubeThumb } from '@/lib/utils';
import { Field, Notice, Panel } from './ui';

export default function VideosAdmin() {
  const { items } = useCollection('videos', 'fecha', 'desc');
  const [form, setForm] = useState(nuevoVideo());
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: '', tone: 'error' });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const ytId = youtubeId(form.youtubeId);

  function reset() {
    setForm(nuevoVideo());
    setEditId(null);
  }

  function edit(v) {
    setEditId(v.id);
    setForm({
      youtubeId: v.youtubeId || '',
      titulo: v.titulo || '',
      titulo_en: v.titulo_en || '',
      descripcion: v.descripcion || '',
      temporada: v.temporada ?? 1,
      fecha: toDateInput(toMillis(v.fecha)),
      palabrasClave: (v.palabrasClave || []).join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(e) {
    e.preventDefault();
    if (!ytId) {
      setMsg({ text: 'ID o URL de YouTube inválido.', tone: 'error' });
      return;
    }
    setBusy(true);
    setMsg({ text: '', tone: 'error' });
    try {
      const data = {
        youtubeId: ytId,
        titulo: form.titulo,
        titulo_en: form.titulo_en,
        descripcion: form.descripcion,
        temporada: Number(form.temporada) || 1,
        fecha: Timestamp.fromDate(new Date(`${form.fecha}T12:00`)),
        palabrasClave: form.palabrasClave
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editId) await setDoc(doc(db, 'videos', editId), data, { merge: true });
      else await addDoc(collection(db, 'videos'), data);
      reset();
      setMsg({ text: 'Video guardado ✅', tone: 'ok' });
    } catch (err) {
      console.error(err);
      setMsg({ text: err.message, tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function remove(v) {
    if (!window.confirm(`¿Borrar "${v.titulo}"? (sus comentarios quedan huérfanos en Firestore)`)) return;
    try {
      await deleteDoc(doc(db, 'videos', v.id));
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
    }
  }

  return (
    <div className="space-y-6">
      <Panel title={editId ? '✏️ Editar video' : '🎬 Nuevo video'}>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="ID o URL de YouTube" hint={ytId ? `ID detectado: ${ytId}` : 'Pegá la URL completa o el ID de 11 caracteres.'}>
            <input className="input" value={form.youtubeId} onChange={set('youtubeId')} required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Temporada">
              <input type="number" min={1} className="input" value={form.temporada} onChange={set('temporada')} required />
            </Field>
            <Field label="Fecha de publicación">
              <input type="date" className="input" value={form.fecha} onChange={set('fecha')} required />
            </Field>
          </div>
          <Field label="Título (ES)">
            <input className="input" value={form.titulo} onChange={set('titulo')} required />
          </Field>
          <Field label="Título (EN, opcional)">
            <input className="input" value={form.titulo_en} onChange={set('titulo_en')} />
          </Field>
          <Field label="Descripción" className="sm:col-span-2">
            <textarea className="input min-h-20" value={form.descripcion} onChange={set('descripcion')} />
          </Field>
          <Field label="Palabras clave" hint="Separadas por coma: patagonia, camping, ruta 40" className="sm:col-span-2">
            <input className="input" value={form.palabrasClave} onChange={set('palabrasClave')} />
          </Field>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button className="btn-sol" disabled={busy}>
              {busy ? 'Guardando…' : editId ? 'Guardar cambios' : 'Agregar video'}
            </button>
            {editId && (
              <button type="button" className="btn-ghost" onClick={reset}>
                Cancelar
              </button>
            )}
          </div>
          <div className="sm:col-span-2">
            <Notice tone={msg.tone}>{msg.text}</Notice>
          </div>
        </form>
      </Panel>

      <Panel title={`📚 Videos (${items.length})`}>
        <ul className="divide-y-2 divide-noche/10">
          {items.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center gap-3 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={youtubeThumb(v.youtubeId)} alt="" className="h-12 w-20 rounded-lg border-2 border-noche object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold">{v.titulo}</p>
                <p className="text-xs font-semibold text-noche/70">
                  Temporada {v.temporada} · {formatDate(toMillis(v.fecha), 'es', { dateStyle: 'medium' })}
                </p>
              </div>
              <button type="button" className="btn-ghost !py-1 text-sm" onClick={() => edit(v)}>
                Editar
              </button>
              <button type="button" className="btn-rosa !py-1 text-sm" onClick={() => remove(v)}>
                Borrar
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="py-2 text-sm font-semibold">Todavía no hay videos cargados.</li>}
        </ul>
      </Panel>
    </div>
  );
}
