import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

const ROW_COUNT = 6;

export function AdminProductsTableSkeleton() {
  return (
    <Card className="border-border/70 bg-card/35" aria-hidden="true">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-[2.2fr_1fr_0.8fr_0.8fr_1fr_0.8fr_0.8fr] gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="ml-auto h-4 w-14" />
          </div>

          <div className="space-y-2">
            {Array.from({ length: ROW_COUNT }).map((_, index) => (
              <div
                key={`admin-products-skeleton-row-${index}`}
                className="grid grid-cols-[2.2fr_1fr_0.8fr_0.8fr_1fr_0.8fr_0.8fr] items-center gap-2 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-[14px]" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-4 w-18" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="ml-auto h-8 w-18 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
