import {
  isSuspiciousValue,
  isValidStorageKey,
  sanitizeValue,
} from "./validation";

// Utility for persistent storage access outside React hooks
export function getItem(key: string): string | null {
  if (typeof window !== "undefined") {
    try {
      const value =
        window.localStorage.getItem(key) || window.sessionStorage.getItem(key);

      if (value && isSuspiciousValue(value)) {
        console.warn(`Suspicious value detected for key: ${key}`);
        removeItem(key);
        return null;
      }

      return value;
    } catch {
      return null;
    }
  }
  return null;
}

export function setItem(key: string, value: string): void {
  if (typeof window !== "undefined") {
    if (!isValidStorageKey(key)) {
      console.warn(`Invalid storage key format: ${key}`);
      return;
    }

    const sanitizedValue = sanitizeValue(value);

    if (isSuspiciousValue(sanitizedValue)) {
      console.warn(`Potentially dangerous value blocked for key: ${key}`);
      return;
    }

    try {
      window.localStorage.setItem(key, sanitizedValue);
    } catch {
      try {
        window.sessionStorage.setItem(key, sanitizedValue);
      } catch {
        // Ignore when both storages are unavailable (e.g. private mode)
      }
    }
  }
}

export function removeItem(key: string): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore when storage is unavailable
    }
  }
}

export function clear(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch {
      // Ignore when storage is unavailable
    }
  }
}

// Clear all filter and view tab storage keys when switching organizations
export function clearFiltersAndViews(): void {
  if (typeof window !== "undefined") {
    try {
      const keysToRemove: string[] = [];

      // Get all localStorage keys
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          // Check if it's a filter or view preference key
          if (
            key.startsWith("typeFilter_") ||
            key.startsWith("statusFilter_") ||
            key.startsWith("viewPreference_") ||
            key.startsWith("mapFilters_") ||
            key.startsWith("mapViewTab_")
          ) {
            keysToRemove.push(key);
          }
        }
      }

      // Remove the identified keys
      keysToRemove.forEach((key) => {
        window.localStorage.removeItem(key);
      });

      // Set a flag to prevent components from loading saved filters immediately
      window.localStorage.setItem("_orgSwitchInProgress", "true");
    } catch (error) {
      console.warn("Failed to clear filters and views:", error);
    }
  }
}
