import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import type { HealthCheckResponse } from './interfaces/health.interface';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async check(): Promise<HealthCheckResponse> {
    const startedAt = Date.now();

    try {
      await this.prisma.$queryRaw<
        Array<{ health_check: number }>
      >`SELECT 1 AS health_check`;
    } catch {
      throw new ServiceUnavailableException('Database health check failed');
    }

    return {
      status: 'ok',
      service: 'luxekeys-api',
      environment: this.configService.get<string>('NODE_ENV') ?? 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      checks: {
        database: {
          status: 'ok',
          latencyMs: Date.now() - startedAt,
        },
      },
    };
  }
}
