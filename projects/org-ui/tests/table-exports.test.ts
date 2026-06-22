import { describe, expect, it } from 'vitest';
import * as OrgUI from '../src';

const tableComponents = [
  'Table',
  'TableBulkBar',
  'TableColumnHeader',
  'TableHeaderLabel',
  'TableEmptyState',
  'TableGridCard',
  'TableGridView',
  'TableKanbanView',
  'TableListView',
  'TablePagination',
  'TableReveal',
  'TableToolbar',
  'TableToolbarPanel',
  'TableViewSwitcher',
  'TableActions',
] as const;

const tableFunctions = [
  'applyTableFilters',
  'applyTableSearch',
  'applyTableSort',
  'applyColumnPreferences',
  'clearTableFilters',
  'clearTableSortRules',
  'countActiveTableFilters',
  'cycleTableColumnSort',
  'createDefaultColumnPreferences',
  'getTableColumnDefinitions',
  'getTableFilterValue',
  'groupTableItemsByStatus',
  'setTableFilterValue',
  'toggleTableFilterOption',
  'useTableColumnPreferences',
  'useTablePreferences',
  'buildKanbanMoveEvent',
] as const;

const tableConstants = ['DEFAULT_TABLE_PAGE_SIZE', 'TableViewModeEnum'] as const;

describe('table public exports', () => {
  it.each(tableComponents)('exports %s component', (name) => {
    expect(OrgUI[name]).toBeDefined();
    expect(typeof OrgUI[name]).toBe('function');
  });

  it.each(tableFunctions)('exports %s helper', (name) => {
    expect(OrgUI[name]).toBeDefined();
    expect(typeof OrgUI[name]).toBe('function');
  });

  it.each(tableConstants)('exports %s constant', (name) => {
    expect(OrgUI[name]).toBeDefined();
  });

  it('exports TableViewModeEnum values', () => {
    expect(OrgUI.TableViewModeEnum.LIST).toBe('list');
    expect(OrgUI.TableViewModeEnum.GRID).toBe('grid');
    expect(OrgUI.TableViewModeEnum.KANBAN).toBe('kanban');
  });

  it('exports tableActionIcons object', () => {
    expect(OrgUI.tableActionIcons).toBeDefined();
    expect(typeof OrgUI.tableActionIcons).toBe('object');
    expect(OrgUI.tableActionIcons.view).toBeDefined();
    expect(OrgUI.tableActionIcons.edit).toBeDefined();
    expect(OrgUI.tableActionIcons.delete).toBeDefined();
    expect(OrgUI.tableActionIcons.archive).toBeDefined();
    expect(OrgUI.tableActionIcons.more).toBeDefined();
  });

  it('exports SearchInput for toolbar search', () => {
    expect(OrgUI.SearchInput).toBeDefined();
  });
});
