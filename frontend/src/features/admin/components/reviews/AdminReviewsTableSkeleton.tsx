import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

const ROW_COUNT = 8;

export function AdminReviewsTableSkeleton() {
  return (
    <Card className="border-border/70 bg-card/35" aria-hidden="true">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-[0.5fr_1.2fr_1.1fr_2fr_0.9fr_0.6fr_0.8fr_0.8fr] gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-18" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="ml-auto h-4 w-14" />
          </div>

          <div className="space-y-2">
            {Array.from({ length: ROW_COUNT }).map((_, index) => (
              <div
                key={`admin-reviews-skeleton-row-${index}`}
                className="grid grid-cols-[0.5fr_1.2fr_1.1fr_2fr_0.9fr_0.6fr_0.8fr_0.8fr] items-center gap-2"
              >
                <Skeleton className="h-4 w-4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-26" />
                  <Skeleton className="h-3 w-34" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="ml-auto h-4 w-6" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="ml-auto h-8 w-18 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
