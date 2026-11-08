'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const dict = {
  es: {
    brand: 'Jere Móvil',
    nav_home: 'Mi viaje',
    nav_about: 'Quién soy',
    nav_videos: 'Videos',
    nav_resources: 'Recursos',
    nav_social: 'Mis redes',
    nav_design: 'Design System',
    nav_admin: 'Admin',
    login: 'Entrar con Google',
    logout: 'Salir',
    loading: 'Cargando…',

    auth_title: '¡Alto ahí, viajero!',
    auth_text: 'Para descargar recursos, acceder a los cursos o comentar necesitás entrar con tu cuenta de Google.',
    auth_demo: 'El inicio de sesión no está configurado todavía (modo demo).',
    auth_error: 'No pudimos iniciar sesión. Probá de nuevo.',
    terms_title: 'Términos y Condiciones',
    terms_text: 'Al crear tu cuenta, aceptás recibir correos electrónicos informativos sobre novedades y eventos. Tus datos no se compartirán con terceros.',
    terms_accept: 'Acepto los Términos y Condiciones',
    terms_decline: 'No acepto',

    map_search: 'Buscá una ciudad o punto del viaje…',
    map_day: 'Día',
    map_play: 'Reproducir viaje',
    map_pause: 'Pausar',
    map_demo: 'Mostrando datos de ejemplo',
    map_photos: 'Fotos',
    map_video: 'Video',
    map_close: 'Cerrar',
    map_no_results: 'Sin resultados',
    map_stop: 'Parada',
    map_all: 'Todos',
    map_filters: 'Filtros de la bitácora por categoría',
    map_speed: 'Velocidad del recorrido (clic para cambiar)',
    map_live: 'EN VIVO',
    map_live_follow: 'Seguimiento en tiempo real',
    map_live_wait: 'Esperando señal del celular…',
    map_live_watch: 'Ver el vivo',
    map_live_points: 'puntos del recorrido',
    map_choose: 'Elegí qué punto querés ver',

    about_title: '¿Quién soy?',
    about_empty: 'Pronto vas a encontrar acá la historia de Jere.',
    about_hello: '¡Hola! Soy Jere',
    about_role: 'Cordobés, viajero y creador de contenido en la ruta',
    about_story: '📖 Mi historia',
    about_p1: 'Soy Jere, cordobés con el alma puesta en la ruta. Crecí rodeado de arte —hijo de uno de los artistas más reconocidos de Córdoba—, pero mi lienzo es otro: carreteras, atardeceres y ciudades que aparecen de golpe en el espejo.',
    about_p2: 'El 12 de febrero de 2025 prendí el motor y arrancó la aventura: cruzar América en mi motorhome. Desde entonces no paro. 🇦🇷 Argentina, 🇨🇱 Chile, 🇧🇷 Brasil, 🇺🇾 Uruguay y 🇵🇾 Paraguay ya son parte de la historia.',
    about_p3: 'Cada parada, cada atardecer y cada locura del camino quedan registrados en los capítulos de mi canal y en esta bitácora que estás mirando. Si algo aprendí en la ruta es que los mejores planes no se hacen: se manejan.',
    about_quote: 'No elegí el destino: elegí no quedarme quieto.',
    about_chip1: '🚐 En la ruta desde 12/02/2025',
    about_chip2: '🌎 5 países y contando',
    about_chip3: '❤️ 147K en Instagram',
    about_redes: 'Seguime en la ruta',
    about_redes_sub: 'Nuevos capítulos, fotos y stories: todo el viaje, en tiempo real.',
    labebi_title: 'Conocé a «La Bebi»',
    labebi_sub: 'Mi casa sobre ruedas, mi compañera de viaje… y sí: para mí es mi hija.',
    labebi_desc: 'Acá podés ver fotos y conocer las características técnicas de La Bebi. La sección sigue creciendo: se van a sumar fotos de cada viaje y la ficha completa.',
    labebi_quote: 'Para mí La Bebi es mi hija. Dormir adentro, cuidarla y llevarla por toda América es lo que más me gusta del mundo.',
    labebi_specs: 'Ficha técnica',
    labebi_spec_nombre: 'Nombre',
    labebi_spec_base: 'Base',
    labebi_spec_tipo: 'Tipo',
    labebi_spec_tipo_v: 'Motorhome · pickup con módulo vivienda',
    labebi_spec_color: 'Color',
    labebi_spec_color_v: 'Blanco',
    labebi_spec_ruta: 'En la ruta desde',
    labebi_spec_paises: 'Países recorridos',
    labebi_spec_anio: 'Año',
    labebi_spec_motor: 'Motor',
    labebi_spec_equip: 'Equipamiento',
    labebi_soon: 'Próximamente',
    labebi_photos: 'Galería de fotos',
    labebi_photos_soon: 'Próximamente vas a ver acá la galería de fotos de La Bebi: cada viaje, cada parada y cada detalle del interior.',
    labebi_hint: '💡 Tip: en el mapa hacé clic en La Bebi para verla girar en 360°.',

    videos_title: 'Videos',
    videos_subtitle: 'Toda la aventura, temporada por temporada.',
    videos_search: 'Buscar por título o palabra clave',
    videos_season: 'Temporada',
    videos_all: 'Todas',
    videos_sort_new: 'Más nuevos primero',
    videos_sort_old: 'Más viejos primero',
    videos_empty: 'No hay videos que coincidan.',
    videos_comments: 'Comentarios',
    videos_comment_ph: 'Escribí un comentario…',
    videos_send: 'Enviar',
    videos_delete: 'Borrar',
    videos_no_comments: 'Sé el primero en comentar 🙌',
    videos_play: 'Reproducir',

    res_title: 'Recursos',
    res_subtitle: 'Wallpapers, videos exclusivos y guías para tu próxima aventura.',
    res_all: 'Todo',
    res_wallpaper: 'Wallpapers',
    res_video: 'Videos',
    res_curso: 'Cursos y guías',
    res_download: 'Descargar',
    res_open: 'Abrir',
    res_login_to: 'Entrá para acceder',
    res_empty: 'Todavía no hay recursos en esta categoría.',
    res_mobile: 'Móvil',
    res_desktop: 'Desktop',
    res_demo_note: 'Ficha de ejemplo: todavía no tiene archivo.',
    res_error: 'No pudimos abrir el recurso.',

    social_title: 'Mis redes',
    social_subtitle: 'Seguime por todos lados y viajá conmigo.',
    social_followers: 'seguidores',
    social_go: 'Visitar',
  },
  en: {
    brand: 'Jere Móvil',
    nav_home: 'My trip',
    nav_about: 'Who am I',
    nav_videos: 'Videos',
    nav_resources: 'Resources',
    nav_social: 'My socials',
    nav_design: 'Design System',
    nav_admin: 'Admin',
    login: 'Sign in with Google',
    logout: 'Sign out',
    loading: 'Loading…',

    auth_title: 'Hold up, traveler!',
    auth_text: 'To download resources, access courses or leave comments you need to sign in with your Google account.',
    auth_demo: 'Sign-in is not configured yet (demo mode).',
    auth_error: "We couldn't sign you in. Please try again.",

    map_search: 'Search a city or stop of the trip…',
    map_day: 'Day',
    map_play: 'Play trip',
    map_pause: 'Pause',
    map_demo: 'Showing sample data',
    map_photos: 'Photos',
    map_video: 'Video',
    map_close: 'Close',
    map_no_results: 'No results',
    map_stop: 'Stop',
    map_all: 'All',
    map_filters: 'Trip log filters by category',
    map_speed: 'Trip animation speed (click to change)',
    map_live: 'LIVE',
    map_live_follow: 'Live location tracking',
    map_live_wait: 'Waiting for phone signal…',
    map_live_watch: 'Watch the stream',
    map_live_points: 'track points',
    map_choose: 'Choose which point you want to see',

    about_title: 'Who am I?',
    about_empty: "Jere's story will be here soon.",
    about_hello: "Hi, I'm Jere",
    about_role: 'From Córdoba, traveler and road content creator',
    about_story: '📖 My story',
    about_p1: "I'm Jere, a guy from Córdoba with his soul on the road. I grew up surrounded by art —son of one of Córdoba's most recognized artists—, but my canvas is different: highways, sunsets and towns that pop up in the mirror.",
    about_p2: 'On February 12, 2025 I turned the engine on and the adventure began: crossing America in my motorhome. I have not stopped since. 🇦🇷 Argentina, 🇨🇱 Chile, 🇧🇷 Brasil, 🇺🇾 Uruguay and 🇵🇾 Paraguay are already part of the story.',
    about_p3: 'Every stop, every sunset and every crazy moment on the road ends up in my channel’s episodes and in this travel log you are reading. If there is one thing the road taught me, is that the best plans are not made: they are driven.',
    about_quote: 'I did not pick the destination: I chose not to stay still.',
    about_chip1: '🚐 On the road since 02/12/2025',
    about_chip2: '🌎 5 countries and counting',
    about_chip3: '❤️ 147K on Instagram',
    about_redes: 'Follow me on the road',
    about_redes_sub: 'New episodes, photos and stories: the whole trip, in real time.',
    labebi_title: 'Meet "La Bebi"',
    labebi_sub: 'My home on wheels, my travel partner… and yes: for me she is my daughter.',
    labebi_desc: 'Here you can see photos and technical specs of La Bebi. The section keeps growing: photos from every trip and the full spec sheet are coming.',
    labebi_quote: 'For me, La Bebi is my daughter. Sleeping inside her, taking care of her and driving her all over America is what I love the most.',
    labebi_specs: 'Spec sheet',
    labebi_spec_nombre: 'Name',
    labebi_spec_base: 'Base',
    labebi_spec_tipo: 'Type',
    labebi_spec_tipo_v: 'Motorhome · pickup with camper module',
    labebi_spec_color: 'Color',
    labebi_spec_color_v: 'White',
    labebi_spec_ruta: 'On the road since',
    labebi_spec_paises: 'Countries visited',
    labebi_spec_anio: 'Year',
    labebi_spec_motor: 'Engine',
    labebi_spec_equip: 'Gear',
    labebi_soon: 'Coming soon',
    labebi_photos: 'Photo gallery',
    labebi_photos_soon: 'Soon you will find here the photo gallery of La Bebi: every trip, every stop and every detail inside.',
    labebi_hint: '💡 Tip: on the map, click La Bebi to spin her in 360°.',

    videos_title: 'Videos',
    videos_subtitle: 'The whole adventure, season by season.',
    videos_search: 'Search by title or keyword',
    videos_season: 'Season',
    videos_all: 'All',
    videos_sort_new: 'Newest first',
    videos_sort_old: 'Oldest first',
    videos_empty: 'No videos match your search.',
    videos_comments: 'Comments',
    videos_comment_ph: 'Write a comment…',
    videos_send: 'Send',
    videos_delete: 'Delete',
    videos_no_comments: 'Be the first to comment 🙌',
    videos_play: 'Play',

    res_title: 'Resources',
    res_subtitle: 'Wallpapers, exclusive videos and guides for your next adventure.',
    res_all: 'All',
    res_wallpaper: 'Wallpapers',
    res_video: 'Videos',
    res_curso: 'Courses & guides',
    res_download: 'Download',
    res_open: 'Open',
    res_login_to: 'Sign in to access',
    res_empty: 'No resources in this category yet.',
    res_mobile: 'Mobile',
    res_desktop: 'Desktop',
    res_demo_note: 'Sample card: it has no file yet.',
    res_error: "We couldn't open this resource.",

    social_title: 'My socials',
    social_subtitle: 'Follow me everywhere and travel along.',
    social_followers: 'followers',
    social_go: 'Visit',
  },
};

const I18nContext = createContext({ lang: 'es', setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('es');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jm_lang');
      if (saved === 'es' || saved === 'en') {
        setLangState(saved);
      } else if (navigator.language?.toLowerCase().startsWith('en')) {
        setLangState('en');
      }
    } catch {
      /* localStorage no disponible */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l) => {
    setLangState(l);
    try {
      localStorage.setItem('jm_lang', l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback((key) => dict[lang]?.[key] ?? dict.es[key] ?? key, [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
