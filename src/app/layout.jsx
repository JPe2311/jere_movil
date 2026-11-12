import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Jere Móvil — Bitácora de viaje',
  description:
    'La bitácora interactiva de Jere y La Bebi: seguí la ruta por América, mirá los videos y sumate a la comunidad viajera.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFC93C',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
