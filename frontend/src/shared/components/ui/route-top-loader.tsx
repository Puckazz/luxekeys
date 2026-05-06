'use client';

import { useEffect } from 'react';
import { useTopLoader } from 'nextjs-toploader';

export function RouteTopLoader() {
  const loader = useTopLoader();

  useEffect(() => {
    loader.start();

    return () => {
      loader.done(true);
    };
  }, [loader]);

  return null;
}
