import { TableVariantEnum, type TableVariant } from './tableVariantTypes';

const VARIANT_STORAGE_VERSION = 1;

interface StoredTableVariant {
  v: number;
  variant: TableVariant;
}

export function isTableVariant(value: unknown): value is TableVariant {
  return value === TableVariantEnum.CARD || value === TableVariantEnum.PLAIN;
}

export function loadTableVariant(
  storageKey: string | undefined,
  defaultVariant: TableVariant = TableVariantEnum.CARD
): TableVariant {
  if (!storageKey || typeof window === 'undefined') return defaultVariant;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaultVariant;
    const parsed = JSON.parse(raw) as StoredTableVariant;
    if (parsed.v !== VARIANT_STORAGE_VERSION) return defaultVariant;
    return isTableVariant(parsed.variant) ? parsed.variant : defaultVariant;
  } catch {
    return defaultVariant;
  }
}

export function saveTableVariant(storageKey: string, variant: TableVariant): void {
  if (typeof window === 'undefined') return;

  const payload: StoredTableVariant = {
    v: VARIANT_STORAGE_VERSION,
    variant,
  };

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function tableVariantStorageKey(baseKey: string): string {
  return `${baseKey}:variant`;
}
