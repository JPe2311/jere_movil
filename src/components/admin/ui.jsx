'use client';

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="text-sm font-extrabold">{label}</span>
      {children}
      {hint && <span className="block text-xs font-semibold text-noche/60">{hint}</span>}
    </label>
  );
}

export function Notice({ children, tone = 'error' }) {
  if (!children) return null;
  const color = tone === 'ok' ? 'bg-monte/20' : 'bg-rosa/20';
  return <p className={`rounded-2xl border-2 border-noche px-3 py-2 text-sm font-bold ${color}`}>{children}</p>;
}

export function Panel({ title, children }) {
  return (
    <section className="card-comic space-y-4 p-5">
      <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

/** Miniaturas con botón de quitar (para listas de URLs de fotos). */
export function PhotoStrip({ urls, onRemove }) {
  if (!urls?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {urls.map((u) => (
        <div key={u} className="relative h-16 w-24 overflow-hidden rounded-xl border-2 border-noche">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onRemove(u)}
            className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-noche bg-rosa text-[10px] font-extrabold text-white"
            aria-label="Quitar"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
