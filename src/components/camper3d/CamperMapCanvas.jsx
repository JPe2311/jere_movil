'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createHiluxCamperModel } from './createCamperModel';

/**
 * Renderiza el modelo 3D de "La Bebi" en tiempo real dentro del marcador de Leaflet.
 * Gira hacia el ángulo del trayecto (heading/rumbo) y hace girar las ruedas al avanzar.
 */
export default function CamperMapCanvas({ heading = 0, isMoving = false, onClick }) {
  const containerRef = useRef(null);
  const headingRef = useRef(heading);
  const isMovingRef = useRef(isMoving);

  useEffect(() => {
    headingRef.current = heading;
  }, [heading]);

  useEffect(() => {
    isMovingRef.current = isMoving;
  }, [isMoving]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = 110;
    const height = 110;

    // Escena y Cámara isométrica inclinada
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4.5, 4.2, 5.0);
    camera.lookAt(0, 1.2, 0);

    // Renderer WebGL transparente
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xfff6e8, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5d6, 2.2);
    sunLight.position.set(6, 12, 6);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x8bc34a, 0.6);
    rimLight.position.set(-6, 4, -6);
    scene.add(rimLight);

    // Modelo de La Bebi
    const camper = createHiluxCamperModel();
    scene.add(camper.root);

    // Animación continua
    let animationFrameId;
    let clock = new THREE.Clock();
    let currentYaw = (headingRef.current * Math.PI) / 180;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Suavizado del giro hacia el rumbo del trayecto
      const targetYaw = (headingRef.current * Math.PI) / 180;
      let diff = targetYaw - currentYaw;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      currentYaw += diff * 0.12;

      camper.setHeading(currentYaw);

      // Si está en movimiento, girar ruedas y balanceo de suspensión
      if (isMovingRef.current) {
        camper.spinWheels(0.18);
        camper.root.position.y = Math.sin(time * 12) * 0.04;
        camper.root.rotation.z = Math.sin(time * 8) * 0.02;
      } else {
        // En reposo, rebote suave caricaturesco
        camper.root.position.y = Math.sin(time * 2.5) * 0.02;
        camper.root.rotation.z = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
      title="🚐 ¡Click para inspeccionar La Bebi en 3D 360°!"
      style={{ width: 110, height: 110 }}
    />
  );
}
