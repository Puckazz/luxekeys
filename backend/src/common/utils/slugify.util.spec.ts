import { toSlug } from './slugify.util.js';

describe('toSlug', () => {
  it('should convert to lowercase', () => {
    expect(toSlug('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(toSlug('foo bar')).toBe('foo-bar');
  });

  it('should remove special characters', () => {
    expect(toSlug('a@b#c!')).toBe('abc');
  });

  it('should collapse multiple hyphens into one', () => {
    expect(toSlug('foo--bar')).toBe('foo-bar');
  });

  it('should trim leading and trailing whitespace', () => {
    expect(toSlug('  hello  ')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(toSlug('')).toBe('');
  });

  it('should handle string with only special characters', () => {
    expect(toSlug('@#$%')).toBe('');
  });

  it('should keep hyphens in input', () => {
    expect(toSlug('cherry-mx')).toBe('cherry-mx');
  });

  it('should handle numbers', () => {
    expect(toSlug('K2 Pro 2024')).toBe('k2-pro-2024');
  });
});
