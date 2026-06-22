import { useMemo } from "react";

import { getCookie } from "@/lib/cookies";

import { usePersistentStorage } from "../usePersistentStorage";
import { StorageKey } from "./constants";

export const useDataFromStorageByKey = (key: StorageKey) => {
  const storage = usePersistentStorage();

  const data = useMemo(() => {
    try {
      if (key === StorageKey.ACCESS_TOKEN) {
        return getCookie(key);
      }

      const item = storage.getItem(key);
      if (!item) return null;

      return JSON.parse(item);
    } catch {
      return null;
    }
  }, [key, storage]);

  return data;
};
