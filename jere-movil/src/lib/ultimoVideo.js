'use client';

/**
 * Lectura de la colección `videos` de Firestore.
 * Los documentos se cargan desde el panel /admin (pestaña Videos) y la fecha
 * se guarda como Timestamp, así que hay que normalizarla antes de mostrarla.
 */
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const COLECCION = 'videos';

function aFecha(valor) {
  if (!valor) return null;
  // Timestamp de Firestore
  if (typeof valor?.toDate === 'function') return valor.toDate();
  // { seconds, nanoseconds }
  if (typeof valor === 'object' && typeof valor.seconds === 'number') {
    return new Date(valor.seconds * 1000);
  }
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatearFecha(valor) {
  const d = aFecha(valor);
  if (!d) return '';
  return d.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function normalizar(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    youtubeId: data.youtubeId || data.videoId || '',
    titulo: data.titulo || 'Sin título',
    descripcion: data.descripcion || '',
    temporada: data.temporada || 1,
    episodio: data.episodio || 1,
    fecha: formatearFecha(data.fecha),
    fechaRaw: data.fecha,
  };
}

export async function obtenerVideos() {
  if (!db) return [];
  try {
    const q = query(collection(db, COLECCION), orderBy('fecha', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(normalizar);
  } catch (err) {
    console.error('[videos] error:', err);
    return [];
  }
}

/** Devuelve el video más reciente o null. */
export async function obtenerUltimoVideo() {
  const videos = await obtenerVideos();
  return videos.find((v) => v.youtubeId) || null;
}
