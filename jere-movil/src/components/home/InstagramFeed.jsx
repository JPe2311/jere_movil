'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { obtenerPublicacionesInstagram } from '@/lib/instagram';

const PERFIL = 'https://www.instagram.com/jerefijo/';

/**
 * Feed de Instagram.
 * Con INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_ACCOUNT_ID muestra las últimas
 * publicaciones reales. Sin credenciales, muestra una tarjeta para seguir
 * el perfil (no inventamos publicaciones).
 */
export default function InstagramFeed({ cuenta = 'jerefijo', cantidad = 6 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modoDemo, setModoDemo] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        const resultado = await obtenerPublicacionesInstagram(cantidad);
        setPosts(resultado.datos);
        setModoDemo(resultado.desde === 'demo');
      } catch (err) {
        console.error('[instagram] error:', err);
        setPosts([]);
        setModoDemo(true);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [cantidad]);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border-[2px] border-noche bg-crema flex items-center justify-center">
            <span className="text-xs font-bold text-noche">📸</span>
          </div>
          <div>
            <h2 className="font-display text-2xl font-extrabold text-noche">Instagram</h2>
            <span className={`text-xs font-bold ${modoDemo ? 'text-noche/50' : 'text-monte'}`}>
              {modoDemo ? `@${cuenta}` : 'En vivo'}
            </span>
          </div>
        </div>
        <a
          href={PERFIL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1 rounded-full border-2 border-noche bg-white text-noche font-bold text-xs shadow-comic-sm hover:bg-noche/10 transition"
        >
          <span aria-hidden>📸</span> Ver perfil
        </a>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-10">
          <div className="w-8 h-8 rounded-full border-2 border-noche border-dashed animate-pulse" />
          <span className="text-sm font-bold text-noche/60">Cargando…</span>
        </div>
      )}

      {!loading && (modoDemo || posts.length === 0) && (
        <div className="rounded-2xl border-[3px] border-noche bg-gradient-to-br from-rosa/20 via-sol/30 to-cielo/20 p-8 text-center shadow-comic">
          <div className="mb-2 text-4xl" aria-hidden>📸</div>
          <h3 className="font-display text-xl font-extrabold text-noche">Seguime en Instagram</h3>
          <p className="mx-auto mb-5 mt-1 max-w-md text-sm font-semibold text-noche/70">
            Las fotos y videos del día a día de La Bebi los subo a @{cuenta}.
          </p>
          <a
            href={PERFIL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border-2 border-noche bg-rosa px-5 py-2 font-extrabold text-white shadow-comic-sm transition-transform hover:brightness-110 active:scale-95"
          >
            Seguir @{cuenta} →
          </a>
        </div>
      )}

      {!loading && !modoDemo && posts.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border-[3px] border-noche shadow-comic"
            >
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block h-full w-full"
              >
                <span className="absolute inset-0 grid place-items-center bg-gradient-to-br from-cielo/70 to-sol/70 text-4xl" aria-hidden>
                  📸
                </span>
                <img
                  src={post.imagen}
                  alt={post.leyenda || 'Publicación de Instagram'}
                  className="relative h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-noche/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-sm font-bold text-white">Ver en Instagram</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-noche/80 p-2 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {post.leyenda}
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
