import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

const ROW_COUNT = 7;

export function AdminCategoriesTableSkeleton() {
  return (
    <Card className="border-border/70 bg-card/35" aria-hidden="true">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-[1.1fr_1.2fr_2fr_0.8fr_0.8fr_0.9fr_0.8fr] gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-22" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="ml-auto h-4 w-12" />
          </div>

          <div className="space-y-2">
            {Array.from({ length: ROW_COUNT }).map((_, index) => (
              <div
                key={`admin-categories-skeleton-row-${index}`}
                className="grid grid-cols-[1.1fr_1.2fr_2fr_0.8fr_0.8fr_0.9fr_0.8fr] items-center gap-2"
              >
                <Skeleton className="h-4 w-26" />
                <Skeleton className="h-4 w-30" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-14" />
                <Skeleton className="ml-auto h-8 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
