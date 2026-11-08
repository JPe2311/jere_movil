'use client';

import { useEffect, useRef, useState } from 'react';
import { collection, deleteDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from '@/lib/useCollection';
import { nuevoPunto } from '@/lib/schemas';
import { uploadFiles } from '@/lib/storageUpload';
import { formatDate, toDateInput, toMillis, toTimeInput } from '@/lib/utils';
import { Field, Notice, Panel, PhotoStrip } from './ui';

export default function PuntosAdmin() {
  const { items } = useCollection('puntos_mapa', 'fechaHora', 'asc');
  const [form, setForm] = useState(nuevoPunto());
  const [editId, setEditId] = useState(null);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: '', tone: 'error' });

  // --- Geocodificación con Nominatim (OpenStreetMap). Política de uso: máx. 1 req/s → debounce.
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const skip = useRef(false);

  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return undefined;
    }
    if (q.trim().length < 3) {
      setResults([]);
      return undefined;
    }
    const ctl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&accept-language=es&q=${encodeURIComponent(q)}`,
          { signal: ctl.signal }
        );
        setResults(await r.json());
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
    }, 600);
    return () => {
      clearTimeout(id);
      ctl.abort();
    };
  }, [q]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function pickPlace(r) {
    const a = r.address || {};
    setForm((f) => ({
      ...f,
      ciudad: a.city || a.town || a.village || a.municipality || r.name || q,
      pais: a.country || '',
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    }));
    skip.current = true;
    setQ(r.display_name);
    setResults([]);
  }

  function reset() {
    setForm(nuevoPunto());
    setEditId(null);
    setFiles([]);
    setQ('');
    setResults([]);
  }

  function edit(p) {
    const ms = toMillis(p.fechaHora);
    setEditId(p.id);
    setFiles([]);
    skip.current = true;
    setQ(`${p.ciudad || ''}${p.pais ? `, ${p.pais}` : ''}`);
    setForm({
      ciudad: p.ciudad || '', pais: p.pais || '', lat: p.lat, lng: p.lng,
      fecha: toDateInput(ms), hora: toTimeInput(ms),
      titulo: p.titulo || '', titulo_en: p.titulo_en || '',
      descripcion: p.descripcion || '', descripcion_en: p.descripcion_en || '',
      fotos: p.fotos || [], videoUrl: p.videoUrl || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(e) {
    e.preventDefault();
    if (typeof form.lat !== 'number' || typeof form.lng !== 'number') {
      setMsg({ text: 'Elegí una ubicación de la lista de resultados del buscador.', tone: 'error' });
      return;
    }
    if (!form.fecha) {
      setMsg({ text: 'Falta la fecha.', tone: 'error' });
      return;
    }
    setBusy(true);
    setMsg({ text: '', tone: 'error' });
    try {
      const ref = editId ? doc(db, 'puntos_mapa', editId) : doc(collection(db, 'puntos_mapa'));
      const nuevas = files.length ? await uploadFiles(files, `puntos/${ref.id}`) : [];
      await setDoc(
        ref,
        {
          ciudad: form.ciudad,
          pais: form.pais,
          lat: form.lat,
          lng: form.lng,
          fechaHora: Timestamp.fromDate(new Date(`${form.fecha}T${form.hora || '12:00'}`)),
          titulo: form.titulo,
          titulo_en: form.titulo_en,
          descripcion: form.descripcion,
          descripcion_en: form.descripcion_en,
          fotos: [...form.fotos, ...nuevas],
          videoUrl: form.videoUrl,
        },
        { merge: true }
      );
      reset();
      setMsg({ text: editId ? 'Punto actualizado ✅' : 'Punto creado ✅ — la ruta se recalcula sola.', tone: 'ok' });
    } catch (err) {
      console.error(err);
      setMsg({ text: err.message, tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function remove(p) {
    if (!window.confirm(`¿Borrar "${p.titulo || p.ciudad}"?`)) return;
    try {
      await deleteDoc(doc(db, 'puntos_mapa', p.id));
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
    }
  }

  return (
    <div className="space-y-6">
      <Panel title={editId ? '✏️ Editar punto del mapa' : '📍 Nuevo punto del mapa'}>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div className="relative sm:col-span-2">
            <Field label="Ciudad o lugar" hint="Escribí y elegí un resultado: se completan país y coordenadas.">
              <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej: Ushuaia" autoComplete="off" />
            </Field>
            {results.length > 0 && (
              <ul className="card-comic absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto p-1">
                {results.map((r) => (
                  <li key={r.place_id}>
                    <button type="button" onClick={() => pickPlace(r)} className="w-full rounded-2xl px-3 py-2 text-left text-sm font-bold hover:bg-sol/40">
                      📍 {r.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {typeof form.lat === 'number' && (
              <p className="mt-1 text-xs font-bold text-monte">
                ✔ {form.ciudad}, {form.pais} ({form.lat.toFixed(4)}, {form.lng.toFixed(4)})
              </p>
            )}
          </div>

          <Field label="Fecha">
            <input type="date" className="input" value={form.fecha} onChange={set('fecha')} required />
          </Field>
          <Field label="Hora">
            <input type="time" className="input" value={form.hora} onChange={set('hora')} />
          </Field>

          <Field label="Título (ES)">
            <input className="input" value={form.titulo} onChange={set('titulo')} required />
          </Field>
          <Field label="Título (EN, opcional)">
            <input className="input" value={form.titulo_en} onChange={set('titulo_en')} />
          </Field>

          <Field label="Descripción (ES)">
            <textarea className="input min-h-28" value={form.descripcion} onChange={set('descripcion')} />
          </Field>
          <Field label="Descripción (EN, opcional)">
            <textarea className="input min-h-28" value={form.descripcion_en} onChange={set('descripcion_en')} />
          </Field>

          <Field label="Enlace de video" hint="YouTube o archivo de video directo.">
            <input className="input" value={form.videoUrl} onChange={set('videoUrl')} placeholder="https://youtu.be/..." />
          </Field>
          <Field label="Subir fotos">
            <input type="file" accept="image/*" multiple className="input" onChange={(e) => setFiles([...e.target.files])} />
          </Field>

          <div className="sm:col-span-2">
            <PhotoStrip urls={form.fotos} onRemove={(u) => setForm((f) => ({ ...f, fotos: f.fotos.filter((x) => x !== u) }))} />
            {files.length > 0 && <p className="mt-1 text-xs font-bold">{files.length} foto(s) nueva(s) para subir al guardar.</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button className="btn-sol" disabled={busy}>
              {busy ? 'Guardando…' : editId ? 'Guardar cambios' : 'Crear punto'}
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

      <Panel title={`🗺️ Puntos cargados (${items.length})`}>
        <p className="text-sm font-semibold">La ruta del mapa une estos puntos en orden cronológico automáticamente.</p>
        <ul className="divide-y-2 divide-noche/10">
          {items.map((p, i) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 py-2">
              <span className="hito-pin shrink-0">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold">{p.titulo || p.ciudad}</p>
                <p className="text-xs font-semibold text-noche/70">
                  {p.ciudad}
                  {p.pais ? `, ${p.pais}` : ''} · {formatDate(toMillis(p.fechaHora), 'es', { dateStyle: 'medium', timeStyle: 'short' })} · {(p.fotos || []).length} foto(s)
                </p>
              </div>
              <button type="button" className="btn-ghost !py-1 text-sm" onClick={() => edit(p)}>
                Editar
              </button>
              <button type="button" className="btn-rosa !py-1 text-sm" onClick={() => remove(p)}>
                Borrar
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="py-2 text-sm font-semibold">Todavía no hay puntos: el mapa muestra datos de ejemplo.</li>}
        </ul>
      </Panel>
    </div>
  );
}
