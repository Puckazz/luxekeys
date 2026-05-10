import { buildOrderBy } from './query.util.js';

describe('buildOrderBy', () => {
  it('should use sortBy when the field is in the allowed list', () => {
    const result = buildOrderBy(
      ['name', 'createdAt'],
      'createdAt',
      'name',
      'asc',
    );
    expect(result).toEqual({ name: 'asc' });
  });

  it('should fall back to defaultField when sortBy is not in allowed list', () => {
    const result = buildOrderBy(
      ['name', 'createdAt'],
      'createdAt',
      'invalid',
      'desc',
    );
    expect(result).toEqual({ createdAt: 'desc' });
  });

  it('should fall back to defaultField when sortBy is undefined', () => {
    const result = buildOrderBy(
      ['name', 'createdAt'],
      'createdAt',
      undefined,
      'asc',
    );
    expect(result).toEqual({ createdAt: 'asc' });
  });

  it('should default to asc when sortOrder is undefined', () => {
    const result = buildOrderBy(['name'], 'name', 'name', undefined);
    expect(result).toEqual({ name: 'asc' });
  });

  it('should use desc direction when specified', () => {
    const result = buildOrderBy(
      ['name', 'updatedAt'],
      'createdAt',
      'updatedAt',
      'desc',
    );
    expect(result).toEqual({ updatedAt: 'desc' });
  });

  it('should use defaultField with asc when both sortBy and sortOrder are undefined', () => {
    const result = buildOrderBy(['name'], 'name', undefined, undefined);
    expect(result).toEqual({ name: 'asc' });
  });
});
