'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as THREE from 'three';
import { animate, motion, useMotionValue } from 'framer-motion';
import { useCollection } from '@/lib/useCollection';
import { demoPuntos } from '@/lib/demoData';
import { toMillis } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import TimelineSlider from './TimelineSlider';
import CitySearch from './CitySearch';
import MilestoneModal from './MilestoneModal';
import CamperModalViewer from './camper3d/CamperModalViewer';
import { createHiluxCamperModel } from './camper3d/createCamperModel';

const DAY = 86_400_000;

// Proveedores de mapas 100% Open Source de la comunidad OpenStreetMap (CERO API Keys necesarias)
const OPEN_SOURCE_MAPS = {
  osm: {
    name: 'OpenStreetMap Oficial (100% Libre)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  hot: {
    name: 'OSM Humanitario (Cálido & Aventura)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; HOT',
    subdomains: 'abc',
    maxZoom: 19,
  },
  topo: {
    name: 'OpenTopoMap (Relieve & Andes)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; OpenTopoMap',
    subdomains: 'abc',
    maxZoom: 17,
  },
  cyclosm: {
    name: 'CyclOSM (Caminos y Rutas)',
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; CyclOSM',
    subdomains: 'abc',
    maxZoom: 18,
  },
};

/**
 * Calcula el rumbo geográfico en grados (0° = Norte, 90° = Este, 180° = Sur, 270° = Oeste)
 */
function calculateHeading(p1, p2) {
  if (!p1 || !p2) return 0;
  const dLat = p2.lat - p1.lat;
  const dLng = p2.lng - p1.lng;
  let angleDeg = (Math.atan2(dLng, dLat) * 180) / Math.PI;
  if (angleDeg < 0) angleDeg += 360;
  return angleDeg;
}

/** Posición y rumbo de La Bebi en el instante ts, interpolando entre puntos de la ruta. */
function positionAt(puntos, ts) {
  const last = puntos[puntos.length - 1];
  if (ts <= puntos[0].ts) {
    const next = puntos[1] || puntos[0];
    return { lat: puntos[0].lat, lng: puntos[0].lng, idx: 0, heading: calculateHeading(puntos[0], next) };
  }
  if (ts >= last.ts) {
    const prev = puntos[puntos.length - 2] || last;
    return { lat: last.lat, lng: last.lng, idx: puntos.length - 1, heading: calculateHeading(prev, last) };
  }
  let i = 0;
  while (i < puntos.length - 2 && puntos[i + 1].ts <= ts) i += 1;
  const a = puntos[i];
  const b = puntos[i + 1];
  const f = (ts - a.ts) / (b.ts - a.ts || 1);
  return {
    lat: a.lat + (b.lat - a.lat) * f,
    lng: a.lng + (b.lng - a.lng) * f,
    idx: i,
    heading: calculateHeading(a, b),
  };
}

