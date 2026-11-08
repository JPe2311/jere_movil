'use client';

import { LanguageProvider } from '@/lib/i18n';
import { AuthProvider } from './AuthProvider';

export default function Providers({ children }) {
  return (
    <LanguageProvider>
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  );
}
