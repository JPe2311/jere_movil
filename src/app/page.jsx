'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

import InstagramFeed from '@/components/home/InstagramFeed';
import UltimoVideo from '@/components/home/UltimoVideo';
import ContactoForm from '@/components/home/ContactoForm';

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-crema text-noche">
      {/* Navbar superior simplificada */}
      <header className="fixed top-0 w-full z-[1000] bg-sol/90 backdrop-blur-sm border-b-[2px] border-noche">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/logo_jere.png" alt="Logo Jere Móvil" className="h-8 w-8 object-contain" />
              <span className="font-display text-xl font-extrabold text-noche">Jere Móvil</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="border-2 border-noche bg-white px-3 py-1 text-xs font-extrabold rounded-full shadow-comic-sm">
                Inicio
              </a>
              <a href="/mapa" className="border-2 border-noche bg-white px-3 py-1 text-xs font-extrabold rounded-full shadow-comic-sm">
                Mapa
              </a>
              <a href="/quien-soy" className="border-2 border-noche bg-white px-3 py-1 text-xs font-extrabold rounded-full shadow-comic-sm">
                Quién soy
              </a>
              <a href="/redes" className="border-2 border-noche bg-white px-3 py-1 text-xs font-extrabold rounded-full shadow-comic-sm">
                Mis redes
              </a>
              <a href="/admin" className="border-2 border-noche bg-rosa px-3 py-1 text-xs font-extrabold text-white rounded-full shadow-comic-sm">
                Admin
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-[150px]">
        {/* Hero Banner */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full aspect-video overflow-hidden rounded-2xl border-[3px] border-noche shadow-comic bg-crema"
          >
            <img
              src="https://images.unsplash.com/photo-1469854523076-882547143777?w=1200&h=600&fit=crop"
              alt="Jere Móvil - Bitácora de viaje"
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.85)' }}
            />
            <div className="absolute inset-0 flex items-end justify-between p-6 sm:p-8">
              <div className="text-noche">
                <span className="inline-block rounded-full border-2 border-noche bg-sol px-3 py-1 text-xs font-extrabold text-white mb-2">
                  🚐 Bienvenido
                </span>
                <h1 className="font-display text-4xl font-extrabold text-white">
                  Bienvenido a Jere Móvil
                </h1>
                <p className="text-lg font-semibold text-white mt-2 max-w-md">
                  Recorriendo América en La Bebi, nuestra casa sobre ruedas.
                </p>
              </div>
              <a
                href="/mapa"
                className="flex items-center gap-2 px-5 py-2 rounded-full border-2 border-noche bg-sol text-white font-extrabold text-sm shadow-comic-sm hover:bg-yellow-300 transition-transform active:scale-95"
              >
                Ir al mapa →
              </a>
            </div>
          </motion.div>
        </section>

        {/* Último video */}
        <UltimoVideo />

        {/* Instagram */}
        <InstagramFeed cuenta="jerefijo" cantidad={6} />

        {/* Sección de contacto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ContactoForm />
          <div className="card-comic p-6 sm:p-8 rounded-2xl border-[3px] border-noche shadow-comic flex flex-col items-center justify-center h-96">
            <div className="text-4xl mb-4" aria-hidden>🗺️</div>
            <h3 className="font-display text-xl font-extrabold text-noche mb-2">
              Mapa en vivo
            </h3>
            <p className="text-sm text-noche/70 text-center">
              Ver el mapa interactivo con la ubicación actual de La Bebi.
            </p>
            <a
              href="/mapa"
              className="mt-4 inline-block rounded-full border-2 border-noche bg-sol text-white font-bold text-sm px-6 py-2 shadow-comic-sm hover:bg-yellow-300"
            >
              Ir al mapa →
            </a>
          </div>
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
