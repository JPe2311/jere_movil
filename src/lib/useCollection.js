'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

/** Suscripción en vivo a una colección (o subcolección) de Firestore. */
export function useCollection(path, orderField, direction = 'asc') {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(isFirebaseConfigured && Boolean(path));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !path) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const ref = collection(db, path);
    const q = orderField ? query(ref, orderBy(orderField, direction)) : ref;
    return onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(`[useCollection] ${path}`, err);
        setError(err);
        setLoading(false);
      }
    );
  }, [path, orderField, direction]);

  return { items, loading, error };
}
