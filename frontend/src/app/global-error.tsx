'use client';

import { ServerCrash } from 'lucide-react';

import { AppErrorState } from '@/shared/components/layout/AppErrorState';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppErrorState
          code="500"
          title="Application error"
          description="The application could not recover from an unexpected error."
          icon={ServerCrash}
          tone="destructive"
          actions={[
            { label: 'Try again', onClick: reset },
            { label: 'Back to home', href: '/', variant: 'outline' },
          ]}
        />
      </body>
    </html>
  );
}
