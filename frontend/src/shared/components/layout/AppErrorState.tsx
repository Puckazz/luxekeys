'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

type AppErrorStateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline';
};

type AppErrorStateProps = {
  code: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone?: 'primary' | 'destructive';
  actions?: AppErrorStateAction[];
};

const toneClassByValue: Record<NonNullable<AppErrorStateProps['tone']>, string> =
  {
    primary: 'bg-primary/10 text-primary',
    destructive: 'bg-destructive/10 text-destructive',
  };

export function AppErrorState({
  code,
  title,
  description,
  icon: Icon,
  tone = 'primary',
  actions = [{ label: 'Back to home', href: '/' }],
}: AppErrorStateProps) {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-16">
      <section className="mx-auto w-full max-w-md text-center">
        <div
          className={`${toneClassByValue[tone]} mx-auto mb-5 flex size-14 items-center justify-center rounded-full`}
        >
          <Icon className="size-7" />
        </div>
        <p className="text-primary text-xl font-bold tracking-[0.2em] uppercase">
          {code}
        </p>
        <h1 className="text-foreground mt-3 text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          {description}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {actions.map((action) => {
            if (action.href) {
              return (
                <Button
                  key={`${action.label}-${action.href}`}
                  asChild
                  variant={action.variant}
                >
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              );
            }

            return (
              <Button
                key={action.label}
                type="button"
                variant={action.variant}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
