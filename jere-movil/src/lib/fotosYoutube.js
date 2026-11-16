'use client';

/**
 * Fotos de ejemplo de los formatos de integración en YouTube.
 * Se cargan desde el modo admin de /publicidad y quedan guardadas en
 * localStorage con una clave versionada (igual criterio que el tarifario).
 */

export const CLAVE_FOTOS_YOUTUBE = 'jeremovil_fotos_youtube_v1';

export function cargarFotosYoutube() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CLAVE_FOTOS_YOUTUBE);
    if (!raw) return {};
    const datos = JSON.parse(raw);
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return {};
    return Object.fromEntries(
      Object.entries(datos).filter(([, valor]) => typeof valor === 'string' && valor)
    );
  } catch {
    return {};
  }
}

export function guardarFotosYoutube(fotos) {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(CLAVE_FOTOS_YOUTUBE, JSON.stringify(fotos));
    return true;
  } catch {
    /* sin espacio o sin localStorage: la foto vale solo para esta sesión */
    return false;
  }
}
