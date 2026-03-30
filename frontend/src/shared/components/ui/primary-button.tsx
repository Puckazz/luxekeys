import * as React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/ui/spinner';

type PrimaryButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  'variant'
> & {
  isLoading?: boolean;
  spinnerClassName?: string;
};

function PrimaryButton({
  className,
  children,
  disabled,
  isLoading = false,
  spinnerClassName,
  ...props
}: PrimaryButtonProps) {
  return (
    <Button
      variant="default"
      disabled={disabled || isLoading}
      className={cn(
        'text-primary-foreground h-12 w-full text-base font-bold',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner className={cn('size-6', spinnerClassName)} />
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export { PrimaryButton };
