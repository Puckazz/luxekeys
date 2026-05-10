import { PrismaService } from '../../modules/database/prisma.service.js';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type MockPrismaService = DeepMockProxy<PrismaService>;

export function createMockPrismaService(): MockPrismaService {
  const mock = mockDeep<PrismaService>();

  // Default $transaction mock: supports both batch and interactive overloads
  mock.$transaction.mockImplementation((arg: unknown) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg) as ReturnType<PrismaService['$transaction']>;
    }
    if (typeof arg === 'function') {
      return (arg as (tx: PrismaService) => Promise<unknown>)(
        mock as unknown as PrismaService,
      );
    }
    return Promise.resolve(undefined) as ReturnType<
      PrismaService['$transaction']
    >;
  });

  return mock;
}
