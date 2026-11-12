'use client';

import { motion } from 'framer-motion';
import BlockRenderer from '@/components/BlockRenderer';
import { useCollection } from '@/lib/useCollection';
import { useI18n } from '@/lib/i18n';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { type: 'spring', damping: 20 },
};

const REDES = [
  {
    id: 'instagram',
    nombre: 'Instagram',
    handle: '@jerefijo',
    url: 'https://www.instagram.com/jerefijo/',
    emoji: '📸',
    color: 'bg-atardecer',
    seguidores: '147K',
  },
  {
    id: 'youtube',
    nombre: 'YouTube',
    handle: '@JereMovil',
    url: 'https://www.youtube.com/@JereMovil',
    emoji: '▶️',
    color: 'bg-rosa',
    seguidores: null,
  },
];

export default function QuienSoyPage() {
  const { t } = useI18n();
  const { items, loading } = useCollection('quien_soy_bloques', 'orden', 'asc');

  // Ficha técnica de La Bebi. `value: null` → se muestra "Próximamente"
  // (para completar con los datos reales cuando se quieran sumar).
  const ficha = [
    { emoji: '🏷️', label: t('labebi_spec_nombre'), value: 'La Bebi 🚐' },
    { emoji: '🚙', label: t('labebi_spec_base'), value: 'Toyota Hilux' },
    { emoji: '🏠', label: t('labebi_spec_tipo'), value: t('labebi_spec_tipo_v') },
    { emoji: '🎨', label: t('labebi_spec_color'), value: t('labebi_spec_color_v') },
    { emoji: '📅', label: t('labebi_spec_ruta'), value: '12 · 02 · 2025' },
    { emoji: '🌎', label: t('labebi_spec_paises'), value: '🇦🇷 🇨🇱 🇧🇷 🇺🇾 🇵🇾' },
    { emoji: '🔧', label: t('labebi_spec_anio'), value: null },
    { emoji: '⚙️', label: t('labebi_spec_motor'), value: null },
    { emoji: '🪑', label: t('labebi_spec_equip'), value: null },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 sm:px-12 lg:px-[150px] py-10">
      {/* ============ PRESENTACIÓN ============ */}
      <motion.header {...fadeUp} className="card-comic relative overflow-hidden p-6 sm:p-8">
        {/* manchas de color de fondo */}
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-sol/40" aria-hidden />
        <div className="absolute -bottom-14 -left-10 h-32 w-32 rounded-full bg-rosa/30" aria-hidden />

        <div className="relative flex flex-col items-center gap-7 sm:flex-row sm:items-start">
          {/* Foto con sticker del logo */}
          <div className="shrink-0">
            <motion.div whileHover={{ rotate: -2, scale: 1.03 }} className="relative w-44 sm:w-56">
              <span
                className="washi-tape-yellow absolute -top-3 left-5 z-10 h-6 w-24 -rotate-6"
                aria-hidden
              />
              <div className="overflow-hidden rounded-3xl border-[3px] border-noche bg-white shadow-comic">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/quiensoy.png"
                  alt="Jere, en las dunas con su sandboard"
                  className="aspect-square w-full object-cover"
                />
              </div>
              {/* Logotipo en contenedor circular */}
              <div className="absolute -bottom-4 -right-3 grid h-16 w-16 place-items-center rounded-full border-[3px] border-noche bg-white shadow-comic">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo_jere.png" alt="Logo Jere Móvil" className="h-11 w-11 object-contain" />
              </div>
            </motion.div>
          </div>

          {/* Texto de presentación */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <span className="chip">🙋 {t('about_title')}</span>
            <h1 className="page-title mt-2">{t('about_hello')}</h1>
            <p className="mt-1 font-display text-base font-bold text-atardecer sm:text-lg">
              {t('about_role')}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {[t('about_chip1'), t('about_chip2'), t('about_chip3')].map((c) => (
                <span
                  key={c}
                  className="rounded-full border-2 border-noche bg-white px-3 py-1 text-xs font-extrabold shadow-comic-sm sm:text-sm"
                >
                  {c}
                </span>
              ))}
            </div>

            {/* Bocadillo con la frase */}
            <div className="mt-5 inline-block rounded-3xl border-[3px] border-noche bg-cielo px-4 py-3 text-left font-display text-sm font-extrabold text-white shadow-comic sm:text-base">
              “{t('about_quote')}”
            </div>
          </div>
        </div>
      </motion.header>

      {/* ============ MI HISTORIA ============ */}
      <motion.section {...fadeUp} className="card-comic p-6 sm:p-8">
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{t('about_story')}</h2>
        <div className="mt-3 space-y-4 text-lg font-semibold leading-relaxed">
          <p className="first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:font-extrabold first-letter:leading-[0.8] first-letter:text-rosa">
            {t('about_p1')}
          </p>
          <p>{t('about_p2')}</p>
          <p>{t('about_p3')}</p>
        </div>
      </motion.section>

      {/* ============ LA BEBI ============ */}
      <motion.section {...fadeUp} className="card-comic overflow-hidden">
        <div className="border-b-[3px] border-noche bg-sol px-5 py-3">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">🚐 {t('labebi_title')}</h2>
          <p className="font-bold">{t('labebi_sub')}</p>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          {/* Ilustración + cita */}
          <div className="space-y-4">
            <motion.div
              whileHover={{ rotate: -1.5, scale: 1.02 }}
              className="rounded-2xl border-[3px] border-noche bg-crema p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/labebi.svg"
                alt="La Bebi — Toyota Hilux Camper"
                className="mx-auto w-full max-w-[280px]"
              />
            </motion.div>
            <blockquote className="rounded-2xl border-[3px] border-noche bg-cielo p-4 font-semibold text-white shadow-comic-sm">
              «{t('labebi_quote')}»
            </blockquote>
            <p className="text-sm font-bold text-noche/70">{t('labebi_hint')}</p>
          </div>

          {/* Ficha técnica */}
          <div>
            <h3 className="font-display text-xl font-extrabold">🔧 {t('labebi_specs')}</h3>
            <p className="mt-1 text-sm font-semibold text-noche/70">{t('labebi_desc')}</p>
            <dl className="mt-3 overflow-hidden rounded-2xl border-[3px] border-noche bg-white">
              {ficha.map((f, i) => (
                <div
                  key={f.label}
                  className={`flex items-center gap-3 px-3 py-2 text-sm ${
                    i > 0 ? 'border-t-2 border-noche/10' : ''
                  } ${i % 2 ? 'bg-crema/60' : 'bg-white'}`}
                >
                  <span aria-hidden>{f.emoji}</span>
                  <dt className="font-extrabold text-noche/70">{f.label}</dt>
                  <dd className="ml-auto text-right font-black">
                    {f.value ?? (
                      <span className="rounded-full border-2 border-dashed border-noche/50 px-2 py-0.5 text-xs text-noche/60">
                        ✏️ {t('labebi_soon')}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Galería: espacio para las fotos futuras */}
        <div className="px-5 pb-5">
          <h3 className="font-display text-xl font-extrabold">📷 {t('labebi_photos')}</h3>
          <div className="mt-2 grid place-items-center rounded-2xl border-[3px] border-dashed border-noche bg-white/60 px-4 py-8 text-center">
            <span className="text-4xl" aria-hidden>
              🚐📸
            </span>
            <p className="mt-2 max-w-md font-semibold">{t('labebi_photos_soon')}</p>
          </div>
        </div>
      </motion.section>

      {/* ============ REDES ============ */}
      <motion.section {...fadeUp} className="space-y-4 text-center">
        <h2 className="font-display text-3xl font-extrabold">📲 {t('about_redes')}</h2>
        <p className="font-semibold">{t('about_redes_sub')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {REDES.map((r, i) => (
            <motion.a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: i % 2 ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ type: 'spring', damping: 18 }}
              whileHover={{ scale: 1.03, rotate: i % 2 ? 1 : -1 }}
              whileTap={{ scale: 0.97 }}
              className={`card-comic group flex items-center gap-4 p-4 text-white ${r.color}`}
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[3px] border-noche bg-white text-3xl group-hover:animate-wiggle">
                {r.emoji}
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block font-display text-2xl font-extrabold leading-none">
                  {r.nombre}
                </span>
                <span className="block text-sm font-bold opacity-90">{r.handle}</span>
              </span>
              <span className="text-right">
                {r.seguidores && (
                  <span className="block font-display text-xl font-extrabold leading-none">
                    {r.seguidores}
                  </span>
                )}
                <span className="mt-1 inline-block rounded-full border-2 border-noche bg-white px-3 py-0.5 text-xs font-extrabold text-noche">
                  {t('social_go')} ↗
                </span>
              </span>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* ============ Bloques editables desde /admin ============ */}
      {loading && <p className="text-center font-bold">{t('loading')}</p>}
      {!loading && items.length > 0 && (
        <section className="space-y-8 border-t-[3px] border-dashed border-noche/30 pt-8">
          {items.map((b) => (
            <BlockRenderer key={b.id} bloque={b} />
          ))}
        </section>
      )}
    </div>
  );
}
