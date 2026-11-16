# Especificaciones Técnicas y de Diseño: Sección "Publicidad" (Jere Móvil)

## 1. Objetivo del Proyecto
Desarrollar una sección web interactiva tipo **Landing Page** llamada **`/publicidad`** (o sección `#publicidad`) para el proyecto de viajes y vlogs **Jere Móvil ("La Bebi")**. 
La página debe presentar la propuesta comercial para auspiciantes respetando estrictamente la identidad visual del Media Kit original, e incorporar un **Constructor Interactivo de Presupuestos y Paquetes** con capacidades de edición (Modo Administrador / Edición) y **exportación a PDF** manteniendo la estética de marca.

---

## 2. Identidad Visual y Sistema de Diseño (UI/UX)
El diseño debe replicar el estilo **Neo-Brutalista Suave / Ilustrado** del PDF original:

* **Paleta de Colores:**
  * **Fondo Principal:** Crema cálido / Arena claro (`#FDF6E7` o `#FAF3E3`).
  * **Superficies / Tarjetas:** Blanco puro (`#FFFFFF`) con bordes sólidos oscuros (`2px` o `3px solid #1E2433`) y sombras desplazadas sólidas (`box-shadow: 4px 4px 0px #1E2433`).
  * **Texto Principal y Bordes:** Azul marino muy oscuro / Casi negro (`#1E2433`).
  * **Texto Secundario:** Gris pizarra (`#5A6275`).
  * **Acentos de Marca (Píldoras, Badges, Botones e Íconos):**
    * Rojo Logo: `#E31E24`
    * Naranja Ruta / Destacado: `#F37021`
    * Verde Esmeralda: `#2B9E63`
    * Amarillo Mostaza: `#F8C630`
    * Azul Cielo: `#2997D8`
    * Rosa Coral: `#F25287`
* **Tipografía:**
  * Títulos principales: Sans-serif geométrica gruesa, de alto impacto (`Fredoka`, `Rubik`, `Outfit` o `Montserrat ExtraBold`).
  * Cuerpo de texto: Sans-serif limpia y legible (`Plus Jakarta Sans` o `Inter`).
* **Elementos Gráficos:**
  * Uso de etiquetas tipo "píldora" con bordes redondeados completos (`border-radius: 9999px`), borde oscuro y sombra dura.
  * Líneas divisorias punteadas (`border-bottom: 2px dashed #CBD5E1`) y separadores en zigzag amarillo.
  * Íconos y badges numerados circulares con colores de acento.

---

## 3. Estructura y Contenido de la Landing Page

### A. Hero / Portada
* **Logo:** Isologo circular "Jere móvil" con flecha verde.
* **Título Principal:** `SISTEMA DE PROMOCIÓN EN JERE MÓVIL`
* **Subtítulo / Tagline:** `Viajá con La Bebi • Sumá tu marca a la ruta`
* **CTA Principal:** Botón de acción que haga scroll suave hacia la sección de Paquetes y Armador de Presupuesto (`Armar mi presupuesto`).

### B. Sección 01: Quién Soy & La Ruta en Números
* **Badge:** `01. QUIÉN SOY` | **Título:** `Hola, soy Jere`
* **Texto de Presentación:**
  > Viajo en mi furgoneta "La Bebi" por Latinoamérica, desde Córdoba (Km 0), y realizo el vlog de todos estos viajes en videos en YouTube, por mis redes sociales para una comunidad hermosa que me sigue capítulo a capítulo.
  > Una marca que viaja con La Bebi no se ve como un aviso: se vuelve parte de la ruta. Tu producto aparece en escenas reales de mi vida diaria, en las redes y en la propia furgoneta.
* **Cita Destacada:**
  > *"Cada marca que sube a La Bebi se vuelve parte de la aventura: acá se prueba de verdad, kilómetro a kilómetro."* — **Jere**
* **Métricas ("La Ruta en Números"):** Tarjetas destacadas con bordes oscuros:
  * **33.500** Suscriptores
  * **800.000** Vistas por mes
  * **149.000** Seguidores en redes
  * **5** Países recorridos
* **Pilares ("Por qué auspiciar el viaje"):**
  1. **Integración orgánica:** El producto se usa en escenas reales del viaje: se ve, se prueba y se recomienda de verdad.
  2. **Audiencia viajera y fiel:** Una comunidad que sigue la ruta capítulo a capítulo y participa en todos nuestros productos.
  3. **Tres espacios:** Videos, redes y la furgoneta conviven en una misma historia de marca.

