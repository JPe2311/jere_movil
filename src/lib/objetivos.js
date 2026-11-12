'use client';

/**
 * Objetivos en el mapa: hitos que el usuario quiere marcar (ej: Machu Picchu)
 * que NO son parte de la ruta cronológica, solo un punto de referencia visual.
 *
 * Estructura en Firestore:
 *   objetivos/{id} → { titulo, descripcion, lat, lng, creado }
 *
 * Lectura: pública (el mapa los muestra a todos).
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

export const COLECCION = 'objetivos';

/** Crea un nuevo objetivo y devuelve su id. */
export async function crearObjetivo({ titulo, descripcion, lat, lng }) {
  if (!db) throw new Error('Firebase sin configurar.');
  const ref = await addDoc(collection(db, COLECCION), {
    titulo: titulo || 'Objetivo',
    descripcion: descripcion || '',
    lat: Number(lat),
    lng: Number(lng),
    creado: serverTimestamp(),
  });
  return ref.id;
}

/** Actualiza un objetivo existente. */
export async function actualizarObjetivo(id, { titulo, descripcion, lat, lng } = {}) {
  if (!db || !id) return;
  const datos = {};
  if (titulo !== undefined) datos.titulo = titulo;
  if (descripcion !== undefined) datos.descripcion = descripcion;
  if (lat !== undefined) datos.lat = Number(lat);
  if (lng !== undefined) datos.lng = Number(lng);
  await updateDoc(doc(db, COLECCION, id), datos);
}

/** Borra un objetivo. */
export async function borrarObjetivo(id) {
  if (!db || !id) return;
  await deleteDoc(doc(db, COLECCION, id));
}

/** Devuelve todos los objetivos guardados. */
export async function obtenerObjetivos() {
  if (!db) return [];
  const snap = await getDocs(collection(db, COLECCION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
