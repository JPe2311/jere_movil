// Datos de ejemplo: se muestran solo cuando Firestore está vacío o sin configurar.
// Cuando Jere cargue su primer punto desde /admin, estos datos desaparecen solos.

const foto = (seed) => `https://picsum.photos/seed/${seed}/900/600`;

export const demoPuntos = [
  { id: 'demo-1', ciudad: 'Buenos Aires', pais: 'Argentina', lat: -34.6037, lng: -58.3816,
    fechaHora: '2025-03-01T09:00:00', titulo: '¡Arranca la aventura!', titulo_en: 'The adventure begins!',
    descripcion: 'Punto de ejemplo: acá empieza el viaje. Cargá tus propios hitos desde /admin.',
    descripcion_en: 'Sample stop: the trip starts here. Add your own milestones from /admin.',
    fotos: [foto('jere1'), foto('jere2')], videoUrl: '' },
  { id: 'demo-2', ciudad: 'Mendoza', pais: 'Argentina', lat: -32.8895, lng: -68.8458,
    fechaHora: '2025-03-12T18:30:00', titulo: 'Atardecer entre viñedos', titulo_en: 'Sunset among vineyards',
    descripcion: 'Punto de ejemplo en Mendoza.', descripcion_en: 'Sample stop in Mendoza.',
    fotos: [foto('jere3')], videoUrl: '' },
  { id: 'demo-3', ciudad: 'Santiago', pais: 'Chile', lat: -33.4489, lng: -70.6693,
    fechaHora: '2025-03-20T12:00:00', titulo: 'Cruzando los Andes', titulo_en: 'Crossing the Andes',
    descripcion: 'Punto de ejemplo en Santiago.', descripcion_en: 'Sample stop in Santiago.',
    fotos: [], videoUrl: '' },
  { id: 'demo-4', ciudad: 'San Pedro de Atacama', pais: 'Chile', lat: -22.9087, lng: -68.2,
    fechaHora: '2025-04-02T16:00:00', titulo: 'Desierto y estrellas', titulo_en: 'Desert and stars',
    descripcion: 'Punto de ejemplo en el desierto de Atacama.', descripcion_en: 'Sample stop in the Atacama desert.',
    fotos: [foto('jere4')], videoUrl: '' },
  { id: 'demo-5', ciudad: 'Cusco', pais: 'Perú', lat: -13.5319, lng: -71.9675,
    fechaHora: '2025-05-10T10:00:00', titulo: 'Rumbo a Machu Picchu', titulo_en: 'Heading to Machu Picchu',
    descripcion: 'Punto de ejemplo en Cusco.', descripcion_en: 'Sample stop in Cusco.',
    fotos: [], videoUrl: '' },
  { id: 'demo-6', ciudad: 'Bogotá', pais: 'Colombia', lat: 4.711, lng: -74.0721,
    fechaHora: '2025-07-01T14:00:00', titulo: 'Café y montañas', titulo_en: 'Coffee and mountains',
    descripcion: 'Punto de ejemplo en Bogotá.', descripcion_en: 'Sample stop in Bogotá.',
    fotos: [], videoUrl: '' },
  { id: 'demo-7', ciudad: 'Ciudad de México', pais: 'México', lat: 19.4326, lng: -99.1332,
    fechaHora: '2025-09-15T11:00:00', titulo: 'Tacos en el DF', titulo_en: 'Tacos in CDMX',
    descripcion: 'Punto de ejemplo en Ciudad de México.', descripcion_en: 'Sample stop in Mexico City.',
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
