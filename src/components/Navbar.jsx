'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useAuth } from './AuthProvider';

const baseLinks = [
  { href: '/', key: 'nav_home', emoji: '🗺️' },
  { href: '/quien-soy', key: 'nav_about', emoji: '🙋' },
  { href: '/videos', key: 'nav_videos', emoji: '🎬' },
  { href: '/recursos', key: 'nav_resources', emoji: '🎁' },
  { href: '/redes', key: 'nav_social', emoji: '📲' },
  { href: '/design-system', key: 'nav_design', emoji: '🎨' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { t, lang, setLang } = useI18n();
  const { user, isAdmin, login, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = isAdmin ? [...baseLinks, { href: '/admin', key: 'nav_admin', emoji: '⚙️' }] : baseLinks;
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-[3000] h-16 border-b-[3px] border-noche bg-sol">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-3 sm:px-5">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold sm:text-2xl" onClick={() => setOpen(false)}>
          <motion.span whileHover={{ rotate: [0, -12, 12, 0] }} className="text-2xl" aria-hidden>
            🚐
          </motion.span>
          {t('brand')}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-full border-2 px-3 py-1 font-display text-sm font-bold transition',
                isActive(l.href)
                  ? 'border-noche bg-white shadow-comic-sm'
                  : 'border-transparent hover:border-noche hover:bg-white/60'
              )}
            >
              <span aria-hidden>{l.emoji}</span> {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            className="rounded-full border-2 border-noche bg-white px-2.5 py-1 font-display text-xs font-extrabold shadow-comic-sm"
            aria-label="Cambiar idioma / Change language"
          >
            {lang === 'es' ? 'ES → EN' : 'EN → ES'}
          </button>

          {user ? (
            <button type="button" onClick={logout} className="flex items-center gap-2 rounded-full border-2 border-noche bg-white py-0.5 pl-0.5 pr-3 text-xs font-bold shadow-comic-sm">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-7 w-7 rounded-full" />
              ) : (
                <span className="grid h-7 w-7 place-items-center rounded-full bg-cielo text-white">
                  {(user.displayName || '?')[0]}
                </span>
              )}
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          ) : (
            <button type="button" onClick={login} className="rounded-full border-2 border-noche bg-cielo px-3 py-1 text-xs font-extrabold text-white shadow-comic-sm">
              <span className="hidden sm:inline">{t('login')}</span>
              <span className="sm:hidden">Google</span>
            </button>
          )}

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border-2 border-noche bg-white text-lg lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-x-0 top-full flex flex-col gap-1 border-b-[3px] border-noche bg-crema p-3 shadow-soft lg:hidden"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-2xl border-2 px-4 py-2 font-display text-lg font-bold',
                  isActive(l.href) ? 'border-noche bg-sol shadow-comic-sm' : 'border-transparent'
                )}
              >
                <span aria-hidden>{l.emoji}</span> {t(l.key)}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
