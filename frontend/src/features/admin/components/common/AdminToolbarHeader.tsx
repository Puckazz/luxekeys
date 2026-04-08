import type { ReactNode } from 'react';

type AdminToolbarHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function AdminToolbarHeader({
  title,
  description,
  actions,
}: AdminToolbarHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
