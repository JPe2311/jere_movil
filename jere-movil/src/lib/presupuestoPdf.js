'use client';

import { precioARS } from '@/lib/tarifario';

const PALETA = {
  crema: '#FDF6E7',
  blanco: '#FFFFFF',
  tinta: '#1E2433',
  gris: '#5A6275',
  rojo: '#E31E24',
  naranja: '#F37021',
  verde: '#2B9E63',
  amarillo: '#F8C630',
  azul: '#2997D8',
  rosa: '#F25287',
};

const WHATSAPP = '5493517518953';

function esc(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fechaLarga(fecha) {
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function textoPresupuesto(datos) {
  const lineas = datos.items.map(
    (i) => `• ${i.cantidad > 1 ? `${i.cantidad}x ` : ''}${i.nombre} — ${precioARS(i.subtotal)}`
  );
  return [
    `¡Hola Jere! Te paso el presupuesto${datos.marca ? ` para ${datos.marca}` : ''}:`,
    '',
    ...lineas,
    '',
    `Subtotal: ${precioARS(datos.subtotal)}`,
    datos.descuento > 0
      ? `Bonificación (${datos.descuento}%): -${precioARS(datos.descuentoMonto)}`
      : null,
    `Total final: ${precioARS(datos.total)}`,
    datos.campania ? `\nCampaña: ${datos.campania}` : null,
    datos.validez ? `Validez: ${datos.validez}` : null,
    datos.notas ? `Notas: ${datos.notas}` : null,
    '',
    '¡Gracias por sumarte a la ruta! 🚐',
  ]
    .filter((l) => l !== null)
    .join('\n');
}

export function urlWhatsApp(datos) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(textoPresupuesto(datos))}`;
}

/**
 * Abre una página A4 con la propuesta lista para "Guardar como PDF".
 * Se usa HTML/CSS propio (no una captura) para que el texto y los colores
 * salgan nítidos y el documento respete la identidad del media kit.
 */
export function generarPresupuestoPDF(datos) {
  if (typeof window === 'undefined') return;

  const logo = `${window.location.origin}/logo_jere.png`;

  const filas = datos.items
    .map(
      (i) => `
        <div class="item">
          <div class="item-info">
            <div class="item-nombre">${esc(i.nombre)}${i.cantidad > 1 ? ` <span class="qty">x${i.cantidad}</span>` : ''}</div>
            ${i.detalle ? `<div class="item-detalle">${esc(i.detalle)}</div>` : ''}
          </div>
          <div class="item-precio">${esc(precioARS(i.subtotal))}</div>
        </div>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Propuesta de auspicios · Jere Móvil</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: ${PALETA.crema};
    color: ${PALETA.tinta};
    font-family: 'Plus Jakarta Sans', -apple-system, 'Segoe UI', Arial, sans-serif;
    font-size: 11px;
    line-height: 1.45;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .hoja { width: 100%; max-width: 186mm; margin: 0 auto; padding: 4px 0 10px; }
  h1, h2, h3, .display { font-family: 'Fredoka', 'Baloo 2', system-ui, sans-serif; margin: 0; letter-spacing: .2px; }

  .cabecera { display: flex; align-items: center; gap: 14px; border-bottom: 2px dashed #CBD5E1; padding-bottom: 12px; }
  .logo { width: 62px; height: 62px; border-radius: 999px; border: 3px solid ${PALETA.tinta}; object-fit: contain; background: #fff; padding: 3px; }
  .cabecera h1 { font-size: 21px; line-height: 1.05; }
  .cabecera .sub { font-size: 10.5px; font-weight: 700; color: ${PALETA.gris}; margin-top: 3px; }
  .tag { display: inline-block; border: 2px solid ${PALETA.tinta}; background: ${PALETA.amarillo}; border-radius: 999px; padding: 2px 9px; font-size: 9px; font-weight: 800; }

  .datos { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; margin: 14px 0 16px; }
  .dato { border-bottom: 1.5px dashed #CBD5E1; padding-bottom: 4px; }
  .dato b { display: block; font-size: 8.5px; text-transform: uppercase; letter-spacing: .8px; color: ${PALETA.gris}; }
  .dato span { font-size: 11.5px; font-weight: 800; }

  .bloque-titulo { display: flex; align-items: center; gap: 8px; margin: 16px 0 8px; }
  .num { width: 20px; height: 20px; border-radius: 999px; border: 2px solid ${PALETA.tinta}; background: ${PALETA.naranja}; color: #fff; display: grid; place-items: center; font-size: 10px; font-weight: 800; }
  .bloque-titulo h2 { font-size: 13px; text-transform: uppercase; }

  .item { display: flex; gap: 12px; align-items: flex-start; justify-content: space-between; background: ${PALETA.blanco}; border: 2px solid ${PALETA.tinta}; border-radius: 10px; box-shadow: 3px 3px 0 0 ${PALETA.tinta}; padding: 8px 11px; margin-bottom: 8px; break-inside: avoid; }
  .item-nombre { font-size: 11.5px; font-weight: 800; }
  .item-detalle { font-size: 9.5px; color: ${PALETA.gris}; font-weight: 600; margin-top: 1px; }
  .item-precio { font-size: 12px; font-weight: 800; white-space: nowrap; }
  .qty { display: inline-block; border: 1.5px solid ${PALETA.tinta}; border-radius: 999px; padding: 0 6px; font-size: 9px; background: ${PALETA.azul}; color: #fff; }

  .totales { display: flex; justify-content: flex-end; margin-top: 12px; break-inside: avoid; }
  .totales-caja { width: 78mm; background: ${PALETA.blanco}; border: 3px solid ${PALETA.tinta}; border-radius: 12px; box-shadow: 4px 4px 0 0 ${PALETA.tinta}; padding: 10px 12px; }
  .linea { display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; padding: 3px 0; }
  .linea.bonif { color: ${PALETA.verde}; }
  .linea.total { border-top: 2px dashed #CBD5E1; margin-top: 5px; padding-top: 7px; font-size: 14px; font-family: 'Fredoka', sans-serif; }
  .linea.total span:last-child { color: ${PALETA.rojo}; }

  .notas { margin-top: 14px; border: 2px dashed ${PALETA.tinta}; border-radius: 10px; padding: 8px 11px; background: #fff; font-size: 10px; color: ${PALETA.gris}; break-inside: avoid; }
  .notas b { color: ${PALETA.tinta}; font-size: 9px; text-transform: uppercase; letter-spacing: .7px; }

  .pasos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; break-inside: avoid; }
  .paso { background: #fff; border: 2px solid ${PALETA.tinta}; border-radius: 10px; padding: 8px; }
  .paso .n { width: 17px; height: 17px; border-radius: 999px; border: 2px solid ${PALETA.tinta}; display: grid; place-items: center; font-size: 9px; font-weight: 800; background: ${PALETA.amarillo}; margin-bottom: 4px; }
  .paso b { display: block; font-size: 10px; }
  .paso span { font-size: 9px; color: ${PALETA.gris}; font-weight: 600; }

  .zocalo { margin-top: 18px; border-top: 2px dashed #CBD5E1; padding-top: 10px; break-inside: avoid; }
  .contactos { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .pill { border: 2px solid ${PALETA.tinta}; border-radius: 999px; padding: 3px 9px; font-size: 9px; font-weight: 800; }
  .p-email { background: ${PALETA.amarillo}; }
  .p-wa { background: ${PALETA.verde}; color: #fff; }
  .p-ig { background: ${PALETA.rosa}; color: #fff; }
  .p-yt { background: ${PALETA.naranja}; color: #fff; }
  .p-web { background: ${PALETA.azul}; color: #fff; }
  .gracias { margin-top: 8px; font-family: 'Fredoka', sans-serif; font-size: 11px; font-weight: 700; }
  .no-print { text-align: center; margin: 10px 0 20px; }
  .no-print button { font: inherit; font-weight: 800; border: 3px solid ${PALETA.tinta}; border-radius: 999px; background: ${PALETA.amarillo}; padding: 8px 18px; cursor: pointer; box-shadow: 3px 3px 0 0 ${PALETA.tinta}; }
  @media print { .no-print { display: none !important; } .hoja { max-width: none; } }
</style>
</head>
<body>
  <div class="no-print"><button onclick="window.print()">Guardar como PDF</button></div>
  <div class="hoja">
    <div class="cabecera">
      <img class="logo" src="${logo}" alt="Jere Móvil" />
      <div>
        <span class="tag">PROPUESTA DE AUSPICIOS • 2026</span>
        <h1>Jere Móvil · La Bebi</h1>
        <div class="sub">Viajá con La Bebi · Sumá tu marca a la ruta</div>
      </div>
    </div>

    <div class="datos">
      <div class="dato"><b>Fecha de emisión</b><span>${esc(fechaLarga(datos.fecha))}</span></div>
      <div class="dato"><b>Marca / Cliente</b><span>${esc(datos.marca || 'A definir')}</span></div>
      <div class="dato"><b>Campaña / Etapa de la ruta</b><span>${esc(datos.campania || 'A definir')}</span></div>
      <div class="dato"><b>Validez de la oferta</b><span>${esc(datos.validez || '30 días')}</span></div>
    </div>

    <div class="bloque-titulo">
      <div class="num">04</div>
      <h2>Detalle de la propuesta</h2>
    </div>
    ${filas || '<p>No se seleccionaron ítems.</p>'}

    <div class="totales">
      <div class="totales-caja">
        <div class="linea"><span>Subtotal</span><span>${esc(precioARS(datos.subtotal))}</span></div>
        ${
          datos.descuento > 0
            ? `<div class="linea bonif"><span>Bonificación (${esc(datos.descuento)}%)</span><span>-${esc(precioARS(datos.descuentoMonto))}</span></div>`
            : ''
        }
        <div class="linea total"><span>Total final</span><span>${esc(precioARS(datos.total))}</span></div>
      </div>
    </div>

    ${datos.notas ? `<div class="notas"><b>Notas</b><br />${esc(datos.notas)}</div>` : ''}

    <div class="bloque-titulo">
      <div class="num">05</div>
      <h2>Próximos pasos</h2>
    </div>
    <div class="pasos">
      <div class="paso"><div class="n">1</div><b>Contanos</b><span>Tu producto y tus objetivos.</span></div>
      <div class="paso"><div class="n">2</div><b>Propuesta</b><span>Armamos el formato ideal.</span></div>
      <div class="paso"><div class="n">3</div><b>¡A rodar!</b><span>Se graba y se publica.</span></div>
    </div>

    <div class="zocalo">
      <div class="contactos">
        <span class="pill p-email">jeremovil@gmail.com</span>
        <span class="pill p-wa">+54 9 3517 51-8953</span>
        <span class="pill p-ig">@jerefijo</span>
        <span class="pill p-yt">youtube.com/@JereMovil</span>
        <span class="pill p-web">jere-movil.ar</span>
      </div>
      <div class="gracias">Gracias por sumarte a la ruta 🚐</div>
    </div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    window.alert('Permití las ventanas emergentes para descargar el PDF.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  // Esperamos a que el logo/fuentes estén listos antes de abrir el diálogo.
  window.setTimeout(() => {
    try {
      win.print();
    } catch {
      /* si el navegador bloquea el print, queda el botón "Guardar como PDF" */
    }
  }, 700);
}
