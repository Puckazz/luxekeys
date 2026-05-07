'use client';

import { SearchX } from 'lucide-react';

import { AppErrorState } from '@/shared/components/layout/AppErrorState';

export default function NotFound() {
  return (
    <AppErrorState
      code="404"
      title="Page not found"
      description="The page or resource you are looking for may have moved, expired, or never existed."
      icon={SearchX}
    />
  );
}
