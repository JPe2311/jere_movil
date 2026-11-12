'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import LoginWall from '@/components/LoginWall';
import PuntosAdmin from '@/components/admin/PuntosAdmin';
import EnVivoAdmin from '@/components/admin/EnVivoAdmin';
import ObjetivosAdmin from '@/components/admin/ObjetivosAdmin';
import RutasAdmin from '@/components/admin/RutasAdmin';
import QuienSoyAdmin from '@/components/admin/QuienSoyAdmin';
import VideosAdmin from '@/components/admin/VideosAdmin';
import RecursosAdmin from '@/components/admin/RecursosAdmin';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'puntos', label: '📍 Puntos del mapa', C: PuntosAdmin },
  { id: 'envivo', label: '📡 En vivo', C: EnVivoAdmin },
  { id: 'objetivos', label: '🏁 Objetivos', C: ObjetivosAdmin },
  { id: 'rutas', label: '🗺️ Rutas', C: RutasAdmin },
  { id: 'quien', label: '🙋 Quién soy', C: QuienSoyAdmin },
  { id: 'videos', label: '🎬 Videos', C: VideosAdmin },
  { id: 'recursos', label: '🎁 Recursos', C: RecursosAdmin },
];

export default function AdminPage() {
  const { user, isAdmin, loading, configured } = useAuth();
  const [tab, setTab] = useState('puntos');

  if (!configured) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="card-comic space-y-2 p-6 text-center">
          <div className="text-5xl">🔧</div>
          <h1 className="font-display text-2xl font-extrabold">Firebase sin configurar</h1>
          <p className="font-semibold">Completá las variables NEXT_PUBLIC_FIREBASE_* (ver .env.example) para usar el panel.</p>
        </div>
      </div>
    );
  }

  if (loading) return <p className="py-20 text-center font-bold">Cargando…</p>;

  if (!user) {
    return (
      <div className="px-4 py-16">
        <LoginWall />
      </div>
    );
  }

  // Esta es solo la barrera de interfaz: la seguridad real la imponen firestore.rules y storage.rules.
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="card-comic space-y-2 p-6 text-center">
          <div className="text-5xl">⛔</div>
          <h1 className="font-display text-2xl font-extrabold">Zona solo para el admin</h1>
          <p className="font-semibold">Tu cuenta ({user.email}) no tiene el rol admin.</p>
        </div>
      </div>
    );
  }

  const Active = tabs.find((t) => t.id === tab).C;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <header>
        <h1 className="page-title">⚙️ Panel de Jere</h1>
        <p className="font-semibold">Todo lo que cargues acá aparece al instante en la web.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-full border-[3px] border-noche px-4 py-1 font-display font-bold transition',
              tab === t.id ? 'bg-sol shadow-comic-sm' : 'bg-white hover:bg-crema'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Active />
    </div>
  );
}
