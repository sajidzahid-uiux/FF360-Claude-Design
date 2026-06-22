"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

/**
 * A hook that provides a debounced navigation function to prevent multiple
 * rapid redirects that can cause UI flicker.
 */
export function useDebounceNavigation(delay = 100) {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPathRef = useRef<string | null>(null);

  const navigateTo = useCallback(
    (path: string) => {
      // If we're already planning to navigate to this path, do nothing
      if (pendingPathRef.current === path) {
        return;
      }

      // Clear any existing timeout
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set the new pending path
      pendingPathRef.current = path;

      // Set a new timeout
      timerRef.current = setTimeout(() => {
        if (pendingPathRef.current) {
          router.push(pendingPathRef.current);
          pendingPathRef.current = null;
        }
      }, delay);
    },
    [router, delay]
  );

  // Clear timeout on unmount
  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingPathRef.current = null;
  }, []);

  return { navigateTo, cancel };
}
