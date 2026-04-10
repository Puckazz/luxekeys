'use client';

import { Activity } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { AdminDashboardRevenuePoint } from '@/features/admin/types';
import { formatCurrency } from '@/lib/formatters';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

type AdminRevenueTrendCardProps = {
  points: AdminDashboardRevenuePoint[];
};

export function AdminRevenueTrendCard({ points }: AdminRevenueTrendCardProps) {
  const totalRevenue = points.reduce(
    (total, point) => total + point.revenue,
    0
  );

  return (
    <Card className="border-border/70 bg-card/35 h-full">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Revenue trend</CardTitle>
          <CardDescription>
            Sales performance in the selected period.
          </CardDescription>
        </div>

        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
          <Activity className="size-4" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <p className="text-muted-foreground text-xs uppercase">
            Period revenue
          </p>
          <p className="text-2xl font-semibold">
            {formatCurrency(totalRevenue, { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer>
            <LineChart data={points}>
              <CartesianGrid
                vertical={false}
                stroke="var(--color-border)"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                dy={8}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                tickFormatter={(value) =>
                  `$${Math.round(Number(value) / 1000)}k`
                }
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-card)',
                }}
                labelStyle={{ color: 'var(--color-foreground)' }}
                formatter={(value) =>
                  formatCurrency(Number(value), { maximumFractionDigits: 0 })
                }
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-1)"
                strokeWidth={3}
                dot={{ r: 3, fill: 'var(--chart-1)' }}
                activeDot={{ r: 5, fill: 'var(--chart-1)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
