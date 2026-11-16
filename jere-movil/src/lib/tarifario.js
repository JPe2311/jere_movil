'use client';

/**
 * Catálogo del tarifario de publicidad (Media Kit Jere Móvil).
 * Se puede editar desde el "Modo edición" de /publicidad y queda guardado
 * en Firestore (documento config/tarifario) para que todos los visitantes
 * vean la información actualizada. Los valores base son los del
 * documento original.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const RUTA_TARIFARIO = 'configuracion/tarifario';

export const PAQUETES_BASE = [
  {
    id: 'explorador',
    nombre: 'EXPLORADOR',
    subtitulo: 'Para empezar a rodar',
    precio: 600000,
    destacado: false,
    activo: true,
    incluye: [
      'Mención de apertura (10-15 seg)',
      'Agradecimiento en créditos (10 seg)',
      '1 Short/Reels',
    ],
  },
  {
    id: 'aventurero',
    nombre: 'AVENTURERO',
    subtitulo: 'El más elegido',
    precio: 850000,
    destacado: true,
    activo: true,
    incluye: [
      'Todo lo del Explorador',
      'Banner de 1 min en video',
      '2 posts + 2 sets de stories',
      'Banner en la web por 30 días',
    ],
  },
  {
    id: 'leyenda',
    nombre: 'LEYENDA',
    subtitulo: 'Ruta completa',
    precio: 1500000,
    destacado: false,
    activo: true,
    incluye: [
      'Todo lo del Aventurero',
      'Integración orgánica (~1 min) con banner central',
      'Marca en la furgoneta por 60 días',
      'Sección de marca en la web (90 días)',
    ],
  },
];

export const SERVICIOS_BASE = [
  {
    id: 'mencion-apertura',
    nombre: 'Mención de apertura',
    detalle: 'En la introducción del capítulo. 10-15 seg',
    precio: 150000,
    activo: true,
  },
  {
    id: 'integracion-organica',
    nombre: 'Integración orgánica',
    detalle: 'Uso del producto en escena real ~1 min',
    precio: 900000,
    activo: true,
  },
  {
    id: 'banner-apertura',
    nombre: 'Banner de apertura',
    detalle: 'Logo o gráfico discreto 10 seg',
    precio: 100000,
    activo: true,
  },
  {
    id: 'banner',
    nombre: 'Banner',
    detalle: 'En cualquier espacio del video (no central) - 15 seg',
    precio: 150000,
    activo: true,
  },
  {
    id: 'banner-central',
    nombre: 'Banner central',
    detalle: 'Momento medio del capítulo. 15 seg',
    precio: 300000,
    activo: true,
  },
  {
    id: 'banner-cierre',
    nombre: 'Banner de cierre',
    detalle: 'Junto al "Agradecemos a...". 10 seg',
    precio: 150000,
    activo: true,
  },
  {
    id: 'creditos',
    nombre: 'Agradecimiento en créditos',
    detalle: 'Logo, nombre y link 10 seg',
    precio: 100000,
    activo: true,
  },
  {
    id: 'link-descripcion',
    nombre: 'Link en descripción + fijado',
    detalle: 'Mientras el video esté publicado',
    precio: 250000,
    activo: true,
  },
  {
    id: 'post-feed',
    nombre: 'Post en feed',
    detalle: 'Publicación con mención y link',
    precio: 200000,
    activo: true,
  },
  {
    id: 'set-stories',
    nombre: 'Set de stories',
    detalle: '3 stories con mención y link (1 mes)',
    precio: 180000,
    activo: true,
  },
  {
    id: 'marca-exterior',
    nombre: 'Marca en la furgoneta (exterior)',
    detalle: 'Calco/logo visible en la furgoneta 60 días',
    precio: 300000,
    activo: true,
  },
  {
    id: 'marca-conduccion',
    nombre: 'Marca en la furgoneta (conducción)',
    detalle: 'Calco/logo visible detrás del conductor 30 días',
    precio: 500000,
    activo: true,
  },
].map((servicio) => ({ ...servicio, foto: '' }));

export function catalogoOriginal() {
  return {
    paquetes: JSON.parse(JSON.stringify(PAQUETES_BASE)),
    servicios: JSON.parse(JSON.stringify(SERVICIOS_BASE)),
  };
}

function normalizar(guardado) {
  const base = catalogoOriginal();
  if (!guardado || typeof guardado !== 'object') return base;

  // Los tarifarios guardados antes del cambio de nombre pueden nombrar a la
  // furgoneta de una forma que ya no usamos: lo corregimos sin tocar precios.
  const sinMencion = (texto) => String(texto ?? '').replace(/La Bebi/g, 'la furgoneta');

  const paquetes = Array.isArray(guardado.paquetes)
    ? guardado.paquetes.filter((p) => p && p.id).map((p) => ({
        id: String(p.id),
        nombre: sinMencion(p.nombre),
        subtitulo: sinMencion(p.subtitulo),
        precio: Number(p.precio) || 0,
        destacado: Boolean(p.destacado),
        activo: p.activo !== false,
        incluye: Array.isArray(p.incluye) ? p.incluye.map((it) => sinMencion(it)) : [],
      }))
    : base.paquetes;

  const servicios = Array.isArray(guardado.servicios)
    ? guardado.servicios.filter((s) => s && s.id).map((s) => ({
        id: String(s.id),
        nombre: sinMencion(s.nombre),
        detalle: sinMencion(s.detalle),
        foto: typeof s.foto === 'string' ? s.foto : '',
        precio: Number(s.precio) || 0,
        activo: s.activo !== false,
      }))
    : base.servicios;

  return { paquetes, servicios };
}

/**
 * Lee el tarifario desde Firestore. Cualquier visitante puede leerlo.
 * Si no hay documento ni Firebase configurado, devuelve el catálogo base.
 */
