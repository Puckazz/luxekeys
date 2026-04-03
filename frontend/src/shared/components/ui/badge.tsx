import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide uppercase transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/90 text-primary-foreground',
        secondary: 'bg-accent/70 text-accent-foreground',
        success: 'bg-emerald-500/90 text-white',
        warning: 'bg-amber-400/90 text-black',
        destructive: 'bg-destructive text-destructive-foreground',
        tag: 'bg-slate-700 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
