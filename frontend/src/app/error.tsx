'use client';

import { ServerCrash } from 'lucide-react';

import { AppErrorState } from '@/shared/components/layout/AppErrorState';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <AppErrorState
      code="500"
      title="Something went wrong"
      description="The page failed to load. Try again, or return home and continue browsing."
      icon={ServerCrash}
      tone="destructive"
      actions={[
        { label: 'Try again', onClick: reset },
        { label: 'Back to home', href: '/', variant: 'outline' },
      ]}
    />
  );
}
