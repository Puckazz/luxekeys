'use client';

import type { LucideIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

type AdminTableIconActionButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
};

export function AdminTableIconActionButton({
  icon: Icon,
  label,
  onClick,
}: AdminTableIconActionButtonProps) {
  return (
    <Button type="button" size="icon-sm" variant="outline" onClick={onClick}>
      <Icon className="size-3.5" />
      <span className="sr-only">{label}</span>
    </Button>
  );
}
