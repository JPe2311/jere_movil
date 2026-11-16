'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { imagenADataUrl } from '@/lib/tarifario';
import { cargarFotosYoutube, guardarFotosYoutube } from '@/lib/fotosYoutube';

const COLORES = ['#F37021', '#E31E24', '#2997D8', '#2B9E63', '#F25287'];

export default function FormatosYoutube({ formatos }) {
  const { isAdmin } = useAuth();
  const [fotos, setFotos] = useState({});
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    setFotos(cargarFotosYoutube());
  }, []);

  function actualizar(id, valor) {
    const siguiente = { ...fotos };
    if (valor) siguiente[id] = valor;
    else delete siguiente[id];
    setFotos(siguiente);
    setAviso(
      guardarFotosYoutube(siguiente)
        ? ''
        : 'No pudimos guardar la foto en este navegador (se quedó sin espacio). Probá con una imagen más liviana.'
    );
  }

  async function subir(id, file) {
    if (!file) return;
    try {
      const dataUrl = await imagenADataUrl(file, 960, 0.78);
      actualizar(id, dataUrl);
    } catch {
      setAviso('No pudimos procesar esa imagen. Probá con otro archivo.');
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {formatos.map((f, i) => {
          const foto = fotos[f.id];
          return (
            <article
              key={f.id}
              className={`relative flex flex-col overflow-hidden rounded-2xl border-[3px] border-[#1E2433] bg-white shadow-[4px_4px_0_0_#1E2433] ${
                f.destacado ? 'md:col-span-2' : ''
              }`}
            >
              {f.destacado && (
                <span className="absolute right-3 top-3 z-10 rounded-full border-2 border-[#1E2433] bg-[#E31E24] px-2 py-0.5 text-[10px] font-extrabold text-white shadow-[2px_2px_0_0_#1E2433]">
                  {f.destacado}
                </span>
              )}

              <div
                className={`relative w-full border-b-[3px] border-[#1E2433] bg-[#FFF9EC] ${
                  f.destacado ? 'h-56 sm:h-64' : 'h-44'
                }`}
              >
                {foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={foto}
                    alt={`Foto de ejemplo de ${f.nombre}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1 text-[11px] font-bold text-[#5A6275]">
                    <span className="text-2xl" aria-hidden>
                      📷
                    </span>
                    <span>Foto de ejemplo</span>
                  </div>
                )}

                {isAdmin && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <label className="cursor-pointer rounded-full border-2 border-[#1E2433] bg-white px-2 py-0.5 text-[10px] font-extrabold shadow-[2px_2px_0_0_#1E2433]">
                      📷 {foto ? 'Cambiar' : 'Subir foto'}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          subir(f.id, e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    {foto && (
                      <button
                        type="button"
                        onClick={() => actualizar(f.id, '')}
                        className="rounded-full border-2 border-[#1E2433] bg-white px-2 py-0.5 text-[10px] font-extrabold shadow-[2px_2px_0_0_#1E2433]"
                        title="Quitar foto"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#1E2433] font-kit text-xs font-bold text-white"
                    style={{ backgroundColor: COLORES[i % COLORES.length] }}
                  >
                    {i + 1}
                  </span>
                  <h3 className="font-kit text-lg font-bold">{f.nombre}</h3>
                  <span className="rounded-full border-2 border-[#1E2433] bg-[#F8C630] px-2 py-0.5 text-[10px] font-extrabold uppercase">
                    {f.tiempo}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5A6275]">
                  {f.texto}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {isAdmin && (
        <p className="mt-3 rounded-lg border-2 border-dashed border-[#CBD5E1] bg-white px-3 py-1.5 text-[11px] font-bold text-[#5A6275]">
          Modo admin: las fotos de ejemplo se guardan en este navegador, igual que el tarifario.
        </p>
      )}

      {aviso && (
        <p className="mt-3 rounded-lg border-2 border-[#E31E24] bg-[#FFF1F1] px-3 py-2 text-xs font-bold text-[#E31E24]">
          {aviso}
        </p>
      )}

      <p className="mt-4 text-xs font-bold italic text-[#5A6275]">
        * Los tiempos son aproximados y se confirman en la revisión previa con la marca.
      </p>
    </>
  );
}
