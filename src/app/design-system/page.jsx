'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';

const colorTokens = [
  { name: 'Sol Dorado', hex: '#FFC93C', bg: 'bg-sol', role: 'Primario & Energía', desc: 'Botones principales, medallas, soles y destaques vivos.', icon: '☀️' },
  { name: 'Atardecer Rodante', hex: '#FF7A3D', bg: 'bg-atardecer', textWhite: true, role: 'Secundario de Acción', desc: 'Ruta trazada en el mapa, avisos de aventura y calor.', icon: '🔥' },
  { name: 'Cielo Abierto', hex: '#2D9CDB', bg: 'bg-cielo', textWhite: true, role: 'Información & Agua', desc: 'Océanos, lagos andinos, filtros y enlaces de clima.', icon: '🌊' },
  { name: 'Noche Cómic', hex: '#1F2A44', bg: 'bg-noche', textWhite: true, role: 'Tinta Maestra', desc: 'Bordes de 3px, sombras duras a 90° y tipografía.', icon: '✒️' },
  { name: 'Crema Papel', hex: '#FFF6E5', bg: 'bg-crema', role: 'Fondo Editorial', desc: 'Lienzo estilo papel de historieta con micro-puntos.', icon: '📜' },
  { name: 'Rosa Stickers', hex: '#FF5D8F', bg: 'bg-rosa', textWhite: true, role: 'Lúdico & Emotivo', desc: 'Reacciones, favoritos, stickers y stickers de la comunidad.', icon: '💖' },
  { name: 'Monte Selva', hex: '#2F9E6B', bg: 'bg-monte', textWhite: true, role: 'Naturaleza & Éxito', desc: 'Acampada libre, hitos completados y sellos de ruta.', icon: '🌲' },
];

const washiStickers = [
  { text: '⛺ Acampada Libre Confirmada', rotate: 'rotate-1', bg: 'bg-sol/90' },
  { text: '💨 Viento Patagónico Superado', rotate: '-rotate-2', bg: 'bg-rosa/85 text-white' },
  { text: '☕ Café Carretero a 0°C', rotate: 'rotate-2', bg: 'bg-cielo/85 text-white' },
  { text: '🏔️ Paso de Jama • 4.200 msnm', rotate: '-rotate-1', bg: 'bg-atardecer/90 text-white' },
  { text: '⛽ Tanque Lleno de Esperanza', rotate: 'rotate-3', bg: 'bg-monte/90 text-white' },
];

