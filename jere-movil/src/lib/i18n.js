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

    about_title: '¿Quién soy?',
    about_empty: 'Pronto vas a encontrar acá la historia de Jere.',

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

    about_title: 'Who am I?',
    about_empty: "Jere's story will be here soon.",

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
