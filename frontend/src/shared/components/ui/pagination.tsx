import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';

type PaginationProps = React.ComponentProps<'nav'> & {
  children?: React.ReactNode;
};

function Pagination({ className, ...props }: PaginationProps) {
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      data-slot="pagination"
      className={cn('flex items-center justify-center gap-2', className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  );
}

function PaginationItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li data-slot="pagination-item" className={cn('', className)} {...props} />
  );
}

function PaginationLink({
  className,
  isActive,
  size = 'icon-lg',
  ...props
}: React.ComponentProps<typeof Button> & {
  isActive?: boolean;
}) {
  return (
    <Button
      data-slot="pagination-link"
      aria-current={isActive ? 'page' : undefined}
      variant={isActive ? 'default' : 'outline'}
      size={size}
      className={cn('rounded-full', className)}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="icon-lg"
      className={cn('rounded-full', className)}
      {...props}
    >
      <ChevronLeftIcon className="size-4" />
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="icon-lg"
      className={cn('rounded-full', className)}
      {...props}
    >
      <ChevronRightIcon className="size-4" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden
      className={cn(
        'text-muted-foreground flex h-10 w-10 items-center justify-center text-sm font-medium',
        className
      )}
      {...props}
    >
      ...
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
