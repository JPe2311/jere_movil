'use client';

/**
 * Obtiene el último video cargado de la colección de videos de Firestore.
 * Los videos se ordenan por fecha descendente para obtener el más reciente.
 */
import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const COLECCION = 'videos';

/**
 * Obtiene el video más reciente de Firestore.
 * Devuelve null si no hay videos o hay error.
 */
export async function obtenerUltimoVideo() {
  if (!db) return null;
  try {
    const q = query(collection(db, COLECCION), orderBy('fecha', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const doc = snap.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      youtubeId: data.youtubeId || data.videoId || '',
      titulo: data.titulo || 'Sin título',
      titulo_en: data.titulo_en || data.titulo || '',
      descripcion: data.descripcion || '',
      descripcion_en: data.descripcion_en || data.descripcion || '',
      temporada: data.temporada || 1,
      episodio: data.episodio || 1,
      fecha: data.fecha ? new Date(data.fecha).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) : '',
      fechaRaw: data.fecha,
    };
  } catch (err) {
    console.error('[ultimoVideo] error:', err);
    return null;
  }
}
