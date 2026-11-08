import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

const safeName = (name) => name.replace(/[^\w.\-]/g, '_');

/** Sube un archivo y devuelve { url, path }. */
export async function uploadOne(file, folder) {
  if (!storage) throw new Error('Firebase Storage no está configurado.');
  const path = `${folder}/${Date.now()}-${safeName(file.name)}`;
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return { url: await getDownloadURL(r), path };
}

/** Sube varios archivos y devuelve la lista de URLs. */
export async function uploadFiles(files, folder) {
  const urls = [];
  for (const f of files) {
    const { url } = await uploadOne(f, folder);
    urls.push(url);
  }
  return urls;
}
