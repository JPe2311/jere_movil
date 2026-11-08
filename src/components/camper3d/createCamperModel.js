import * as THREE from 'three';

/**
 * Genera la textura de pintura artística con las montañas en pinceladas azules
 * idéntica a la furgoneta real de Jere (Toyota Hilux con gráfica de pinceladas).
 */
function createMountainLiveryTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Fondo crema / off-white de la carrocería del camper
  ctx.fillStyle = '#FBF8EE';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Función para dibujar trazos de pincel grueso / espátula
  function drawBrushStroke(x1, y1, x2, y2, width, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Salpicaduras / cerdas del pincel
    for (let i = 0; i < 6; i++) {
      const offset = (Math.random() - 0.5) * width * 0.9;
      ctx.lineWidth = width * (0.1 + Math.random() * 0.2);
      ctx.beginPath();
      ctx.moveTo(x1 + offset, y1 + (Math.random() - 0.5) * 10);
      ctx.lineTo(x2 + offset, y2 + (Math.random() - 0.5) * 10);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Pinceladas en azul oscuro (#1A365D), azul medio (#2B6CB0), celeste glaciar (#63B3ED) y blanco
  const navy = '#1A365D';
  const denim = '#2B6CB0';
  const sky = '#63B3ED';
  const white = '#FFFFFF';

  // Montaña principal (triángulo artístico de trazos)
  const strokes = [
    // Picos base azul marino
    { x1: 200, y1: 420, x2: 360, y2: 140, w: 55, c: navy },
    { x1: 240, y1: 440, x2: 400, y2: 120, w: 60, c: navy },
    { x1: 280, y1: 450, x2: 440, y2: 150, w: 50, c: navy },
    { x1: 340, y1: 450, x2: 480, y2: 180, w: 45, c: navy },

    // Relleno denim / cian
    { x1: 220, y1: 380, x2: 380, y2: 160, w: 40, c: denim },
    { x1: 270, y1: 400, x2: 420, y2: 170, w: 45, c: denim },
    { x1: 320, y1: 410, x2: 460, y2: 210, w: 35, c: denim },

    // Luces celestes glaciares
    { x1: 260, y1: 340, x2: 390, y2: 180, w: 25, c: sky },
    { x1: 300, y1: 360, x2: 430, y2: 200, w: 28, c: sky },
    { x1: 350, y1: 390, x2: 470, y2: 230, w: 22, c: sky },

    // Nieve y brillo blanco con técnica de pincel seco
    { x1: 380, y1: 200, x2: 410, y2: 130, w: 18, c: white },
    { x1: 395, y1: 220, x2: 425, y2: 145, w: 14, c: white },
    { x1: 320, y1: 280, x2: 350, y2: 210, w: 16, c: white },

    // Pinceladas menores en la parte delantera (alcoba / capuchina)
    { x1: 720, y1: 260, x2: 820, y2: 160, w: 35, c: navy },
    { x1: 740, y1: 250, x2: 835, y2: 175, w: 28, c: denim },
    { x1: 760, y1: 240, x2: 840, y2: 190, w: 18, c: sky },
    { x1: 800, y1: 190, x2: 825, y2: 165, w: 12, c: white },
  ];

  strokes.forEach((s) => drawBrushStroke(s.x1, s.y1, s.x2, s.y2, s.w, s.c));

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Crea el modelo 3D detallado de "La Bebi":
 * Pick-up Toyota Hilux con módulo camper de techo extendido (alcoba) y livery de montaña.
 */
export function createHiluxCamperModel() {
  const root = new THREE.Group();
  root.name = 'LaBebi_HiluxCamper';

  // --- Materiales ---
  const hiluxWhite = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.1,
  });

  const mountainTexture = createMountainLiveryTexture();
  const camperCreamSide = new THREE.MeshStandardMaterial({
    map: mountainTexture,
    roughness: 0.45,
    metalness: 0.05,
  });

  const camperCreamPlain = new THREE.MeshStandardMaterial({
    color: 0xfbf8ee,
    roughness: 0.45,
    metalness: 0.05,
  });

  const blackSkirt = new THREE.MeshStandardMaterial({
    color: 0x1f242e,
    roughness: 0.8,
    metalness: 0.2,
  });

  const darkTrim = new THREE.MeshStandardMaterial({
    color: 0x16191f,
    roughness: 0.7,
  });

  const windowGlass = new THREE.MeshPhysicalMaterial({
    color: 0x152238,
    roughness: 0.1,
    transmission: 0.6,
    thickness: 0.5,
    transparent: true,
    opacity: 0.85,
  });

  const tireRubber = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9,
  });

  const steelRim = new THREE.MeshStandardMaterial({
    color: 0xd8dde3,
    roughness: 0.35,
    metalness: 0.8,
  });

  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xfffee0,
    emissive: 0xffea75,
    emissiveIntensity: 0.8,
    roughness: 0.1,
  });

  const taillightMat = new THREE.MeshStandardMaterial({
    color: 0xcc1100,
    emissive: 0xcc1100,
    emissiveIntensity: 0.6,
  });

  // ==========================================
  // 1. CABINA TOYOTA HILUX (Frente blanco)
  // ==========================================
  const cabGroup = new THREE.Group();
  cabGroup.name = 'Hilux_Cab';

  // Capó / Trompa
  const hoodGeo = new THREE.BoxGeometry(1.7, 0.45, 1.4);
  const hood = new THREE.Mesh(hoodGeo, hiluxWhite);
  hood.position.set(0, 0.75, 1.7);
  hood.castShadow = true;
  hood.receiveShadow = true;
  cabGroup.add(hood);

  // Paragolpes delantero Hilux
  const bumperGeo = new THREE.BoxGeometry(1.72, 0.35, 0.3);
  const bumper = new THREE.Mesh(bumperGeo, darkTrim);
  bumper.position.set(0, 0.45, 2.45);
  bumper.castShadow = true;
  cabGroup.add(bumper);

  // Parrilla frontal
  const grillGeo = new THREE.BoxGeometry(1.3, 0.25, 0.05);
  const grill = new THREE.Mesh(grillGeo, darkTrim);
  grill.position.set(0, 0.75, 2.42);
  cabGroup.add(grill);

  // Faros delanteros Hilux
  const headlightGeo = new THREE.BoxGeometry(0.3, 0.18, 0.06);
  const hlLeft = new THREE.Mesh(headlightGeo, headlightMat);
  hlLeft.position.set(-0.62, 0.77, 2.41);
  cabGroup.add(hlLeft);

  const hlRight = hlLeft.clone();
  hlRight.position.x = 0.62;
  cabGroup.add(hlRight);

  // Cabina de pasajeros (puertas y techo bajo la alcoba)
  const cabBodyGeo = new THREE.BoxGeometry(1.68, 0.9, 1.25);
  const cabBody = new THREE.Mesh(cabBodyGeo, hiluxWhite);
  cabBody.position.set(0, 1.05, 0.55);
  cabBody.castShadow = true;
  cabGroup.add(cabBody);

  // Parabrisas inclinado
  const windshieldGeo = new THREE.BoxGeometry(1.46, 0.6, 0.08);
  const windshield = new THREE.Mesh(windshieldGeo, windowGlass);
  windshield.position.set(0, 1.18, 1.12);
  windshield.rotation.x = -Math.PI * 0.16;
  cabGroup.add(windshield);

  // Ventanas laterales cabina
  const sideWinGeo = new THREE.BoxGeometry(0.05, 0.42, 0.85);
  const sideWinLeft = new THREE.Mesh(sideWinGeo, windowGlass);
  sideWinLeft.position.set(-0.85, 1.2, 0.55);
  cabGroup.add(sideWinLeft);

  const sideWinRight = sideWinLeft.clone();
  sideWinRight.position.x = 0.85;
  cabGroup.add(sideWinRight);

  // Espejos retrovisores
  const mirrorGeo = new THREE.BoxGeometry(0.16, 0.12, 0.2);
  const mirrorLeft = new THREE.Mesh(mirrorGeo, darkTrim);
  mirrorLeft.position.set(-0.95, 1.1, 1.05);
  cabGroup.add(mirrorLeft);

  const mirrorRight = mirrorLeft.clone();
  mirrorRight.position.x = 0.95;
  cabGroup.add(mirrorRight);

  // Manijas de puerta negras
  const handleGeo = new THREE.BoxGeometry(0.04, 0.05, 0.12);
  const handleLeft = new THREE.Mesh(handleGeo, darkTrim);
  handleLeft.position.set(-0.86, 0.95, 0.45);
  cabGroup.add(handleLeft);

  const handleRight = handleLeft.clone();
  handleRight.position.x = 0.86;
  cabGroup.add(handleRight);

  root.add(cabGroup);

  // ==========================================
  // 2. MÓDULO CAMPER / CASA RODANTE ("La Bebi")
  // ==========================================
  const camperGroup = new THREE.Group();
  camperGroup.name = 'Camper_LivingModule';

  // Caja principal habitable (montada en la caja de la camioneta)
  // Dimensiones: ancho 1.95m, alto 1.65m, largo 2.4m
  const camperBodyGeo = new THREE.BoxGeometry(1.95, 1.65, 2.4);
  // Asignar materiales por cara: lados con livery de montaña, frente/techo crema liso
  const camperBodyMaterials = [
    camperCreamSide, // derecha (+X)
    camperCreamSide, // izquierda (-X)
    camperCreamPlain, // arriba (+Y)
    camperCreamPlain, // abajo (-Y)
    camperCreamPlain, // frente (+Z)
    camperCreamPlain, // atrás (-Z)
  ];
  const camperBody = new THREE.Mesh(camperBodyGeo, camperBodyMaterials);
  camperBody.position.set(0, 1.62, -0.9);
  camperBody.castShadow = true;
  camperBody.receiveShadow = true;
  camperGroup.add(camperBody);

  // Alcoba sobre la cabina (la proyección delantera sobre el techo de la Hilux)
  const alcoveGeo = new THREE.BoxGeometry(1.92, 0.95, 1.3);
  const alcove = new THREE.Mesh(alcoveGeo, camperBodyMaterials);
  alcove.position.set(0, 1.95, 0.75);
  alcove.castShadow = true;
  camperGroup.add(alcove);

  // Chaflán aerodinámico delantero de la alcoba
  const wedgeGeo = new THREE.CylinderGeometry(0.96, 0.96, 0.95, 4, 1, false, 0, Math.PI);
  wedgeGeo.rotateZ(Math.PI / 2);
  wedgeGeo.rotateY(Math.PI / 2);
  const alcoveNose = new THREE.Mesh(wedgeGeo, camperCreamPlain);
  alcoveNose.position.set(0, 1.95, 1.4);
  alcoveNose.scale.set(1, 0.7, 0.35);
  camperGroup.add(alcoveNose);

  // Ventana frontal pequeña de la alcoba
  const alcoveWinGeo = new THREE.BoxGeometry(0.65, 0.35, 0.05);
  const alcoveWin = new THREE.Mesh(alcoveWinGeo, windowGlass);
  alcoveWin.position.set(0, 2.05, 1.43);
  camperGroup.add(alcoveWin);

  // Ventana lateral del camper (marco negro + vidrio grande)
  const camperWinFrameGeo = new THREE.BoxGeometry(0.06, 0.65, 1.05);
  const camperWinLeft = new THREE.Mesh(camperWinFrameGeo, darkTrim);
  camperWinLeft.position.set(-0.99, 1.8, -0.6);
  camperGroup.add(camperWinLeft);

  const camperGlassGeo = new THREE.BoxGeometry(0.08, 0.55, 0.95);
  const camperGlassLeft = new THREE.Mesh(camperGlassGeo, windowGlass);
  camperGlassLeft.position.set(-0.99, 1.8, -0.6);
  camperGroup.add(camperGlassLeft);

  // Puerta de entrada lateral (lado derecho como en la foto)
  const doorFrameGeo = new THREE.BoxGeometry(0.04, 1.35, 0.68);
  const doorFrame = new THREE.Mesh(doorFrameGeo, darkTrim);
  doorFrame.position.set(0.99, 1.48, -0.15);
  camperGroup.add(doorFrame);

  const doorPanelGeo = new THREE.BoxGeometry(0.05, 1.3, 0.62);
  const doorPanel = new THREE.Mesh(doorPanelGeo, hiluxWhite);
  doorPanel.position.set(0.99, 1.48, -0.15);
  camperGroup.add(doorPanel);

  // Ventanita redondeada de la puerta
  const doorWinGeo = new THREE.BoxGeometry(0.07, 0.42, 0.28);
  const doorWin = new THREE.Mesh(doorWinGeo, windowGlass);
  doorWin.position.set(0.99, 1.72, -0.15);
  camperGroup.add(doorWin);

  // Manija / cerrojo de la puerta
  const doorLockGeo = new THREE.BoxGeometry(0.08, 0.1, 0.06);
  const doorLock = new THREE.Mesh(doorLockGeo, darkTrim);
  doorLock.position.set(1.0, 1.35, 0.08);
  camperGroup.add(doorLock);

  // Faldón inferior negro con compartimentos portaobjetos
  const skirtGeo = new THREE.BoxGeometry(1.94, 0.4, 2.4);
  const skirt = new THREE.Mesh(skirtGeo, blackSkirt);
  skirt.position.set(0, 0.65, -0.9);
  camperGroup.add(skirt);

  // Portaequipajes superior con barras negras tubulares
  const railGeo = new THREE.BoxGeometry(0.05, 0.12, 3.4);
  const railLeft = new THREE.Mesh(railGeo, darkTrim);
  railLeft.position.set(-0.9, 2.52, -0.2);
  camperGroup.add(railLeft);

  const railRight = railLeft.clone();
  railRight.position.x = 0.9;
  camperGroup.add(railRight);

  // Escalera trasera hacia el techo
  const ladderGroup = new THREE.Group();
  for (let step = 0; step < 5; step++) {
    const rungGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35);
    rungGeo.rotateZ(Math.PI / 2);
    const rung = new THREE.Mesh(rungGeo, darkTrim);
    rung.position.set(0.55, 1.2 + step * 0.22, -2.13);
    ladderGroup.add(rung);
  }
  camperGroup.add(ladderGroup);

  // Luces traseras
  const taillightGeo = new THREE.BoxGeometry(0.12, 0.35, 0.05);
  const tlLeft = new THREE.Mesh(taillightGeo, taillightMat);
  tlLeft.position.set(-0.85, 0.75, -2.12);
  camperGroup.add(tlLeft);

  const tlRight = tlLeft.clone();
  tlRight.position.x = 0.85;
  camperGroup.add(tlRight);

  root.add(camperGroup);

  // ==========================================
  // 3. RUEDAS OFF-ROAD (4 ruedas con giro)
  // ==========================================
  const wheels = [];
  const wheelPositions = [
    { x: -0.86, y: 0.38, z: 1.55 }, // Delantera izquierda
    { x: 0.86, y: 0.38, z: 1.55 },  // Delantera derecha
    { x: -0.88, y: 0.38, z: -1.05 }, // Trasera izquierda
    { x: 0.88, y: 0.38, z: -1.05 },  // Trasera derecha
  ];

  wheelPositions.forEach((pos, idx) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(pos.x, pos.y, pos.z);

    // Neumático
    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.26, 20);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, tireRubber);
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Llanta de acero
    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.27, 16);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, steelRim);
    wheelGroup.add(rim);

    // Taza central negra
    const hubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.28, 12);
    hubGeo.rotateZ(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, darkTrim);
    wheelGroup.add(hub);

    root.add(wheelGroup);
    wheels.push(wheelGroup);
  });

  // Sombras generales y escala equilibrada para Leaflet y visor
  root.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  // Retornar objeto con helpers de animación
  return {
    root,
    wheels,
    spinWheels(speed = 0.1) {
      wheels.forEach((w) => {
        w.children.forEach((c) => {
          c.rotation.x += speed;
        });
      });
    },
    setHeading(radians) {
      root.rotation.y = radians;
    },
  };
}
