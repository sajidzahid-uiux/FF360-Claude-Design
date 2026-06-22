"use client";

import { useEffect, useState } from "react";

export interface UseDebouncedValueOptions {
  trim?: boolean;
}

export function useDebouncedValue<T>(
  value: T,
  delayMs = 300,
  options?: UseDebouncedValueOptions
): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    if (delayMs <= 0) {
      setDebouncedValue(value);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (typeof value === "string" && options?.trim) {
        setDebouncedValue(value.trim() as T);
        return;
      }
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, options?.trim, value]);

  return debouncedValue;
}
