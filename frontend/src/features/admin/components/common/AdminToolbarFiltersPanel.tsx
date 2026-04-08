import type { ReactNode } from 'react';

type AdminToolbarFiltersPanelProps = {
  searchSlot: ReactNode;
  children: ReactNode;
};

export function AdminToolbarFiltersPanel({
  searchSlot,
  children,
}: AdminToolbarFiltersPanelProps) {
  return (
    <div className="bg-card/35 border-border/70 rounded-2xl border p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="w-full lg:max-w-sm">{searchSlot}</div>

        <div className="flex flex-1 flex-wrap items-center gap-2 lg:justify-end">
          {children}
        </div>
      </div>
    </div>
  );
}
