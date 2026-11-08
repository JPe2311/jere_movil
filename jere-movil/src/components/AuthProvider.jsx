'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

// Keys de localStorage
const LS_USER = 'jere_user_session';
const LS_CONFIG = 'jere_config_session';

const AuthContext = createContext({
  user: null,
  role: 'user',
  isAdmin: false,
  loading: false,
  configured: false, // Será setado en useEffect abajo
  login: async () => {},
  logout: async () => {},
  error: null,
  termsAccepted: false,
  youtubeSubscribed: false,
  instagramSubscribed: false,
});

// Helper: leer config de LS (devuelve null si no hay)
const readLS = (key) => {
  try {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return null;
    const v = w.localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};

// Helper: guardar en LS
const saveLS = (key, obj) => {
  try {
    const w = typeof window !== 'undefined' ? window : null;
    if (!w) return;
    w.localStorage.setItem(key, JSON.stringify(obj));
  } catch {
    /* sin LS: no pasa nada */
  }
};

function restoreFromLS() {
  const lsUser = readLS(LS_USER);
  const lsCfg = readLS(LS_CONFIG);
  if (lsUser) {
    // Restauramos user basic, el resto lo completaremos al leer Firestore
    return { ...lsUser, _ls: true };
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState(null);
  // State que viene de LS o se llena de Firestore
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [youtubeSubscribed, setYoutubeSubscribed] = useState(false);
  const [instagramSubscribed, setInstagramSubscribed] = useState(false);

  // Cargar desde LS al iniciar (solo una vez)
  const loadFromLS = useCallback(() => {
    const lsData = readLS(LS_USER);
    if (lsUser && lsUser._ls) {
      setUser(lsUser.user || null);
      setRole(lsUser.role || 'user');
      setTermsAccepted(lsUser.termsAccepted !== false);
      setYoutubeSubscribed(lsUser.youtubeSubscribed || false);
      setInstagramSubscribed(lsUser.instagramSubscribed || false);
      // Marcamos que ya cargamos de LS, el resto lo completamos de Firestore
    }
  }, []);

  useEffect(() => {
    loadFromLS();
    // Suscripción normal a auth state_changed
    if (!auth || !db) return undefined;
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setRole('user');
        setLoading(false);
        setTermsAccepted(false);
        setYoutubeSubscribed(false);
        setInstagramSubscribed(false);
        // Limpiar LS al desconectar
        saveLS(LS_USER, null);
        return;
      }
      try {
        const ref = doc(db, 'usuarios', u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role || 'user');
          // Guardar en LS para futuras recargas rápidas
          saveLS(LS_USER, {
            user: { uid: u.uid, displayName: u.displayName, photoURL: u.photoURL },
            role: data.role || 'user',
            termsAccepted: data.terms_accepted,
            youtubeSubscribed: data.youtube_subscribed,
            instagramSubscribed: data.instagram_subscribed,
          });
          setTermsAccepted(data.terms_accepted || false);
          setYoutubeSubscribed(data.youtube_subscribed || false);
          setInstagramSubscribed(data.instagram_subscribed || false);
        } else {
          // Primer ingreso
          await setDoc(ref, {
            nombre: u.displayName || '',
            email: u.email || '',
            foto: u.photoURL || '',
            role: 'user',
            creado: serverTimestamp(),
            terms_accepted: false,
            youtube_subscribed: false,
            instagram_subscribed: false,
          });
          setRole('user');
          setTermsAccepted(false);
          setYoutubeSubscribed(false);
          setInstagramSubscribed(false);
          saveLS(LS_USER, {
            user: { uid: u.uid, displayName: u.displayName, photoURL: u.photoURL },
            role: 'user',
            termsAccepted: false,
            youtubeSubscribed: false,
            instagramSubscribed: false,
          });
        }
      } catch (err) {
        console.error('[auth] error leyendo perfil', err);
        setRole('user');
      } finally {
        setLoading(false);
      }
    });
  }, [db, auth]);

  useEffect(() => {
    loadFromLS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar aceptación de T&C en Firestore + LS
  const aceptarTerminos = useCallback(async (accepted) => {
    if (!user || !db) return;
    setTermsAccepted(accepted);
    await setDoc(doc(db, 'usuarios', user.uid), {
      terms_accepted: accepted,
    }, { merge: true });
    saveLS(LS_USER, {
      ...readLS(LS_USER) || {},
      termsAccepted: accepted,
    });
  }, [user, db]);

  // Marcar/youtube inscrito en Firestore + LS
  const marcarYoutube = useCallback(async (subscribed) => {
    if (!user || !db) return;
    setYoutubeSubscribed(subscribed);
    await setDoc(doc(db, 'usuarios', user.uid), {
      youtube_subscribed: subscribed,
    }, { merge: true });
    saveLS(LS_USER, {
      ...readLS(LS_USER) || {},
      youtubeSubscribed: subscribed,
    });
  }, [user, db]);

  // Marcar/instagram inscrito en Firestore + LS
  const marcarInstagram = useCallback(async (subscribed) => {
    if (!user || !db) return;
    setInstagramSubscribed(subscribed);
    await setDoc(doc(db, 'usuarios', user.uid), {
      instagram_subscribed: subscribed,
    }, { merge: true });
    saveLS(LS_USER, {
      ...readLS(LS_USER) || {},
      instagramSubscribed: subscribed,
    });
  }, [user, db]);

  const login = useCallback(async () => {
    setError(null);
    if (!auth) {
      setError('demo');
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        console.error(err);
        setError('error');
      }
    }
  }, []);

  const logout = useCallback(async () => {
    if (auth) await signOut(auth);
    // Limpiar LS al desconectar
    saveLS(LS_USER, null);
  }, [auth]);

  const value = useMemo(
    () => ({
      user,
      role,
      isAdmin: role === 'admin',
      loading,
      configured: isFirebaseConfigured,
      termsAccepted,
      youtubeSubscribed,
      instagramSubscribed,
      login,
      logout,
      error,
      aceptarTerminos,
      marcarYoutube,
      marcarInstagram,
    }),
    [user, role, loading, configured, termsAccepted, youtubeSubscribed, instagramSubscribed, login, logout, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}