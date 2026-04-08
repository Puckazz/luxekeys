import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Spinner } from '@/shared/components/ui/spinner';

type AdminListStateCardProps = {
  isLoading: boolean;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: LucideIcon;
  emptyActionLabel?: string;
  onEmptyActionClick?: () => void;
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
  children,
}: AdminListStateCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border/70 bg-card/35">
        <CardContent className="items-center justify-center py-16">
          <Spinner />
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
