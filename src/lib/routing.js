/**
 * Servicio de rutas por carretera real utilizando OSRM (Open Source Routing Machine).
 * 100% libre, open source y SIN API KEY.
 * Devuelve la geometría exacta siguiendo las rutas, autopistas y pasos de montaña.
 */

// Cache en memoria para evitar llamadas repetidas
const memoryCache = new Map();

/**
 * Obtiene la ruta por carretera entre dos coordenadas [lat, lng]
 */
export async function getRoadSegment(p1, p2) {
  const cacheKey = `${p1.lat.toFixed(4)},${p1.lng.toFixed(4)}_${p2.lat.toFixed(4)},${p2.lng.toFixed(4)}`;

  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  // Intentar leer de localStorage para persistencia ultra rápida
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`road_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        memoryCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch (_) {}
  }

  try {
    // Llamada a OSRM (Open Source Routing Machine) público y libre
    // OSRM espera: {lng1},{lat1};{lng2},{lat2}
    const url = `https://router.project-osrm.org/route/v1/driving/${p1.lng},${p1.lat};${p2.lng},${p2.lat}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes[0]?.geometry?.coordinates) {
        // OSRM devuelve [lng, lat], convertimos a [lat, lng] para Leaflet
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        memoryCache.set(cacheKey, coords);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`road_${cacheKey}`, JSON.stringify(coords));
          } catch (_) {}
        }
        return coords;
      }
    }
  } catch (err) {
    // Si no hay conexión o falla el servidor OSRM, usamos interpolación de carretera
  }

  // Fallback con curva suave que no sea línea recta plana
  const fallback = generateCurvedFallback(p1, p2);
  memoryCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Genera puntos intermedios con sutil curvatura realista en caso de que no haya internet
 */
function generateCurvedFallback(p1, p2, steps = 15) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Arco parabólico sutil para simular curvatura de ruta
    const curve = Math.sin(t * Math.PI) * 0.15;
    const lat = p1.lat + (p2.lat - p1.lat) * t + curve;
    const lng = p1.lng + (p2.lng - p1.lng) * t - curve * 0.5;
    points.push([lat, lng]);
  }
  return points;
}

/**
 * Construye la trayectoria completa detallada por carretera que une todos los hitos del viaje
 */
export async function buildFullRoadPath(puntos) {
  if (!puntos || puntos.length === 0) return [];
  if (puntos.length === 1) return [[puntos[0].lat, puntos[0].lng]];

  const fullPath = [];

  for (let i = 0; i < puntos.length - 1; i++) {
    const a = puntos[i];
    const b = puntos[i + 1];
    const segment = await getRoadSegment(a, b);

    // Evitar duplicar el punto de unión entre tramos
    if (i > 0 && segment.length > 0) {
      fullPath.push(...segment.slice(1));
    } else {
      fullPath.push(...segment);
    }
  }

  return fullPath;
}
