'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { collection, deleteDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from '@/lib/useCollection';
import { nuevoPunto } from '@/lib/schemas';
import { CATEGORIAS_PUNTOS, LISTA_CATEGORIAS } from '@/lib/categories';
import { ordenarPuntos, planInsercion, planMovimiento, planRenumerar, persistirOrden } from '@/lib/orden';
import { uploadFiles } from '@/lib/storageUpload';
import { formatDate, toDateInput, toMillis, toTimeInput } from '@/lib/utils';
import { Field, Notice, Panel, PhotoStrip } from './ui';
import { obtenerRutas } from '@/lib/rutas';

export default function PuntosAdmin() {
  const { items } = useCollection('puntos_mapa', 'fechaHora', 'asc');
  const [form, setForm] = useState(nuevoPunto());
  const [editId, setEditId] = useState(null);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ text: '', tone: 'error' });

  // Rutas disponibles para asignar a los puntos
  const [rutas, setRutas] = useState([]);

  // Orden en el que se muestran y numeran los puntos (mismo criterio que el mapa)
  const ordenados = useMemo(() => ordenarPuntos(items), [items]);

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

  // Cargar rutas disponibles para asignar a los puntos
  useEffect(() => {
    async function cargarRutas() {
      try {
        const data = await obtenerRutas();
        setRutas(data);
      } catch (err) {
        console.error('[rutas] error cargando:', err);
      }
    }
    cargarRutas();
  }, []);

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
      categoria: p.categoria || 'importante',
      rutaId: p.rutaId || '',
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
      const fechaMs = new Date(`${form.fecha}T${form.hora || '12:00'}`).getTime();

      // Numeración: manda la fecha. Un punto nuevo (o una fecha cambiada) entra
      // en su lugar y los números siguientes se corren solos (+1).
      // Si la fecha no cambió al editar, se respeta el lugar manual (↑ ↓).
      const fechaAnterior = editId ? toMillis(items.find((x) => x.id === editId)?.fechaHora) : NaN;
      const cambioFecha = !Number.isFinite(fechaAnterior) || fechaAnterior !== fechaMs;
      const plan =
        editId && !cambioFecha
          ? planRenumerar(items)
          : planInsercion(
              items.filter((x) => x.id !== ref.id),
              { id: ref.id },
              fechaMs
            );
      const orden = plan.find((x) => x.id === ref.id)?.orden ?? 1;

      await setDoc(
        ref,
        {
          ciudad: form.ciudad,
          pais: form.pais,
          lat: form.lat,
          lng: form.lng,
          fechaHora: Timestamp.fromDate(new Date(fechaMs)),
          titulo: form.titulo,
          titulo_en: form.titulo_en,
          descripcion: form.descripcion,
          descripcion_en: form.descripcion_en,
          categoria: form.categoria || 'importante',
          rutaId: form.rutaId || '',
          orden,
          fotos: [...form.fotos, ...nuevas],
          videoUrl: form.videoUrl,
        },
        { merge: true }
      );
      await persistirOrden(
        plan.filter((x) => x.id !== ref.id),
        items.filter((x) => x.id !== ref.id)
      );
      reset();
      setMsg({
        text: editId
          ? 'Punto actualizado ✅'
          : `Punto creado ✅ — entró en la posición #${orden} y los números siguientes se corrieron.`,
        tone: 'ok',
      });
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
      const restantes = items.filter((x) => x.id !== p.id);
      await persistirOrden(planRenumerar(restantes), restantes);
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
    }
  }

  /** Mueve un punto un lugar arriba (dir: -1) o abajo (dir: +1) en la numeración. */
  async function mover(p, dir) {
    try {
      const plan = planMovimiento(items, p.id, dir);
      if (!plan) return;
      await persistirOrden(plan, items);
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

          <div className="sm:col-span-2">
            <span className="text-sm font-extrabold">Categoría</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {LISTA_CATEGORIAS.map((c) => {
                const on = form.categoria === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, categoria: c.id }))}
                    aria-pressed={on}
                    title={c.desc}
                    className={`rounded-full border-[3px] border-noche px-3 py-1 font-display text-xs font-extrabold transition ${
                      on ? 'shadow-comic-sm' : 'bg-white text-noche/45 opacity-70 hover:opacity-100'
                    }`}
                    style={on ? { backgroundColor: c.pinBg, color: c.textColor } : undefined}
                  >
                    {c.emoji} {c.nombre}
                  </button>
                );
              })}
            </div>
            <span className="block text-xs font-semibold text-noche/60">
              Se usa para filtrar los puntos en el mapa.
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-sm font-extrabold">Ruta</span>
            <div className="mt-1 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, rutaId: '' }))}
                aria-pressed={!form.rutaId}
                title="Sin ruta (punto independiente)"
                className={`rounded-full border-[3px] border-noche px-3 py-1 font-display text-xs font-extrabold transition ${
                  !form.rutaId ? 'shadow-comic-sm' : 'bg-white text-noche/45 opacity-70 hover:opacity-100'
                }`}
              >
                Sin ruta
              </button>
              {rutas.map((r) => {
                const on = form.rutaId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, rutaId: r.id }))}
                    aria-pressed={on}
                    title={r.desc || r.titulo}
                    className={`rounded-full border-[3px] border-noche px-3 py-1 font-display text-xs font-extrabold transition ${
                      on ? 'shadow-comic-sm' : 'bg-white text-noche/45 opacity-70 hover:opacity-100'
                    }`}
                    style={on ? { backgroundColor: r.color || '#FFC93C', color: '#ffffff' } : undefined}
                  >
                    {r.titulo}
                  </button>
                );
              })}
            </div>
            <span className="block text-xs font-semibold text-noche/60">
              Ruta a la que pertenece este punto. Déjala vacía si es un punto independiente.
            </span>
          </div>

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
        <p className="text-sm font-semibold">
          La numeración sigue la <b>fecha</b>: si cargás un punto con fecha anterior, los números
          siguientes se corren solos. Con <b>▲ ▼</b> también podés mover un punto a mano.
        </p>
        <ul className="divide-y-2 divide-noche/10">
          {ordenados.map((p, i) => {
            const cat = CATEGORIAS_PUNTOS[p.categoria] || CATEGORIAS_PUNTOS.importante;
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-2">
                <span
                  className="hito-pin shrink-0"
                  style={{ backgroundColor: cat.pinBg, color: cat.textColor }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold">{p.titulo || p.ciudad}</p>
                  <p className="text-xs font-semibold text-noche/70">
                    <span
                      className="mr-1 inline-block rounded-full border border-noche px-1.5 py-px text-[10px] font-black"
                      style={{ backgroundColor: cat.pinBg, color: cat.textColor }}
                    >
                      {cat.emoji} {cat.nombre}
                    </span>
                    {p.ciudad}
                    {p.pais ? `, ${p.pais}` : ''} · {formatDate(toMillis(p.fechaHora), 'es', { dateStyle: 'medium', timeStyle: 'short' })} · {(p.fotos || []).length} foto(s)
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    className="btn-ghost !px-2 !py-0.5 text-sm"
                    disabled={i === 0}
                    onClick={() => mover(p, -1)}
                    title="Subir en la numeración"
                    aria-label="Subir en la numeración"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="btn-ghost !px-2 !py-0.5 text-sm"
                    disabled={i === ordenados.length - 1}
                    onClick={() => mover(p, 1)}
                    title="Bajar en la numeración"
                    aria-label="Bajar en la numeración"
                  >
                    ▼
                  </button>
                </div>
                <button type="button" className="btn-ghost !py-1 text-sm" onClick={() => edit(p)}>
                  Editar
                </button>
                <button type="button" className="btn-rosa !py-1 text-sm" onClick={() => remove(p)}>
                  Borrar
                </button>
              </li>
            );
          })}
          {items.length === 0 && <li className="py-2 text-sm font-semibold">Todavía no hay puntos: el mapa muestra datos de ejemplo.</li>}
        </ul>
      </Panel>
    </div>
  );
}
