'use client';

/**
 * Rutas del viaje: agrupaciones de puntos (ej: "Ruta a Jujuy", "Ruta a Salta").
 * Los puntos pueden pertenecer a una ruta o no tener ninguna (ruta sin asignar).
 *
 * Estructura en Firestore:
 *   rutas/{id} → { titulo, descripcion, color, orden, creado }
 *
 * Lectura: pública (el mapa las muestra para filtrar).
 * Escritura: solo admin.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const COLECCION = 'rutas';

/** Crea una nueva ruta y devuelve su id. */
export async function crearRuta({ titulo, descripcion, color } = {}) {
  if (!db) throw new Error('Firebase sin configurar.');
  const ref = await addDoc(collection(db, COLECCION), {
    titulo: titulo || 'Ruta sin nombre',
    descripcion: descripcion || '',
    color: color || '#FFC93C',
    creado: serverTimestamp(),
  });
  return ref.id;
}

/** Actualiza una ruta existente. */
export async function actualizarRuta(id, { titulo, descripcion, color } = {}) {
  if (!db || !id) return;
  const datos = {};
  if (titulo !== undefined) datos.titulo = titulo;
  if (descripcion !== undefined) datos.descripcion = descripcion;
  if (color !== undefined) datos.color = color;
  await updateDoc(doc(db, COLECCION, id), datos);
}

/** Borra una ruta (no borra los puntos asociados, quedan sin ruta). */
export async function borrarRuta(id) {
  if (!db || !id) return;
  await deleteDoc(doc(db, COLECCION, id));
}

/** Devuelve todas las rutas ordenadas por título. */
export async function obtenerRutas() {
  if (!db) return [];
  const snap = await getDocs(collection(db, COLECCION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Obtiene una ruta por su id. */
export async function obtenerRuta(id) {
  if (!db || !id) return null;
  const snap = await getDoc(doc(db, COLECCION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
