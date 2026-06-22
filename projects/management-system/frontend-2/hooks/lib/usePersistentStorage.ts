import { useCallback, useMemo } from "react";

import { getCookie, removeCookie, setCookie } from "@/lib/cookies";
import {
  isSuspiciousValue,
  isValidStorageKey,
  sanitizeValue,
} from "@/utils/validation";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export const usePersistentStorage = () => {
  const safeStorageOperation = useCallback(
    <T>(operation: () => T): T | null => {
      if (!isBrowser()) {
        return null;
      }
      try {
        return operation();
      } catch (error) {
        console.warn("Storage operation failed:", error);
        return null;
      }
    },
    []
  );

  // setItem - always stores in localStorage, sessionStorage, and cookies
  const setItem = useCallback(
    (key: string, value: string) => {
      if (!isBrowser()) {
        return false;
      }

      if (!isValidStorageKey(key)) {
        console.warn(`Invalid storage key format: ${key}`);
        return false;
      }

      const sanitizedValue = sanitizeValue(value);

      if (isSuspiciousValue(sanitizedValue)) {
        console.warn(`Potentially dangerous value blocked for key: ${key}`);
        return false;
      }

      safeStorageOperation(() => {
        localStorage.setItem(key, sanitizedValue);
      });
      safeStorageOperation(() => {
        sessionStorage.setItem(key, sanitizedValue);
      });
      setCookie(key, sanitizedValue); // Always set cookie
      // Notify same-tab listeners (storage event doesn't fire in same tab)
      safeStorageOperation(() => {
        window.dispatchEvent(new Event("app-storage"));
      });
      return true;
    },
    [safeStorageOperation]
  );

  // removeItem - removes from all storage types
  const removeItem = useCallback(
    (key: string) => {
      if (!isBrowser()) {
        return;
      }

      safeStorageOperation(() => {
        localStorage.removeItem(key);
      });
      safeStorageOperation(() => {
        sessionStorage.removeItem(key);
      });

      removeCookie(key);
      safeStorageOperation(() => {
        window.dispatchEvent(new Event("app-storage"));
      });
    },
    [safeStorageOperation]
  );

  // getItem - tries localStorage first, falls back to sessionStorage, then cookies
  const getItem = useCallback(
    (key: string) => {
      if (!isBrowser()) {
        return null;
      }

      // Try localStorage first
      let value = safeStorageOperation(() => {
        const v = localStorage.getItem(key);
        return v;
      });

      // If not found in localStorage, try sessionStorage
      if (value === null) {
        value = safeStorageOperation(() => {
          const v = sessionStorage.getItem(key);
          return v;
        });

        // If found in sessionStorage, restore to localStorage
        if (value !== null) {
          const restoredValue = value;
          safeStorageOperation(() => {
            localStorage.setItem(key, restoredValue);
          });
        }
      }

      // If still not found, try cookies
      if (value === null) {
        value = getCookie(key);

        // If found in cookies, restore to localStorage and sessionStorage
        if (value !== null) {
          const restoredValue = value;
          safeStorageOperation(() => {
            localStorage.setItem(key, restoredValue);
          });
          safeStorageOperation(() => {
            sessionStorage.setItem(key, restoredValue);
          });
        }
      }

      if (value !== null) {
        if (isSuspiciousValue(value)) {
          console.warn(`Suspicious value detected for key: ${key}`);
          removeItem(key);
          return null;
        }
      }

      return value;
    },
    [safeStorageOperation, removeItem]
  );

  // clear - clears all storage types
  const clear = useCallback(() => {
    if (!isBrowser()) {
      return;
    }

    safeStorageOperation(() => {
      localStorage.clear();
    });
    safeStorageOperation(() => {
      sessionStorage.clear();
    });
    // Clear all cookies that match our pattern
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const name = cookie.split("=")[0].trim();

      removeCookie(name);
    });
    safeStorageOperation(() => {
      window.dispatchEvent(new Event("app-storage"));
    });
  }, [safeStorageOperation]);

  // key - gets key at index from localStorage, falls back to sessionStorage
  const key = useCallback(
    (index: number) => {
      if (!isBrowser()) {
        return null;
      }

      let keyName = safeStorageOperation(() => localStorage.key(index));

      if (keyName === null) {
        keyName = safeStorageOperation(() => sessionStorage.key(index));
      }

      return keyName;
    },
    [safeStorageOperation]
  );

  // length - gets combined length (avoiding duplicates)
  const length = useCallback(() => {
    if (!isBrowser()) {
      return 0;
    }

    const localKeys =
      safeStorageOperation(() => Object.keys(localStorage)) || [];
    const sessionKeys =
      safeStorageOperation(() => Object.keys(sessionStorage)) || [];
    const cookieKeys = document.cookie
      .split(";")
      .map((cookie) => cookie.split("=")[0].trim());
    const uniqueKeys = new Set([...localKeys, ...sessionKeys, ...cookieKeys]);
    return uniqueKeys.size;
  }, [safeStorageOperation]);

  return useMemo(
    () => ({
      setItem,
      getItem,
      removeItem,
      clear,
      key,
      get length() {
        return length();
      },
    }),
    [setItem, getItem, removeItem, clear, key, length]
  );
};
