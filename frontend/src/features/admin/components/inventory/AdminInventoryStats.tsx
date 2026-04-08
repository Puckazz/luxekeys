import { AlertTriangle, Boxes, PackageX } from 'lucide-react';

import type { AdminInventoryListSummary } from '@/features/admin/types/admin-inventory.types';
import { LOW_STOCK_THRESHOLD } from '@/features/admin/utils/admin-products.constants';
import { Card, CardContent } from '@/shared/components/ui/card';

type AdminInventoryStatsProps = {
  summary: AdminInventoryListSummary;
};

const statCards = [
  {
    key: 'total',
    label: 'Tracked variants',
    icon: Boxes,
    valueKey: 'totalVariants' as const,
    helper: 'Variants currently monitored in inventory.',
  },
  {
    key: 'low-stock',
    label: 'Low stock',
    icon: AlertTriangle,
    valueKey: 'lowStockItems' as const,
    helper: `Quantity 1-${LOW_STOCK_THRESHOLD} needs attention.`,
  },
  {
    key: 'out-of-stock',
    label: 'Out of stock',
    icon: PackageX,
    valueKey: 'outOfStockItems' as const,
    helper: 'Variants that are unavailable right now.',
  },
];

export function AdminInventoryStats({ summary }: AdminInventoryStatsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {statCards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.key} className="border-border/70 bg-card/35">
            <CardContent className="space-y-3 p-4">
              <div className="text-muted-foreground flex items-center justify-between text-sm">
                <span>{card.label}</span>
                <Icon className="size-4" />
              </div>
              <p className="text-foreground text-2xl leading-none font-semibold">
                {summary[card.valueKey]}
              </p>
              <p className="text-muted-foreground text-xs">{card.helper}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