export default function InteractiveMap() {
  const { t } = useI18n();
  const { items, loading } = useCollection('puntos_mapa', 'fechaHora', 'asc');
  const [nowMs] = useState(() => Date.now());

  const isDemo = !loading && items.length === 0;

  // Mapa Open Source seleccionado por defecto: OpenStreetMap Oficial (Cero API Keys)
  const [mapStyle, setMapStyle] = useState('osm');
  const [show3DModal, setShow3DModal] = useState(false);

  // Puntos ordenados cronológicamente
  const puntos = useMemo(() => {
    if (loading) return [];
    const src = items.length ? items : demoPuntos;
    return src
      .map((p) => ({ ...p, ts: toMillis(p.fechaHora) }))
      .filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.lat) && Number.isFinite(p.lng))
      .sort((a, b) => a.ts - b.ts);
  }, [items, loading]);

  // Rango del timeline
  const { start, end } = useMemo(() => {
    if (!puntos.length) return { start: 0, end: 1 };
    const s = puntos[0].ts;
    const e = Math.max(nowMs, puntos[puntos.length - 1].ts);
    return { start: s, end: e === s ? s + 1 : e };
  }, [puntos, nowMs]);

  const progress = useMotionValue(1);
  const [current, setCurrent] = useState({ idx: 0, day: 1, ts: start });
  const [selectedId, setSelectedId] = useState(null);
  const [playing, setPlaying] = useState(false);

  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersRef = useRef({});
  const animRef = useRef(null);

  // Referencias para el render 3D WebGL en tiempo real sobre el mapa
  const threeRef = useRef(null);
  const targetYawRef = useRef(Math.PI);
  const isDrivingRef = useRef(false);

  /* ---------- 1) Crear mapa Leaflet Open Source ---------- */
  useEffect(() => {
    const map = L.map(mapEl.current, { zoomControl: false, worldCopyJump: true, minZoom: 2 }).setView([-15, -68], 4);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const cfg = OPEN_SOURCE_MAPS[mapStyle] || OPEN_SOURCE_MAPS.osm;
    const tileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: cfg.subdomains || 'abc',
      maxZoom: cfg.maxZoom,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  /* ---------- 1.1) Cambio dinámico de capa Open Source ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }
    const cfg = OPEN_SOURCE_MAPS[mapStyle] || OPEN_SOURCE_MAPS.osm;
    tileLayerRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: cfg.subdomains || 'abc',
      maxZoom: cfg.maxZoom,
    }).addTo(map);
  }, [mapStyle]);

  /* ---------- Helpers de animación ---------- */
  const stop = useCallback(() => {
    animRef.current?.stop();
    animRef.current = null;
    setPlaying(false);
    isDrivingRef.current = false;
  }, []);

  const tweenTo = useCallback(
    (p, duration = 1.2) => {
      stop();
      const target = Math.min(1, Math.max(0, (p.ts - start) / (end - start)));
      isDrivingRef.current = true;
      animRef.current = animate(progress, target, {
        duration,
        ease: 'easeInOut',
        onComplete: () => {
          isDrivingRef.current = false;
        },
      });
    },
    [progress, start, end, stop]
  );

  const pick = useCallback(
    (id, { fly = true } = {}) => {
      const p = puntos.find((x) => x.id === id);
      if (!p) return;
      tweenTo(p);
      setSelectedId(id);
      const map = mapRef.current;
      if (fly && map) map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 6), { duration: 1.4 });
    },
    [puntos, tweenTo]
  );

  const pickRef = useRef(pick);
  useEffect(() => {
    pickRef.current = pick;
  }, [pick]);

  /* ---------- 2) Capas: Ruta, Hitos y Camioneta 3D Real (Three.js WebGL) ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !puntos.length) return undefined;

    const latlngs = puntos.map((p) => [p.lat, p.lng]);
    const full = L.polyline(latlngs, {
      color: '#1F2A44', weight: 4, opacity: 0.25, dashArray: '2 10', lineCap: 'round',
    }).addTo(map);
    const done = L.polyline([], {
      color: '#FF7A3D', weight: 6, opacity: 0.95, lineCap: 'round', lineJoin: 'round',
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    puntos.forEach((p, i) => {
      const icon = L.divIcon({
        className: '',
        html: `<div class="hito-pin">${i + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([p.lat, p.lng], { icon, title: p.ciudad || p.titulo })
        .on('click', () => pickRef.current(p.id, { fly: false }))
        .addTo(group);
    });

    // Marcador con contenedor para el lienzo Three.js 3D
    const bebiIcon = L.divIcon({
      className: '',
      html: `
        <div id="bebi-marker-wrapper" style="width:130px;height:130px;position:relative;cursor:pointer;" title="🚐 La Bebi 3D • Toyota Hilux Camper (¡Click para rotar 360°!)">
          <div id="bebi-three-canvas-slot" style="width:130px;height:130px;pointer-events:none;"></div>
          <div style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);background:#1F2A44;color:#FFC93C;font-family:'Baloo 2',sans-serif;font-size:10px;font-weight:900;padding:2px 8px;border-radius:999px;border:2px solid #FFC93C;white-space:nowrap;box-shadow:2px 2px 0 #1F2A44;pointer-events:none;">
            🚐 La Bebi 3D
          </div>
        </div>
      `,
      iconSize: [130, 130],
      iconAnchor: [65, 85],
    });

    const bebi = L.marker(latlngs[0], { icon: bebiIcon, zIndexOffset: 1000, interactive: true }).addTo(map);
    bebi.on('click', () => setShow3DModal(true));

    layersRef.current = { done, bebi };
    map.fitBounds(L.latLngBounds(latlngs).pad(0.25), { maxZoom: 6 });

    // Inicializar el motor 3D WebGL de Three.js dentro del marcador de Leaflet
    let threeInstance = null;
    let animFrameId = null;

    const setupThreeOnMarker = () => {
      const slot = document.getElementById('bebi-three-canvas-slot');
      if (!slot) return;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(130, 130);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      // Cámara elevada con perspectiva isométrica que mira al centro de la camioneta
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0, 5.8, 5.0);
      camera.lookAt(0, 0.85, 0);

      // Iluminación solar exterior y ambiente
      const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.8);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xfffae0, 2.6);
      sunLight.position.set(6, 14, 6);
      sunLight.castShadow = true;
      scene.add(sunLight);

      const fillLight = new THREE.DirectionalLight(0x7eb3e6, 0.8);
      fillLight.position.set(-6, 6, -6);
      scene.add(fillLight);

      // Modelo 3D de La Bebi (Toyota Hilux con módulo camper y pintura de montaña)
      const camper = createHiluxCamperModel();
      scene.add(camper.root);

      slot.innerHTML = '';
      slot.appendChild(renderer.domElement);

      threeInstance = {
        renderer,
        scene,
        camera,
        camper,
        currentYaw: Math.PI,
      };
      threeRef.current = threeInstance;

      // Loop de render continuo en 3D
      let clock = new THREE.Clock();
      const loop = () => {
        animFrameId = requestAnimationFrame(loop);
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        if (threeRef.current) {
          const { camper: c, currentYaw, renderer: r, scene: sc, camera: cam } = threeRef.current;
          const target = targetYawRef.current;

          // Interpolación suave del ángulo yaw (giro horizontal en 3D)
          let diff = target - currentYaw;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          threeRef.current.currentYaw += diff * 0.18;

          c.setHeading(threeRef.current.currentYaw);

          // Si avanza por la ruta, girar neumáticos y amortiguación de suspensión
          if (isDrivingRef.current) {
            c.spinWheels(0.18);
            c.root.position.y = Math.sin(time * 12) * 0.04;
          } else {
            c.root.position.y = Math.sin(time * 2.5) * 0.015;
          }

          r.render(sc, cam);
        }
      };
      loop();
    };

    // Dar tiempo mínimo a que Leaflet inserte el DOM
    const timer = setTimeout(setupThreeOnMarker, 120);

    return () => {
      clearTimeout(timer);
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (threeInstance?.renderer) {
        threeInstance.renderer.dispose();
      }
      threeRef.current = null;
      full.remove();
      done.remove();
      group.remove();
      bebi.remove();
      layersRef.current = {};
    };
  }, [puntos]);

  /* ---------- 3) El timeline mueve y GIRA en 3D a La Bebi ---------- */
  const update = useCallback(
    (frac) => {
      const { done, bebi } = layersRef.current;
      if (!bebi || !puntos.length) return;
      const ts = start + frac * (end - start);
      const pos = positionAt(puntos, ts);
      bebi.setLatLng([pos.lat, pos.lng]);

      // IMPORTANTE:
      // En Three.js, la rotación 3D es sobre el eje Y (yaw vertical).
      // Las ruedas SIEMPRE están en el suelo (Y=0) y el techo arriba.
      // Calculamos el yaw para que el frente de la Hilux apunte exactamente a la carretera:
      if (Number.isFinite(pos.heading)) {
        targetYawRef.current = Math.PI - (pos.heading * Math.PI) / 180;
      }

      const path = puntos.slice(0, pos.idx + 1).map((p) => [p.lat, p.lng]);
      path.push([pos.lat, pos.lng]);
      done.setLatLngs(path);

      const day = Math.floor((ts - start) / DAY) + 1;
      setCurrent((prev) => (prev.idx === pos.idx && prev.day === day ? prev : { idx: pos.idx, day, ts }));
    },
    [puntos, start, end]
  );

  useEffect(() => {
    update(progress.get());
    return progress.on('change', update);
  }, [progress, update]);

  /* ---------- Controles de reproducción ---------- */
  const togglePlay = () => {
    if (playing) {
      stop();
      return;
    }
    let from = progress.get();
    if (from >= 0.999) {
      progress.set(0);
      from = 0;
    }
    setPlaying(true);
    isDrivingRef.current = true;
    animRef.current = animate(progress, 1, {
      duration: Math.max(4, (1 - from) * 30),
      ease: 'linear',
      onComplete: () => {
        setPlaying(false);
        isDrivingRef.current = false;
      },
    });
  };

  const scrub = (v) => {
    stop();
    isDrivingRef.current = true;
    progress.set(v);
    setTimeout(() => {
      isDrivingRef.current = false;
    }, 200);
  };

  useEffect(() => () => animRef.current?.stop(), []);

  const selected = puntos.find((p) => p.id === selectedId) || null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={mapEl} className="absolute inset-0 z-0" />

      {/* Buscador de ciudades */}
      <div className="absolute left-3 right-3 top-3 z-[1000] sm:left-5 sm:right-auto sm:w-96">
        <CitySearch puntos={puntos} onSelect={(p) => pick(p.id)} />
      </div>

      {/* Botonera superior derecha: Mapa Open Source & Visor 3D */}
      <div className="absolute right-3 top-3 z-[1000] flex flex-wrap items-center justify-end gap-2 sm:right-5">
        {/* Selector de capa Open Source (Sin API Key) */}
        <div className="flex items-center gap-1.5 rounded-full border-2 border-noche bg-white/95 px-3 py-1 text-xs font-black shadow-comic-sm backdrop-blur-sm">
          <span>🗺️</span>
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            className="cursor-pointer bg-transparent font-display font-extrabold text-noche outline-none"
            aria-label="Selector de mapa Open Source"
          >
            <option value="osm">🌍 OpenStreetMap Oficial (100% Libre)</option>
            <option value="hot">☀️ OSM Humanitario (Cálido)</option>
            <option value="topo">🏔️ OpenTopoMap (Relieve &amp; Andes)</option>
            <option value="cyclosm">🚲 CyclOSM (Rutas de Aventura)</option>
          </select>
        </div>

        {/* Botón para abrir el Visor 3D Interactivo de La Bebi */}
        <button
          type="button"
          onClick={() => setShow3DModal(true)}
          className="btn btn-sol text-xs py-1 px-3 shadow-comic-sm hover:scale-105 active:scale-95 transition-transform"
        >
          🚐 La Bebi 3D (360°)
        </button>

        {isDemo && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full border-2 border-noche bg-rosa px-3 py-1 text-xs font-extrabold text-white shadow-comic-sm"
          >
            🧪 {t('map_demo')}
          </motion.div>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 z-[1000] grid place-items-center bg-crema/70">
          <div className="card-comic px-5 py-3 font-display text-lg font-bold">🚐 {t('loading')}</div>
        </div>
      )}

      {/* Timeline inferior */}
      {puntos.length > 0 && (
        <TimelineSlider
          progress={progress}
          puntos={puntos}
          start={start}
          end={end}
          current={current}
          playing={playing}
          onPlay={togglePlay}
          onScrub={scrub}
          onPick={(id) => pick(id)}
        />
      )}

      {/* Modal de Hito / Parada */}
      <MilestoneModal punto={selected} onClose={() => setSelectedId(null)} />

      {/* Modal Visor 3D de "La Bebi" con Three.js */}
      <CamperModalViewer isOpen={show3DModal} onClose={() => setShow3DModal(false)} />
    </div>
  );
}
