'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { obtenerPublicacionesInstagram } from '@/lib/instagram';

/**
 * Feed de Instagram - Muestra las últimas publicaciones.
 * Intenta obtener datos reales de Instagram Graph API o de la página pública.
 * Si no hay configuración, muestra datos de ejemplo con aviso.
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
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [cantidad]);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-[2px] border-noche bg-crema flex items-center justify-center">
              <span className="text-xs font-bold text-noche">📸</span>
            </div>
            <div>
              <h2 className="font-display text-2xl font-extrabold text-noche">
                Instagram
              </h2>
              <span className={`text-xs font-bold ${modoDemo ? 'text-rosa' : 'text-sol'}`}>
                {modoDemo ? 'Modo de ejemplo' : 'En vivo'}
              </span>
            </div>
          </div>
          <a
            href="https://www.instagram.com/jerefijo/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1 rounded-full border-2 border-noche bg-white text-noche font-bold text-xs shadow-comic-sm hover:bg-noche/10 transition"
          >
            <span aria-hidden>📸</span> Ver perfil
          </a>
        </div>

        {modoDemo && (
          <div className="mb-4 rounded-full border-2 border-dashed border-noche bg-crema px-4 py-2 text-sm font-bold text-noche/70">
            ⚠️ Modo de ejemplo: configura INSTAGRAM_ACCESS_TOKEN y INSTAGRAM_ACCOUNT_ID en .env.local para ver publicaciones reales.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square overflow-hidden rounded-2xl border-[3px] border-noche shadow-comic cursor-pointer group"
            >
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                <img
                  src={post.imagen}
                  alt={post.leyenda || 'Publicación de Instagram'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-noche/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Ver en Instagram</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-noche/80 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {post.leyenda}
                </div>
              </a>
            </motion.div>
          ))}
          {posts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <div className="text-4xl mb-2" aria-hidden>📸</div>
              <p className="text-sm font-semibold text-noche/70">
                No hay publicaciones para mostrar.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
