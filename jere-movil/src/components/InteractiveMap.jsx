'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as THREE from 'three';
import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollection } from '@/lib/useCollection';
import { demoPuntos } from '@/lib/demoData';
import { formatDateTime, toMillis } from '@/lib/utils';
import { CATEGORIAS_PUNTOS, LISTA_CATEGORIAS } from '@/lib/categories';
import { ordenarPuntos } from '@/lib/orden';
import { embedDeYouTube } from '@/lib/enVivo';
import { useI18n } from '@/lib/i18n';
import { buildFullRoadPath } from '@/lib/routing';
import TimelineSlider from './TimelineSlider';
import CitySearch from './CitySearch';
import MilestoneModal from './MilestoneModal';
import CamperModalViewer from './camper3d/CamperModalViewer';
import { createHiluxCamperModel } from './camper3d/createCamperModel';

const DAY = 86_400_000;

/** Categoría de un punto (los puntos viejos sin categoría se consideran "importante"). */
const catDe = (p) => (CATEGORIAS_PUNTOS[p?.categoria] ? p.categoria : 'importante');

// Proveedores de mapas 100% Open Source de la comunidad OpenStreetMap (CERO API Keys)
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

/** Ícono visible de cada tipo de mapa (el select queda transparente encima). */
const MAP_STYLE_ICONS = {
  osm: '🌍',
  hot: '☀️',
  topo: '🏔️',
  cyclosm: '🚲',
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

/** Calcula posición y ángulo sobre la carretera real */
function positionOnRoad(roadPath, frac) {
  if (!roadPath || roadPath.length === 0) return null;
  if (roadPath.length === 1) return { lat: roadPath[0][0], lng: roadPath[0][1], heading: 0, baseIdx: 0 };

  const maxIdx = roadPath.length - 1;
  const floatIdx = Math.max(0, Math.min(maxIdx, frac * maxIdx));
  const baseIdx = Math.floor(floatIdx);
  const rem = floatIdx - baseIdx;

  const a = roadPath[baseIdx];
  const b = roadPath[Math.min(baseIdx + 1, maxIdx)];

  const lat = a[0] + (b[0] - a[0]) * rem;
  const lng = a[1] + (b[1] - a[1]) * rem;

  const heading = calculateHeading({ lat: a[0], lng: a[1] }, { lat: b[0], lng: b[1] });
  return { lat, lng, heading, baseIdx };
}

/** Posición entre hitos (usada como fallback mientras carga la carretera) */
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
  const { t, lang } = useI18n();
  const { items, loading } = useCollection('puntos_mapa', 'fechaHora', 'asc');
  const [nowMs] = useState(() => Date.now());

  const isDemo = !loading && items.length === 0;

  // Mapa Open Source seleccionado por defecto (100% Libre sin API Key)
  const [mapStyle, setMapStyle] = useState('osm');
  const [show3DModal, setShow3DModal] = useState(false);
  const [roadPath, setRoadPath] = useState([]);
  const [roadLoading, setRoadLoading] = useState(false);

  // Puntos en orden cronológico (manda la fecha: así viajan la ruta y el timeline)
  const puntos = useMemo(() => {
    if (loading) return [];
    const src = items.length ? items : demoPuntos;
    return src
      .map((p) => ({ ...p, ts: toMillis(p.fechaHora) }))
      .filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.lat) && Number.isFinite(p.lng))
      .sort((a, b) => a.ts - b.ts);
  }, [items, loading]);

  // Números de la bitácora (orden efectivo: `orden` si todos lo tienen, si no la fecha)
  const numeros = useMemo(() => {
    const m = new Map();
    ordenarPuntos(puntos).forEach((p, i) => m.set(p.id, i + 1));
    return m;
  }, [puntos]);

  // Filtros por categoría (todos activos por defecto)
  const [activas, setActivas] = useState(() => new Set(LISTA_CATEGORIAS.map((c) => c.id)));
  const visibles = useMemo(() => puntos.filter((p) => activas.has(catDe(p))), [puntos, activas]);
  const conteo = useMemo(() => {
    const m = {};
    puntos.forEach((p) => {
      const k = catDe(p);
      m[k] = (m[k] || 0) + 1;
    });
    return m;
  }, [puntos]);

  const toggleCat = useCallback((id) => {
    setElegir(null);
    setActivas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const activarTodas = useCallback(() => {
    setElegir(null);
    setActivas(new Set(LISTA_CATEGORIAS.map((c) => c.id)));
  }, []);

  // ---------- Evento EN VIVO (seguimiento del admin en tiempo real) ----------
  const { items: eventos } = useCollection('eventos_en_vivo', 'inicio', 'asc');
  const enVivo = useMemo(() => {
    const activos = eventos.filter((e) => e?.estado === 'activo');
    return activos.length ? activos[activos.length - 1] : null;
  }, [eventos]);

  const [track, setTrack] = useState([]);
  useEffect(() => {
    if (!db || !enVivo?.id) {
      setTrack([]);
      return undefined;
    }
    const q = query(collection(db, 'eventos_en_vivo', enVivo.id, 'track'), orderBy('ts', 'asc'));
    return onSnapshot(
      q,
      (snap) => setTrack(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error('[en vivo]', err)
    );
  }, [enVivo?.id]);

  // Pines encimados: un solo botón que abre el selector de eventos
  const [elegir, setElegir] = useState(null);
  // Ref para rastrear si el click fue en el stack (evita que el mapa lo cierre)
  const clickEnStack = useRef(false);

  // ---------- Objetivos en el mapa (bandera 🏁) ----------
  const { items: objetivos, loading: objetivosLoading } = useCollection('objetivos', 'creado', 'desc');
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

  // Velocidad del recorrido animado: 0.5× (lento) … 4× (rápido)
  const VELOCIDADES = [0.5, 1, 2, 4];
  const [velocidad, setVelocidad] = useState(1);
  const velocidadRef = useRef(1);
  useEffect(() => {
    velocidadRef.current = velocidad;
  }, [velocidad]);

  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersRef = useRef({});
  const animRef = useRef(null);

  // Referencias para el render 3D WebGL en tiempo real sobre el mapa
  const threeRef = useRef(null);
  const targetYawRef = useRef(Math.PI);
  const isDrivingRef = useRef(false);
  const roadPathRef = useRef([]);

  /* ---------- 0) Obtener la carretera real (OSRM libre) que une las ciudades ---------- */
  useEffect(() => {
    if (!puntos.length) {
      setRoadPath([]);
      roadPathRef.current = [];
      return;
    }
    let cancelled = false;
    setRoadLoading(true);

    buildFullRoadPath(puntos).then((coords) => {
      if (cancelled) return;
      if (coords && coords.length > 0) {
        setRoadPath(coords);
        roadPathRef.current = coords;

        // Si la capa ya existe en el mapa, actualizar el trazado con las curvas reales
        if (layersRef.current.full) {
          layersRef.current.full.setLatLngs(coords);
        }
      }
      setRoadLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [puntos]);

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
        // A mayor velocidad, el salto a un punto también es más rápido
        duration: duration / velocidadRef.current,
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
      setElegir(null);
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

  /* ---------- 2) Capas: Carretera Real, Hitos y Camioneta 3D ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !puntos.length) return undefined;

    // Trazado inicial: si la carretera real ya está cargada se usa roadPath, si no los puntos directos temporalmente
    const latlngs = roadPath.length > 0 ? roadPath : puntos.map((p) => [p.lat, p.lng]);

    // Trazado completo de la carretera (línea punteada)
    const full = L.polyline(latlngs, {
      color: '#1F2A44', weight: 4, opacity: 0.35, dashArray: '4 8', lineCap: 'round',
    }).addTo(map);

    // Trazado recorrido (línea naranja viva continua)
    const done = L.polyline([], {
      color: '#FF7A3D', weight: 6, opacity: 0.95, lineCap: 'round', lineJoin: 'round',
    }).addTo(map);

    // Marcador con contenedor para el lienzo Three.js 3D
    const bebiIcon = L.divIcon({
      className: '',
      html: `
        <div id="bebi-marker-wrapper" style="width:130px;height:130px;position:relative;cursor:pointer;">
          <div id="bebi-three-canvas-slot" style="width:130px;height:130px;pointer-events:none;"></div>
        </div>
      `,
      iconSize: [130, 130],
      iconAnchor: [65, 85],
    });

    const bebi = L.marker(latlngs[0], { icon: bebiIcon, zIndexOffset: 1000, interactive: true }).addTo(map);
    bebi.on('click', () => setShow3DModal(true));

    layersRef.current = { done, bebi, full };
    map.fitBounds(L.latLngBounds(puntos.map((p) => [p.lat, p.lng])).pad(0.25), { maxZoom: 6 });

    // Inicializar el motor 3D WebGL de Three.js
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
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0, 5.8, 5.0);
      camera.lookAt(0, 0.85, 0);

      const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.8);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xfffae0, 2.6);
      sunLight.position.set(6, 14, 6);
      sunLight.castShadow = true;
      scene.add(sunLight);

      const fillLight = new THREE.DirectionalLight(0x7eb3e6, 0.8);
      fillLight.position.set(-6, 6, -6);
      scene.add(fillLight);

      const camper = createHiluxCamperModel();
      // Escala reducida para que La Bebi entre COMPLETA dentro del
      // contenedor de 130px (al girar, las esquinas no se cortan).
      camper.root.scale.setScalar(0.6);
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

      let clock = new THREE.Clock();
      const loop = () => {
        animFrameId = requestAnimationFrame(loop);
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        if (threeRef.current) {
          const { camper: c, currentYaw, renderer: r, scene: sc, camera: cam } = threeRef.current;
          const target = targetYawRef.current;

          let diff = target - currentYaw;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          threeRef.current.currentYaw += diff * 0.18;

          c.setHeading(threeRef.current.currentYaw);

          if (isDrivingRef.current) {
            c.spinWheels(0.2);
            c.root.position.y = Math.sin(time * 12) * 0.04;
          } else {
            c.root.position.y = Math.sin(time * 2.5) * 0.015;
          }

          r.render(sc, cam);
        }
      };
      loop();
    };

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
      bebi.remove();
      layersRef.current = {};
    };
  }, [puntos, roadPath]);

  /* ---------- 2.1) Pines de la bitácora: agrupa los que quedan encimados ---------- */
  const [grupos, setGrupos] = useState([]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !visibles.length) {
      setGrupos([]);
      return undefined;
    }

    // Agrupa los pines que caen a menos de 40px uno del otro (varía con el zoom)
    // Así los puntos cercanos se muestran como un solo botón con número
    const calcular = () => {
      const salida = [];
      visibles.forEach((p) => {
        const pt = map.latLngToContainerPoint([p.lat, p.lng]);
        const g = salida.find((x) => Math.hypot(x.x - pt.x, x.y - pt.y) < 40);
        if (g) g.puntos.push(p);
        else salida.push({ x: pt.x, y: pt.y, puntos: [p] });
      });
      setGrupos(salida);
    };

    calcular();
    map.on('moveend', calcular);
    map.on('zoomend', calcular);
    return () => {
      map.off('moveend', calcular);
      map.off('zoomend', calcular);
    };
  }, [visibles]);

  /* ---------- 2.1.1) Dibuja los pines (o un botón stack si hay encimados) ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !grupos.length) return undefined;

    const group = L.layerGroup().addTo(map);
    map.on('click', (e) => {
      // Solo cerrar si el click NO fue en el stack de pines
      if (!clickEnStack.current) {
        setElegir(null);
      }
      clickEnStack.current = false;
    });

    grupos.forEach((g) => {
      // Un solo punto: el pin de siempre
      if (g.puntos.length === 1) {
        const p = g.puntos[0];
        const cat = CATEGORIAS_PUNTOS[catDe(p)] || CATEGORIAS_PUNTOS.importante;
        const n = numeros.get(p.id) ?? 0;
        const sel = p.id === selectedId;
        const icon = L.divIcon({
          className: '',
          html: `<div class="hito-pin${sel ? ' is-sel' : ''}" style="background:${cat.pinBg};color:${cat.textColor}">${n}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker([p.lat, p.lng], {
          icon,
          title: `${n}. ${cat.emoji} ${p.ciudad || p.titulo || ''}`,
          zIndexOffset: sel ? 400 : 0,
        })
          .on('click', () => pickRef.current(p.id, { fly: false }))
          .addTo(group);
        return;
      }

      // Varios puntos encimados: un solo botón que abre el selector
      const latlng = map.containerPointToLatLng([g.x, g.y]);
      const icon = L.divIcon({
        className: '',
        html: `<div class="hito-pin hito-stack" style="font-size:16px; font-weight:900;">${g.puntos.length}</div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });
      L.marker(latlng, {
        icon,
        title: `${g.puntos.length} puntos juntos — hacé clic para elegir`,
        zIndexOffset: 500,
      })
        .on('click', (e) => {
          clickEnStack.current = true;
          setElegir({ puntos: g.puntos });
        })
        .addTo(group);
    });

    return () => {
      map.off('click');
      group.remove();
    };
  }, [grupos, numeros, selectedId]);

  /* ---------- 2.2) Objetivos en el mapa: bandera 🏁 ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !objetivos?.length) return undefined;

    const layer = L.layerGroup().addTo(map);
    const cerrarAgregar = () => setAgregandoObjetivo(false);

    objetivos.forEach((o) => {
      if (!Number.isFinite(o?.lat) || !Number.isFinite(o?.lng)) return;
      const icon = L.divIcon({
        className: '',
        html: `<div class="objetivo-pin" style="font-size:20px; line-height:1;">🏁</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });
      const marker = L.marker([o.lat, o.lng], {
        icon,
        title: `🏁 ${o.titulo || 'Objetivo'}`,
        zIndexOffset: 600,
      })
        .on('click', () => {
          map.flyTo([o.lat, o.lng], Math.max(map.getZoom(), 7), { duration: 1 });
        })
        .addTo(layer);

      // Popup con info del objetivo
      marker.bindPopup(
        `<div style="min-width:180px;">
          <div style="font-weight:800; font-family:'Baloo 2',sans-serif;">🏁 ${o.titulo || 'Objetivo'}</div>
          ${o.descripcion ? `<div style="font-size:0.9rem; margin-top:4px; color:#1F2A44;">${o.descripcion}</div>` : ''}
          <div style="margin-top:6px; font-size:0.75rem; color:#1F2A44/70;">
            ${o.lat.toFixed(4)}, ${o.lng.toFixed(4)}
          </div>
        </div>`
      );
    });

    // Modo agregar objetivo: deshabilitado (se gestiona desde /admin)
    
    return () => {
      layer.remove();
    };
  }, [objetivos]);

  /* ---------- 2.3) Evento en vivo: recorrido en tiempo real del admin ---------- */
  const panVivoRef = useRef(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !enVivo) return undefined;

    const coords = track
      .filter((p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng))
      .map((p) => [p.lat, p.lng]);
    const posActual =
      Number.isFinite(enVivo?.lat) && Number.isFinite(enVivo?.lng)
        ? [enVivo.lat, enVivo.lng]
        : null;
    const lineas = coords.length ? coords : posActual ? [posActual] : [];
    if (!lineas.length) return undefined;

    const layer = L.layerGroup().addTo(map);

    if (lineas.length > 1) {
      // Sombra debajo + línea punteada "seguimiento"
      L.polyline(lineas, { color: '#1F2A44', weight: 9, opacity: 0.18 }).addTo(layer);
      L.polyline(lineas, {
        color: '#FF3B6B',
        weight: 5,
        opacity: 0.95,
        dashArray: '1 12',
        lineCap: 'round',
      }).addTo(layer);
    }

    const latlng = lineas[lineas.length - 1];
    L.marker(latlng, {
      icon: L.divIcon({
        className: '',
        html: '<div class="live-pin"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
      zIndexOffset: 700,
      title: `📍 ${enVivo.titulo || 'En vivo'}`,
    }).addTo(layer);

    // Centra el mapa solo la primera vez que aparece cada evento
    if (panVivoRef.current !== enVivo.id) {
      panVivoRef.current = enVivo.id;
      map.panTo(latlng, { animate: true, duration: 0.9 });
    }

    return () => {
      layer.remove();
    };
  }, [enVivo, track]);

  /* ---------- 3) El timeline mueve a La Bebi siguiendo las curvas de la carretera ---------- */
  const update = useCallback(
    (frac) => {
      const { done, bebi } = layersRef.current;
      if (!bebi || !puntos.length) return;

      const rPath = roadPathRef.current;
      let pos;

      if (rPath && rPath.length > 1) {
        // Posición exacta sobre la carretera real
        pos = positionOnRoad(rPath, frac);
        bebi.setLatLng([pos.lat, pos.lng]);

        const completedRoad = rPath.slice(0, pos.baseIdx + 1).concat([[pos.lat, pos.lng]]);
        done.setLatLngs(completedRoad);
      } else {
        // Fallback mientras carga la carretera
        const ts = start + frac * (end - start);
        pos = positionAt(puntos, ts);
        bebi.setLatLng([pos.lat, pos.lng]);

        const path = puntos.slice(0, pos.idx + 1).map((p) => [p.lat, p.lng]);
        path.push([pos.lat, pos.lng]);
        done.setLatLngs(path);
      }

      // Orientar la camioneta 3D en la dirección de la curva de la carretera
      if (pos && Number.isFinite(pos.heading)) {
        targetYawRef.current = Math.PI - (pos.heading * Math.PI) / 180;
      }

      const ts = start + frac * (end - start);
      const day = Math.floor((ts - start) / DAY) + 1;
      const idx = pos?.idx ?? Math.floor(frac * (puntos.length - 1));
      setCurrent((prev) => (prev.idx === idx && prev.day === day ? prev : { idx, day, ts }));
    },
    [puntos, start, end]
  );

  useEffect(() => {
    update(progress.get());
    return progress.on('change', update);
  }, [progress, update]);

  /* ---------- Controles de reproducción ---------- */
  /** Arranca (o re-arranca desde `from`) el recorrido a la velocidad actual. */
  const reproducir = useCallback(
    (from) => {
      animRef.current?.stop();
      isDrivingRef.current = true;
      setPlaying(true);
      animRef.current = animate(progress, 1, {
        duration: Math.max(4, (1 - from) * 32) / velocidadRef.current,
        ease: 'linear',
        onComplete: () => {
          setPlaying(false);
          isDrivingRef.current = false;
        },
      });
    },
    [progress]
  );

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
    reproducir(from);
  };

  // Si cambia la velocidad mientras se reproduce, se re-arranca desde
  // el punto actual (sin salto ni pérdida de lugar).
  const velPrevRef = useRef(velocidad);
  useEffect(() => {
    if (velPrevRef.current === velocidad) return;
    velPrevRef.current = velocidad;
    if (playing) reproducir(progress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [velocidad]);

  const scrub = (v) => {
    stop();
    isDrivingRef.current = true;
    progress.set(v);
    setTimeout(() => {
      isDrivingRef.current = false;
    }, 200);
  };

  useEffect(() => () => animRef.current?.stop(), []);

  const selected = useMemo(() => {
    const p = puntos.find((x) => x.id === selectedId);
    return p ? { ...p, numero: numeros.get(p.id) ?? null } : null;
  }, [puntos, numeros, selectedId]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={mapEl} className="absolute inset-0 z-0" />

      {/* Panel superior DERECHO: controles, buscador y filtros de la bitácora */}
      <div className="absolute left-3 right-3 top-3 z-[1000] flex flex-col items-end gap-2 sm:left-auto sm:right-5">
        {/* Fila de controles: trazado, tipo de mapa (solo ícono) y modo demo */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Indicador de carretera real cargada */}
          {roadLoading && (
            <div className="rounded-full border-2 border-noche bg-sol px-2.5 py-1 text-[11px] font-black text-noche shadow-comic-sm animate-pulse">
              🛣️ Trazando carreteras...
            </div>
          )}

          {/* Selector de capa Open Source: solo un ícono (el select queda invisible encima) */}
          <div
            className="relative grid h-9 w-9 place-items-center rounded-full border-2 border-noche bg-white/95 text-base shadow-comic-sm backdrop-blur-sm"
            title={OPEN_SOURCE_MAPS[mapStyle]?.name}
          >
            <span aria-hidden>{MAP_STYLE_ICONS[mapStyle] || '🗺️'}</span>
            <select
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Tipo de mapa"
            >
              <option value="osm">🌍 OpenStreetMap Oficial (100% Libre)</option>
              <option value="hot">☀️ OSM Humanitario (Cálido)</option>
              <option value="topo">🏔️ OpenTopoMap (Relieve &amp; Andes)</option>
              <option value="cyclosm">🚲 CyclOSM (Rutas de Aventura)</option>
            </select>
          </div>

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

        {/* Buscador de ciudades (derecha) */}
        <div className="relative z-20 w-full sm:w-96">
          <CitySearch puntos={puntos} onSelect={(p) => pick(p.id)} />
        </div>

        {/* Filtros por categoría de la bitácora (derecha) */}
        <div
          className="relative z-10 flex w-full flex-wrap justify-end gap-1.5 sm:w-96"
          role="group"
          aria-label={t('map_filters')}
        >
          <button
            type="button"
            onClick={activarTodas}
            className={`rounded-full border-2 border-noche px-3 py-1 text-xs font-extrabold shadow-comic-sm backdrop-blur-sm transition ${
              activas.size === LISTA_CATEGORIAS.length ? 'bg-white/95 text-noche' : 'bg-sol text-noche'
            }`}
          >
            🧭 {t('map_all')}
          </button>
          {LISTA_CATEGORIAS.map((c) => {
            const on = activas.has(c.id);
            const n = conteo[c.id] || 0;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCat(c.id)}
                aria-pressed={on}
                title={`${lang === 'en' ? c.nombre_en : c.nombre} — ${c.desc}`}
                className={`rounded-full border-2 border-noche px-3 py-1 text-xs font-extrabold shadow-comic-sm backdrop-blur-sm transition ${
                  on ? '' : 'bg-white/70 text-noche/45'
                }`}
                style={on ? { backgroundColor: c.pinBg, color: c.textColor } : undefined}
              >
                {c.emoji} {lang === 'en' ? c.corto_en : c.corto}
                {n > 0 ? ` (${n})` : ''}
              </button>
            );
          })}
        </div>
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
          visibles={visibles}
          numeros={numeros}
          velocidad={velocidad}
          velocidades={VELOCIDADES}
          onVelocidad={setVelocidad}
          start={start}
          end={end}
          current={current}
          playing={playing}
          onPlay={togglePlay}
          onScrub={scrub}
          onPick={(id) => pick(id)}
        />
      )}

      {/* Selector de puntos encimados */}
      {elegir && elegir.puntos && elegir.puntos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed z-[2100] flex items-center justify-center bg-noche/70 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card-comic p-5 max-w-sm w-full border-[3px] border-noche shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-extrabold text-noche">
                Elegí punto
              </h3>
              <button
                type="button"
                onClick={() => setElegir(null)}
                className="rounded-full border-2 border-noche bg-white px-2 py-1 text-xs font-bold text-noche"
              >
                ✕
              </button>
            </div>
            <p className="text-sm font-bold text-noche/60 mb-4">
              {elegir.puntos.length} punto{elegir.puntos.length !== 1 ? 's' : ''} en este lugar
            </p>
            <div className="space-y-2">
              {elegir.puntos.map((p) => {
                const cat = CATEGORIAS_PUNTOS[p?.categoria] || CATEGORIAS_PUNTOS.importante;
                const n = numeros.get(p.id) ?? 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      pickRef.current?.(p.id, { fly: false });
                      setElegir(null);
                    }}
                    className="flex items-center gap-3 rounded-xl border-2 border-noche bg-white px-3 py-2 text-sm font-bold text-noche hover:bg-crema transition"
                  >
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-noche bg-white text-xs font-extrabold"
                      style={{
                        backgroundColor: cat.pinBg || '#ffc93c',
                        color: cat.textColor || '#1f2a44',
                      }}
                    >
                      {n}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-extrabold text-sm">
                        {p.titulo || p.ciudad || 'Sin nombre'}
                      </div>
                      <div className="text-xs text-noche/60 truncate">
                        {p.ciudad || ''}
                        {p.pais ? `, ${p.pais}` : ''}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de Hito / Parada */}
      <MilestoneModal punto={selected} onClose={() => setSelectedId(null)} />

      {/* Modal Visor 3D de "La Bebi" con Three.js */}
      <CamperModalViewer isOpen={show3DModal} onClose={() => setShow3DModal(false)} />
    </div>
  );
}
