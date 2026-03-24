import Link from 'next/link';
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/shared/components/ui/button';

type ButtonSize = VariantProps<typeof buttonVariants>['size'];

type LinkButtonProps = React.ComponentProps<typeof Link> & {
  className?: string;
  size?: ButtonSize;
};

function PrimaryButtonLink({
  href,
  children,
  className,
  size = 'default',
  ...props
}: LinkButtonProps) {
  return (
    <Button
      asChild
      size={size}
      className={cn('h-12 rounded-md px-7 text-sm font-semibold', className)}
    >
      <Link href={href} {...props}>
        {children}
      </Link>
    </Button>
  );
}

function OutlineButtonLink({
  href,
  children,
  className,
  size = 'default',
  ...props
}: LinkButtonProps) {
  return (
    <Button
      asChild
      variant="outline"
      size={size}
      className={cn('h-12 rounded-md px-7 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700', className)}
    >
      <Link href={href} {...props}>
        {children}
      </Link>
    </Button>
  );
}

export { PrimaryButtonLink, OutlineButtonLink };
