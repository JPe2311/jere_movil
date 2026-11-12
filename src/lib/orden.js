/**
 * Numeración de la bitácora de viaje.
 *
 * Regla principal: el orden lo manda la FECHA. Si cargás un punto con una
 * fecha anterior a los existentes, el número de los puntos siguientes se
 * corre solo (+1). Además el admin puede mover un punto a mano (↑ ↓);
 * ese movimiento se respeta hasta la próxima inserción o cambio de fecha.
 *
 * Ojo: la animación del timeline y el trazado de la ruta siempre usan el
 * orden cronológico (fecha). Este módulo maneja el orden de los NÚMEROS
 * que se muestran en los pines, el timeline y el admin.
 */
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toMillis } from '@/lib/utils';

/** Fecha en ms de un punto (Timestamp de Firestore, string ISO, Date…). */
export const tsDe = (p) => toMillis(p?.fechaHora);

/**
 * Orden efectivo de la bitácora: por el campo `orden` cuando todos los
 * puntos lo tienen (así se respetan los movimientos manuales); si algún
 * punto todavía no lo tiene, orden cronológico por fecha.
 */
export function ordenarPuntos(puntos = []) {
  const arr = puntos.filter((p) => p && Number.isFinite(tsDe(p)));
  const todos = arr.length > 0 && arr.every((p) => Number.isFinite(p.orden));
  if (todos) return arr.sort((a, b) => a.orden - b.orden || tsDe(a) - tsDe(b));
  return arr.sort((a, b) => tsDe(a) - tsDe(b));
}

/**
 * Plan de numeración al insertar un punto nuevo o al cambiarle la fecha:
 * lo coloca en la posición que le corresponde por fecha y corre el resto.
 *
 * @param {Array} puntosExistentes  puntos ya guardados (sin el nuevo)
 * @param {{id: string}} nuevo     objeto con el id del punto a insertar
 * @param {number} tsNuevo         fecha del nuevo punto en ms
 * @returns {Array<{id: string, orden: number}>} numeración final 1..N
 */
export function planInsercion(puntosExistentes, nuevo, tsNuevo) {
  const arr = ordenarPuntos(puntosExistentes);
  let i = arr.findIndex((p) => tsDe(p) > tsNuevo);
  if (i === -1) i = arr.length;
  const ids = arr.map((p) => p.id);
  ids.splice(i, 0, nuevo.id);
  return ids.map((id, idx) => ({ id, orden: idx + 1 }));
}

/**
 * Plan al mover un punto un lugar arriba (-1) o abajo (+1).
 * Devuelve null si el punto no se puede mover en esa dirección.
 */
export function planMovimiento(puntos, id, dir) {
  const ids = ordenarPuntos(puntos).map((p) => p.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i === -1 || j < 0 || j >= ids.length) return null;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  return ids.map((x, idx) => ({ id: x, orden: idx + 1 }));
}

/** Plan de renumeración 1..N en el orden efectivo actual (p. ej. tras borrar). */
export const planRenumerar = (puntos) =>
  ordenarPuntos(puntos).map((p, idx) => ({ id: p.id, orden: idx + 1 }));

/**
 * Escribe en Firestore solo los `orden` que cambiaron (en un solo batch).
 *
 * @param {Array<{id: string, orden: number}>} plan  numeración deseada
 * @param {Array} actuales   documentos ya guardados, para comparar
 * @returns {Promise<number>} cuántos documentos se tocaron
 *
 * Nota: el plan NO debe contener puntos que todavía no existan en
 * Firestore (el punto nuevo se guarda aparte con su `orden` incluido).
 */
export async function persistirOrden(plan, actuales = []) {
  const previo = new Map(actuales.map((p) => [p.id, p.orden]));
  const batch = writeBatch(db);
  let n = 0;
  plan.forEach(({ id, orden }) => {
    if (previo.get(id) === orden) return;
    batch.update(doc(db, 'puntos_mapa', id), { orden });
    n += 1;
  });
  if (n > 0) await batch.commit();
  return n;
}
