import { afterEach, describe, expect, it } from 'vitest';

import {
  loadTableVariant,
  saveTableVariant,
  TableVariantEnum,
} from '../src';

const storageKey = 'test-table-variant';

afterEach(() => {
  window.localStorage.removeItem(storageKey);
});

describe('tableVariantPreferences', () => {
  it('loads default variant when nothing is stored', () => {
    expect(loadTableVariant(storageKey, TableVariantEnum.PLAIN)).toBe(
      TableVariantEnum.PLAIN
    );
  });

  it('persists variant to localStorage', () => {
    saveTableVariant(storageKey, TableVariantEnum.PLAIN);
    expect(loadTableVariant(storageKey, TableVariantEnum.CARD)).toBe(
      TableVariantEnum.PLAIN
    );
  });
});
