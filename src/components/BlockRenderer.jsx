'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { loc, youtubeId } from '@/lib/utils';

const colors = {
  sol: 'bg-sol',
  atardecer: 'bg-atardecer text-white',
  monte: 'bg-monte text-white',
  cielo: 'bg-cielo text-white',
  rosa: 'bg-rosa text-white',
};

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { type: 'spring', damping: 20 },
};

function VideoEmbed({ url, title }) {
  const yt = youtubeId(url || '');
  if (!url) return null;
  return (
    <div className="aspect-video overflow-hidden rounded-2xl border-[3px] border-noche bg-noche">
      {yt ? (
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${yt}`}
          title={title}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video className="h-full w-full" src={url} controls playsInline />
      )}
    </div>
  );
}

/** Renderiza un bloque de "Quién soy" según su tipo: texto | tarjeta | galeria | video. */
export default function BlockRenderer({ bloque }) {
  const { lang } = useI18n();
  const titulo = loc(bloque, 'titulo', lang);
  const contenido = loc(bloque, 'contenido', lang);

  switch (bloque.tipo) {
    case 'tarjeta':
      return (
        <motion.article
          {...fadeUp}
          whileHover={{ rotate: -1.5, scale: 1.02 }}
          className={`card-comic flex items-start gap-4 p-5 ${colors[bloque.color] || colors.sol}`}
        >
          <div className="text-5xl" aria-hidden>
            {bloque.icono || '⭐'}
          </div>
          <div>
            {titulo && <h3 className="font-display text-2xl font-extrabold">{titulo}</h3>}
            <p className="whitespace-pre-line font-semibold leading-relaxed">{contenido}</p>
          </div>
        </motion.article>
      );

    case 'galeria':
      return (
        <motion.section {...fadeUp} className="space-y-3">
          {titulo && <h3 className="font-display text-2xl font-extrabold">📷 {titulo}</h3>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(bloque.imagenes || []).map((src, i) => (
              <motion.div
                key={src}
                whileHover={{ rotate: i % 2 ? 2 : -2, scale: 1.04 }}
                className="aspect-[4/3] overflow-hidden rounded-2xl border-[3px] border-noche bg-white shadow-comic"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </motion.div>
            ))}
          </div>
        </motion.section>
      );

    case 'video':
      return (
        <motion.section {...fadeUp} className="space-y-3">
          {titulo && <h3 className="font-display text-2xl font-extrabold">🎬 {titulo}</h3>}
          <VideoEmbed url={bloque.videoUrl} title={titulo} />
          {contenido && <p className="whitespace-pre-line font-semibold">{contenido}</p>}
        </motion.section>
      );

    case 'texto':
    default:
      return (
        <motion.section {...fadeUp} className="space-y-2">
          {titulo && <h2 className="font-display text-3xl font-extrabold sm:text-4xl">{titulo}</h2>}
          {contenido
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((par, i) => (
              <p key={i} className="whitespace-pre-line text-lg font-semibold leading-relaxed">
                {par}
              </p>
            ))}
        </motion.section>
      );
  }
}
