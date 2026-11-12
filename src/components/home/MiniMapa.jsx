'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Mini mapa que muestra la última ubicación cargada.
 * Úsalo en la página principal para mostrar dónde está La Bebi ahora.
 */
export default function MiniMapa({ latitud, longitud, titulo }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!latitud || !longitud) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      zoom: 13,
      center: [latitud, longitud],
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([latitud, longitud]).addTo(map);
    marker.bindPopup(`<b>${titulo || 'Última ubicación'}</b>`).openPopup();

    markerRef.current = marker;

    return () => {
      map.remove();
    };
  }, [latitud, longitud]);

  return (
    <div
      ref={mapRef}
      className="w-full aspect-square rounded-2xl border-[3px] border-noche shadow-comic overflow-hidden"
    />
  );
}
