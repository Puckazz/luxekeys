'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const WISHLIST_PAGE_QUERY_KEY = 'page';

const parsePositiveInt = (value: string | null): number => {
  if (!value) {
    return 1;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
};

export const useWishlistPaginationState = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = useMemo(() => {
    return parsePositiveInt(searchParams.get(WISHLIST_PAGE_QUERY_KEY));
  }, [searchParams]);

  const setPage = (page: number) => {
    const next = new URLSearchParams(searchParams.toString());

    if (page <= 1) {
      next.delete(WISHLIST_PAGE_QUERY_KEY);
    } else {
      next.set(WISHLIST_PAGE_QUERY_KEY, String(page));
    }

    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return {
    currentPage,
    setPage,
  };
};
