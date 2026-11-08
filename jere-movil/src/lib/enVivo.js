'use client';

/**
 * Eventos "en vivo": seguimiento de la ubicación del admin en tiempo real
 * + link opcional de streaming (YouTube / TikTok / Kick / otro).
 *
 * Estructura en Firestore:
 *   eventos_en_vivo/{id}        → { titulo, plataforma, streamUrl, estado, inicio, fin, lat, lng, actualizado }
 *   eventos_en_vivo/{id}/track  → { lat, lng, ts }   (puntos del recorrido)
 *
 * Lectura: pública (el mapa la muestra a todos).
 * Escritura: solo admin (ver firestore.rules).
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const COLECCION = 'eventos_en_vivo';
const LS_KEY = 'jere_evento_activo';

export const PLATAFORMAS = [
  { id: 'youtube', nombre: 'YouTube', emoji: '▶️', placeholder: 'https://www.youtube.com/watch?v=…' },
  { id: 'tiktok', nombre: 'TikTok', emoji: '🎵', placeholder: 'https://www.tiktok.com/@tuusuario/live' },
  { id: 'kick', nombre: 'Kick', emoji: '🟩', placeholder: 'https://kick.com/tuusuario' },
  { id: 'otro', nombre: 'Otro link', emoji: '🔗', placeholder: 'https://…' },
];

/** Devuelve el id de video de YouTube para embebirlo, o null si no se puede. */
export function embedDeYouTube(url = '') {
  const m = String(url).match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|live\/|embed\/))([A-Za-z0-9_-]{6,})/
  );
  return m ? m[1] : null;
}

/** Id del evento que este dispositivo estaba transmitiendo (sobrevive a un F5). */
export function eventoActivoId() {
  try {
    return localStorage.getItem(LS_KEY);
  } catch {
    return null;
  }
}

export function recordarEvento(id) {
  try {
    if (id) localStorage.setItem(LS_KEY, id);
    else localStorage.removeItem(LS_KEY);
  } catch {
    /* sin localStorage: no pasa nada */
  }
}

/** Crea el documento del evento y devuelve su id. */
export async function crearEvento({ titulo, plataforma, streamUrl } = {}) {
  if (!db) throw new Error('Firebase sin configurar.');
  const ref = await addDoc(collection(db, COLECCION), {
    titulo: titulo || 'En vivo desde La Bebi',
    plataforma: plataforma || '',
    streamUrl: (streamUrl || '').trim(),
    estado: 'activo',
    inicio: serverTimestamp(),
    fin: null,
    lat: null,
    lng: null,
    actualizado: serverTimestamp(),
  });
  recordarEvento(ref.id);
  return ref.id;
}

/** Actualiza la posición actual del admin (y opcionalmente agrega un punto al recorrido). */
export async function registrarPosicion(id, { lat, lng, ts = Date.now() }, conTrack = true) {
  if (!db || !id) return;
  const t = Timestamp.fromMillis(ts);
  const promesas = [updateDoc(doc(db, COLECCION, id), { lat, lng, actualizado: t })];
  if (conTrack) {
    promesas.push(addDoc(collection(db, COLECCION, id, 'track'), { lat, lng, ts: t }));
  }
  await Promise.all(promesas);
}

/** Guarda el link de streaming (mientras el evento está activo). */
export async function actualizarStream(id, { titulo, plataforma, streamUrl }) {
  if (!db || !id) return;
  await updateDoc(doc(db, COLECCION, id), {
    titulo: titulo || 'En vivo desde La Bebi',
    plataforma: plataforma || '',
    streamUrl: (streamUrl || '').trim(),
  });
}

/** Cierra el evento (deja de transmitir, pero el recorrido queda guardado). */
export async function terminarEvento(id) {
  if (!db || !id) return;
  await updateDoc(doc(db, COLECCION, id), { estado: 'finalizado', fin: serverTimestamp() });
  if (eventoActivoId() === id) recordarEvento(null);
}

/** Borra el evento y todos sus puntos de recorrido. */
export async function borrarEvento(id) {
  if (!db || !id) return;
  const snap = await getDocs(collection(db, COLECCION, id, 'track'));
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 400) {
    await Promise.all(docs.slice(i, i + 400).map((d) => deleteDoc(d.ref)));
  }
  await deleteDoc(doc(db, COLECCION, id));
  if (eventoActivoId() === id) recordarEvento(null);
}
