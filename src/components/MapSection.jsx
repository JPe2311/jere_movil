'use client';

import dynamic from 'next/dynamic';

// Leaflet usa `window`, así que el mapa se carga solo en el navegador.
const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-crema">
      <div className="card-comic animate-bounceSoft px-5 py-3 font-display text-lg font-bold">🚐 …</div>
    </div>
  ),
});

export default function MapSection() {
  return <InteractiveMap />;
}
