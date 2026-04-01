import { Star } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import type { ProductReviewsSectionProps } from '@/features/shop/types/product-detail.types';

export default function ProductReviewsSection({
  heading,
  reviews,
  visibleCount,
  onLoadMore,
}: ProductReviewsSectionProps) {
  const visibleReviews = reviews.slice(0, visibleCount);
  const canLoadMore = visibleCount < reviews.length;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-foreground text-3xl font-black tracking-tight lg:text-4xl">
          {heading}
        </h2>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-xs font-medium tracking-wide sm:text-sm"
        >
          Write a review
        </Button>
      </div>

      <div className="mt-8">
        {visibleReviews.map((review, index) => (
          <article key={review.id} className="py-6 sm:py-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-foreground text-sm font-semibold tracking-tight">
                  {review.author}
                </p>
                <div className="mt-1.5 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, starIndex) => {
                    const isFilled = starIndex < review.rating;

                    return (
                      <Star
                        key={`${review.id}-star-${starIndex + 1}`}
                        className={
                          isFilled
                            ? 'size-3.5 fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/40 size-3.5'
                        }
                      />
                    );
                  })}
                </div>
              </div>
              <p className="text-muted-foreground pt-0.5 text-xs">
                {review.createdAtLabel}
              </p>
            </div>

            <p className="text-muted-foreground mt-3.5 max-w-5xl text-sm leading-7">
              {review.comment}
            </p>
            <p className="text-primary mt-3 text-xs font-medium tracking-wide">
              {review.helpfulCount} people found this helpful
            </p>

            {index !== visibleReviews.length - 1 ? (
              <Separator className="mt-6" />
            ) : null}
          </article>
        ))}
      </div>

      {canLoadMore ? (
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-6"
            onClick={onLoadMore}
          >
            Load More Reviews
          </Button>
        </div>
      ) : null}
    </section>
  );
}
