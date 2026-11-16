'use client';

/**
 * Fotos de ejemplo de los formatos de integración en YouTube.
 * Se cargan desde el modo admin de /publicidad y quedan guardadas
 * en Firestore (documento configuracion/fotos_youtube) para que
 * todos los visitantes vean las fotos subidas por el administrador.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const RUTA_FOTOS_YOUTUBE = 'configuracion/fotos_youtube';

export async function cargarFotosYoutube() {
  if (typeof window === 'undefined') return {};
  if (!db) return {};
  try {
    const snap = await getDoc(doc(db, RUTA_FOTOS_YOUTUBE));
    if (!snap.exists()) return {};
    const datos = snap.data();
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return {};
    return Object.fromEntries(
      Object.entries(datos).filter(([, valor]) => typeof valor === 'string' && valor)
    );
  } catch {
    return {};
  }
}

export async function guardarFotosYoutube(fotos) {
  if (typeof window === 'undefined') return false;
  if (!db) return false;
  try {
    await setDoc(doc(db, RUTA_FOTOS_YOUTUBE), fotos);
    return true;
  } catch {
    /* sin permisos o sin conexión: la foto vale solo para esta sesión */
    return false;
  }
}
