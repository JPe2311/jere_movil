'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  borrarObjetivo,
  crearObjetivo,
  obtenerObjetivos,
  actualizarObjetivo,
} from '@/lib/objetivos';
import { Field, Notice, Panel } from './ui';

export default function ObjetivosAdmin() {
  const [objetivos, setObjetivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', tone: 'error' });

  // Formulario de agregar/editar
  const [abierto, setAbierto] = useState(false);
  const [editId, setEditId] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
      const data = await obtenerObjetivos();
      setObjetivos(data);
      setLoading(false);
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
      setLoading(false);
    }
  }

  function abrirNuevo() {
    setEditId(null);
    setTitulo('');
    setDescripcion('');
    setLat('');
    setLng('');
    setAbierto(true);
  }

  function editar(o) {
    setEditId(o.id);
    setTitulo(o.titulo || '');
    setDescripcion(o.descripcion || '');
    setLat(String(o.lat ?? ''));
    setLng(String(o.lng ?? ''));
    setAbierto(true);
  }

  async function guardar() {
    if (!titulo.trim()) {
      setMsg({ text: 'El título es obligatorio', tone: 'error' });
      return;
    }
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      setMsg({ text: 'Latitud y longitud deben ser números válidos', tone: 'error' });
      return;
    }
    try {
      if (editId) {
        await actualizarObjetivo(editId, { titulo: titulo.trim(), descripcion: descripcion.trim(), lat: latNum, lng: lngNum });
      } else {
        await crearObjetivo({ titulo: titulo.trim(), descripcion: descripcion.trim(), lat: latNum, lng: lngNum });
      }
      setAbierto(false);
      setMsg({ text: editId ? 'Objetivo actualizado ✅' : 'Objetivo creado ✅', tone: 'ok' });
      await cargar();
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
    }
  }

  async function eliminar(id) {
    if (!window.confirm('¿Borrar este objetivo?')) return;
    try {
      await borrarObjetivo(id);
      setMsg({ text: 'Objetivo borrado 🗑', tone: 'ok' });
      await cargar();
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
    }
  }

  if (loading) {
    return (
      <Panel title="🏁 Objetivos del mapa">
        <p className="text-center font-bold">Cargando…</p>
      </Panel>
    );
  }

  return (
    <Panel title="🏁 Objetivos del mapa">
      <p className="text-sm font-semibold">
        Los objetivos aparecen en el mapa con una bandera 🏁. Son puntos de referencia
        que no forman parte de la ruta cronológica (ej: Machu Picchu).
      </p>

      {msg.text && <Notice tone={msg.tone}>{msg.text}</Notice>}

      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={abrirNuevo}
          className="btn btn-cielo"
        >
          ➕ Agregar objetivo
        </button>
      </div>

      <ul className="divide-y-2 divide-noche/10">
        {objetivos.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center gap-3 py-2">
            <span className="text-2xl" aria-hidden>🏁</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-extrabold">{o.titulo || 'Objetivo'}</p>
              <p className="text-xs font-semibold text-noche/70">
                {o.descripcion || 'Sin descripción'} · {o.lat?.toFixed(4)}, {o.lng?.toFixed(4)}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                className="btn-ghost !py-1 text-sm"
                onClick={() => editar(o)}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn-rosa !py-1 text-sm"
                onClick={() => eliminar(o.id)}
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
        {objetivos.length === 0 && (
          <li className="py-4 text-center text-sm font-bold text-noche/60">
            Todavía no hay objetivos. Agregá uno desde este panel.
          </li>
        )}
      </ul>

      {/* Formulario modal de crear/editar */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-noche/80 p-6"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="card-comic p-6 sm:p-8 max-w-sm w-full border-[3px] border-noche shadow-2xl"
            >
              <h2 className="font-display text-2xl font-extrabold text-center mb-4">
                {editId ? '✏️ Editar objetivo' : '➕ Nuevo objetivo'}
              </h2>

              <Field label="Título">
                <input
                  className="input w-full"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Machu Picchu"
                />
              </Field>

              <Field label="Descripción">
                <textarea
                  className="input w-full"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción opcional"
                  rows={2}
                />
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Latitud">
                  <input
                    type="number"
                    step="any"
                    className="input w-full"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="-13.1631"
                  />
                </Field>
                <Field label="Longitud">
                  <input
                    type="number"
                    step="any"
                    className="input w-full"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="-72.5450"
                  />
                </Field>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="flex-1 btn-ghost py-2 rounded-full text-sm font-bold text-noche/60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={guardar}
                  className="flex-1 btn btn-rosa py-2 rounded-full text-sm font-bold"
                >
                  {editId ? 'Guardar cambios' : 'Crear objetivo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}