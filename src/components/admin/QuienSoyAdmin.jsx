'use client';

import { useState } from 'react';
import { collection, deleteDoc, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from '@/lib/useCollection';
import { nuevoBloque } from '@/lib/schemas';
import { uploadFiles } from '@/lib/storageUpload';
import { Field, Notice, Panel, PhotoStrip } from './ui';

const tipos = [
  ['texto', '📝 Texto'],
  ['tarjeta', '🃏 Tarjeta destacada'],
  ['galeria', '🖼️ Galería de imágenes'],
  ['video', '🎬 Video'],
];
const colores = ['sol', 'atardecer', 'monte', 'cielo', 'rosa'];

export default function QuienSoyAdmin() {
  const { items } = useCollection('quien_soy_bloques', 'orden', 'asc');
  const [form, setForm] = useState(nuevoBloque());
  const [editId, setEditId] = useState(null);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: '', tone: 'error' });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function reset() {
    setForm(nuevoBloque());
    setEditId(null);
    setFiles([]);
  }

  function edit(b) {
    setEditId(b.id);
    setFiles([]);
    setForm({ ...nuevoBloque(), ...b });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMsg({ text: '', tone: 'error' });
    try {
      const ref = editId ? doc(db, 'quien_soy_bloques', editId) : doc(collection(db, 'quien_soy_bloques'));
      const nuevas = files.length ? await uploadFiles(files, `quien_soy/${ref.id}`) : [];
      const orden = editId ? form.orden : (items.length ? Math.max(...items.map((b) => b.orden || 0)) : 0) + 1;
      await setDoc(
        ref,
        {
          tipo: form.tipo,
          orden,
          titulo: form.titulo,
          titulo_en: form.titulo_en,
          contenido: form.contenido,
          contenido_en: form.contenido_en,
          icono: form.icono,
          color: form.color,
          imagenes: [...(form.imagenes || []), ...nuevas],
          videoUrl: form.videoUrl,
        },
        { merge: true }
      );
      reset();
      setMsg({ text: 'Bloque guardado ✅', tone: 'ok' });
    } catch (err) {
      console.error(err);
      setMsg({ text: err.message, tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function move(index, dir) {
    const other = items[index + dir];
    const me = items[index];
    if (!other) return;
    try {
      const batch = writeBatch(db);
      // Se intercambian las posiciones; si hubiera "orden" repetido se normaliza con el índice.
      batch.update(doc(db, 'quien_soy_bloques', me.id), { orden: index + dir + 1 });
      batch.update(doc(db, 'quien_soy_bloques', other.id), { orden: index + 1 });
      await batch.commit();
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
    }
  }

  async function remove(b) {
    if (!window.confirm(`¿Borrar el bloque "${b.titulo || b.tipo}"?`)) return;
    try {
      await deleteDoc(doc(db, 'quien_soy_bloques', b.id));
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
    }
  }

  const tipo = form.tipo;

  return (
    <div className="space-y-6">
      <Panel title={editId ? '✏️ Editar bloque' : '➕ Nuevo bloque'}>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo de bloque">
            <select className="input" value={tipo} onChange={set('tipo')}>
              {tipos.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>

          {tipo === 'tarjeta' && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Emoji">
                <input className="input" value={form.icono} onChange={set('icono')} maxLength={4} />
              </Field>
              <Field label="Color">
                <select className="input" value={form.color} onChange={set('color')}>
                  {colores.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          <Field label="Título (ES)">
            <input className="input" value={form.titulo} onChange={set('titulo')} />
          </Field>
          <Field label="Título (EN, opcional)">
            <input className="input" value={form.titulo_en} onChange={set('titulo_en')} />
          </Field>

          {tipo !== 'galeria' && (
            <>
              <Field label="Contenido (ES)" hint="Dejá una línea en blanco para separar párrafos.">
                <textarea className="input min-h-32" value={form.contenido} onChange={set('contenido')} />
              </Field>
              <Field label="Contenido (EN, opcional)">
                <textarea className="input min-h-32" value={form.contenido_en} onChange={set('contenido_en')} />
              </Field>
            </>
          )}

          {tipo === 'video' && (
            <Field label="Enlace de video" className="sm:col-span-2">
              <input className="input" value={form.videoUrl} onChange={set('videoUrl')} placeholder="https://youtu.be/..." />
            </Field>
          )}

          {tipo === 'galeria' && (
            <div className="space-y-2 sm:col-span-2">
              <Field label="Subir imágenes">
                <input type="file" accept="image/*" multiple className="input" onChange={(e) => setFiles([...e.target.files])} />
              </Field>
              <PhotoStrip urls={form.imagenes} onRemove={(u) => setForm((f) => ({ ...f, imagenes: f.imagenes.filter((x) => x !== u) }))} />
              {files.length > 0 && <p className="text-xs font-bold">{files.length} imagen(es) nueva(s) para subir al guardar.</p>}
            </div>
          )}

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button className="btn-sol" disabled={busy}>
              {busy ? 'Guardando…' : editId ? 'Guardar cambios' : 'Agregar bloque'}
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

      <Panel title={`🧱 Bloques (${items.length}) — el orden de acá es el de la web`}>
        <ul className="space-y-2">
          {items.map((b, i) => (
            <li key={b.id} className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-noche bg-crema p-3">
              <div className="flex flex-col">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-2 font-extrabold disabled:opacity-30" aria-label="Subir">
                  ▲
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="px-2 font-extrabold disabled:opacity-30" aria-label="Bajar">
                  ▼
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold">
                  {tipos.find(([v]) => v === b.tipo)?.[1]} · {b.titulo || '(sin título)'}
                </p>
              </div>
              <button type="button" className="btn-ghost !py-1 text-sm" onClick={() => edit(b)}>
                Editar
              </button>
              <button type="button" className="btn-rosa !py-1 text-sm" onClick={() => remove(b)}>
                Borrar
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="text-sm font-semibold">Sin bloques: la web muestra contenido de ejemplo.</li>}
        </ul>
      </Panel>
    </div>
  );
}