### C. Sección 02: YouTube (Integraciones dentro del video)
* **Badge:** `02. YOUTUBE` | **Título:** `Integraciones dentro del video`
* **Formatos de Video (Tarjetas informativas):**
  1. **Mención de apertura** (`10-15 seg`): La marca se nombra en la introducción del capítulo.
  2. **Integración orgánica** (`~1 min` — *Badge: MAYOR IMPACTO*): El producto se usa en una escena real del viaje. Es el formato de mayor impacto.
  3. **Banner en pantalla** (`10-15 seg`): Logo o gráfico discreto. Cuatro opciones: banner de apertura (10 seg en la introducción), de integración (todo el minuto de la integración), central (15 seg a mitad del capítulo) y de cierre (10 seg junto al "Agradecemos a...").
  4. **Agradecimiento en créditos** (`10 seg`): "Agradecemos a..." con logo, nombre y link de la marca.
  5. **Link en descripción y comentario fijado** (`Permanente`): Queda mientras el video esté publicado. Puede incluir código de descuento o la web de la marca.
* *Nota al pie:* "Los tiempos son aproximados y se confirman en la revisión previa con la marca."

### D. Sección 03: Más Allá del Video & Cómo Trabajamos
* **Badge:** `03. MÁS ALLÁ DEL VIDEO` | **Título:** `Redes, furgoneta y web`
* **Otros Espacios:**
  * **Posts y stories en redes:** Publicaciones y stories con mención de la marca y link.
  * **Marca en La Bebi:** Calco o logo de la marca visible en la furgoneta durante la ruta: se ve en cada escena y cada foto.
  * **Banner / sección en la web:** Espacio de marca dentro de la bitácora y el mapa interactivo, con link directo.
* **Flujo de Trabajo ("Cómo trabajamos"):**
  1. **Brief:** Objetivo, producto y fechas de la marca.
  2. **Propuesta y guion:** Armamos la integración y la aprobamos juntos.
  3. **Rodaje y publicación:** Se graba en ruta y se publica en el capítulo.
  4. **Reporte:** Vistas, alcance y clics del link.

---

## 4. Módulo Interactivo: Paquetes, Servicios a Medida y Presupuestador

Esta sección unifica las páginas **04. Elegí tu ruta (Paquetes)** y **05. A medida (Servicios sueltos)** con herramientas dinámicas de gestión y cotización.

### 4.1. Datos Iniciales Precargados (Catálogo Base)

#### Paquetes Base:
1. **EXPLORADOR** (*Para empezar a rodar*) — **$600.000 ARS**
   * Incluye: Mención de apertura (10-15 seg), Agradecimiento en créditos (10 seg), 1 Short/Reels.
2. **AVENTURERO** (*Badge: EL MÁS ELEGIDO*) — **$850.000 ARS**
   * Incluye: Todo lo del Explorador, Banner de 1 min en video, 2 posts + 2 sets de stories, Banner en la web por 30 días.
3. **LEYENDA** (*Ruta completa*) — **$1.500.000 ARS**
   * Incluye: Todo lo del Aventurero, Integración orgánica (~1 min) con Banner central, Marca en La Bebi por 60 días, Sección de marca en la web (90 días).

#### Servicios Sueltos / Extras (Precios por video vlog en ARS):
1. **Mención de apertura** | En la introducción del capítulo. 10-15 seg | **$150.000**
2. **Integración orgánica** | Uso del producto en escena real ~1 min | **$900.000**
3. **Banner de apertura** | Logo o gráfico discreto 10 seg | **$100.000**
4. **Banner** | En cualquier espacio del video (no central) - 15 seg | **$150.000**
5. **Banner central** | Momento medio del capítulo. 15 seg | **$300.000**
6. **Banner de cierre** | Junto al "Agradecemos a...". 10 seg | **$150.000**
7. **Agradecimiento en créditos** | Logo, nombre y link 10 seg | **$100.000**
8. **Link en descripción + fijado** | Mientras el video esté publicado | **$250.000**
9. **Post en feed** | Publicación con mención y link | **$200.000**
10. **Set de stories** | 3 stories con mención y link (1 mes) | **$180.000**
11. **Marca en La Bebi (exterior)** | Calco/logo visible en la furgoneta 60 días | **$300.000**
12. **Marca en La Bebi (conducción)** | Calco/logo visible detrás del conductor 30 días | **$500.000**

---

### 4.2. Funcionalidades Requeridas

#### 1. Panel de Gestión / Edición (Toggle "Modo Edición / Configurar Tarifario"):
* Debe existir un interruptor o botón discreto (ej. ícono de engranaje o botón *"Personalizar Servicios y Precios"*) que habilite la edición en tiempo real de todo el catálogo (persistiendo los cambios en `localStorage` para no perder la configuración).
* **Por cada Servicio y Paquete se debe poder:**
  * **Activar / Desactivar (Switch ON/OFF):** Si un servicio está desactivado, se oculta de la vista pública / presupuesto (o se muestra atenuado en modo edición).
  * **Editar Nombre:** Input editable directo sobre el título del servicio/paquete.
  * **Editar Precio:** Input numérico formateado en ARS (`$`).
  * **Editar lo que incluye (Detalle / Items):** En servicios sueltos, editar la descripción; en paquetes, agregar, editar o eliminar ítems de la lista de beneficios.
  * **Crear Nuevo Servicio / Crear Nuevo Paquete:** Botón `+ Agregar servicio` y `+ Crear nuevo paquete` (permitiendo elegir qué servicios sueltos lo componen, ponerle un nombre, subtítulo, precio personalizado y marcarlo como "Más elegido" opcionalmente).

