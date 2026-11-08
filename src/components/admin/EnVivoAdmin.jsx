'use client';

import { useEffect, useRef, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from '@/lib/useCollection';
import {
  PLATAFORMAS,
  actualizarStream,
  borrarEvento,
  crearEvento,
  embedDeYouTube,
  eventoActivoId,
  recordarEvento,
  registrarPosicion,
  terminarEvento,
} from '@/lib/enVivo';
import { formatDate } from '@/lib/utils';
import { Field, Notice, Panel } from './ui';

// Umbral del recorrido: un punto nuevo cada 25 m o cada 60 s si se movió algo.
const DIST_MIN_M = 25;
const DIST_MIN_MS = 10_000;
const DIST_SIN_MOV_MS = 60_000;
// La posición actual del pin se refresca aunque no se mueva.
const POS_MAX_MS = 5_000;

export default function EnVivoAdmin() {
  const { items } = useCollection('eventos_en_vivo', 'inicio', 'desc');
  const activo = items.find((e) => e.estado === 'activo') || null;

  const [titulo, setTitulo] = useState('En vivo desde La Bebi');
  const [plataforma, setPlataforma] = useState('youtube');
  const [streamUrl, setStreamUrl] = useState('');
  const [msg, setMsg] = useState({ text: '', tone: 'error' });
  const [esperando, setEsperando] = useState(false);
  const [ultimo, setUltimo] = useState(null); // { lat, lng, ts } del dispositivo

  const watchRef = useRef(null);
  const lastRef = useRef(null); // { lat, lng, tsPos, tsTrack }

  // Puntos del evento activo (para mostrar cuántos se registraron)
  const { items: track } = useCollection(
    activo ? `eventos_en_vivo/${activo.id}/track` : null,
    'ts',
    'asc'
  );

  const arrancarWatch = (id) => {
    if (!db || !id) return;
    if (!('geolocation' in navigator)) {
      setMsg({ text: 'Tu navegador no soporta geolocalización.', tone: 'error' });
      return;
    }
    setEsperando(true);
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setEsperando(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const ts = Date.now();
        const prev = lastRef.current;
        let conTrack = false;

        if (prev) {
          const dLat = (lat - prev.lat) * 111_320;
          const dLng = (lng - prev.lng) * 111_320 * Math.cos((lat * Math.PI) / 180);
          const dist = Math.hypot(dLat, dLng);
          const desdeTrack = ts - prev.tsTrack;
          conTrack =
            dist >= DIST_MIN_M
              ? desdeTrack >= DIST_MIN_MS
              : dist > 2 && desdeTrack >= DIST_SIN_MOV_MS;
        } else {
          conTrack = true; // primer punto del recorrido
        }

        const desdePos = !prev || ts - prev.tsPos >= POS_MAX_MS;
        if (!conTrack && !desdePos) return;

        lastRef.current = {
          lat,
          lng,
          tsPos: desdePos ? ts : prev.tsPos,
          tsTrack: conTrack ? ts : prev.tsTrack,
        };
        setUltimo({ lat, lng, ts });

        registrarPosicion(id, { lat, lng, ts }, conTrack).catch((err) => {
          console.error('[EnVivo]', err);
          setMsg({ text: 'No se pudo guardar la ubicación: ' + err.message, tone: 'error' });
        });
      },
      (err) => {
        setEsperando(false);
        setMsg({
          text:
            err.code === 1
              ? 'Permiso de ubicación denegado. Activalo en la configuración del navegador.'
              : 'No pudimos leer tu ubicación: ' + (err.message || 'error desconocido'),
          tone: 'error',
        });
      },
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 20_000 }
    );
  };

  // Si este dispositivo dejó un evento abierto (F5, cambio de pestaña), lo retoma.
  useEffect(() => {
    const id = eventoActivoId();
    if (!id || !db) return undefined;
    getDoc(doc(db, 'eventos_en_vivo', id))
      .then((snap) => {
        if (snap.exists() && snap.data().estado === 'activo') {
          setMsg({ text: '📍 Retomando el seguimiento en este dispositivo…', tone: 'ok' });
          arrancarWatch(id);
        } else {
          recordarEvento(null);
        }
      })
      .catch(() => {});
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    },
    []
  );

  const arrancar = async () => {
    if (!db) return;
    setMsg({ text: '', tone: 'error' });
    try {
      const id = activo?.id || (await crearEvento({ titulo, plataforma, streamUrl }));
      arrancarWatch(id);
      setMsg({ text: '🔴 Transmitiendo tu ubicación en tiempo real.', tone: 'ok' });
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
    }
  };

  const detener = async () => {
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    try {
      await terminarEvento(activo.id);
      lastRef.current = null;
      setUltimo(null);
      setMsg({ text: '⏹ Seguimiento finalizado. El recorrido queda guardado.', tone: 'ok' });
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
    }
  };

  const guardarStream = async () => {
    try {
      await actualizarStream(activo.id, { titulo, plataforma, streamUrl });
      setMsg({ text: '✅ Link del vivo actualizado.', tone: 'ok' });
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
    }
  };

  const borrar = async () => {
    if (!window.confirm('¿Borrar este evento y todo su recorrido?')) return;
    try {
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
      await borrarEvento(activo.id);
      lastRef.current = null;
      setUltimo(null);
      setMsg({ text: '🗑 Evento borrado.', tone: 'ok' });
    } catch (err) {
      setMsg({ text: err.message, tone: 'error' });
    }
  };

  const plataformaActual = PLATAFORMAS.find((p) => p.id === (activo?.plataforma || plataforma));

  return (
    <Panel title="📡 Evento en vivo (seguimiento del celular)">
      <p className="text-sm font-semibold">
        Cuando activás esto, <b>el mapa muestra tu ubicación en tiempo real</b> y el recorrido que
        vas haciendo. Si además pegás el link de tu vivo (YouTube, TikTok, Kick…), se muestra
        embebido en el mapa junto al recorrido.
      </p>

      <Notice tone={msg.tone}>{msg.text}</Notice>

      {!activo ? (
        <div className="space-y-4 rounded-2xl border-[3px] border-noche bg-crema/60 p-4">
          <Field label="Título del evento" hint="Lo que se ve en el mapa.">
            <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </Field>

          <div>
            <span className="text-sm font-extrabold">Transmitir en vivo (opcional)</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {PLATAFORMAS.map((p) => {
                const on = plataforma === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlataforma(p.id)}
                    aria-pressed={on}
                    className={`rounded-full border-[3px] border-noche px-3 py-1 font-display text-xs font-extrabold transition ${
                      on ? 'bg-sol shadow-comic-sm' : 'bg-white text-noche/60 hover:opacity-100'
                    }`}
                  >
                    {p.emoji} {p.nombre}
                  </button>
                );
              })}
            </div>
            <span className="mt-1 block text-xs font-semibold text-noche/60">
              Sin link, el mapa solo muestra el recorrido en tiempo real.
            </span>
          </div>

          <Field label="Link del vivo">
            <input
              className="input"
              value={streamUrl}
              placeholder={plataformaActual?.placeholder}
              onChange={(e) => setStreamUrl(e.target.value)}
            />
          </Field>

          <button type="button" className="btn btn-rosa w-full" onClick={arrancar}>
            🔴 Compartir mi ubicación en vivo
          </button>
          {esperando && <p className="text-center text-sm font-bold">📍 Buscando señal del GPS…</p>}
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl border-[3px] border-noche bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="live-dot inline-block h-3.5 w-3.5 rounded-full bg-rosa" aria-hidden />
            <span className="font-display text-lg font-extrabold text-rosa">EN VIVO</span>
            <span className="rounded-full border-2 border-noche bg-crema px-2 py-0.5 text-xs font-extrabold">
              {activo.titulo}
            </span>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto rounded-full border-2 border-noche bg-sol px-3 py-1 text-xs font-extrabold shadow-comic-sm"
            >
              Ver en el mapa ↗
            </a>
          </div>

          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border-2 border-noche/20 bg-crema/60 px-3 py-2">
              <dt className="text-xs font-bold text-noche/60">Última posición</dt>
              <dd className="font-black">
                {ultimo
                  ? `${ultimo.lat.toFixed(5)}, ${ultimo.lng.toFixed(5)}`
                  : 'esperando señal…'}
              </dd>
            </div>
            <div className="rounded-xl border-2 border-noche/20 bg-crema/60 px-3 py-2">
              <dt className="text-xs font-bold text-noche/60">Puntos del recorrido</dt>
              <dd className="font-black">🗺️ {track.length}</dd>
            </div>
            <div className="col-span-2 rounded-xl border-2 border-noche/20 bg-crema/60 px-3 py-2">
              <dt className="text-xs font-bold text-noche/60">Última actualización</dt>
              <dd className="font-black">
                {ultimo
                  ? formatDate(ultimo.ts, 'es', { timeStyle: 'short', dateStyle: 'medium' })
                  : '—'}
              </dd>
            </div>
          </dl>

          {/* Link del vivo mientras el evento está activo */}
          <div className="space-y-2 border-t-2 border-dashed border-noche/30 pt-3">
            <span className="text-sm font-extrabold">Link del vivo</span>
            <div className="flex flex-wrap gap-2">
              {PLATAFORMAS.map((p) => {
                const on = plataforma === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlataforma(p.id)}
                    aria-pressed={on}
                    className={`rounded-full border-2 border-noche px-2.5 py-0.5 text-xs font-extrabold transition ${
                      on ? 'bg-sol' : 'bg-white text-noche/60'
                    }`}
                  >
                    {p.emoji} {p.nombre}
                  </button>
                );
              })}
            </div>
            <input
              className="input"
              value={streamUrl}
              placeholder={plataformaActual?.placeholder}
              onChange={(e) => setStreamUrl(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-cielo !py-1.5 text-sm" onClick={guardarStream}>
                💾 Actualizar link
              </button>
              {embedDeYouTube(streamUrl || activo.streamUrl) && (
                <span className="rounded-full border-2 border-noche bg-monte/20 px-3 py-1 text-xs font-extrabold">
                  ▶️ Se va a embeber en el mapa
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t-2 border-dashed border-noche/30 pt-3">
            <button type="button" className="btn btn-rosa" onClick={detener}>
              ⏹ Terminar seguimiento
            </button>
            <button type="button" className="btn btn-ghost text-sm" onClick={borrar}>
              🗑 Borrar evento
            </button>
          </div>
          {esperando && <p className="text-sm font-bold">📍 Buscando señal del GPS…</p>}
        </div>
      )}

      {/* Historial breve */}
      {items.filter((e) => e.estado !== 'activo').length > 0 && (
        <div className="space-y-2">
          <h3 className="font-display text-lg font-extrabold">Historial</h3>
          <ul className="divide-y-2 divide-noche/10 rounded-2xl border-[3px] border-noche bg-white">
            {items
              .filter((e) => e.estado !== 'activo')
              .slice(0, 5)
              .map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <span aria-hidden>{embedDeYouTube(e.streamUrl) ? '▶️' : '📍'}</span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate">{e.titulo}</b>
                    <span className="text-xs font-semibold text-noche/60">
                      {formatDate(e.inicio?.toMillis?.() ?? Date.now(), 'es', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="btn-ghost !py-1 text-xs"
                    onClick={async () => {
                      if (window.confirm('¿Borrar este evento y su recorrido?')) {
                        try {
                          await borrarEvento(e.id);
                        } catch (err) {
                          setMsg({ text: err.message, tone: 'error' });
                        }
                      }
                    }}
                  >
                    🗑
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
