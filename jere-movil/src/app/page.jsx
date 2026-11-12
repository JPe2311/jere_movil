'use client';

import dynamic from 'next/dynamic';

import HeroSlider from '@/components/home/HeroSlider';
import InstagramFeed from '@/components/home/InstagramFeed';
import UltimoVideo from '@/components/home/UltimoVideo';
import ContactoForm from '@/components/home/ContactoForm';

// Leaflet toca `window` al importarse, así que este mapa se carga solo en el navegador.
const MiniMapa = dynamic(() => import('@/components/home/MiniMapa'), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-square w-full items-center justify-center rounded-2xl border-[3px] border-noche shadow-comic">
      <span className="text-sm font-semibold text-noche/60">Cargando mapa…</span>
    </div>
  ),
});

export default function HomePage() {
  const slides = [
    {
      titulo: '¡Bienvenidos a Jere Móvil!',
      descripcion: 'Recorriendo América en La Bebi, nuestra casa sobre ruedas.',
      emoji: '🚐',
      imagen: 'https://images.unsplash.com/photo-1469854523076-882547143777?w=1200&h=600&fit=crop',
      etiqueta: 'Inicio',
    },
    {
      titulo: 'La Bebi en la ruta',
      descripcion: 'Noches de acampada y paisajes inolvidables en el camino.',
      imagen: 'https://images.unsplash.com/photo-1506905925366-2e255474e445?w=1200&h=600&fit=crop',
      etiqueta: 'La Bebi',
    },
    {
      titulo: 'Montañas del Norte',
      descripcion: 'Cruzando los Andes hacia Chile y Bolivia.',
      imagen: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=600&fit=crop',
      etiqueta: 'Montañas',
    },
    {
      titulo: 'Atardeceres de viaje',
      descripcion: 'Cada día termina con un espectáculo único en el horizonte.',
      imagen: 'https://images.unsplash.com/photo-1470770753741-de97c97e2a16?w=1200&h=600&fit=crop',
      etiqueta: 'Paisajes',
    },
  ];

  return (
    <div className="min-h-screen bg-crema text-noche">
      <main className="pt-8 pb-12 px-4 sm:px-8 lg:px-[150px]">
        {/* Hero Slider */}
        <section className="mb-12">
          <HeroSlider slides={slides} />
        </section>

        {/* Último video */}
        <UltimoVideo />

        {/* Instagram */}
        <InstagramFeed cuenta="jerefijo" cantidad={6} />

        {/* Contacto y Mapa Mini */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ContactoForm />
          <MiniMapa latitud={-24.7} longitud={-65.4} titulo="Última ubicación: Villa de Soto" />
        </div>
      </main>

      <footer className="border-t-[2px] border-noche bg-sol py-8 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo_jere.png" alt="Logo Jere Móvil" className="h-6 w-6 object-contain" />
              <span className="font-display text-lg font-extrabold text-noche">Jere Móvil</span>
            </div>
            <p className="text-sm text-noche/70 text-center md:text-left">
              Bitácora de viaje interactiva · Viajar con La Bebi por América
            </p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/jerefijo/" target="_blank" rel="noopener noreferrer" className="text-noche/60 hover:text-noche transition">
                Instagram
              </a>
              <a href="https://www.youtube.com/@JereMovil" target="_blank" rel="noopener noreferrer" className="text-noche/60 hover:text-noche transition">
                YouTube
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
