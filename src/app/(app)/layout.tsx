import { ReactNode, Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CenterSpinner } from '@/components/ui/feedback';

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  // AppShell reads usePathname/useDashboard (dynamic). Under cacheComponents
  // it must stream in behind a Suspense boundary.
  return (
    <Suspense fallback={<CenterSpinner />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
