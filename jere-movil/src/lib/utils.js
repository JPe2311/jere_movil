export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/** Acepta Timestamp de Firestore, Date, ISO string o número y devuelve milisegundos. */
export function toMillis(v) {
  if (v == null) return NaN;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return new Date(v).getTime();
  if (v instanceof Date) return v.getTime();
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (typeof v.seconds === 'number') return v.seconds * 1000;
  return NaN;
}

const locale = (lang) => (lang === 'en' ? 'en-US' : 'es-AR');

export function formatDate(ms, lang = 'es', opts = { dateStyle: 'long' }) {
  if (!Number.isFinite(ms)) return '';
  return new Intl.DateTimeFormat(locale(lang), opts).format(new Date(ms));
}

export function formatDateTime(ms, lang = 'es') {
  return formatDate(ms, lang, { dateStyle: 'full', timeStyle: 'short' });
}

const pad = (n) => String(n).padStart(2, '0');
export function toDateInput(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function toTimeInput(ms) {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Devuelve el campo en el idioma pedido, con fallback a español (campo base). */
export function loc(doc, field, lang) {
  if (!doc) return '';
  if (lang === 'en' && doc[`${field}_en`]) return doc[`${field}_en`];
  return doc[field] ?? '';
}

/** Extrae el ID de 11 caracteres de una URL de YouTube (o acepta el ID directo). */
export function youtubeId(input = '') {
  const s = String(input).trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/
  );
  return m ? m[1] : null;
}

export const youtubeThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
