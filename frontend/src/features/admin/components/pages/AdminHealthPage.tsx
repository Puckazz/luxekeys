'use client';

import { Activity, Database, RefreshCw, Server, Timer, WifiOff } from 'lucide-react';

import { AdminToolbarHeader } from '@/features/admin/components/common';
import { useAdminHealthQuery } from '@/features/admin/hooks';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Spinner } from '@/shared/components/ui/spinner';

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

export function AdminHealthPage() {
  const healthQuery = useAdminHealthQuery();
  const health = healthQuery.data;
  const isChecking = healthQuery.isLoading || healthQuery.isFetching;

  return (
    <div className="space-y-4">
      <AdminToolbarHeader
        title="Production Health"
        description="Live Render readiness status for the API service."
        actions={
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              void healthQuery.refetch();
            }}
            disabled={isChecking}
            title="Refresh health status"
          >
            {isChecking ? (
              <Spinner className="size-4" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refresh
          </Button>
        }
      />

      {healthQuery.isLoading ? <AdminHealthSkeleton /> : null}

      {!healthQuery.isLoading && healthQuery.isError ? (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-destructive/15 text-destructive flex size-10 items-center justify-center rounded-md">
                <WifiOff className="size-5" />
              </div>
              <div>
                <p className="text-foreground font-semibold">API unavailable</p>
                <p className="text-muted-foreground text-sm">
                  Health check did not return a ready response.
                </p>
              </div>
            </div>
            <Badge variant="destructive">Down</Badge>
          </CardContent>
        </Card>
      ) : null}

      {health ? (
        <div className="grid gap-4 lg:grid-cols-4">
          <HealthMetricCard
            icon={Activity}
            label="API status"
            value="Ready"
            detail={health.service}
            badge="OK"
          />
          <HealthMetricCard
            icon={Database}
            label="Database"
            value="Connected"
            detail={`${health.checks.database.latencyMs}ms latency`}
            badge="OK"
          />
          <HealthMetricCard
            icon={Timer}
            label="Uptime"
            value={formatUptime(health.uptimeSeconds)}
            detail={`${health.uptimeSeconds}s total`}
          />
          <HealthMetricCard
            icon={Server}
            label="Environment"
            value={health.environment}
            detail={new Date(health.timestamp).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          />
        </div>
      ) : null}
    </div>
  );
}

type HealthMetricCardProps = {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
  badge?: string;
};

function HealthMetricCard({
  icon: Icon,
  label,
  value,
  detail,
  badge,
}: HealthMetricCardProps) {
  return (
    <Card className="border-border/70 bg-card/35">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Icon className="size-4" />
            <span>{label}</span>
          </div>
          {badge ? <Badge variant="success">{badge}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="gap-1 pt-0">
        <CardTitle className="text-xl">{value}</CardTitle>
        <CardDescription>{detail}</CardDescription>
      </CardContent>
    </Card>
  );
}

function AdminHealthSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-border/70 bg-card/35">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="gap-2 pt-0">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
