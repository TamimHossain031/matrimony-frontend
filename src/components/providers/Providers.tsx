'use client';

import { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { I18nProvider } from '@/lib/i18n';
import { ToastProvider } from './ToastProvider';
import { AuthProvider } from './AuthProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <I18nProvider>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </QueryProvider>
  );
}
