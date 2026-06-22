import { describe, expect, it } from 'vitest';

import { buildKanbanMoveEvent } from '../src';

interface Row {
  id: number;
  status: string;
}

const columns = [
  { key: 'draft', label: 'Draft' },
  { key: 'ordered', label: 'Ordered' },
];

const rows: Row[] = [
  { id: 1, status: 'draft' },
  { id: 2, status: 'draft' },
  { id: 3, status: 'ordered' },
];

describe('buildKanbanMoveEvent', () => {
  it('returns null when dropping on the same index', () => {
    const item = rows[0];
    const event = buildKanbanMoveEvent(
      item,
      rows,
      columns,
      (row) => row.status,
      'draft',
      0
    );
    expect(event).toBeNull();
  });

  it('builds a cross-column move event', () => {
    const item = rows[0];
    const event = buildKanbanMoveEvent(
      item,
      rows,
      columns,
      (row) => row.status,
      'ordered',
      1
    );
    expect(event).toEqual({
      item,
      fromColumnKey: 'draft',
      toColumnKey: 'ordered',
      fromIndex: 0,
      toIndex: 1,
    });
  });

  it('adjusts target index when reordering within the same column', () => {
    const item = rows[0];
    const event = buildKanbanMoveEvent(
      item,
      rows,
      columns,
      (row) => row.status,
      'draft',
      2
    );
    expect(event).toEqual({
      item,
      fromColumnKey: 'draft',
      toColumnKey: 'draft',
      fromIndex: 0,
      toIndex: 1,
    });
  });
});
