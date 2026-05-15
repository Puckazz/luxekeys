export type HealthCheckStatus = 'ok';

export interface HealthCheckResponse {
  status: HealthCheckStatus;
  service: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  checks: {
    database: {
      status: HealthCheckStatus;
      latencyMs: number;
    };
  };
}
