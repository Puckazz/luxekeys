import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

type AdminListStateCardProps = {
  isLoading: boolean;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: LucideIcon;
  emptyActionLabel?: string;
  onEmptyActionClick?: () => void;
  loadingSkeleton?: ReactNode;
  children: ReactNode;
};

export function AdminListStateCard({
  isLoading,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyIcon: EmptyIcon,
  emptyActionLabel,
  onEmptyActionClick,
  loadingSkeleton,
  children,
}: AdminListStateCardProps) {
  if (isLoading) {
    if (loadingSkeleton) {
      return loadingSkeleton;
    }

    return (
      <Card className="border-border/70 bg-card/35">
        <CardContent className="p-4" aria-hidden="true">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="ml-auto h-4 w-20" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className="border-border/70 bg-card/35">
        <CardContent className="py-12 text-center">
          <EmptyIcon className="text-muted-foreground mx-auto size-8" />
          <p className="text-foreground mt-3 font-semibold">{emptyTitle}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {emptyDescription}
          </p>
          {emptyActionLabel && onEmptyActionClick ? (
            <div className="mt-4">
              <Button type="button" size="sm" onClick={onEmptyActionClick}>
                {emptyActionLabel}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card/35">
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
