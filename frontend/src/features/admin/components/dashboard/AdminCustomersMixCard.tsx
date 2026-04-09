'use client';

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts';

import type {
  AdminDashboardCustomerMixItem,
  AdminDashboardStatusBreakdownItem,
} from '@/features/admin/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

type AdminCustomersMixCardProps = {
  mixItems: AdminDashboardCustomerMixItem[];
  statusBreakdown: AdminDashboardStatusBreakdownItem[];
};

export function AdminCustomersMixCard({
  mixItems,
  statusBreakdown,
}: AdminCustomersMixCardProps) {
  const total = mixItems.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-border/70 bg-card/35 h-full">
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>
          Composition and order status distribution.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_170px]">
          <div className="space-y-2.5">
            {mixItems.map((item) => {
              const percent =
                total <= 0 ? 0 : Math.round((item.value / total) * 100);

              return (
                <div key={item.key} className="text-sm">
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: `var(${item.colorToken})` }}
                      />
                      {item.label}
                    </span>
                    <span className="font-medium">{percent}%</span>
                  </p>
                </div>
              );
            })}

            <div className="bg-card/50 border-border/70 rounded-xl border p-3">
              <p className="text-muted-foreground text-xs uppercase">
                Order status
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {statusBreakdown.map((item) => (
                  <p
                    key={item.status}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="relative h-44 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={mixItems}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={76}
                  stroke="none"
                >
                  {mixItems.map((item) => (
                    <Cell key={item.key} fill={`var(${item.colorToken})`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-semibold">{total}</p>
              <p className="text-muted-foreground text-xs">Total</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
