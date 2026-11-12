'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { createHiluxCamperModel } from './createCamperModel';

export default function CamperModalViewer({ isOpen, onClose }) {
  const containerRef = useRef(null);
  const [isNight, setIsNight] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNight ? 0x0f172a : 0xfdf8ee);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.5, 3.2, 5.5);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(isNight ? 0x1e293b : 0xfffaed, isNight ? 0.6 : 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(isNight ? 0x64748b : 0xfff0c2, isNight ? 1.0 : 2.5);
    dirLight.position.set(8, 14, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Suelo con sombra suave
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Modelo La Bebi Hilux
    const camper = createHiluxCamperModel();
    scene.add(camper.root);

    // Control de rotación con el mouse / touch
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let yaw = Math.PI * 0.25;
    let pitch = 0.4;
    let radius = 7.5;

    const updateCamera = () => {
      pitch = Math.max(0.1, Math.min(Math.PI / 2.2, pitch));
      camera.position.x = radius * Math.cos(pitch) * Math.sin(yaw);
      camera.position.y = radius * Math.sin(pitch) + 0.8;
      camera.position.z = radius * Math.cos(pitch) * Math.cos(yaw);
      camera.lookAt(0, 1.2, 0);
    };
    updateCamera();

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      prevMouseY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;
      prevMouseX = clientX;
      prevMouseY = clientY;

      yaw -= deltaX * 0.008;
      pitch += deltaY * 0.008;
      updateCamera();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      radius = Math.max(3.5, Math.min(12, radius + e.deltaY * 0.005));
      updateCamera();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onMouseDown, { passive: true });
    window.addEventListener('touchmove', onMouseMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isDragging) {
        yaw += 0.4 * delta;
        updateCamera();
      }

      camper.spinWheels(autoRotate ? 0.08 : 0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onMouseDown);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [isOpen, isNight, autoRotate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[4000] grid place-items-center bg-noche/75 p-3 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="card-comic w-full max-w-4xl overflow-hidden bg-white shadow-comic-lg"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b-[3px] border-noche bg-sol px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚐</span>
            <div>
              <h2 className="font-display text-xl font-black">"La Bebi" 3D • Toyota Hilux Camper</h2>
              <p className="text-xs font-bold text-noche/75">Modelo 3D interactivo con la pintura real de montaña</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border-2 border-noche bg-white font-extrabold shadow-comic-sm hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        {/* Visor 3D Canvas */}
        <div className="relative h-[440px] w-full bg-crema">
          <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

          {/* Badge de interacción */}
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border-2 border-noche bg-white/90 px-3 py-1 text-xs font-extrabold shadow-comic-sm backdrop-blur-sm">
            🖱️ Arrastrá para rotar 360° • Rueda para zoom
          </div>

          {/* Controles de vista */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className={`rounded-full border-2 border-noche px-3 py-1 font-display text-xs font-black shadow-comic-sm transition ${
                autoRotate ? 'bg-sol' : 'bg-white'
              }`}
            >
              🔄 {autoRotate ? 'Pausar Giro' : 'Auto Giro'}
            </button>
            <button
              type="button"
              onClick={() => setIsNight(!isNight)}
              className={`rounded-full border-2 border-noche px-3 py-1 font-display text-xs font-black shadow-comic-sm transition ${
                isNight ? 'bg-noche text-white' : 'bg-white text-noche'
              }`}
            >
              {isNight ? '🌙 Modo Noche' : '☀️ Modo Día'}
            </button>
          </div>
        </div>

        {/* Especificaciones de la camper real */}
        <div className="grid grid-cols-2 gap-3 border-t-[3px] border-noche bg-crema p-4 sm:grid-cols-4 text-xs font-bold">
          <div className="rounded-xl border-2 border-noche bg-white p-2 text-center shadow-comic-sm">
            <span className="text-neutral-500">Base</span>
            <div className="font-extrabold text-noche">Toyota Hilux 4x4</div>
          </div>
          <div className="rounded-xl border-2 border-noche bg-white p-2 text-center shadow-comic-sm">
            <span className="text-neutral-500">Módulo</span>
            <div className="font-extrabold text-atardecer">Camper con Alcoba</div>
          </div>
          <div className="rounded-xl border-2 border-noche bg-white p-2 text-center shadow-comic-sm">
            <span className="text-neutral-500">Gráfica</span>
            <div className="font-extrabold text-cielo">Pinceladas Andinas</div>
          </div>
          <div className="rounded-xl border-2 border-noche bg-white p-2 text-center shadow-comic-sm">
            <span className="text-neutral-500">Equipamiento</span>
            <div className="font-extrabold text-monte">Baca, Escalera &amp; Cocina</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
