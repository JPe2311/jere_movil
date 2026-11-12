'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Formulario de contacto para dejar mensajes a Jere.
 * Los mensajes se guardan en la colección 'contactos' de Firestore.
 */
export default function ContactoForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !mensaje.trim()) return;

    setEnviando(true);
    try {
      await setDoc(doc(db, 'contactos'), {
        nombre: nombre.trim(),
        email: email.trim(),
        mensaje: mensaje.trim(),
        fecha: new Date(),
        leido: false,
      });
      setEnviado(true);
      setNombre('');
      setEmail('');
      setMensaje('');
    } catch (err) {
      alert('No se pudo enviar el mensaje. Inténtalo de nuevo.');
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-comic p-8 max-w-md w-full border-[3px] border-noche shadow-comic text-center"
      >
        <div className="text-4xl mb-4" aria-hidden>✅</div>
        <h3 className="font-display text-2xl font-extrabold text-noche">¡Mensaje enviado!</h3>
        <p className="text-sm font-semibold text-noche/70">
          Gracias por escribirnos. Te responderemos a la brevedad.
        </p>
      </motion.div>
    );
  }

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-comic p-6 sm:p-8 border-[3px] border-noche shadow-comic"
        >
          <h2 className="font-display text-2xl font-extrabold text-center text-noche mb-6">
            Escríbenos
          </h2>
          <p className="text-sm font-semibold text-noche/70 text-center mb-6">
            ¿Tienes una pregunta, quieres colaborar o solo saludar?
            Escríbenos y te responderemos.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-noche">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full rounded-2xl border-[3px] border-noche bg-white px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-sol/60"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-noche">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-2xl border-[3px] border-noche bg-white px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-sol/60"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-noche">Mensaje</label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="¿Qué quieres decirnos?"
                rows={4}
                className="w-full rounded-2xl border-[3px] border-noche bg-white px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-sol/60"
                required
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-noche font-extrabold text-lg shadow-comic-sm transition-transform active:scale-95 ${
                enviando ? 'bg-noche/40 text-noche/40 cursor-not-allowed' : 'bg-sol text-white hover:bg-yellow-300'
              }`}
            >
              {enviando ? 'Enviando…' : 'Enviar mensaje'}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
