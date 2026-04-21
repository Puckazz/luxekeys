import { Prisma } from '../../generated/prisma/index.js';

type SortOrder = 'asc' | 'desc';

export function buildOrderBy<T extends object>(
  fields: string[],
  defaultField: string,
  sortBy?: string,
  sortOrder?: SortOrder,
): T {
  const dir: Prisma.SortOrder = sortOrder === 'desc' ? 'desc' : 'asc';
  const key = fields.includes(sortBy!) ? sortBy! : defaultField;
  return { [key]: dir } as T;
}
