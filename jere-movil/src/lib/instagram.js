'use client';

/**
 * Obtiene publicaciones de Instagram.
 *
 * Intenta obtener datos reales de Instagram de varias formas:
 * 1. Si hay INSTAGRAM_ACCESS_TOKEN configurado, usa Instagram Graph API
 * 2. Si no, intenta obtener datos públicos de la página de Instagram
 * 3. Como fallback, devuelve datos de ejemplo con aviso
 *
 * Para obtener un access token de Instagram:
 * 1. Crear una app en https://developers.facebook.com/
 * 2. Crear un Instagram Business Account
 * 3. Obtener un Page Access Token con permiso instagram_basic
 * 4. Agregar INSTAGRAM_ACCESS_TOKEN a .env.local
 */

const INSTAGRAM_ACCESS_TOKEN = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_ACCOUNT_ID = process.env.NEXT_PUBLIC_INSTAGRAM_ACCOUNT_ID;

/**
 * Intenta obtener publicaciones reales de Instagram Graph API.
 * Requiere INSTAGRAM_ACCESS_TOKEN y INSTAGRAM_ACCOUNT_ID configurados.
 */
async function obtenerDesdeGraphAPI(cantidad = 6) {
  if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_ACCOUNT_ID) return null;

  try {
    const url = `https://graph.facebook.com/v18.0/${INSTAGRAM_ACCOUNT_ID}/media?fields=id,caption,media_url,permalink,timestamp&access_token=${INSTAGRAM_ACCESS_TOKEN}&limit=${cantidad}`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache 1 hora
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.map((item) => ({
      id: item.id,
      url: item.permalink,
      imagen: item.media_url,
      leyenda: item.caption || '',
      fecha: item.timestamp,
    })) || [];
  } catch (err) {
    console.error('[instagram] error graph API:', err);
    return null;
  }
}

/**
 * Intenta obtener datos públicos de la página de Instagram (sin API key).
 * Esto puede fallar si Instagram bloquea el request.
 */
async function obtenerDesdePaginaPublica(cantidad = 6) {
  try {
    const res = await fetch('https://www.instagram.com/jerefijo/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Buscar datos embebidos en el HTML de Instagram
    const match = html.match(/window\._sharedData\s*=\s*(\{.*?\});</);
    if (!match) return null;

    const data = JSON.parse(match[1]);
    const user = data.entry_data?.ProfilePage?.[0]?.graphql?.user;
    if (!user) return null;

    const posts = user.edge_owner_to_timeline_media?.edges?.slice(0, cantidad) || [];
    return posts.map((edge) => {
      const node = edge.node;
      return {
        id: node.id,
        url: `https://www.instagram.com/p/${node.shortcode}/`,
        imagen: node.display_url,
        leyenda: node.caption?.edges?.[0]?.node?.text || '',
        fecha: new Date(node.taken_at_timestamp * 1000).toISOString(),
      };
    }) || [];
  } catch (err) {
    console.error('[instagram] error pagina publica:', err);
    return null;
  }
}

/**
 * Obtiene publicaciones de Instagram.
 * Intenta Graph API primero, luego página pública, y como fallback datos de ejemplo.
 */
export async function obtenerPublicacionesInstagram(cantidad = 6) {
  // 1. Intentar Graph API
  const desdeGraph = await obtenerDesdeGraphAPI(cantidad);
  if (desdeGraph && desdeGraph.length > 0) {
    return { desde: 'grafico', datos: desdeGraph };
  }

  // 2. Intentar página pública
  const desdePagina = await obtenerDesdePaginaPublica(cantidad);
  if (desdePagina && desdePagina.length > 0) {
    return { desde: 'publica', datos: desdePagina };
  }

  // 3. Fallback: datos de ejemplo con aviso
  const demoPosts = [
    {
      id: 'demo-1',
      url: 'https://www.instagram.com/jerefijo/',
      imagen: 'https://images.unsplash.com/photo-1469854523076-882547143777?w=400&h=400&fit=crop',
      leyenda: 'Atardecer en la ruta 🌅',
      fecha: new Date().toISOString(),
      demo: true,
    },
    {
      id: 'demo-2',
      url: 'https://www.instagram.com/jerefijo/',
      imagen: 'https://images.unsplash.com/photo-1506905925366-2e255474e445?w=400&h=400&fit=crop',
      leyenda: 'La Bebi lista para carretera 🚐',
      fecha: new Date(Date.now() - 86400000).toISOString(),
      demo: true,
    },
    {
      id: 'demo-3',
      url: 'https://www.instagram.com/jerefijo/',
      imagen: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop',
      leyenda: 'Montañas del norte 🏔️',
      fecha: new Date(Date.now() - 172800000).toISOString(),
      demo: true,
    },
    {
      id: 'demo-4',
      url: 'https://www.instagram.com/jerefijo/',
      imagen: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
      leyenda: 'Lagos y paisajes 🌊',
      fecha: new Date(Date.now() - 259200000).toISOString(),
      demo: true,
    },
    {
      id: 'demo-5',
      url: 'https://www.instagram.com/jerefijo/',
      imagen: 'https://images.unsplash.com/photo-1470770753741-de97c97e2a16?w=400&h=400&fit=crop',
      leyenda: 'Desierto y caminos 🏜️',
      fecha: new Date(Date.now() - 345600000).toISOString(),
      demo: true,
    },
    {
      id: 'demo-6',
      url: 'https://www.instagram.com/jerefijo/',
      imagen: 'https://images.unsplash.com/photo-1518285054465-732c27907d6d?w=400&h=400&fit=crop',
      leyenda: 'Amanecer en ruta ☀️',
      fecha: new Date(Date.now() - 432000000).toISOString(),
      demo: true,
    },
  ];

  return {
    desde: 'demo',
    datos: demoPosts.slice(0, cantidad),
  };
}
