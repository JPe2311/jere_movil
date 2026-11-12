'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Feed de Instagram - Muestra las últimas publicaciones.
 * Nota: Para usar datos reales de Instagram se requiere Access Token de Instagram Graph API.
 * Por ahora muestra datos de ejemplo que pueden ser reemplazados por datos reales.
 */
export default function InstagramFeed({ cuenta = 'jerefijo', cantidad = 6 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // En un entorno real, aquí se llamaría a la API de Instagram Graph API
    // Con el access token correspondiente.
    // Por ahora mostramos datos de ejemplo.
    const demoPosts = [
      {
        id: 'ig1',
        url: 'https://www.instagram.com/jerefijo/',
        imagen: 'https://images.unsplash.com/photo-1469854523076-882547143777?w=400&h=400&fit=crop',
        leyenda: 'Atardecer en la ruta 🌅',
      },
      {
        id: 'ig2',
        url: 'https://www.instagram.com/jerefijo/',
        imagen: 'https://images.unsplash.com/photo-1506905925366-2e255474e445?w=400&h=400&fit=crop',
        leyenda: 'La Bebi lista para carretera 🚐',
      },
      {
        id: 'ig3',
        url: 'https://www.instagram.com/jerefijo/',
        imagen: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop',
        leyenda: 'Montañas del norte 🏔️',
      },
      {
        id: 'ig4',
        url: 'https://www.instagram.com/jerefijo/',
        imagen: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
        leyenda: 'Lagos y paisajes 🌊',
      },
      {
        id: 'ig5',
        url: 'https://www.instagram.com/jerefijo/',
        imagen: 'https://images.unsplash.com/photo-1470770753741-de97c97e2a16?w=400&h=400&fit=crop',
        leyenda: 'Desierto y caminos 🏜️',
      },
      {
        id: 'ig6',
        url: 'https://www.instagram.com/jerefijo/',
        imagen: 'https://images.unsplash.com/photo-1518285054465-732c27907d6d?w=400&h=400&fit=crop',
        leyenda: 'Amanecer en ruta ☀️',
      },
    ];

    setLoading(false);
    setPosts(demoPosts.slice(0, cantidad));
  }, [cuenta, cantidad]);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-extrabold text-noche">
            Instagram
          </h2>
          <a
            href="https://www.instagram.com/jerefijo/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1 rounded-full border-2 border-noche bg-white text-noche font-bold text-xs shadow-comic-sm hover:bg-noche/10 transition"
          >
            <span aria-hidden>📸</span> Ver perfil
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="aspect-square overflow-hidden rounded-2xl border-[3px] border-noche shadow-comic cursor-pointer"
            >
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                <img
                  src={post.imagen}
                  alt={post.leyenda}
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
        </div>
      </div>
    </section>
  );
}
