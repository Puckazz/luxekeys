'use client';

import { useEffect, useState } from 'react';

import type { AdminReviewStatus } from '@/features/admin/types/admin-reviews.types';
import {
  adminReviewStatusLabelByValue,
  adminReviewStatusFilterLabelByValue,
} from '@/features/admin/utils/admin-reviews.utils';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';

type AdminReviewModerationDialogProps = {
  open: boolean;
  isSubmitting: boolean;
  selectedCount: number;
  defaultStatus?: AdminReviewStatus;
  title?: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: {
    status: AdminReviewStatus;
    moderationNote?: string;
  }) => void;
};

const statusOptions: AdminReviewStatus[] = [
  'published',
  'pending',
  'hidden',
  'rejected',
];

export function AdminReviewModerationDialog({
  open,
  isSubmitting,
  selectedCount,
  defaultStatus = 'published',
  title,
  description,
  onOpenChange,
  onSubmit,
}: AdminReviewModerationDialogProps) {
  const [status, setStatus] = useState<AdminReviewStatus>(defaultStatus);
  const [moderationNote, setModerationNote] = useState('');

  useEffect(() => {
    if (open) {
      setStatus(defaultStatus);
      setModerationNote('');
    }
  }, [defaultStatus, open]);

  const handleSubmit = () => {
    onSubmit({
      status,
      moderationNote: moderationNote.trim() ? moderationNote.trim() : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-md">
        <DialogHeader>
          <DialogTitle>{title ?? 'Moderate Reviews'}</DialogTitle>
          <DialogDescription>
            {description ??
              `Apply one moderation status to ${selectedCount} selected reviews.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold">Status</p>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as AdminReviewStatus)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {adminReviewStatusLabelByValue[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold">Moderation note (optional)</p>
            <Textarea
              value={moderationNote}
              onChange={(event) => setModerationNote(event.target.value)}
              placeholder={`Reason for ${adminReviewStatusFilterLabelByValue[status].toLowerCase()} status...`}
              className="min-h-24"
              maxLength={240}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="lg">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              size="lg"
              disabled={isSubmitting || selectedCount <= 0}
              onClick={handleSubmit}
            >
              Apply Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
