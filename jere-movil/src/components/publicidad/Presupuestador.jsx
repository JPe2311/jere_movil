'use client';

import { useEffect, useState } from 'react';
import {
  borrarTarifario,
  cargarTarifario,
  guardarTarifario,
  nuevoId,
  precioARS,
} from '@/lib/tarifario';
import { generarPresupuestoPDF, urlWhatsApp } from '@/lib/presupuestoPdf';

const TINTA = '#1E2433';
const GRIS = '#5A6275';
const VERDE = '#2B9E63';

const inputEdit =
  'w-full rounded-lg border-2 border-[#1E2433] bg-white px-2 py-1 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#F8C630]';

function Switch({ activo, onChange, titulo }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!activo)}
      aria-pressed={activo}
      title={titulo || (activo ? 'Activo' : 'Inactivo')}
      className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-[#1E2433] p-0.5 transition ${
        activo ? 'bg-[#2B9E63]' : 'bg-[#CBD5E1]'
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full border border-[#1E2433] bg-white transition ${
          activo ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function Presupuestador() {
  const [tarifario, setTarifario] = useState(null);
  const [edicion, setEdicion] = useState(false);
  const [paqueteId, setPaqueteId] = useState(null);
  const [carrito, setCarrito] = useState({});
  const [descuento, setDescuento] = useState(0);
  const [descuentoManual, setDescuentoManual] = useState(false);
  const [cliente, setCliente] = useState({
    marca: '',
    campania: '',
    validez: '30 días',
    notas: '',
  });
  const [nuevoPaquete, setNuevoPaquete] = useState(null);

  useEffect(() => {
    setTarifario(cargarTarifario());
  }, []);

  useEffect(() => {
    if (tarifario) guardarTarifario(tarifario);
  }, [tarifario]);

  const paqueteSel = tarifario?.paquetes.find((p) => p.id === paqueteId && p.activo) || null;

  const items = [];
  if (paqueteSel) {
    items.push({
      key: `paq-${paqueteSel.id}`,
      nombre: paqueteSel.nombre,
      detalle: paqueteSel.subtitulo,
      cantidad: 1,
      unitario: paqueteSel.precio,
      subtotal: paqueteSel.precio,
    });
  }
  for (const s of tarifario?.servicios || []) {
    const cant = carrito[s.id] || 0;
    if (cant > 0) {
      items.push({
        key: `srv-${s.id}`,
        nombre: s.nombre,
        detalle: s.detalle,
        cantidad: cant,
        unitario: s.precio,
        subtotal: s.precio * cant,
      });
    }
  }

  const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0);
  const unidades = items.reduce((acc, i) => acc + i.cantidad, 0);
  const descuentoNum = Math.min(Math.max(Number(descuento) || 0, 0), 100);
  const descuentoMonto = Math.round((subtotal * descuentoNum) / 100);
  const total = subtotal - descuentoMonto;

  // Sugerencia automática: 3 o más ítems → 10% (siempre editable a mano).
  useEffect(() => {
    if (descuentoManual) return;
    setDescuento(unidades >= 3 ? 10 : 0);
  }, [unidades, descuentoManual]);

  if (!tarifario) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-pulse rounded-full border-[3px] border-dashed border-[#1E2433]" />
      </div>
    );
  }

  const datosPresupuesto = () => ({
    marca: cliente.marca,
    campania: cliente.campania,
    validez: cliente.validez,
    notas: cliente.notas,
    fecha: new Date(),
    items,
    subtotal,
    descuento: descuentoNum,
    descuentoMonto,
    total,
  });

  function descargarPdf() {
    if (items.length === 0) {
      window.alert('Sumá al menos un paquete o servicio para generar el presupuesto.');
      return;
    }
    generarPresupuestoPDF(datosPresupuesto());
  }

  function actualizarPaquete(id, patch) {
    setTarifario((t) => ({
      ...t,
      paquetes: t.paquetes.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }

  function actualizarServicio(id, patch) {
    setTarifario((t) => ({
      ...t,
      servicios: t.servicios.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function setItemIncluye(id, index, valor) {
    setTarifario((t) => ({
      ...t,
      paquetes: t.paquetes.map((p) =>
        p.id === id
          ? { ...p, incluye: p.incluye.map((it, i) => (i === index ? valor : it)) }
          : p
      ),
    }));
  }

  function agregarItemIncluye(id) {
    setTarifario((t) => ({
      ...t,
      paquetes: t.paquetes.map((p) =>
        p.id === id ? { ...p, incluye: [...p.incluye, 'Nuevo beneficio'] } : p
      ),
    }));
  }

  function quitarItemIncluye(id, index) {
    setTarifario((t) => ({
      ...t,
      paquetes: t.paquetes.map((p) =>
        p.id === id ? { ...p, incluye: p.incluye.filter((_, i) => i !== index) } : p
      ),
    }));
  }

  function eliminarPaquete(id) {
    if (!window.confirm('¿Eliminar este paquete del tarifario?')) return;
    setTarifario((t) => ({ ...t, paquetes: t.paquetes.filter((p) => p.id !== id) }));
    if (paqueteId === id) setPaqueteId(null);
  }

  function eliminarServicio(id) {
    if (!window.confirm('¿Eliminar este servicio del tarifario?')) return;
    setTarifario((t) => ({ ...t, servicios: t.servicios.filter((s) => s.id !== id) }));
    setCarrito((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  }

  function agregarServicio() {
    const id = nuevoId('servicio');
    setTarifario((t) => ({
      ...t,
      servicios: [
        ...t.servicios,
        { id, nombre: 'Nuevo servicio', detalle: 'Descripción del servicio', precio: 0, activo: true },
      ],
    }));
  }

  function crearPaquete() {
    const nombre = (nuevoPaquete?.nombre || '').trim();
    if (!nombre) return;
    const elegidos = tarifario.servicios.filter((s) => nuevoPaquete.servicios.includes(s.id));
    const paquete = {
      id: nuevoId('paquete'),
      nombre,
      subtitulo: (nuevoPaquete.subtitulo || '').trim(),
      precio: Number(nuevoPaquete.precio) || 0,
      destacado: Boolean(nuevoPaquete.destacado),
      activo: true,
      incluye: elegidos.map((s) => s.nombre),
    };
    setTarifario((t) => ({ ...t, paquetes: [...t.paquetes, paquete] }));
    setNuevoPaquete(null);
  }

  function restaurar() {
    if (!window.confirm('¿Volver a los precios y textos originales del media kit?')) return;
    borrarTarifario();
    setTarifario(cargarTarifario());
    setPaqueteId(null);
    setCarrito({});
    setDescuento(0);
    setDescuentoManual(false);
  }

  function sumarServicio(id, delta) {
    setCarrito((c) => {
      const n = (c[id] || 0) + delta;
      const next = { ...c };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
  }

  const paquetesVisibles = tarifario.paquetes.filter((p) => edicion || p.activo);
  const serviciosVisibles = tarifario.servicios.filter((s) => edicion || s.activo);

  return (
    <div>
      {/* Barra de edición */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-[#5A6275]">
          Armá tu combo: elegí un paquete y sumá servicios sueltos.
        </p>
        <button
          type="button"
          onClick={() => setEdicion((e) => !e)}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#1E2433] bg-white px-4 py-1.5 text-xs font-extrabold shadow-[2px_2px_0_0_#1E2433] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <span aria-hidden>⚙️</span>
          {edicion ? 'Salir del modo edición' : 'Configurar tarifario'}
        </button>
      </div>

      {edicion && (
        <div className="mb-6 rounded-2xl border-[3px] border-[#1E2433] bg-[#FFF9EC] p-4 shadow-[4px_4px_0_0_#1E2433]">
          <p className="font-display text-lg font-bold">Modo edición</p>
          <p className="mt-1 text-sm font-semibold text-[#5A6275]">
            Podés cambiar nombres, precios y beneficios, activar o desactivar ítems, y crear
            servicios o paquetes nuevos. Los cambios se guardan en este navegador.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={agregarServicio}
              className="rounded-full border-2 border-[#1E2433] bg-[#F8C630] px-3 py-1 text-xs font-extrabold shadow-[2px_2px_0_0_#1E2433]"
            >
              + Agregar servicio
            </button>
            <button
              type="button"
              onClick={() =>
                setNuevoPaquete({ nombre: '', subtitulo: '', precio: '', servicios: [], destacado: false })
              }
              className="rounded-full border-2 border-[#1E2433] bg-[#2997D8] px-3 py-1 text-xs font-extrabold text-white shadow-[2px_2px_0_0_#1E2433]"
            >
              + Crear nuevo paquete
            </button>
            <button
              type="button"
              onClick={restaurar}
              className="rounded-full border-2 border-[#1E2433] bg-white px-3 py-1 text-xs font-extrabold shadow-[2px_2px_0_0_#1E2433]"
            >
              ↺ Restaurar valores originales
            </button>
          </div>

          {nuevoPaquete && (
            <div className="mt-4 rounded-xl border-2 border-dashed border-[#1E2433] bg-white p-4">
              <p className="mb-2 font-display font-bold">Nuevo paquete</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-xs font-bold">
                  Nombre
                  <input
                    className={inputEdit}
                    value={nuevoPaquete.nombre}
                    onChange={(e) => setNuevoPaquete((n) => ({ ...n, nombre: e.target.value }))}
                  />
                </label>
                <label className="text-xs font-bold">
                  Subtítulo
                  <input
                    className={inputEdit}
                    value={nuevoPaquete.subtitulo}
                    onChange={(e) => setNuevoPaquete((n) => ({ ...n, subtitulo: e.target.value }))}
                  />
                </label>
                <label className="text-xs font-bold">
                  Precio (ARS)
                  <input
                    type="number"
                    className={inputEdit}
                    value={nuevoPaquete.precio}
                    onChange={(e) => setNuevoPaquete((n) => ({ ...n, precio: e.target.value }))}
                  />
                </label>
                <label className="flex items-end gap-2 pb-1 text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={nuevoPaquete.destacado}
                    onChange={(e) =>
                      setNuevoPaquete((n) => ({ ...n, destacado: e.target.checked }))
                    }
                  />
                  Marcar como “Más elegido”
                </label>
              </div>

              <p className="mb-1 mt-3 text-xs font-bold">Servicios que incluye</p>
              <div className="grid gap-1 sm:grid-cols-2">
                {tarifario.servicios.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={nuevoPaquete.servicios.includes(s.id)}
                      onChange={(e) =>
                        setNuevoPaquete((n) => ({
                          ...n,
                          servicios: e.target.checked
                            ? [...n.servicios, s.id]
                            : n.servicios.filter((id) => id !== s.id),
                        }))
                      }
                    />
                    {s.nombre}
                  </label>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={crearPaquete}
                  className="rounded-full border-2 border-[#1E2433] bg-[#2B9E63] px-4 py-1 text-xs font-extrabold text-white shadow-[2px_2px_0_0_#1E2433]"
                >
                  Crear paquete
                </button>
                <button
                  type="button"
                  onClick={() => setNuevoPaquete(null)}
                  className="rounded-full border-2 border-[#1E2433] bg-white px-4 py-1 text-xs font-extrabold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Catálogo */}
        <div className="space-y-8">
          <div>
            <h3 className="mb-3 font-display text-xl font-bold">Paquetes</h3>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paquetesVisibles.map((p) => (
                <article
                  key={p.id}
                  className={`relative flex flex-col rounded-2xl border-[3px] border-[#1E2433] bg-white p-4 shadow-[4px_4px_0_0_#1E2433] ${
                    p.activo ? '' : 'opacity-50'
                  }`}
                >
                  {edicion ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold">Activo</span>
                        <Switch
                          activo={p.activo}
                          onChange={(v) => actualizarPaquete(p.id, { activo: v })}
                        />
                      </div>
                      <input
                        className={inputEdit}
                        value={p.nombre}
                        onChange={(e) => actualizarPaquete(p.id, { nombre: e.target.value })}
                      />
                      <input
                        className={inputEdit}
                        value={p.subtitulo}
                        onChange={(e) => actualizarPaquete(p.id, { subtitulo: e.target.value })}
                      />
                      <label className="block text-xs font-bold">
                        Precio (ARS)
                        <input
                          type="number"
                          className={inputEdit}
                          value={p.precio}
                          onChange={(e) =>
                            actualizarPaquete(p.id, { precio: Number(e.target.value) || 0 })
                          }
                        />
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold">
                        <input
                          type="checkbox"
                          checked={p.destacado}
                          onChange={(e) =>
                            actualizarPaquete(p.id, { destacado: e.target.checked })
                          }
                        />
                        “Más elegido”
                      </label>

                      <div className="space-y-1">
                        <p className="text-xs font-bold">Incluye</p>
                        {p.incluye.map((it, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <input
                              className={inputEdit}
                              value={it}
                              onChange={(e) => setItemIncluye(p.id, i, e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => quitarItemIncluye(p.id, i)}
                              className="shrink-0 rounded-md border-2 border-[#1E2433] bg-white px-1.5 text-xs font-extrabold"
                              title="Quitar beneficio"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => agregarItemIncluye(p.id)}
                          className="text-xs font-extrabold underline"
                        >
                          + Agregar beneficio
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => eliminarPaquete(p.id)}
                        className="mt-1 text-xs font-extrabold text-[#E31E24] underline"
                      >
                        Eliminar paquete
                      </button>
                    </div>
                  ) : (
                    <>
                      {p.destacado && (
                        <span className="absolute -top-3 left-4 rounded-full border-2 border-[#1E2433] bg-[#F25287] px-2 py-0.5 text-[10px] font-extrabold text-white shadow-[2px_2px_0_0_#1E2433]">
                          EL MÁS ELEGIDO
                        </span>
                      )}
                      <h4 className="mt-1 font-display text-xl font-bold leading-none">{p.nombre}</h4>
                      <p className="mt-1 text-xs font-bold text-[#5A6275]">{p.subtitulo}</p>
                      <ul className="mt-3 flex-1 space-y-1 text-sm font-semibold">
                        {p.incluye.map((it, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-[#2B9E63]">✔</span>
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 font-display text-2xl font-bold">{precioARS(p.precio)}</p>
                      <button
                        type="button"
                        onClick={() => setPaqueteId(paqueteId === p.id ? null : p.id)}
                        className={`mt-2 rounded-full border-2 border-[#1E2433] px-3 py-1.5 text-xs font-extrabold shadow-[2px_2px_0_0_#1E2433] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                          paqueteId === p.id ? 'bg-[#2B9E63] text-white' : 'bg-[#F8C630]'
                        }`}
                      >
                        {paqueteId === p.id ? '✓ En el presupuesto' : '+ Sumar al presupuesto'}
                      </button>
                    </>
                  )}
                </article>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-1 font-display text-xl font-bold">Servicios a medida</h3>
            <p className="mb-3 text-sm font-semibold text-[#5A6275]">
              Precios por video vlog. Sumá los que quieras y ajustá la cantidad.
            </p>
            <div className="space-y-2">
              {serviciosVisibles.map((s) => {
                const cant = carrito[s.id] || 0;
                return (
                  <div
                    key={s.id}
                    className={`rounded-xl border-2 border-[#1E2433] bg-white p-3 shadow-[2px_2px_0_0_#1E2433] ${
                      s.activo ? '' : 'opacity-50'
                    }`}
                  >
                    {edicion ? (
                      <div className="grid gap-2 sm:grid-cols-[1.1fr_1.5fr_auto_auto] sm:items-center">
                        <input
                          className={inputEdit}
                          value={s.nombre}
                          onChange={(e) => actualizarServicio(s.id, { nombre: e.target.value })}
                        />
                        <input
                          className={inputEdit}
                          value={s.detalle}
                          onChange={(e) => actualizarServicio(s.id, { detalle: e.target.value })}
                        />
                        <input
                          type="number"
                          className={`${inputEdit} sm:w-28`}
                          value={s.precio}
                          onChange={(e) =>
                            actualizarServicio(s.id, { precio: Number(e.target.value) || 0 })
                          }
                        />
                        <div className="flex items-center gap-2">
                          <Switch
                            activo={s.activo}
                            onChange={(v) => actualizarServicio(s.id, { activo: v })}
                          />
                          <button
                            type="button"
                            onClick={() => eliminarServicio(s.id)}
                            className="rounded-md border-2 border-[#1E2433] bg-white px-1.5 text-xs font-extrabold"
                            title="Eliminar servicio"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="min-w-[180px] flex-1">
                          <p className="font-extrabold leading-tight">{s.nombre}</p>
                          <p className="text-xs font-semibold text-[#5A6275]">{s.detalle}</p>
                        </div>
                        <p className="font-display text-lg font-bold">{precioARS(s.precio)}</p>
                        {cant === 0 ? (
                          <button
                            type="button"
                            onClick={() => sumarServicio(s.id, 1)}
                            className="rounded-full border-2 border-[#1E2433] bg-white px-3 py-1 text-xs font-extrabold shadow-[2px_2px_0_0_#1E2433]"
                          >
                            + Sumar
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 rounded-full border-2 border-[#1E2433] bg-[#F8C630] px-1">
                            <button
                              type="button"
                              onClick={() => sumarServicio(s.id, -1)}
                              className="h-6 w-6 rounded-full font-extrabold"
                              aria-label={`Quitar un ${s.nombre}`}
                            >
                              −
                            </button>
                            <span className="w-4 text-center text-sm font-extrabold">{cant}</span>
                            <button
                              type="button"
                              onClick={() => sumarServicio(s.id, 1)}
                              className="h-6 w-6 rounded-full font-extrabold"
                              aria-label={`Agregar un ${s.nombre}`}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {serviciosVisibles.length === 0 && (
                <p className="rounded-xl border-2 border-dashed border-[#1E2433] p-4 text-center text-sm font-bold text-[#5A6275]">
                  No hay servicios activos. Activá alguno en el modo edición.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Resumen */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border-[3px] border-[#1E2433] bg-white p-4 shadow-[6px_6px_0_0_#1E2433]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">Tu presupuesto</h3>
              <span className="rounded-full border-2 border-[#1E2433] bg-[#2997D8] px-2 py-0.5 text-[10px] font-extrabold text-white">
                {unidades} {unidades === 1 ? 'ítem' : 'ítems'}
              </span>
            </div>

            <div className="my-3 border-t-2 border-dashed border-[#CBD5E1]" />

            {items.length === 0 ? (
              <p className="py-4 text-center text-sm font-semibold text-[#5A6275]">
                Todavía no sumaste nada. Empezá por un paquete o un servicio.
              </p>
            ) : (
              <ul className="space-y-2">
                {items.map((i) => (
                  <li key={i.key} className="flex items-start justify-between gap-2 text-sm">
                    <span className="font-bold leading-tight">
                      {i.cantidad > 1 && (
                        <span className="mr-1 rounded-full border border-[#1E2433] bg-[#F8C630] px-1.5 text-[10px]">
                          x{i.cantidad}
                        </span>
                      )}
                      {i.nombre}
                    </span>
                    <span className="whitespace-nowrap font-bold">{precioARS(i.subtotal)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="my-3 border-t-2 border-dashed border-[#CBD5E1]" />

            <div className="flex items-center justify-between text-sm font-bold">
              <span>Subtotal</span>
              <span>{precioARS(subtotal)}</span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <label htmlFor="bonif" className="text-sm font-bold">
                Bonificación (%)
              </label>
              <input
                id="bonif"
                type="number"
                min="0"
                max="100"
                value={descuento}
                onChange={(e) => {
                  setDescuentoManual(true);
                  setDescuento(e.target.value);
                }}
                className="w-20 rounded-lg border-2 border-[#1E2433] px-2 py-1 text-right text-sm font-extrabold"
              />
            </div>
            {unidades >= 3 && !descuentoManual && (
              <p className="mt-1 text-[11px] font-bold text-[#2B9E63]">
                Sugerimos 10% por sumar 3 o más servicios de la misma campaña.
              </p>
            )}
            {descuentoNum > 0 && (
              <div className="mt-1 flex items-center justify-between text-sm font-bold text-[#2B9E63]">
                <span>Descuento</span>
                <span>-{precioARS(descuentoMonto)}</span>
              </div>
            )}

            <div className="mt-3 flex items-baseline justify-between border-t-[3px] border-[#1E2433] pt-2">
              <span className="font-display text-lg font-bold">Total</span>
              <span className="font-display text-2xl font-bold text-[#E31E24]">
                {precioARS(total)}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-[#5A6275]">
                Marca / Cliente
                <input
                  className="mt-1 w-full rounded-lg border-2 border-[#1E2433] px-2 py-1 text-sm font-semibold text-[#1E2433]"
                  placeholder="Ej: Termo Aventura"
                  value={cliente.marca}
                  onChange={(e) => setCliente((c) => ({ ...c, marca: e.target.value }))}
                />
              </label>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-[#5A6275]">
                Campaña / Etapa de la ruta
                <input
                  className="mt-1 w-full rounded-lg border-2 border-[#1E2433] px-2 py-1 text-sm font-semibold text-[#1E2433]"
                  placeholder="Ej: Temporada 2 · Norte"
                  value={cliente.campania}
                  onChange={(e) => setCliente((c) => ({ ...c, campania: e.target.value }))}
                />
              </label>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-[#5A6275]">
                Validez de la oferta
                <input
                  className="mt-1 w-full rounded-lg border-2 border-[#1E2433] px-2 py-1 text-sm font-semibold text-[#1E2433]"
                  placeholder="30 días"
                  value={cliente.validez}
                  onChange={(e) => setCliente((c) => ({ ...c, validez: e.target.value }))}
                />
              </label>
              <label className="block text-[11px] font-extrabold uppercase tracking-wide text-[#5A6275]">
                Notas adicionales
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-lg border-2 border-[#1E2433] px-2 py-1 text-sm font-semibold text-[#1E2433]"
                  placeholder="Fechas, ideas, referencias..."
                  value={cliente.notas}
                  onChange={(e) => setCliente((c) => ({ ...c, notas: e.target.value }))}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={descargarPdf}
              className="mt-4 w-full rounded-full border-[3px] border-[#1E2433] bg-[#F8C630] px-4 py-2.5 font-display text-base font-bold shadow-[4px_4px_0_0_#1E2433] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              ⬇ Descargar presupuesto en PDF
            </button>
            <a
              href={urlWhatsApp(datosPresupuesto())}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (items.length === 0) {
                  e.preventDefault();
                  window.alert('Sumá al menos un paquete o servicio para enviarlo.');
                }
              }}
              className="mt-2 block w-full rounded-full border-[3px] border-[#1E2433] bg-[#2B9E63] px-4 py-2 text-center font-display text-sm font-bold text-white shadow-[4px_4px_0_0_#1E2433] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Enviar este presupuesto por WhatsApp
            </a>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setPaqueteId(null);
                  setCarrito({});
                  setDescuento(0);
                  setDescuentoManual(false);
                }}
                className="mt-2 w-full text-center text-xs font-extrabold text-[#5A6275] underline"
              >
                Vaciar presupuesto
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
