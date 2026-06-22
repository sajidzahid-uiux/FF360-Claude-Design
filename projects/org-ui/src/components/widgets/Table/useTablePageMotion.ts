'use client';

import { useEffect, useRef, useState } from 'react';

export type TablePageDirection = 'forward' | 'back';

export function useTablePageMotion(currentPage: number | undefined) {
  const [motionKey, setMotionKey] = useState(currentPage ?? 1);
  const [direction, setDirection] = useState<TablePageDirection>('forward');
  const previousPageRef = useRef(currentPage ?? 1);

  useEffect(() => {
    if (currentPage === undefined) {
      return;
    }

    if (currentPage === previousPageRef.current) {
      return;
    }

    setDirection(currentPage > previousPageRef.current ? 'forward' : 'back');
    setMotionKey(currentPage);
    previousPageRef.current = currentPage;
  }, [currentPage]);

  return { motionKey, direction };
}
