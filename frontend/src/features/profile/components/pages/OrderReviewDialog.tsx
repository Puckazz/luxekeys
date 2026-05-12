'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

import type { OrderLineItem } from '@/features/profile/types';
import { useReviewMutations } from '@/features/shop/hooks/useReviewMutations';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

interface OrderReviewDialogProps {
  orderItemId: string;
  productId: string;
  productName: string;
  review: OrderLineItem['review'];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderReviewDialog({
  orderItemId,
  productId,
  productName,
  review,
  isOpen,
  onOpenChange,
}: OrderReviewDialogProps) {
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [title, setTitle] = useState(review?.title ?? '');
  const [content, setContent] = useState(review?.content ?? '');
  const [hoveredRating, setHoveredRating] = useState(0);

  const { createReview, updateReview, isSaving } = useReviewMutations();

  useEffect(() => {
    setRating(review?.rating ?? 5);
    setTitle(review?.title ?? '');
    setContent(review?.content ?? '');
    setHoveredRating(0);
  }, [isOpen, review]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      rating,
      title: title.trim() || undefined,
      content: content.trim() || undefined,
    };

    const mutationOptions = {
      onSuccess: () => {
        onOpenChange(false);
      },
    };

    if (review?.id) {
      updateReview(
        {
          productId,
          reviewId: review.id,
          orderItemId,
          payload,
        },
        mutationOptions,
      );

      return;
    }

    createReview(
      {
        productId,
        payload: {
          orderItemId,
          ...payload,
        },
      },
      mutationOptions,
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {review ? 'Edit Your Review' : 'Write a Review'}
            </DialogTitle>
            <DialogDescription>
              Share your experience with {productName}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-2 py-2">
              <Label className="text-sm font-medium">Your Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-transform active:scale-95"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star
                      className={cn(
                        'size-8 transition-colors',
                        (hoveredRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30',
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="text-muted-foreground text-xs font-medium">
                {rating === 5 && 'Excellent!'}
                {rating === 4 && 'Good'}
                {rating === 3 && 'Average'}
                {rating === 2 && 'Poor'}
                {rating === 1 && 'Very Bad'}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Review Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Summarize your experience"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Your Review (Optional)</Label>
              <Textarea
                id="content"
                placeholder="Tell us what you liked or disliked..."
                className="min-h-25"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? 'Saving...'
                : review
                  ? 'Update Review'
                  : 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
