'use client';

import { Providers } from '@/providers/providers';
import { ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
