# 🚐 Jere Móvil

Bitácora de viaje interactiva + comunidad. Next.js (App Router) · Tailwind · Framer Motion · Firebase · Leaflet (CartoDB Voyager). Sitio en español e inglés.

## Probarlo en local

```bash
npm install
npm run dev        # http://localhost:3000
```

Sin variables de entorno funciona en **modo demo**: mapa con puntos de ejemplo, sin login. Para activar todo, copiá `.env.example` a `.env.local` y completá las claves de Firebase.

## Configurar Firebase

1. Crear un proyecto en [console.firebase.google.com](https://console.firebase.google.com) y registrar una app web (copiar las claves a `.env.local`).
2. **Authentication → Sign-in method → Google**: habilitar. En *Settings → Authorized domains* agregar tu dominio de Vercel.
3. Crear **Firestore** y **Storage**.
4. Publicar las reglas de seguridad:
   ```bash
   npm i -g firebase-tools && firebase login
   firebase use --add
   firebase deploy --only firestore:rules,storage
   ```
5. **Hacer admin a Jere**: iniciar sesión una vez en la web (se crea `usuarios/{uid}` con `role: "user"`), y en la consola de Firestore cambiar ese campo a `"admin"`. Desde ahí aparece "Admin" en el menú (`/admin`).

> Las reglas son la seguridad real: el rol `admin` solo se puede asignar desde la consola, y los archivos de `recursos/` solo se leen con sesión iniciada.

## Desplegar (GitHub + Vercel)

```bash
git init && git add . && git commit -m "Jere Móvil"
git remote add origin <tu-repo> && git push -u origin main
```
En Vercel: *Add New → Project* → importar el repo → cargar las variables `NEXT_PUBLIC_FIREBASE_*` → Deploy. Cada push a `main` despliega solo.

## Estructura

```
src/
  app/                 layout, páginas (/, /quien-soy, /videos, /recursos, /redes, /admin)
  components/
    InteractiveMap.jsx   mapa Leaflet + ruta + La Bebi + timeline (la pieza central)
    TimelineSlider.jsx   slider con Framer Motion, nodos clickeables y play
    CitySearch.jsx       autocompletado + flyTo
    MilestoneModal.jsx   tarjeta del hito (fecha, texto, fotos, video)
    BlockRenderer.jsx    bloques de "Quién soy"
    Comments.jsx         comentarios por video (requieren login)
    AuthProvider.jsx     Google Auth + rol desde Firestore
    admin/               gestores de puntos, quién soy, videos y recursos
  lib/                 firebase.js, schemas.js, i18n.js, utils.js, redes.js, datos demo
public/labebi.svg      icono del marcador (provisorio)
firestore.rules / storage.rules
```

## Colecciones de Firestore

Detalle completo en `src/lib/schemas.js`.

| Colección | Qué guarda |
|---|---|
| `usuarios/{uid}` | nombre, email, foto, `role` (`user` / `admin`) |
| `puntos_mapa/{id}` | ciudad, país, lat, lng, `fechaHora`, título, descripción, `fotos[]`, `videoUrl` |
| `quien_soy_bloques/{id}` | `tipo` (texto, tarjeta, galeria, video), `orden`, título, contenido, imágenes… |
| `videos/{id}` | `youtubeId`, título, `temporada`, `fecha`, `palabrasClave[]` |
| `videos/{id}/comentarios/{cid}` | uid, nombre, foto, texto, creado |
| `recursos/{id}` | ficha pública: tipo, formato, título, descripción, miniatura |
| `recursos_privados/{id}` | acceso real: `storagePath` o `url` (solo con sesión) |

Cualquier texto admite variante en inglés con sufijo `_en` (`titulo_en`, `descripcion_en`…). Si falta, se muestra el español.

## Cosas para completar / saber

- **La Bebi**: `public/labebi.svg` es una ilustración provisoria. Para usar la tuya, reemplazá ese archivo (SVG o PNG; si es PNG, cambiá la extensión en `InteractiveMap.jsx`).
- **Mis redes**: editar `src/lib/redes.js` con los enlaces reales y, si querés contadores, el número de seguidores.
- **Timeline**: va del día 1 hasta hoy (o el último punto si es posterior). Entre hito e hito La Bebi avanza en línea recta, proporcional al tiempo.
- **Geocodificación**: usa Nominatim (OpenStreetMap, gratis, ~1 consulta/seg). Para mucho volumen conviene pasar a Mapbox Geocoding.
- **YouTube**: el login pide solo el perfil de Google. Para pedir también acceso a YouTube poné `NEXT_PUBLIC_REQUEST_YOUTUBE_SCOPE=true`, pero Google exige verificar la app con ese permiso.
- El panel `/admin` está en español (es para Jere); el sitio público es bilingüe.
- Borrar un punto desde el panel no borra sus fotos de Firebase Storage (solo el documento).
