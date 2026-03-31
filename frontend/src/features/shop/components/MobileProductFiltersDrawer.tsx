'use client';

import { ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';

type MobileProductFiltersDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function MobileProductFiltersDrawer({
  isOpen,
  onClose,
  children,
}: MobileProductFiltersDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        className="w-[min(24rem,92vw)] overflow-y-auto p-0 lg:hidden"
      >
        <SheetHeader className="border-border border-b p-4">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="p-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
