import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function AdminInventoryStatsSkeleton() {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={`admin-inventory-stats-skeleton-${index}`}
          className="border-border/70 bg-card/35"
        >
          <CardContent className="space-y-3 py-5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
