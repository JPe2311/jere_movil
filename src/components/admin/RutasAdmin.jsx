'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  borrarRuta,
  crearRuta,
  obtenerRutas,
  actualizarRuta,
} from '@/lib/rutas';
import { Field, Notice, Panel } from './ui';

export default function RutasAdmin() {
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', tone: 'error' });

  // Formulario de agregar/editar ruta
  const [abierto, setAbierto] = useState(false);
  const [editId, setEditId] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [color, setColor] = useState('#FFC93C');

  const COLORES = [
    '#FFC93C',
    '#FF5D8F',
    '#2F9E6B',
    '#4A90E2',
    '#FF7A3D',
    '#1F2A44',
  ];

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
      setLoading(true);
      const data = await obtenerRutas();
      setRutas(data);
    } catch (err) {
      console.error('[rutas] error cargando:', err);
      setMsg({ text: err.message || 'Error al cargar rutas', tone: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function abrirNuevo() {
    setEditId(null);
    setTitulo('');
    setDescripcion('');
    setColor('#FFC93C');
    setAbierto(true);
  }

  function editar(r) {
    setEditId(r.id);
    setTitulo(r.titulo || '');
    setDescripcion(r.descripcion || '');
    setColor(r.color || '#FFC93C');
    setAbierto(true);
  }

  async function guardar() {
    if (!titulo.trim()) {
      setMsg({ text: 'El título es obligatorio', tone: 'error' });
      return;
    }
    try {
      if (editId) {
        await actualizarRuta(editId, { titulo: titulo.trim(), descripcion: descripcion.trim(), color });
      } else {
        await crearRuta({ titulo: titulo.trim(), descripcion: descripcion.trim(), color });
      }
      setAbierto(false);
      setMsg({ text: editId ? 'Ruta actualizada ✅' : 'Ruta creada ✅', tone: 'ok' });
      await cargar();
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
    }
  }

  async function eliminar(id) {
    if (!window.confirm('¿Borrar esta ruta? Los puntos asociados quedarán sin ruta asignada.')) return;
    try {
      await borrarRuta(id);
      setMsg({ text: 'Ruta borrada 🗑', tone: 'ok' });
      await cargar();
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
    }
  }

  if (loading) {
    return (
      <Panel title="🗺️ Rutas del mapa">
        <p className="text-center font-bold">Cargando…</p>
      </Panel>
    );
  }

  return (
    <Panel title="🗺️ Rutas del mapa">
      <p className="text-sm font-semibold">
        Las rutas agrupan puntos del mapa. Cada ruta tiene su propio trazado y color.
        Creá rutas para organizar tu viaje (ej: "Ruta a Jujuy", "Ruta a Salta").
      </p>

      {msg.text && <Notice tone={msg.tone}>{msg.text}</Notice>}

      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={abrirNuevo}
          className="btn btn-cielo"
        >
          ➕ Nueva ruta
        </button>
      </div>

      <ul className="divide-y-2 divide-noche/10">
        {rutas.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-3 py-2">
            <div
              className="w-8 h-8 rounded-full border-2 border-noche flex items-center justify-center text-xs font-extrabold"
              style={{ backgroundColor: r.color || '#FFC93C', color: '#ffffff' }}
            >
              {r.titulo.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-extrabold">{r.titulo || 'Ruta sin nombre'}</p>
              <p className="text-xs font-semibold text-noche/70">
                {r.descripcion || 'Sin descripción'}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                className="btn-ghost !py-1 text-sm"
                onClick={() => editar(r)}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn-rosa !py-1 text-sm"
                onClick={() => eliminar(r.id)}
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
        {rutas.length === 0 && (
          <li className="py-4 text-center text-sm font-bold text-noche/60">
            Todavía no hay rutas. Agregá una desde este panel.
          </li>
        )}
      </ul>

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
                {editId ? '✏️ Editar ruta' : '➕ Nueva ruta'}
              </h2>

              <Field label="Nombre de la ruta">
                <input
                  className="input w-full"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Ruta a Jujuy"
                />
              </Field>

              <Field label="Descripción">
                <textarea
                  className="input w-full"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: Recorrido por el norte argentino"
                  rows={2}
                />
              </Field>

              <Field label="Color">
                <div className="flex flex-wrap gap-2 mt-1">
                  {COLORES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={c}
                      className={`w-8 h-8 rounded-full border-2 border-noche ${c === color ? 'ring-2 ring-sol' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </Field>

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
                  {editId ? 'Guardar cambios' : 'Crear ruta'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}