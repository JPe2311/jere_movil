// Datos de ejemplo: se muestran solo cuando Firestore está vacío o sin configurar.
// Cuando Jere cargue su primer punto desde /admin, estos datos desaparecen solos.

const foto = (seed) => `https://picsum.photos/seed/${seed}/900/600`;

export const demoPuntos = [
  { id: 'demo-1', orden: 1, categoria: 'importante', ciudad: 'Buenos Aires', pais: 'Argentina', lat: -34.6037, lng: -58.3816,
    fechaHora: '2025-03-01T09:00:00', titulo: '¡Arranca la aventura con La Bebi!', titulo_en: 'The adventure begins!',
    descripcion: 'Punto de partida de la travesía. Primer tanque lleno y rumbo a la ruta.',
    descripcion_en: 'Starting point of the trip. First full tank and hitting the road.',
    fotos: [foto('jere1'), foto('jere2')], videoUrl: '' },
  { id: 'demo-2', orden: 2, categoria: 'foto', ciudad: 'Mendoza', pais: 'Argentina', lat: -32.8895, lng: -68.8458,
    fechaHora: '2025-03-12T18:30:00', titulo: 'Atardecer cordillerano entre viñedos', titulo_en: 'Sunset among vineyards',
    descripcion: 'Postal épica con la Cordillera de los Andes de fondo y vino mendocino.',
    descripcion_en: 'Epic postcard with the Andes Mountains in the background.',
    fotos: [foto('jere3')], videoUrl: '' },
  { id: 'demo-3', orden: 3, categoria: 'rara', ciudad: 'Paso Los Libertadores', pais: 'Chile', lat: -32.8277, lng: -70.0814,
    fechaHora: '2025-03-20T12:00:00', titulo: '¡La Bebi tosió a 3.800 metros!', titulo_en: 'La Bebi sputtered at 3,800m!',
    descripcion: 'Situación rara: con la altura faltó oxígeno, pero con paciencia y mate caliente cruzamos como campeones.',
    descripcion_en: 'Strange situation: high altitude oxygen drop, but we pushed through with hot mate.',
    fotos: [], videoUrl: '' },
  { id: 'demo-4', orden: 4, categoria: 'acampada', ciudad: 'San Pedro de Atacama', pais: 'Chile', lat: -22.9087, lng: -68.2,
    fechaHora: '2025-04-02T16:00:00', titulo: 'Acampada libre bajo las estrellas', titulo_en: 'Wild camping under the stars',
    descripcion: 'Noche inolvidable durmiendo en la furgoneta en el cielo más limpio del planeta.',
    descripcion_en: 'Unforgettable night sleeping in the camper van under the clearest sky on earth.',
    fotos: [foto('jere4')], videoUrl: '' },
  { id: 'demo-5', orden: 5, categoria: 'recorrido', ciudad: 'Salar de Uyuni', pais: 'Bolivia', lat: -20.1338, lng: -67.4891,
    fechaHora: '2025-04-20T11:00:00', titulo: 'Navegando el salar infinito', titulo_en: 'Navigating the infinite salt flat',
    descripcion: 'Punto de recorrido clave para conectar Bolivia con Perú.',
    descripcion_en: 'Key waypoint connecting Bolivia to Peru.',
    fotos: [], videoUrl: '' },
  { id: 'demo-6', orden: 6, categoria: 'importante', ciudad: 'Cusco', pais: 'Perú', lat: -13.5319, lng: -71.9675,
    fechaHora: '2025-05-10T10:00:00', titulo: 'Meta lograda: ¡Cusco sagrado!', titulo_en: 'Milestone reached: Sacred Cusco!',
    descripcion: 'Llegamos a la capital incaica tras miles de kilómetros de pura vida rodante.',
    descripcion_en: 'Arrived at the Inca capital after thousands of kilometers on the road.',
    fotos: [], videoUrl: '' },
];

export const demoBloques = [
  { id: 'demo-b1', tipo: 'texto', orden: 1, titulo: '¡Hola, soy Jere!', titulo_en: "Hi, I'm Jere!",
    contenido: 'Este es un texto de ejemplo. Desde /admin vas a poder escribir tu historia, sumar fotos y videos y ordenar todo a gusto.',
    contenido_en: 'This is sample text. From /admin you can write your story, add photos and videos, and reorder everything.' },
  { id: 'demo-b2', tipo: 'tarjeta', orden: 2, icono: '🚐', color: 'sol', titulo: 'La Bebi', titulo_en: 'La Bebi',
    contenido: 'Mi casa sobre ruedas. Una pickup blanca con módulo vivienda.', contenido_en: 'My home on wheels. A white pickup with a camper module.' },
  { id: 'demo-b3', tipo: 'tarjeta', orden: 3, icono: '🏔️', color: 'monte', titulo: 'Montañas', titulo_en: 'Mountains',
    contenido: 'Tarjeta de ejemplo para destacar algo importante.', contenido_en: 'Sample card to highlight something important.' },
  { id: 'demo-b4', tipo: 'galeria', orden: 4, titulo: 'Postales', titulo_en: 'Postcards',
    imagenes: [foto('q1'), foto('q2'), foto('q3')] },
];

export const demoRecursos = [
  { id: 'demo-r1', tipo: 'wallpaper', formato: 'movil', titulo: 'Wallpaper móvil (ejemplo)', titulo_en: 'Mobile wallpaper (sample)',
    descripcion: 'Ficha de ejemplo.', descripcion_en: 'Sample card.', miniatura: foto('r1') },
  { id: 'demo-r2', tipo: 'wallpaper', formato: 'desktop', titulo: 'Wallpaper desktop (ejemplo)', titulo_en: 'Desktop wallpaper (sample)',
    descripcion: 'Ficha de ejemplo.', descripcion_en: 'Sample card.', miniatura: foto('r2') },
  { id: 'demo-r3', tipo: 'curso', formato: '', titulo: 'Guía de viaje (ejemplo)', titulo_en: 'Travel guide (sample)',
    descripcion: 'Ficha de ejemplo.', descripcion_en: 'Sample card.', miniatura: '' },
];
