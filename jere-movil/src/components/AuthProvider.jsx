'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

const AuthContext = createContext({
  user: null,
  role: 'user',
  isAdmin: false,
  loading: false,
  configured: false,
  login: async () => {},
  logout: async () => {},
  error: null,
  termsAccepted: false,
  youtubeSubscribed: false,
  instagramSubscribed: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [youtubeSubscribed, setYoutubeSubscribed] = useState(false);
  const [instagramSubscribed, setInstagramSubscribed] = useState(false);

  useEffect(() => {
    if (!auth || !db) return undefined;
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setRole('user');
        setLoading(false);
        setTermsAccepted(false);
        setYoutubeSubscribed(false);
        setInstagramSubscribed(false);
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
    }),
    [user, role, loading, configured, termsAccepted, youtubeSubscribed, instagramSubscribed, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() => useContext(AuthContext);