'use client';

/**
 * Obtiene publicaciones de Instagram.
 *
 * El navegador NO puede pedirle datos a instagram.com directamente (bloquea
 * por CORS) ni conviene exponer el access token. Por eso se consulta nuestro
 * propio endpoint `/api/instagram`, que hace el request desde el servidor con
 * Instagram Graph API.
 *
 * Si no hay credenciales configuradas (INSTAGRAM_ACCESS_TOKEN +
 * INSTAGRAM_ACCOUNT_ID) se muestran publicaciones de ejemplo.
 */

const DEMO = [
  {
    id: 'demo-1',
    url: 'https://www.instagram.com/jerefijo/',
    imagen: '/labebi.svg',
    leyenda: 'Atardecer en la ruta 🌅',
    demo: true,
  },
  {
    id: 'demo-2',
    url: 'https://www.instagram.com/jerefijo/',
    imagen: '/labebi.svg',
    leyenda: 'La Bebi lista para carretera 🚐',
    demo: true,
  },
  {
    id: 'demo-3',
    url: 'https://www.instagram.com/jerefijo/',
    imagen: '/labebi.svg',
    leyenda: 'Montañas del norte 🏔️',
    demo: true,
  },
  {
    id: 'demo-4',
    url: 'https://www.instagram.com/jerefijo/',
    imagen: '/labebi.svg',
    leyenda: 'Lagos y paisajes 🌊',
    demo: true,
  },
  {
    id: 'demo-5',
    url: 'https://www.instagram.com/jerefijo/',
    imagen: '/labebi.svg',
    leyenda: 'Desierto y caminos 🏜️',
    demo: true,
  },
  {
    id: 'demo-6',
    url: 'https://www.instagram.com/jerefijo/',
    imagen: '/labebi.svg',
    leyenda: 'Amanecer en ruta ☀️',
    demo: true,
  },
];

function demo(cantidad) {
  return { desde: 'demo', datos: DEMO.slice(0, cantidad) };
}

export async function obtenerPublicacionesInstagram(cantidad = 6) {
  try {
    const res = await fetch(`/api/instagram?cantidad=${cantidad}`, {
      headers: { accept: 'application/json' },
    });

    if (!res.ok) return demo(cantidad);

    const json = await res.json();
    if (!json?.configurado || !Array.isArray(json.datos) || json.datos.length === 0) {
      return demo(cantidad);
    }

    return { desde: 'grafico', datos: json.datos.slice(0, cantidad) };
  } catch (err) {
    console.error('[instagram] error:', err);
    return demo(cantidad);
  }
}