export async function cargarTarifario() {
  if (typeof window === 'undefined') return catalogoOriginal();
  if (!db) return catalogoOriginal();
  try {
    const snap = await getDoc(doc(db, RUTA_TARIFARIO));
    if (!snap.exists()) return catalogoOriginal();
    return normalizar(snap.data());
  } catch {
    return catalogoOriginal();
  }
}

/**
 * Guarda el tarifario en Firestore. Solo debería llamarlo un administrador.
 * Los visitantes podrán ver los cambios en cuanto se publique.
 */
export async function guardarTarifario(tarifario) {
  if (typeof window === 'undefined') return false;
  if (!db) return false;
  try {
    await setDoc(doc(db, RUTA_TARIFARIO), tarifario);
    return true;
  } catch {
    /* sin permisos o sin conexión: los cambios valen solo para esta sesión */
    return false;
  }
}

export function borrarTarifario() {
  /* Se deja por compatibilidad, pero ya no borra localStorage.
     El tarifario vive en Firestore y se restaura con los valores base
     desde el modo edición si es necesario. */
}

const formatoARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export function precioARS(valor) {
  return formatoARS.format(Number(valor) || 0);
}

export function nuevoId(prefijo) {
  return `${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Convierte una foto elegida por el usuario en un data URL liviano
 * (máximo 720 px de lado, JPEG 75%) para poder guardarla en Firestore
 * junto con el resto del tarifario.
 */
export function imagenADataUrl(file, maxLado = 720, calidad = 0.75) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !file) {
      reject(new Error('No hay archivo para procesar.'));
      return;
    }
    if (!String(file.type || '').startsWith('image/')) {
      reject(new Error('El archivo tiene que ser una imagen.'));
      return;
    }
    const lector = new FileReader();
    lector.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    lector.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('La imagen no es válida.'));
      img.onload = () => {
        const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * escala));
        canvas.height = Math.max(1, Math.round(img.height * escala));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(file);
  });
}
