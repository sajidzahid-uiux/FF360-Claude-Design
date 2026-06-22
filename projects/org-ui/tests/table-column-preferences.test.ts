import { describe, expect, it } from 'vitest';

import {
  applyColumnPreferences,
  createDefaultColumnPreferences,
  getTableColumnDefinitions,
  mergeColumnPreferences,
  moveColumnInPreferences,
  reorderColumnInPreferences,
  toggleColumnVisibility,
  type Column,
} from '../src';

interface Row {
  id: number;
  name: string;
  owner: string;
  actions: string;
}

const columns: Column<Row>[] = [
  { key: 'name', header: 'Name', render: (row) => row.name },
  { key: 'owner', header: 'Owner', render: (row) => row.owner },
  {
    key: 'actions',
    header: '',
    hideable: false,
    render: (row) => row.actions,
  },
];

describe('tableColumnPreferences', () => {
  it('builds definitions with actions pinned as not hideable', () => {
    const definitions = getTableColumnDefinitions(columns);
    expect(definitions.find((def) => def.key === 'actions')?.hideable).toBe(false);
  });

  it('hides columns and keeps at least one hideable column visible', () => {
    const definitions = getTableColumnDefinitions(columns);
    const defaults = createDefaultColumnPreferences(definitions);

    const hiddenOwner = toggleColumnVisibility(
      defaults,
      definitions,
      'owner',
      false
    );
    expect(hiddenOwner.hiddenKeys).toContain('owner');

    const hiddenLast = toggleColumnVisibility(hiddenOwner, definitions, 'name', false);
    expect(hiddenLast.hiddenKeys).not.toContain('name');
  });

  it('reorders hideable columns and keeps pinned columns at the end', () => {
    const definitions = getTableColumnDefinitions(columns);
    const defaults = createDefaultColumnPreferences(definitions);
    const moved = moveColumnInPreferences(defaults, definitions, 'owner', 'up');

    const visible = applyColumnPreferences(columns, moved).map((column) => column.key);
    expect(visible).toEqual(['owner', 'name', 'actions']);
  });

  it('reorders columns by drag target index', () => {
    const definitions = getTableColumnDefinitions(columns);
    const defaults = createDefaultColumnPreferences(definitions);
    const reordered = reorderColumnInPreferences(defaults, definitions, 'owner', 0);

    expect(reordered.order).toEqual(['owner', 'name']);
    expect(applyColumnPreferences(columns, reordered).map((col) => col.key)).toEqual([
      'owner',
      'name',
      'actions',
    ]);
  });

  it('merges preferences when new columns are added', () => {
    const definitions = getTableColumnDefinitions(columns);
    const prefs = { order: ['name'], hiddenKeys: [] as string[] };
    const merged = mergeColumnPreferences(prefs, definitions);
    expect(merged.order).toEqual(['name', 'owner']);
  });
});
