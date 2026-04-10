import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

const ROW_COUNT = 7;

export function AdminOrdersTableSkeleton() {
  return (
    <Card className="border-border/70 bg-card/35" aria-hidden="true">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-[0.5fr_1fr_1.8fr_1fr_0.7fr_0.9fr_0.9fr_0.7fr] gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-18" />
            <Skeleton className="h-4 w-18" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="ml-auto h-4 w-12" />
          </div>

          <div className="space-y-2">
            {Array.from({ length: ROW_COUNT }).map((_, index) => (
              <div
                key={`admin-orders-skeleton-row-${index}`}
                className="grid grid-cols-[0.5fr_1fr_1.8fr_1fr_0.7fr_0.9fr_0.9fr_0.7fr] items-center gap-2"
              >
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-34" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="ml-auto h-8 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
