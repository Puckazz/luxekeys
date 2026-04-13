'use client';

import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

type AdminQuickStatusTabsProps<TStatus extends string> = {
  value: TStatus;
  options: readonly TStatus[];
  labelByValue: Record<TStatus, string>;
  summary?: Partial<Record<TStatus, number>>;
  onValueChange: (value: TStatus) => void;
};

export function AdminQuickStatusTabs<TStatus extends string>({
  value,
  options,
  labelByValue,
  summary,
  onValueChange,
}: AdminQuickStatusTabsProps<TStatus>) {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as TStatus)}
    >
      <TabsList
        variant="default"
        className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0"
      >
        {options.map((status) => {
          const count = summary?.[status] ?? 0;

          return (
            <TabsTrigger
              key={status}
              value={status}
              className="bg-card/35 group data-active:border-primary data-active:bg-primary! data-active:text-primary-foreground border-border/70 h-8 border px-2.5"
            >
              {labelByValue[status]}
              <span className="bg-card text-muted-foreground group-data-active:bg-primary-foreground/20 group-data-active:text-primary-foreground ml-1 rounded-full px-1.5 text-[10px]">
                {count}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
