'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Comments from '@/components/Comments';
import { useCollection } from '@/lib/useCollection';
import { useI18n } from '@/lib/i18n';
import { formatDate, loc, toMillis, youtubeThumb } from '@/lib/utils';

const norm = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function VideoCard({ video }) {
  const { t, lang } = useI18n();
  const [playing, setPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const titulo = loc(video, 'titulo', lang);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card-comic flex flex-col overflow-hidden"
    >
      <div className="relative aspect-video border-b-[3px] border-noche bg-noche">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1`}
            title={titulo}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={`${t('videos_play')}: ${titulo}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={youtubeThumb(video.youtubeId)} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
            <span className="absolute inset-0 grid place-items-center">
              <motion.span
                whileHover={{ scale: 1.15, rotate: -6 }}
                className="grid h-16 w-16 place-items-center rounded-full border-[3px] border-noche bg-sol text-2xl shadow-comic"
              >
                ▶
              </motion.span>
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip bg-cielo text-white">
            {t('videos_season')} {video.temporada}
          </span>
          <span className="text-xs font-bold text-noche/60">{formatDate(toMillis(video.fecha), lang)}</span>
        </div>
        <h3 className="font-display text-xl font-extrabold leading-tight">{titulo}</h3>
        {loc(video, 'descripcion', lang) && (
          <p className="line-clamp-3 text-sm font-semibold">{loc(video, 'descripcion', lang)}</p>
        )}
        <button type="button" onClick={() => setShowComments((s) => !s)} className="btn-ghost mt-auto self-start !py-1 text-sm">
          💬 {t('videos_comments')}
        </button>
        {showComments && <Comments videoId={video.id} />}
      </div>
    </motion.article>
  );
}

export default function VideosPage() {
  const { t } = useI18n();
  const { items, loading } = useCollection('videos', 'fecha', 'desc');
  const [season, setSeason] = useState('all');
  const [sort, setSort] = useState('new');
  const [q, setQ] = useState('');

  const seasons = useMemo(() => [...new Set(items.map((v) => v.temporada))].filter((s) => s != null).sort((a, b) => a - b), [items]);

  const filtered = useMemo(() => {
    const n = norm(q.trim());
    return items
      .filter((v) => season === 'all' || String(v.temporada) === season)
      .filter(
        (v) =>
          !n ||
          norm([v.titulo, v.titulo_en, v.descripcion, ...(v.palabrasClave || [])].filter(Boolean).join(' ')).includes(n)
      )
      .sort((a, b) => (sort === 'new' ? 1 : -1) * (toMillis(b.fecha) - toMillis(a.fecha)));
  }, [items, season, sort, q]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <header className="text-center">
        <div className="mb-2 text-6xl" aria-hidden>
          🎬
        </div>
        <h1 className="page-title">{t('videos_title')}</h1>
        <p className="mt-1 font-semibold">{t('videos_subtitle')}</p>
      </header>

      <div className="card-comic grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]">
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`🔎 ${t('videos_search')}`} />
        <select className="input" value={season} onChange={(e) => setSeason(e.target.value)} aria-label={t('videos_season')}>
          <option value="all">{t('videos_season')}: {t('videos_all')}</option>
          {seasons.map((s) => (
            <option key={s} value={String(s)}>
              {t('videos_season')} {s}
            </option>
          ))}
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="new">{t('videos_sort_new')}</option>
          <option value="old">{t('videos_sort_old')}</option>
        </select>
      </div>

      {loading && <p className="text-center font-bold">{t('loading')}</p>}
      {!loading && filtered.length === 0 && <p className="text-center font-bold">{t('videos_empty')}</p>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
