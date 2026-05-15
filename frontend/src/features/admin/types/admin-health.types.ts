export type AdminHealthStatus = 'ok';

export interface AdminHealthCheck {
  status: AdminHealthStatus;
  service: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  checks: {
    database: {
      status: AdminHealthStatus;
      latencyMs: number;
    };
  };
}
