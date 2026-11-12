'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [autoPlay, slides.length]);

  const slide = slides[index];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full aspect-video overflow-hidden rounded-2xl border-[3px] border-noche shadow-comic bg-crema"
    >
      <motion.img
        src={slide.imagen}
        alt={slide.titulo}
        className="w-full h-full object-cover"
        style={{ filter: 'brightness(0.85)' }}
        layout="fill"
        objectFit="cover"
      />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute inset-0 flex items-end justify-between p-6 sm:p-8"
      >
        <div className="text-noche">
          <span className="inline-block rounded-full border-2 border-noche bg-sol px-3 py-1 text-xs font-extrabold text-white mb-2">
            {slide.etiqueta || 'Viaje'}
          </span>
          <h2 className="font-display text-3xl font-extrabold text-white text-shadow-sm">
            {slide.titulo}
          </h2>
          <p className="text-lg font-semibold text-white mt-2 max-w-md">
            {slide.descripcion}
          </p>
        </div>
        {slide.url && (
          <button
            type="button"
            onClick={() => {
              if (slide.url.startsWith('http')) {
                window.open(slide.url, '_blank');
              } else {
                window.location.href = slide.url;
              }
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-full border-2 border-noche bg-sol text-white font-extrabold text-sm shadow-comic-sm hover:bg-yellow-300 transition-transform active:scale-95"
          >
            {slide.textoBoton || 'Ver mas'}
          </button>
        )}
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${i === index ? 'bg-sol' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
