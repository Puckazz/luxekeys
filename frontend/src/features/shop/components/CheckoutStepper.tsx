'use client';

import { CreditCard, ShieldCheck, Truck } from 'lucide-react';

import type {
  CheckoutStepKey,
  CheckoutStepperProps,
} from '@/features/shop/types/checkout.types';
import { cn } from '@/lib/utils';

const steps: Array<{
  key: CheckoutStepKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'review', label: 'Review', icon: ShieldCheck },
];

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const currentIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <ol className="mx-auto flex w-full max-w-2xl items-center justify-center gap-2 sm:gap-4">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isCompleted = index < currentIndex;
        const Icon = step.icon;

        return (
          <li key={step.key} className="flex items-center gap-2 sm:gap-4">
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide uppercase',
                isCurrent &&
                  'border-primary bg-primary/15 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.25)]',
                isCompleted &&
                  'border-primary/60 bg-primary/10 text-primary/90',
                !isCurrent &&
                  !isCompleted &&
                  'border-border bg-card/50 text-muted-foreground'
              )}
            >
              <Icon className="size-3.5" />
              {step.label}
            </div>

            {index < steps.length - 1 ? (
              <span
                className="bg-border hidden h-px w-10 sm:block"
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
