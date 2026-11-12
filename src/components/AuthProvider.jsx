'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { isFirebaseConfigured, auth, db, googleProvider } from '@/lib/firebase';

const AuthContext = createContext({
  user: null,
  role: 'user',
  isAdmin: false,
  loading: true,
  configured: false,
  termsAccepted: false,
  youtubeSubscribed: false,
  instagramSubscribed: false,
  login: async () => {},
  logout: async () => {},
  error: null,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [youtubeSubscribed, setYoutubeSubscribed] = useState(false);
  const [instagramSubscribed, setInstagramSubscribed] = useState(false);
  const [isClientConfigured, setIsClientConfigured] = useState(isFirebaseConfigured());

  // Verificar si Firebase tiene credenciales en el cliente (solo una vez)
  useEffect(() => {
    try {
      setIsClientConfigured(!!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID));
    } catch {
      setIsClientConfigured(false);
    }
  }, []);

  // Suscribirse a auth state change SIEMPRE que auth exista
  useEffect(() => {
    if (!auth || !db) {
      // Firebase no configurado: modo demo sin mensaje, permitir login local
      setLoading(false);
      // Intentar restaurar sesión desde localStorage
      try {
        const saved = localStorage.getItem('jere_demo_user');
        if (saved) {
          const u = JSON.parse(saved);
          setUser(u);
          setRole(u.role || 'user');
          setTermsAccepted(u.termsAccepted || false);
          setYoutubeSubscribed(u.youtubeSubscribed || false);
          setInstagramSubscribed(u.instagramSubscribed || false);
        }
      } catch {
        /* ignorar */
      }
      return;
    }

    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setRole('user');
        setLoading(false);
        setTermsAccepted(false);
        setYoutubeSubscribed(false);
        setInstagramSubscribed(false);
        // Limpiar sesión demo
        try { localStorage.removeItem('jere_demo_user'); } catch {}
        return;
      }
      try {
        const ref = doc(db, 'usuarios', u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role || 'user');
          setTermsAccepted(data.terms_accepted || false);
          setYoutubeSubscribed(data.youtube_subscribed || false);
          setInstagramSubscribed(data.instagram_subscribed || false);
        } else {
          await setDoc(ref, {
            nombre: u.displayName || '',
            email: u.email || '',
            foto: u.photoURL || '',
            role: 'user',
            creado: Timestamp.now(),
            terms_accepted: false,
            youtube_subscribed: false,
            instagram_subscribed: false,
          });
          setRole('user');
          setTermsAccepted(false);
          setYoutubeSubscribed(false);
          setInstagramSubscribed(false);
        }
      } catch (err) {
        console.error('[auth] error leyendo perfil', err);
        setRole('user');
      } finally {
        setLoading(false);
      }
    });
  }, [auth, db]);

  const login = useCallback(async () => {
    setError(null);
    if (!auth) {
      // Modo demo: crear usuario local sin Firebase
      const demoUser = {
        uid: 'demo-' + Date.now(),
        displayName: 'Usuario Demo',
        email: 'demo@jere.com',
        photoURL: '',
        role: 'user',
        terms_accepted: false,
        youtube_subscribed: false,
        instagram_subscribed: false,
      };
      setUser(demoUser);
      setRole(demoUser.role);
      setTermsAccepted(false);
      setYoutubeSubscribed(false);
      setInstagramSubscribed(false);
      try { localStorage.setItem('jere_demo_user', JSON.stringify(demoUser)); } catch {}
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
    setUser(null);
    setRole('user');
    setLoading(false);
    setTermsAccepted(false);
    setYoutubeSubscribed(false);
    setInstagramSubscribed(false);
    setError(null);
    try { localStorage.removeItem('jere_demo_user'); } catch {}
    if (auth) {
      try { await signOut(auth); } catch {}
    }
  }, [auth]);

  const aceptarTerminos = useCallback(async (accepted) => {
    setTermsAccepted(accepted);
    if (user) {
      try {
        await setDoc(doc(db, 'usuarios', user.uid), { terms_accepted: accepted }, { merge: true });
      } catch {
        // Si no hay Firestore, guardar en localStorage
        try {
          const saved = localStorage.getItem('jere_demo_user');
          if (saved) {
            const u = JSON.parse(saved);
            u.terms_accepted = accepted;
            localStorage.setItem('jere_demo_user', JSON.stringify(u));
            setTermsAccepted(accepted);
          }
        } catch {}
      }
    } else {
      // Usuario demo: guardar en localStorage
      try {
        const saved = localStorage.getItem('jere_demo_user');
        if (saved) {
          const u = JSON.parse(saved);
          u.terms_accepted = accepted;
          localStorage.setItem('jere_demo_user', JSON.stringify(u));
          setTermsAccepted(accepted);
        }
      } catch {}
    }
  }, [user, db]);

  const marcarYoutube = useCallback(async (subscribed) => {
    setYoutubeSubscribed(subscribed);
    if (user) {
      try {
        await setDoc(doc(db, 'usuarios', user.uid), { youtube_subscribed: subscribed }, { merge: true });
      } catch {
        try {
          const saved = localStorage.getItem('jere_demo_user');
          if (saved) {
            const u = JSON.parse(saved);
            u.youtube_subscribed = subscribed;
            localStorage.setItem('jere_demo_user', JSON.stringify(u));
            setYoutubeSubscribed(subscribed);
          }
        } catch {}
      }
    } else {
      try {
        const saved = localStorage.getItem('jere_demo_user');
        if (saved) {
          const u = JSON.parse(saved);
          u.youtube_subscribed = subscribed;
          localStorage.setItem('jere_demo_user', JSON.stringify(u));
          setYoutubeSubscribed(subscribed);
        }
      } catch {}
    }
  }, [user, db]);

  const marcarInstagram = useCallback(async (subscribed) => {
    setInstagramSubscribed(subscribed);
    if (user) {
      try {
        await setDoc(doc(db, 'usuarios', user.uid), { instagram_subscribed: subscribed }, { merge: true });
      } catch {
        try {
          const saved = localStorage.getItem('jere_demo_user');
          if (saved) {
            const u = JSON.parse(saved);
            u.instagram_subscribed = subscribed;
            localStorage.setItem('jere_demo_user', JSON.stringify(u));
            setInstagramSubscribed(subscribed);
          }
        } catch {}
      }
    } else {
      try {
        const saved = localStorage.getItem('jere_demo_user');
        if (saved) {
          const u = JSON.parse(saved);
          u.instagram_subscribed = subscribed;
          localStorage.setItem('jere_demo_user', JSON.stringify(u));
          setInstagramSubscribed(subscribed);
        }
      } catch {}
    }
  }, [user, db]);

  const value = useMemo(
    () => ({
      user,
      role,
      isAdmin: role === 'admin',
      loading,
      configured: isClientConfigured,
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
    [user, role, loading, isClientConfigured, termsAccepted, youtubeSubscribed, instagramSubscribed, login, logout, error, aceptarTerminos, marcarYoutube, marcarInstagram]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}