#### 2. Armador de Presupuesto Interactivo (Carrito / Cotizador):
* Los usuarios (o Jere armando una propuesta para un cliente) pueden:
  * Seleccionar un **Paquete Base** (opcional) y/o sumar múltiples **Servicios Sueltos** mediante checkboxes o botones `+ Sumar al presupuesto` (con selector de cantidad, por ejemplo: 2 videos o 2 posts).
  * **Regla de Bonificación / Descuentos:**
    * Como indica el documento: *"Al sumar tres o más servicios de una misma campaña se puede aplicar una bonificación. Agregar el porcentaje acordado en el presupuesto."*
    * Incluir un campo editable de **Bonificación / Descuento (%)** (que puede sugerir automáticamente un descuento al detectar $\ge 3$ ítems seleccionados, pero siempre editable manualmente por Jere o el usuario).
  * **Datos del Cliente / Marca (para el PDF):**
    * Inputs opcionales en el resumen del presupuesto: *Nombre de la Marca / Cliente*, *Campaña / Etapa de la ruta*, *Validez de la oferta* y *Notas adicionales*.
  * **Resumen Flotante o Lateral:** Muestra el desglose ítem por ítem, Subtotal, Descuento aplicado (`-%`) y **Total Final en ARS**.

#### 3. Generación y Descarga de Presupuesto en PDF (Con Diseño de Marca):
* Botón principal: **`Descargar Presupuesto en PDF`**.
* **Requisito Crítico de Diseño del PDF:** El documento generado NO debe ser una tabla genérica en blanco y negro. Debe renderizarse (mediante `@media print` optimizado o librerías como `html2pdf.js` / `jsPDF` + `html2canvas` sobre una plantilla dedicada oculta) replicando **exactamente el diseño del PDF original**:
  * Fondo crema cálido (`#FDF6E7`) o tarjetas blancas con bordes gruesos (`#1E2433`) y sombras sólidas.
  * Encabezado con el logo de **Jere Móvil**, título *"PROPUESTA DE AUSPICIOS • 2026"*, fecha de emisión y datos de la marca cliente.
  * Detalle visual de los paquetes y/o servicios incluidos con sus descripciones y precios unitarios.
  * Bloque destacado con el Subtotal, Bonificación acordada y Total Final.
  * Pie de página con los **Próximos Pasos** (1. Contanos, 2. Propuesta, 3. ¡A rodar!) y los datos de contacto oficiales de Jere Móvil.

---

## 5. Footer / Sección de Contacto ("¡Vamos a rodar juntos!")
* **Título:** `¡VAMOS A RODAR JUNTOS!`
* **Bajada:** `Contanos qué querés comunicar y armamos una integración a medida para tu marca.`
* **Canales de Contacto (con píldoras de colores estilo Media Kit y enlaces directos):**
  * **EMAIL** (Píldora Amarilla): `jeremovil@gmail.com`
  * **WHATSAPP** (Píldora Verde): `+54 9 3517 51-8953` *(Botón extra: "Enviar este presupuesto por WhatsApp" que pre-llena el mensaje con el detalle cotizado)*
  * **INSTAGRAM** (Píldora Rosa): `@jerefijo`
  * **YOUTUBE** (Píldora Naranja): `youtube.com/@JereMovil`
  * **WEB** (Píldora Azul): `jere-movil.ar`
* **Próximos Pasos:**
  1. **Contanos:** Tu producto y tus objetivos
  2. **Propuesta:** Armamos el formato ideal
  3. **¡A rodar!:** Se graba y se publica
* **Cierre:** `Gracias por sumarte a la ruta`

---

## 6. Recomendaciones Técnicas para la Implementación
* **Stack sugerido:** HTML5 + Tailwind CSS + JavaScript Vanilla (o React / Next.js según la arquitectura actual de `jere-movil.ar`).
* **Persistencia:** Guardar toda la estructura de paquetes y servicios en `localStorage` bajo una clave versionada (ej. `jeremovil_tarifario_v1`), incluyendo un botón de *"Restaurar valores originales"* por si se desea volver a los precios base del media kit.
* **Exportación PDF fiel:** Crear un contenedor específico `#pdf-template` estilizado con CSS inline/Tailwind exacto en formato A4 (`210mm` de ancho) para que al hacer clic en "Descargar PDF", la captura o impresión conserve los colores crema, bordes `#1E2433`, tipografía y píldoras sin cortes de página abruptos (`break-inside: avoid`).