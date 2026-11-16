import Presupuestador from '@/components/publicidad/Presupuestador';
import FormatosYoutube from '@/components/publicidad/FormatosYoutube';
import headerImg from '../../../header.png';

export const metadata = {
  title: 'Publicidad · Jere Móvil',
  description:
    'Sumate a la comunidad viajera: integraciones en YouTube, redes, furgoneta y web. Armá tu presupuesto a medida.',
};

const TINTA = '#1E2433';
const GRIS = '#5A6275';

const METRICAS = [
  { valor: '33.500', label: 'Suscriptores', color: '#E31E24' },
  { valor: '800.000', label: 'Vistas por mes', color: '#F37021' },
  { valor: '149.000', label: 'Seguidores en redes', color: '#F25287' },
  { valor: '5', label: 'Países recorridos', color: '#2B9E63' },
];

const PILARES = [
  {
    titulo: 'Integración orgánica',
    texto:
      'El producto se usa en escenas reales del viaje: se ve, se prueba y se recomienda de verdad.',
  },
  {
    titulo: 'Audiencia viajera y fiel',
    texto:
      'Una comunidad que sigue la ruta capítulo a capítulo y participa en todos nuestros productos.',
  },
  {
    titulo: 'Tres espacios',
    texto: 'Videos, redes y la furgoneta conviven en una misma historia de marca.',
  },
];

const FORMATOS = [
  {
    id: 'apertura',
    tiempo: '10-15 seg',
    nombre: 'Mención de apertura',
    texto: 'La marca se nombra en la introducción del capítulo.',
  },
  {
    id: 'integracion',
    tiempo: '~1 min',
    nombre: 'Integración orgánica',
    texto: 'El producto se usa en una escena real del viaje. Es el formato de mayor impacto.',
    destacado: 'MAYOR IMPACTO',
  },
  {
    id: 'banner',
    tiempo: '10-15 seg',
    nombre: 'Banner en pantalla',
    texto:
      'Logo o gráfico discreto. Cuatro opciones: banner de apertura (10 seg en la introducción), de integración (todo el minuto de la integración), central (15 seg a mitad del capítulo) y de cierre (10 seg junto al “Agradecemos a…”).',
  },
  {
    id: 'creditos',
    tiempo: '10 seg',
    nombre: 'Agradecimiento en créditos',
    texto: '“Agradecemos a…” con logo, nombre y link de la marca.',
  },
  {
    id: 'link',
    tiempo: 'Permanente',
    nombre: 'Link en descripción y comentario fijado',
    texto:
      'Queda mientras el video esté publicado. Puede incluir código de descuento o la web de la marca.',
  },
];

const ESPACIOS = [
  {
    titulo: 'Posts y stories en redes',
    texto: 'Publicaciones y stories con mención de la marca y link.',
    emoji: '📱',
    color: '#F25287',
  },
  {
    titulo: 'Marca en la furgoneta',
    texto:
      'Calco o logo de la marca visible en la furgoneta durante la ruta: se ve en cada escena y cada foto.',
    emoji: '🚐',
    color: '#2B9E63',
  },
  {
    titulo: 'Banner / sección en la web',
    texto: 'Espacio de marca dentro de la bitácora y el mapa interactivo, con link directo.',
    emoji: '💻',
    color: '#2997D8',
  },
];

const PASOS = [
  { nombre: 'Brief', texto: 'Objetivo, producto y fechas de la marca.' },
  { nombre: 'Propuesta y guion', texto: 'Armamos la integración y la aprobamos juntos.' },
  { nombre: 'Rodaje y publicación', texto: 'Se graba en ruta y se publica en el capítulo.' },
  { nombre: 'Reporte', texto: 'Vistas, alcance y clics del link.' },
];

const CONTACTOS = [
  { red: 'EMAIL', valor: 'jeremovil@gmail.com', href: 'mailto:jeremovil@gmail.com', color: '#F8C630', texto: TINTA },
  { red: 'WHATSAPP', valor: '+54 9 3517 51-8953', href: 'https://wa.me/5493517518953', color: '#2B9E63', texto: '#FFFFFF' },
  { red: 'INSTAGRAM', valor: '@jerefijo', href: 'https://www.instagram.com/jerefijo/', color: '#F25287', texto: '#FFFFFF' },
  { red: 'YOUTUBE', valor: 'youtube.com/@JereMovil', href: 'https://youtube.com/@JereMovil', color: '#F37021', texto: '#FFFFFF' },
  { red: 'WEB', valor: 'jere-movil.ar', href: 'https://jere-movil.ar', color: '#2997D8', texto: '#FFFFFF' },
];