export default function DesignSystemPage() {
  const [pressedBtn, setPressedBtn] = useState(false);
  const [vanState, setVanState] = useState('driving');
  const [sliderVal, setSliderVal] = useState(65);

  return (
    <div className="min-h-screen bg-crema px-4 py-8 text-noche sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* HERO BANNER */}
        <section className="relative overflow-hidden rounded-3xl border-[4px] border-noche bg-white p-6 shadow-comic sm:p-10">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip bg-rosa text-white">✨ v2.4 Comic Edition</span>
              <span className="chip bg-sol">🚐 La Bebi Camper Kit</span>
              <span className="chip bg-monte text-white">✓ 100% Neo-Brutalist Ready</span>
            </div>

            <h1 className="font-display text-3xl font-extrabold sm:text-5xl">
              JERE MÓVIL DESIGN SYSTEM 🚐
              <br />
              <span className="text-atardecer underline decoration-sol decoration-wavy">
                GUÍA DE ESTILO CÓMIC & AVENTURA
              </span>
            </h1>

            <p className="max-w-2xl text-base font-semibold text-noche/80 sm:text-lg">
              Sistema de diseño y biblioteca de componentes lúdicos para narrar el viaje de Jere y su furgoneta{' '}
              <strong>"La Bebi"</strong> por Latinoamérica. Tinta gruesa, sombras sólidas, stickers coleccionables y estética de cómic.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="/preview-mapa-comic.html"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sol"
              >
                🗺️ Ver Prototipo Mapa Cómic
              </a>
              <a
                href="/preview-design-system.html"
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
              >
                🎨 Ver Showcase Stitch Completo
              </a>
              <Link href="/" className="btn btn-cielo">
                🚐 Volver al Mapa en Vivo
              </Link>
            </div>
          </div>
        </section>

        {/* 1. COLOR TOKENS */}
        <section className="space-y-4">
          <div className="border-b-[3px] border-noche pb-2">
            <span className="chip bg-sol">01. Colores Cómic</span>
            <h2 className="font-display text-2xl font-black sm:text-3xl">Paleta Cromática & Semántica</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {colorTokens.map((c) => (
              <div
                key={c.name}
                className="card-comic flex flex-col justify-between p-4 transition-transform hover:-translate-y-1"
              >
                <div>
                  <div
                    className={`h-24 rounded-2xl border-2 border-noche ${c.bg} flex items-end justify-between p-3 shadow-comic-sm`}
                  >
                    <span
                      className={`rounded-md border border-noche px-2 py-0.5 font-display text-xs font-black ${
                        c.textWhite ? 'bg-noche text-white' : 'bg-white text-noche'
                      }`}
                    >
                      {c.hex}
                    </span>
                    <span className="text-2xl">{c.icon}</span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold">{c.name}</h3>
                  <span className="chip mt-1 text-[10px]">{c.role}</span>
                </div>
                <p className="mt-3 border-t-2 border-dashed border-noche/20 pt-2 text-xs font-semibold text-noche/75">
                  {c.desc}
                </p>
              </div>
            ))}

            {/* Regla de Oro Cómic */}
            <div className="card-comic flex flex-col justify-between bg-noche p-5 text-white">
              <div>
                <span className="font-display text-sm font-extrabold text-sol">REGLA CÓMIC #1</span>
                <h3 className="font-display text-xl font-black text-white">Sombras Duras de Tinta</h3>
                <p className="mt-2 text-xs font-medium text-crema/90 leading-relaxed">
                  Prohibido el desenfoque gaussiano (blur difuso). Toda elevación en Jere Móvil se proyecta a 90° o 45°
                  con tinta sólida <code>#1F2A44</code>:
                </p>
              </div>
              <div className="mt-3 rounded-xl border border-white/30 bg-white/10 p-2 font-mono text-xs text-sol">
                box-shadow: 4px 4px 0px #1F2A44;
              </div>
            </div>
          </div>
        </section>

        {/* 2. TIPOGRAFÍA */}
        <section className="space-y-4">
          <div className="border-b-[3px] border-noche pb-2">
            <span className="chip bg-cielo text-white">02. Tipografía</span>
            <h2 className="font-display text-2xl font-black sm:text-3xl">Jerarquía y Voces del Viaje</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="card-comic space-y-6 p-6 lg:col-span-7">
              <div>
                <span className="text-xs font-bold text-noche/60 uppercase">Display Hero / Baloo 2</span>
                <p className="font-display text-3xl sm:text-4xl font-black text-noche drop-shadow-[2px_2px_0px_#FFC93C]">
                  ¡VROOM! ¡VÁMONOS AL SUR!
                </p>
              </div>
              <div className="border-t border-dashed border-noche/20 pt-4">
                <span className="text-xs font-bold text-noche/60 uppercase">H1 / Título de Sección</span>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-noche">
                  Bitácora #119: Cruzando el Paso de Jama
                </h1>
              </div>
              <div className="border-t border-dashed border-noche/20 pt-4">
                <span className="text-xs font-bold text-noche/60 uppercase">H2 / Subcapítulo</span>
                <h2 className="font-display text-xl font-bold text-atardecer">
                  Puntualidad mecánica: La Bebi a 4.200 msnm
                </h2>
              </div>
              <div className="border-t border-dashed border-noche/20 pt-4">
                <span className="text-xs font-bold text-noche/60 uppercase">Cuerpo de Texto / Nunito</span>
                <p className="text-sm font-semibold leading-relaxed text-noche/85">
                  Amanecimos con escarcha en el parabrisas de La Bebi. El motor arrancó al segundo intento con ese
                  ronquido fiel que ya reconocemos de memoria. Próxima parada: cocinar fideos al resguardo del viento.
                </p>
              </div>
            </div>

            {/* Globo de diálogo cómic */}
            <div className="space-y-4 lg:col-span-5">
              <div className="card-comic relative bg-sol p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="chip bg-noche text-white text-[10px]">🎙️ Radio VHF</span>
                  <span className="font-display text-xs font-bold">Voz de Jere</span>
                </div>
                <p className="font-display text-base font-bold leading-snug">
                  “¡Che, no se imaginan el cielo estrellado de Atacama! La Bebi se portó como una campeona subiendo la
                  cuesta y ahora tenemos fogata lista.”
                </p>
              </div>

              <div className="card-comic bg-crema p-5">
                <span className="font-display text-xs font-extrabold uppercase text-atardecer">
                  📝 Diario de Viaje con Pauta
                </span>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-noche/80">
                  Cada entrada combina fotografía estilo Polaroid con cinta adhesiva ilustrada (washi tape) en las
                  esquinas y etiquetas con iconos de la ruta.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BOTONERA ARCADE & ESTADOS */}
        <section className="space-y-4">
          <div className="border-b-[3px] border-noche pb-2">
            <span className="chip bg-rosa text-white">03. Botones Arcade</span>
            <h2 className="font-display text-2xl font-black sm:text-3xl">Píldoras y Matriz Háptica</h2>
          </div>

          <div className="card-comic space-y-6 p-6">
            <div>
              <h3 className="font-display text-base font-bold uppercase tracking-wide">
                Variantes de Botón Neo-Brutalistas
              </h3>
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" className="btn btn-sol">
                  ☀️ Iniciar Ruta Sol
                </button>
                <button type="button" className="btn btn-atardecer bg-atardecer text-white">
                  🔥 Subir Foto Polaroid
                </button>
                <button type="button" className="btn btn-cielo">
                  🌊 Descargar Track GPX
                </button>
                <button type="button" className="btn btn-rosa -rotate-1 hover:rotate-1">
                  💖 Apoyar el Viaje
                </button>
                <button type="button" className="btn btn-ghost">
                  🗺️ Centrar en La Bebi
                </button>
              </div>
            </div>

            {/* Matriz interactiva de estados */}
            <div className="border-t-2 border-dashed border-noche/20 pt-4">
              <h3 className="font-display text-base font-bold uppercase tracking-wide">
                Interacción Física en Vivo (¡Haz Click!)
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border-2 border-noche/30 bg-crema p-4 text-center">
                  <span className="text-xs font-bold text-noche/60">Hover (Elevación)</span>
                  <div className="mt-3">
                    <button
                      type="button"
                      className="btn btn-sol transition-transform hover:-translate-y-1 hover:shadow-comic"
                    >
                      Pasa el mouse
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-noche/30 bg-crema p-4 text-center">
                  <span className="text-xs font-bold text-noche/60">Active (Presión de Resorte)</span>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setPressedBtn(!pressedBtn)}
                      className={`btn ${pressedBtn ? 'bg-atardecer text-white translate-x-[2px] translate-y-[2px] shadow-none' : 'btn-sol'}`}
                    >
                      {pressedBtn ? '¡Presionado! 💥' : 'Click para presionar'}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-noche/30 bg-crema p-4 text-center opacity-60">
                  <span className="text-xs font-bold text-noche/60">Disabled (Sin Nafta)</span>
                  <div className="mt-3">
                    <button type="button" disabled className="btn btn-sol">
                      Sin Gasolina ⛽
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. STICKERS Y WASHI TAPE */}
        <section className="space-y-4">
          <div className="border-b-[3px] border-noche pb-2">
            <span className="chip bg-monte text-white">04. Stickers & Mochila Scout</span>
            <h2 className="font-display text-2xl font-black sm:text-3xl">Insignias y Cintas de Cuaderno</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Washi tapes */}
            <div className="card-comic space-y-4 p-6">
              <h3 className="font-display text-base font-bold uppercase text-noche">Cintas Washi Tape Pegadas</h3>
              <div className="flex flex-col gap-3 py-2">
                {washiStickers.map((w) => (
                  <div
                    key={w.text}
                    className={`inline-block w-fit rounded-sm border-2 border-noche/60 px-4 py-1.5 font-display text-xs font-extrabold uppercase shadow-comic-sm ${w.rotate} ${w.bg}`}
                  >
                    {w.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Parches de ruta */}
            <div className="card-comic space-y-4 p-6">
              <h3 className="font-display text-base font-bold uppercase text-noche">Parches Scout de Odisea</h3>
              <div className="flex flex-wrap items-center justify-around gap-4 py-3">
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-dashed border-noche bg-sol text-center shadow-comic-sm"
                >
                  <span className="text-xl">🔧</span>
                  <span className="font-display text-[9px] font-black uppercase">Mecánico Ruta</span>
                </motion.div>

                <motion.div
                  whileHover={{ rotate: -12, scale: 1.1 }}
                  className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border-4 border-noche bg-atardecer text-center text-white shadow-comic-sm"
                >
                  <span className="text-xl">⛰️</span>
                  <span className="font-display text-[9px] font-black uppercase">4.000m Club</span>
                </motion.div>

                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-noche bg-cielo text-center text-white shadow-comic-sm"
                >
                  <span className="text-xl">🌊</span>
                  <span className="font-display text-[9px] font-black uppercase">Pacífico</span>
                </motion.div>

                <motion.div
                  whileHover={{ rotate: -12, scale: 1.1 }}
                  className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border-4 border-dashed border-noche bg-rosa text-center text-white shadow-comic-sm"
                >
                  <span className="text-xl">⭐</span>
                  <span className="font-display text-[9px] font-black uppercase">Noche Libre</span>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. ELEMENTOS DEL MAPA CÓMIC */}
        <section className="space-y-4">
          <div className="border-b-[3px] border-noche pb-2">
            <span className="chip bg-sol">05. Activos del Mapa Cómic</span>
            <h2 className="font-display text-2xl font-black sm:text-3xl">La Bebi, Pines y Scrubber</h2>
          </div>

          <div className="card-comic space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Token de La Bebi */}
              <div className="rounded-2xl border-2 border-noche/30 bg-crema p-4 text-center">
                <span className="text-xs font-bold text-noche/60">Token: Furgoneta "La Bebi"</span>
                <div className="my-4 flex items-center justify-center">
                  <motion.div
                    animate={{
                      y: vanState === 'driving' ? [0, -6, 0] : 0,
                      rotate: vanState === 'driving' ? [-1, 1, -1] : 0,
                    }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                    className="relative cursor-pointer"
                    onClick={() => setVanState(vanState === 'driving' ? 'parked' : 'driving')}
                  >
                    <img src="/labebi.svg" alt="La Bebi" className="w-24 drop-shadow-md" />
                    <span className="absolute -left-6 bottom-0 rounded-full border-2 border-noche bg-white px-1.5 py-0.5 text-[10px] font-black shadow-comic-sm">
                      ¡Puf! 💨
                    </span>
                  </motion.div>
                </div>
                <span className="text-xs font-bold text-noche">
                  Estado: {vanState === 'driving' ? 'En marcha 🛣️' : 'Acampada ⛺'} (Click para alternar)
                </span>
              </div>

              {/* Waypoint pins */}
              <div className="rounded-2xl border-2 border-noche/30 bg-crema p-4 text-center">
                <span className="text-xs font-bold text-noche/60">Pines de Parada Ilustrados</span>
                <div className="my-5 flex items-center justify-center gap-4">
                  <div className="hito-pin" title="Parada 1: Buenos Aires">
                    1
                  </div>
                  <div className="hito-pin bg-atardecer text-white" title="Parada 2: Bariloche">
                    2
                  </div>
                  <div className="hito-pin bg-rosa text-white scale-110 rotate-3" title="Parada 3 (Activa)">
                    3
                  </div>
                  <div className="hito-pin border-dashed bg-white text-noche/60" title="Parada 4 (Futura)">
                    4
                  </div>
                </div>
                <span className="text-xs font-bold text-noche">Completado • Activo • Meta Futura</span>
              </div>

              {/* Brújula cómic */}
              <div className="rounded-2xl border-2 border-noche/30 bg-crema p-4 text-center">
                <span className="text-xs font-bold text-noche/60">Brújula Doodle de Ruta</span>
                <div className="my-4 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                    className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-noche bg-white shadow-comic"
                  >
                    <span className="text-2xl">🧭</span>
                  </motion.div>
                </div>
                <span className="text-xs font-bold text-noche">Orientación: Hacia el Norte</span>
              </div>
            </div>

            {/* Scrubber de Huella de Neumático */}
            <div className="border-t-2 border-dashed border-noche/20 pt-4">
              <div className="flex items-center justify-between text-xs font-bold text-noche">
                <span>🏁 Buenos Aires (Km 0)</span>
                <span className="chip bg-atardecer text-white">{sliderVal}% COMPLETADO</span>
                <span>🏔️ Machu Picchu (Meta)</span>
              </div>

              <div className="mt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderVal}
                  onChange={(e) => setSliderVal(Number(e.target.value))}
                  className="timeline-range"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
