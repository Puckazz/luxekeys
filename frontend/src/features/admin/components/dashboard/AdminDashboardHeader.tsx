'use client';

import { CalendarDays } from 'lucide-react';

import { AdminToolbarHeader } from '@/features/admin/components/common';
import {
  ADMIN_DASHBOARD_PERIOD_OPTIONS,
  type AdminDashboardPeriod,
} from '@/features/admin/types/admin-dashboard.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type AdminDashboardHeaderProps = {
  period: AdminDashboardPeriod;
  onPeriodChange: (period: AdminDashboardPeriod) => void;
};

const periodLabelByValue: Record<AdminDashboardPeriod, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

export function AdminDashboardHeader({
  period,
  onPeriodChange,
}: AdminDashboardHeaderProps) {
  return (
    <AdminToolbarHeader
      title="Dashboard"
      description="Detailed information about your store performance."
      actions={
        <Select
          value={period}
          onValueChange={(value) =>
            onPeriodChange(value as AdminDashboardPeriod)
          }
        >
          <SelectTrigger size="sm" className="h-11 min-w-44">
            <CalendarDays className="size-4" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_DASHBOARD_PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {periodLabelByValue[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    />
  );
}
