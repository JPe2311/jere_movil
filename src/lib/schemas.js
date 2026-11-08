/**
 * Schemas de Firestore (documentados como JSDoc + fábricas de documentos vacíos).
 * Firestore no tiene esquema fijo: esta es la forma que espera la app.
 *
 * Campos bilingües: cualquier campo de texto puede tener una variante "_en"
 * (ej. titulo / titulo_en). Si falta la variante en inglés se muestra el texto en español.
 */

export const COLLECTIONS = {
  usuarios: 'usuarios',
  puntos: 'puntos_mapa',
  quienSoy: 'quien_soy_bloques',
  videos: 'videos',
  recursos: 'recursos',
  recursosPrivados: 'recursos_privados',
};

/**
 * usuarios/{uid}
 * @typedef {Object} Usuario
 * @property {string} nombre
 * @property {string} email
 * @property {string} foto
 * @property {'user'|'admin'} role   // "admin" se asigna a mano en la consola de Firebase
 * @property {import('firebase/firestore').Timestamp} creado
 */

/**
 * puntos_mapa/{id}  — la ruta se traza uniendo los puntos por fechaHora ascendente
 * @typedef {Object} PuntoMapa
 * @property {string} ciudad
 * @property {string} pais
 * @property {number} lat
 * @property {number} lng
 * @property {import('firebase/firestore').Timestamp} fechaHora
 * @property {string} titulo
 * @property {string} [titulo_en]
 * @property {string} descripcion
 * @property {string} [descripcion_en]
 * @property {string} [categoria]     // 'importante' | 'rara' | 'acampada' | 'foto' | 'recorrido'
 * @property {number} [orden]         // posición manual en la secuencia de ruta
 * @property {string[]} fotos          // URLs de Firebase Storage
 * @property {string} [videoUrl]       // YouTube o archivo directo
 */
export const nuevoPunto = () => ({
  ciudad: '', pais: '', lat: '', lng: '',
  fecha: '', hora: '12:00',
  categoria: 'importante',
  orden: 0,
  titulo: '', titulo_en: '', descripcion: '', descripcion_en: '',
  fotos: [], videoUrl: '',
});

/**
 * quien_soy_bloques/{id}
 * @typedef {Object} BloqueQuienSoy
 * @property {'texto'|'tarjeta'|'galeria'|'video'} tipo
 * @property {number} orden            // menor = más arriba
 * @property {string} [titulo]
 * @property {string} [titulo_en]
 * @property {string} [contenido]
 * @property {string} [contenido_en]
 * @property {string} [icono]          // emoji (tarjeta)
 * @property {'sol'|'atardecer'|'monte'|'cielo'|'rosa'} [color]
 * @property {string[]} [imagenes]     // galeria
 * @property {string} [videoUrl]       // video
 */
export const nuevoBloque = () => ({
  tipo: 'texto', titulo: '', titulo_en: '', contenido: '', contenido_en: '',
  icono: '⭐', color: 'sol', imagenes: [], videoUrl: '',
});

/**
 * videos/{id}   (subcolección: videos/{id}/comentarios/{cid})
 * @typedef {Object} Video
 * @property {string} youtubeId
 * @property {string} titulo
 * @property {string} [titulo_en]
 * @property {string} [descripcion]
 * @property {number} temporada
 * @property {import('firebase/firestore').Timestamp} fecha
 * @property {string[]} palabrasClave
 *
 * videos/{id}/comentarios/{cid}
 * @typedef {Object} Comentario
 * @property {string} uid
 * @property {string} nombre
 * @property {string} foto
 * @property {string} texto            // 1..1000 caracteres
 * @property {import('firebase/firestore').Timestamp} creado
 */
export const nuevoVideo = () => ({
  youtubeId: '', titulo: '', titulo_en: '', descripcion: '',
  temporada: 1, fecha: '', palabrasClave: '',
});

/**
 * recursos/{id}              → ficha pública (vidriera)
 * recursos_privados/{id}     → acceso real, solo lectura con sesión iniciada
 * @typedef {Object} Recurso
 * @property {'wallpaper'|'video'|'curso'} tipo
 * @property {'movil'|'desktop'|''} [formato]   // solo wallpapers
 * @property {string} titulo
 * @property {string} [titulo_en]
 * @property {string} [descripcion]
 * @property {string} [descripcion_en]
 * @property {string} [miniatura]               // URL pública
 * @property {import('firebase/firestore').Timestamp} creado
 *
 * @typedef {Object} RecursoPrivado
 * @property {string} [storagePath]             // archivo en Storage (recursos/...)
 * @property {string} [url]                     // o enlace externo (curso, drive, etc.)
 */
export const nuevoRecurso = () => ({
  tipo: 'wallpaper', formato: 'movil',
  titulo: '', titulo_en: '', descripcion: '', descripcion_en: '', url: '',
});