function Badge({ children, color = '#F37021' }) {
  return (
    <span
      className="inline-flex items-center rounded-full border-2 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide"
      style={{ borderColor: TINTA, backgroundColor: color, color: '#FFFFFF' }}
    >
      {children}
    </span>
  );
}

function TituloSeccion({ badge, color, titulo, children }) {
  return (
    <div className="mb-6">
      <Badge color={color}>{badge}</Badge>
      <h2 className="font-kit mt-3 text-3xl font-bold leading-tight sm:text-4xl">{titulo}</h2>
      {children && <div className="mt-2 text-base font-semibold" style={{ color: GRIS }}>{children}</div>}
    </div>
  );
}

export default function PublicidadPage() {
  return (
    <div className="font-kit-body bg-[#FDF6E7] text-[#1E2433]">
      {/* ================= HERO ================= */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${headerImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.14,
          }}
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-8 sm:pt-14 relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo_jere.png"
              alt="Jere Móvil"
              className="h-24 w-24 rounded-full border-[3px] border-[#1E2433] bg-white object-contain p-1 shadow-[4px_4px_0_0_#1E2433]"
            />
            <div className="mt-5">
              <Badge color={TINTA}>MEDIA KIT 2026</Badge>
            </div>
            <h1 className="font-kit mt-4 max-w-3xl text-4xl font-bold uppercase leading-[0.95] sm:text-6xl">
              Sistema de promoción en{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Jere Móvil</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 z-0 h-3 -rotate-1 sm:h-4"
                  style={{ backgroundColor: '#F8C630' }}
                />
              </span>
            </h1>
            <p className="mt-4 text-lg font-bold sm:text-xl" style={{ color: GRIS }}>
              Acompañame en este viaje • Sumate a la comunidad
            </p>
          </div>
        </div>
        <div className="zigzag-yellow" aria-hidden />
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-8">
        {/* ================= 01. QUIÉN SOY ================= */}
        <section id="quien-soy">
          <TituloSeccion badge="01. Quién soy" color="#E31E24" titulo="Hola, soy Jere" />

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <p className="text-base font-semibold leading-relaxed" style={{ color: GRIS }}>
                Viajo en mi furgoneta por Latinoamérica, desde Córdoba (Km 0), y realizo el vlog de
                todos estos viajes en videos en YouTube, por mis redes sociales para una comunidad
                hermosa que me sigue capítulo a capítulo.
              </p>
              <p className="text-base font-semibold leading-relaxed" style={{ color: GRIS }}>
                Una marca que se suma a este viaje no se ve como un aviso: se vuelve parte de la
                ruta. Tu producto aparece en escenas reales de mi vida diaria, en las redes y en la
                propia furgoneta.
              </p>

              <blockquote className="rounded-2xl border-[3px] border-[#1E2433] bg-[#FFF9EC] p-5 shadow-[4px_4px_0_0_#1E2433]">
                <p className="font-kit text-lg font-bold leading-snug">
                  “Cada marca que se suma a esta aventura se vuelve parte del viaje: acá se prueba
                  de verdad, kilómetro a kilómetro.”
                </p>
                <footer className="mt-2 text-sm font-extrabold" style={{ color: GRIS }}>
                  — Jere
                </footer>
              </blockquote>
            </div>

            <div className="grid grid-cols-2 gap-3 self-start">
              {METRICAS.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border-[3px] border-[#1E2433] bg-white p-4 shadow-[4px_4px_0_0_#1E2433]"
                  style={{ borderTopColor: m.color, borderTopWidth: 6 }}
                >
                  <p className="font-kit text-2xl font-bold leading-none sm:text-3xl">{m.valor}</p>
                  <p className="mt-1 text-xs font-extrabold uppercase tracking-wide" style={{ color: GRIS }}>
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t-2 border-dashed border-[#CBD5E1] pt-8">
            <h3 className="font-kit mb-4 text-xl font-bold">Por qué auspiciar el viaje</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {PILARES.map((p, i) => (
                <div
                  key={p.titulo}
                  className="rounded-2xl border-[3px] border-[#1E2433] bg-white p-5 shadow-[4px_4px_0_0_#1E2433]"
                >
                  <span
                    className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#1E2433] font-kit text-sm font-bold text-white"
                    style={{ backgroundColor: ['#F37021', '#F25287', '#2997D8'][i] }}
                  >
                    {i + 1}
                  </span>
                  <h4 className="mt-3 font-kit text-lg font-bold">{p.titulo}</h4>
                  <p className="mt-1 text-sm font-semibold leading-relaxed" style={{ color: GRIS }}>
                    {p.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 02. YOUTUBE ================= */}
        <section id="youtube">
          <TituloSeccion
            badge="02. YouTube"
            color="#E31E24"
            titulo="Integraciones dentro del video"
          />

          <FormatosYoutube formatos={FORMATOS} />
        </section>

        {/* ================= 03. MÁS ALLÁ DEL VIDEO ================= */}
        <section id="mas-alla">
          <TituloSeccion
            badge="03. Más allá del video"
            color="#E31E24"
            titulo="Redes, furgoneta y web"
          />

          <div className="grid gap-4 md:grid-cols-3">
            {ESPACIOS.map((e) => (
              <div
                key={e.titulo}
                className="rounded-2xl border-[3px] border-[#1E2433] bg-white p-5 shadow-[4px_4px_0_0_#1E2433]"
                style={{ borderLeftColor: e.color, borderLeftWidth: 8 }}
              >
                <span className="text-2xl" aria-hidden>
                  {e.emoji}
                </span>
                <h3 className="mt-2 font-kit text-lg font-bold">{e.titulo}</h3>
                <p className="mt-1 text-sm font-semibold leading-relaxed" style={{ color: GRIS }}>
                  {e.texto}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border-[3px] border-[#1E2433] bg-white p-5 shadow-[4px_4px_0_0_#1E2433]">
            <h3 className="font-kit mb-4 text-xl font-bold">Cómo trabajamos</h3>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PASOS.map((p, i) => (
                <li key={p.nombre} className="border-t-2 border-dashed border-[#CBD5E1] pt-3">
                  <span
                    className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#1E2433] font-kit text-xs font-bold"
                    style={{ backgroundColor: '#F8C630' }}
                  >
                    {i + 1}
                  </span>
                  <p className="mt-2 font-kit text-base font-bold">{p.nombre}</p>
                  <p className="text-xs font-semibold" style={{ color: GRIS }}>
                    {p.texto}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ================= 04. PAQUETES Y PRESUPUESTO ================= */}
        <section id="paquetes" className="scroll-mt-20">
          <TituloSeccion
            badge="04. Elegí tu ruta"
            color="#F37021"
            titulo="Paquetes y servicios"
          >
            Paquetes y servicios con precios claros.{' '}
            <a href="#contacto" className="font-extrabold text-[#1E2433] underline">
              Escribinos para armar tu propuesta →
            </a>
          </TituloSeccion>

          <Presupuestador />
        </section>

        {/* ================= 05. CONTACTO ================= */}
        <section
          id="contacto"
          className="scroll-mt-20 rounded-3xl border-[3px] border-[#1E2433] bg-white p-6 shadow-[6px_6px_0_0_#1E2433] sm:p-8"
        >
          <Badge color="#E31E24">05. Contacto</Badge>
          <h2 className="font-kit mt-3 text-3xl font-bold uppercase leading-tight sm:text-4xl">
            ¡Vamos a rodar juntos!
          </h2>
          <p className="mt-2 max-w-2xl text-base font-semibold" style={{ color: GRIS }}>
            Contanos qué querés comunicar y armamos una integración a medida para tu marca.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {CONTACTOS.map((c) => (
              <a
                key={c.red}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#1E2433] px-3 py-1.5 text-xs font-extrabold shadow-[2px_2px_0_0_#1E2433] transition hover:brightness-105"
                style={{ backgroundColor: c.color, color: c.texto }}
              >
                <span className="uppercase tracking-wide">{c.red}</span>
                <span className="font-semibold normal-case">{c.valor}</span>
              </a>
            ))}
          </div>

          <div className="mt-7 border-t-2 border-dashed border-[#CBD5E1] pt-5">
            <p className="font-kit text-lg font-bold">Próximos pasos</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                ['Contanos', 'Tu producto y tus objetivos'],
                ['Propuesta', 'Armamos el formato ideal'],
                ['¡A rodar!', 'Se graba y se publica'],
              ].map(([t, d], i) => (
                <div key={t} className="rounded-xl border-2 border-[#1E2433] bg-[#FFF9EC] p-3">
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full border-2 border-[#1E2433] font-kit text-[11px] font-bold"
                    style={{ backgroundColor: ['#F8C630', '#2997D8', '#2B9E63'][i], color: i === 0 ? TINTA : '#FFF' }}
                  >
                    {i + 1}
                  </span>
                  <p className="mt-1 font-kit text-sm font-bold">{t}</p>
                  <p className="text-xs font-semibold" style={{ color: GRIS }}>
                    {d}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center font-kit text-lg font-bold">Gracias por sumarte a la ruta 🚐</p>
        </section>
      </main>
    </div>
  );
}
