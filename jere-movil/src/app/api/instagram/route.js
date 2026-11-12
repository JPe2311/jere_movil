import { NextResponse } from 'next/server';

export const revalidate = 3600;

const TOKEN =
  process.env.INSTAGRAM_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
const ACCOUNT =
  process.env.INSTAGRAM_ACCOUNT_ID ||
  process.env.NEXT_PUBLIC_INSTAGRAM_ACCOUNT_ID;
const VERSION = process.env.INSTAGRAM_API_VERSION || 'v21.0';

/**
 * Proxy server-side para Instagram Graph API.
 * Se hace acá y no en el navegador porque:
 *  - instagram.com no manda headers CORS (el fetch directo falla)
 *  - el access token no debe viajar al cliente
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pedido = parseInt(searchParams.get('cantidad') || '6', 10);
  const limite = Math.min(Number.isFinite(pedido) ? pedido : 6, 24);

  if (!TOKEN || !ACCOUNT) {
    return NextResponse.json({ configurado: false, datos: [] });
  }

  try {
    const url =
      `https://graph.facebook.com/${VERSION}/${ACCOUNT}/media` +
      `?fields=id,caption,media_url,permalink,thumbnail_url,timestamp` +
      `&limit=${limite}` +
      `&access_token=${encodeURIComponent(TOKEN)}`;

    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      const detalle = await res.text();
      console.error('[instagram] Graph API respondió', res.status, detalle);
      return NextResponse.json({ configurado: true, datos: [], error: `HTTP ${res.status}` });
    }

    const data = await res.json();
    const datos = (data.data || []).map((item) => ({
      id: item.id,
      url: item.permalink,
      imagen: item.media_url || item.thumbnail_url,
      leyenda: item.caption || '',
      fecha: item.timestamp,
    }));

    return NextResponse.json({ configurado: true, datos });
  } catch (err) {
    console.error('[instagram] error Graph API:', err);
    return NextResponse.json({ configurado: true, datos: [], error: 'fetch_failed' });
  }
}
