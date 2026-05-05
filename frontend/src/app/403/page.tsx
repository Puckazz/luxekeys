import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

export default function ForbiddenPage() {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <section className="mx-auto w-full max-w-md text-center">
        <div className="bg-destructive/10 text-destructive mx-auto mb-5 flex size-14 items-center justify-center rounded-full">
          <ShieldAlert className="size-7" />
        </div>
        <h1 className="text-foreground text-3xl font-bold">403 Forbidden</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          You do not have permission to access this area.
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
