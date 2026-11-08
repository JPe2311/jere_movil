'use client';

import { useState } from 'react';
import { collection, deleteDoc, doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { deleteObject, ref as storageRef } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useCollection } from '@/lib/useCollection';
import { nuevoRecurso } from '@/lib/schemas';
import { uploadOne } from '@/lib/storageUpload';
import { Field, Notice, Panel } from './ui';

export default function RecursosAdmin() {
  const { items } = useCollection('recursos', 'creado', 'desc');
  const [form, setForm] = useState(nuevoRecurso());
  const [editId, setEditId] = useState(null);
  const [thumb, setThumb] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: '', tone: 'error' });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function reset() {
    setForm(nuevoRecurso());
    setEditId(null);
    setThumb(null);
    setFile(null);
  }

  async function edit(r) {
    setEditId(r.id);
    setThumb(null);
    setFile(null);
    let priv = {};
    try {
      priv = (await getDoc(doc(db, 'recursos_privados', r.id))).data() || {};
    } catch (err) {
      console.error(err);
    }
    setForm({
      tipo: r.tipo || 'wallpaper',
      formato: r.formato || '',
      titulo: r.titulo || '',
      titulo_en: r.titulo_en || '',
      descripcion: r.descripcion || '',
      descripcion_en: r.descripcion_en || '',
      url: priv.url || '',
      miniatura: r.miniatura || '',
      storagePath: priv.storagePath || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMsg({ text: '', tone: 'error' });
    try {
      const pub = editId ? doc(db, 'recursos', editId) : doc(collection(db, 'recursos'));
      const id = pub.id;

      let miniatura = form.miniatura || '';
      if (thumb) miniatura = (await uploadOne(thumb, `recursos_publicos/${id}`)).url;

      let storagePath = form.storagePath || '';
      if (file) {
        // Archivo nuevo: se sube a la carpeta privada y se borra el anterior si existía.
        const up = await uploadOne(file, `recursos/${id}`);
        if (storagePath && storage) await deleteObject(storageRef(storage, storagePath)).catch(() => {});
        storagePath = up.path;
      }

      if (!storagePath && !form.url) throw new Error('Subí un archivo o pegá un enlace de acceso.');

      await setDoc(
        pub,
        {
          tipo: form.tipo,
          formato: form.tipo === 'wallpaper' ? form.formato : '',
          titulo: form.titulo,
          titulo_en: form.titulo_en,
          descripcion: form.descripcion,
          descripcion_en: form.descripcion_en,
          miniatura,
          ...(editId ? {} : { creado: serverTimestamp() }),
        },
        { merge: true }
      );
      // La parte privada (archivo o enlace real) solo la puede leer un usuario con sesión.
      await setDoc(doc(db, 'recursos_privados', id), { storagePath, url: form.url || '' });

      reset();
      setMsg({ text: 'Recurso guardado ✅', tone: 'ok' });
    } catch (err) {
      console.error(err);
      setMsg({ text: err.message, tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function remove(r) {
    if (!window.confirm(`¿Borrar "${r.titulo}"?`)) return;
    try {
      const priv = (await getDoc(doc(db, 'recursos_privados', r.id))).data();
      if (priv?.storagePath && storage) await deleteObject(storageRef(storage, priv.storagePath)).catch(() => {});
      await deleteDoc(doc(db, 'recursos_privados', r.id));
      await deleteDoc(doc(db, 'recursos', r.id));
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
    }
  }

  return (
    <div className="space-y-6">
      <Panel title={editId ? '✏️ Editar recurso' : '🎁 Nuevo recurso'}>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo">
            <select className="input" value={form.tipo} onChange={set('tipo')}>
              <option value="wallpaper">🖼️ Wallpaper</option>
              <option value="video">🎞️ Video exclusivo / B-Roll</option>
              <option value="curso">🧭 Minicurso o guía</option>
            </select>
          </Field>
          {form.tipo === 'wallpaper' && (
            <Field label="Formato">
              <select className="input" value={form.formato} onChange={set('formato')}>
                <option value="movil">📱 Móvil</option>
                <option value="desktop">🖥️ Desktop</option>
              </select>
            </Field>
          )}
          <Field label="Título (ES)">
            <input className="input" value={form.titulo} onChange={set('titulo')} required />
          </Field>
          <Field label="Título (EN, opcional)">
            <input className="input" value={form.titulo_en} onChange={set('titulo_en')} />
          </Field>
          <Field label="Descripción (ES)">
            <textarea className="input min-h-20" value={form.descripcion} onChange={set('descripcion')} />
          </Field>
          <Field label="Descripción (EN, opcional)">
            <textarea className="input min-h-20" value={form.descripcion_en} onChange={set('descripcion_en')} />
          </Field>
          <Field label="Miniatura (pública)" hint={form.miniatura ? 'Ya tiene miniatura; subí otra para reemplazarla.' : 'Imagen de vista previa.'}>
            <input type="file" accept="image/*" className="input" onChange={(e) => setThumb(e.target.files[0] || null)} />
          </Field>
          <Field label="Archivo a descargar (privado)" hint={form.storagePath ? 'Ya hay un archivo; subí otro para reemplazarlo.' : 'Solo lo descargan usuarios con sesión.'}>
            <input type="file" className="input" onChange={(e) => setFile(e.target.files[0] || null)} />
          </Field>
          <Field label="…o enlace de acceso (curso, Drive, video privado)" className="sm:col-span-2" hint="Se guarda en la parte privada: solo se muestra a usuarios con sesión.">
            <input className="input" value={form.url} onChange={set('url')} placeholder="https://..." />
          </Field>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button className="btn-sol" disabled={busy}>
              {busy ? 'Guardando…' : editId ? 'Guardar cambios' : 'Crear recurso'}
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

      <Panel title={`📦 Recursos (${items.length})`}>
        <ul className="divide-y-2 divide-noche/10">
          {items.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 py-2">
              {r.miniatura ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.miniatura} alt="" className="h-12 w-20 rounded-lg border-2 border-noche object-cover" />
              ) : (
                <span className="grid h-12 w-20 place-items-center rounded-lg border-2 border-noche bg-sol text-xl">🎁</span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold">{r.titulo}</p>
                <p className="text-xs font-semibold text-noche/70">
                  {r.tipo}
                  {r.formato ? ` · ${r.formato}` : ''}
                </p>
              </div>
              <button type="button" className="btn-ghost !py-1 text-sm" onClick={() => edit(r)}>
                Editar
              </button>
              <button type="button" className="btn-rosa !py-1 text-sm" onClick={() => remove(r)}>
                Borrar
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="py-2 text-sm font-semibold">Todavía no hay recursos cargados.</li>}
        </ul>
      </Panel>
    </div>
  );
}
