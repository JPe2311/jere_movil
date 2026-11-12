'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Mini mapa que muestra la última ubicación cargada.
 * El contenedor SIEMPRE se renderiza: Leaflet necesita un nodo real
 * en el DOM cuando se inicializa (si devolvemos un placeholder antes,
 * el ref es null y Leaflet lanza "Map container not found").
 */
export default function MiniMapa({ latitud, longitud, titulo }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || latitud == null || longitud == null) return;

    const map = L.map(container, {
      zoomControl: false,
      attributionControl: false,
      zoom: 13,
      center: [latitud, longitud],
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Ícono propio: evita los PNG por defecto de Leaflet (que dan 404 en Next)
    const icono = L.divIcon({
      className: '',
      html: '<div style="font-size:30px;line-height:1;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))">📍</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 30],
      popupAnchor: [0, -28],
    });

    L.marker([latitud, longitud], { icon: icono })
      .addTo(map)
      .bindPopup(`<b>${titulo || 'Última ubicación'}</b>`)
      .openPopup();

    mapRef.current = map;
    setMapReady(true);

    // El contenedor puede cambiar de tamaño después del montaje.
    const t = setTimeout(() => map.invalidateSize(), 150);

    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
    };
  }, [latitud, longitud, titulo]);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-[3px] border-noche shadow-comic">
      <div ref={containerRef} className="h-full w-full" />
      {!mapReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-crema text-center">
          <span className="text-2xl" aria-hidden>🗺️</span>
          <span className="text-sm font-semibold text-noche/60">Cargando mapa…</span>
        </div>
      )}
    </div>
  );
}
