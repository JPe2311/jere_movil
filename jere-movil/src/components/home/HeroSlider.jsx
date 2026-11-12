'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  // La imagen se monta recién en el cliente: así el `onError` siempre está
  // enganchado antes de que el navegador intente cargarla.
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  // Si cambia la imagen, reintentamos la carga.
  useEffect(() => {
    setImgError(false);
  }, [index]);

  const slide = slides[index];
  if (!slide) return null;

  function ir(url) {
    if (!url) return;
    if (url.startsWith('http')) window.open(url, '_blank', 'noopener');
    else window.location.href = url;
  }

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl border-[3px] border-noche shadow-comic bg-crema">
      {/* Fondo de respaldo (se ve si no hay imagen o si no carga) */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          slide.degradado || 'from-cielo via-sol to-rosa'
        }`}
      />

      {montado && !imgError && slide.imagen ? (
        <motion.img
          key={slide.imagen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          src={slide.imagen}
          alt={slide.titulo}
          onError={() => setImgError(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: 'brightness(0.8)' }}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-[7rem] sm:text-[9rem]" aria-hidden>
          {slide.emoji || '🚐'}
        </div>
      )}

      {/* Degradado para que el texto se lea siempre */}
      <div className="absolute inset-0 bg-gradient-to-t from-noche/80 via-noche/20 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end gap-4 p-6 sm:p-8 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mb-2 inline-block rounded-full border-2 border-noche bg-sol px-3 py-1 text-xs font-extrabold text-white">
            {slide.etiqueta || 'Viaje'}
          </span>
          <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            {slide.titulo}
          </h2>
          <p className="mt-2 max-w-md text-base font-semibold text-white/90 sm:text-lg">
            {slide.descripcion}
          </p>
        </div>

        {slide.url && (
          <button
            type="button"
            onClick={() => ir(slide.url)}
            className="w-full shrink-0 rounded-full border-2 border-noche bg-sol px-5 py-2 text-sm font-extrabold text-white shadow-comic-sm transition-transform hover:bg-yellow-300 active:scale-95 md:w-auto"
          >
            {slide.textoBoton || 'Ver más →'}
          </button>
        )}
      </div>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ir a la imagen ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full border border-noche transition-colors ${
              i === index ? 'bg-sol' : 'bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
