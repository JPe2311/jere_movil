export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-crema text-noche p-8 text-center">
      <div className="rounded-2xl border-2 border-noche bg-white shadow-comic p-6 max-w-md mx-auto">
        <div className="text-6xl mb-4">404</div>
        <h1 className="text-2xl font-bold">Página no encontrada</h1>
        <p className="text-noche/60 mt-4">
          La página que buscas no existe o ha sido movida.
        </p>
        <div className="mt-8">
          <a
            href="/"
            className="btn btn-rosa"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}