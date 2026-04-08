import type { ReadonlyURLSearchParams } from 'next/navigation';

export const parsePositiveIntParam = (
  value: string | null,
  fallback: number
) => {
  const next = Number(value);

  if (!Number.isInteger(next) || next <= 0) {
    return fallback;
  }

  return next;
};

export const getNextSearchParamsString = (
  searchParams: ReadonlyURLSearchParams,
  updater: (params: URLSearchParams) => void
) => {
  const next = new URLSearchParams(searchParams.toString());
  updater(next);
  return next.toString();
};

export const setParamWithDefault = (
  params: URLSearchParams,
  key: string,
  value: string,
  defaultValue: string
) => {
  if (value === defaultValue) {
    params.delete(key);
    return;
  }

  params.set(key, value);
};

export const resetPageParam = (params: URLSearchParams, pageKey: string) => {
  params.delete(pageKey);
};

export const setPageParam = (
  params: URLSearchParams,
  pageKey: string,
  page: number
) => {
  if (page <= 1) {
    params.delete(pageKey);
    return;
  }

  params.set(pageKey, String(page));
};
