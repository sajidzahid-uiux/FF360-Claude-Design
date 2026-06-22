import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Table,
  TableToolbar,
  applyTableFilters,
  applyTableSearch,
  applyTableSort,
  cycleTableColumnSort,
  toggleTableFilterOption,
  type TableFilterDefinition,
  type TableFilterValue,
  type TableSortRule,
} from '../src';

interface Row {
  id: number;
  name: string;
  status: string;
}

const rows: Row[] = [
  { id: 1, name: 'Alpha', status: 'Active' },
  { id: 2, name: 'Beta', status: 'Paused' },
  { id: 3, name: 'Gamma', status: 'Active' },
];

const filters: TableFilterDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    options: [
      { value: 'Active', label: 'Active' },
      { value: 'Paused', label: 'Paused' },
    ],
  },
];

describe('tableDataUtils', () => {
  it('filters rows by search text', () => {
    const result = applyTableSearch(rows, 'beta', (row) => `${row.name} ${row.status}`);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Beta');
  });

  it('applies multiple filter groups', () => {
    const filterValues: TableFilterValue[] = [{ filterId: 'status', values: ['Active'] }];
    const result = applyTableFilters(rows, filterValues, {
      status: (row, values) => values.includes(row.status),
    });
    expect(result.map((row) => row.name)).toEqual(['Alpha', 'Gamma']);
  });

  it('sorts by multiple rules in order', () => {
    const sortRules: TableSortRule[] = [
      { columnKey: 'status', direction: 'asc' },
      { columnKey: 'name', direction: 'desc' },
    ];
    const result = applyTableSort(rows, sortRules, (row, key) =>
      key === 'status' ? row.status : row.name
    );
    expect(result.map((row) => row.name)).toEqual(['Gamma', 'Alpha', 'Beta']);
  });

  it('cycles column sort from asc to desc to removed', () => {
    expect(cycleTableColumnSort([], 'name')).toEqual([
      { columnKey: 'name', direction: 'asc' },
    ]);
    expect(cycleTableColumnSort([{ columnKey: 'name', direction: 'asc' }], 'name')).toEqual([
      { columnKey: 'name', direction: 'desc' },
    ]);
    expect(cycleTableColumnSort([{ columnKey: 'name', direction: 'desc' }], 'name')).toEqual([]);
  });

  it('toggles filter option values', () => {
    const first = toggleTableFilterOption([], 'status', 'Active');
    expect(first).toEqual([{ filterId: 'status', values: ['Active'] }]);
    const second = toggleTableFilterOption(first, 'status', 'Active');
    expect(second).toEqual([]);
  });
});

describe('TableToolbar', () => {
  function ToolbarHarness() {
    const [search, setSearch] = useState('');
    const [filterValues, setFilterValues] = useState<TableFilterValue[]>([]);
    const [sortRules, setSortRules] = useState<TableSortRule[]>([]);

    return (
      <TableToolbar
        search={{ value: search, onChange: setSearch, placeholder: 'Search rows' }}
        filters={filters}
        filterValues={filterValues}
        onFilterValuesChange={setFilterValues}
        sortRules={sortRules}
        onSortRulesChange={setSortRules}
        sortableColumns={[
          { key: 'name', label: 'Name' },
          { key: 'status', label: 'Status' },
        ]}
        actions={<button type="button">Add item</button>}
      />
    );
  }

  it('renders inline search and action slot', () => {
    render(<ToolbarHarness />);

    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'alpha' } });
    expect(screen.getByRole('searchbox')).toHaveValue('alpha');
  });

  it('opens table settings panel when configured', () => {
    function SettingsHarness() {
      const [preferences, setPreferences] = useState({
        order: ['name', 'status'],
        hiddenKeys: [] as string[],
      });

      return (
        <TableToolbar
          tableSettings={{
            columnEditor: {
              definitions: [
                { key: 'name', label: 'Name' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions', hideable: false },
              ],
              preferences,
              onPreferencesChange: setPreferences,
              onReset: () =>
                setPreferences({ order: ['name', 'status'], hiddenKeys: [] }),
            },
            variant: 'card',
            onVariantChange: vi.fn(),
          }}
        />
      );
    }

    render(<SettingsHarness />);

    fireEvent.click(screen.getByRole('button', { name: /Table settings/i }));
    expect(screen.getByText(/Customize how this table looks/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Card/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Drag to reorder Name/i })).toHaveAttribute(
      'draggable',
      'true'
    );
  });

  it('resets filters from the filter panel', () => {
    render(<ToolbarHarness />);

    fireEvent.click(screen.getByRole('button', { name: /Filter/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Active' }));
    expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('supports multiple active filters', () => {
    render(<ToolbarHarness />);

    fireEvent.click(screen.getByRole('button', { name: /Filter/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Active' }));
    fireEvent.click(screen.getByRole('button', { name: 'Paused' }));

    expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Paused' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('allows adding multiple sort rules', () => {
    render(<ToolbarHarness />);

    fireEvent.click(screen.getByRole('button', { name: /Sort/i }));
    fireEvent.click(screen.getByRole('button', { name: /Add sort/i }));

    expect(screen.getAllByText('asc').length).toBeGreaterThanOrEqual(1);
  });

  it('hides search, filter, and sort when the dataset is empty', () => {
    render(
      <TableToolbar
        rowCount={0}
        totalCount={0}
        actions={<button type="button">Add item</button>}
        search={{ value: '', onChange: () => {}, placeholder: 'Search rows' }}
        filters={filters}
        filterValues={[]}
        onFilterValuesChange={() => {}}
        sortRules={[]}
        onSortRulesChange={() => {}}
        sortableColumns={[{ key: 'name', label: 'Name' }]}
      />
    );

    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Filter/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sort/i })).not.toBeInTheDocument();
  });

  it('keeps refinements visible while loading an empty dataset', () => {
    render(
      <TableToolbar
        isLoading
        rowCount={0}
        totalCount={0}
        search={{ value: '', onChange: () => {}, placeholder: 'Search rows' }}
        filters={filters}
        filterValues={[]}
        onFilterValuesChange={() => {}}
      />
    );

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter/i })).toBeInTheDocument();
  });

  it('keeps refinements visible when filters are active but no rows match', () => {
    render(
      <TableToolbar
        rowCount={0}
        totalCount={0}
        search={{ value: '', onChange: () => {}, placeholder: 'Search rows' }}
        filters={filters}
        filterValues={[{ filterId: 'status', values: ['active'] }]}
        onFilterValuesChange={() => {}}
        sortRules={[]}
        onSortRulesChange={() => {}}
        sortableColumns={[{ key: 'name', label: 'Name' }]}
      />
    );

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sort/i })).toBeInTheDocument();
  });

  it('keeps refinements visible when search is active but no rows match', () => {
    render(
      <TableToolbar
        rowCount={0}
        totalCount={0}
        search={{ value: 'no matches', onChange: () => {}, placeholder: 'Search rows' }}
        filters={filters}
        filterValues={[]}
        onFilterValuesChange={() => {}}
      />
    );

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter/i })).toBeInTheDocument();
  });
});

describe('Table toolbar integration', () => {
  it('cycles sort when clicking a sortable column header', () => {
    const onSortRulesChange = vi.fn();

    render(
      <Table
        data={rows}
        columns={[{ key: 'name', header: 'Name', sortable: true, render: (row) => row.name }]}
        sortRules={[]}
        onSortRulesChange={onSortRulesChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Name/i }));
    expect(onSortRulesChange).toHaveBeenCalledWith([{ columnKey: 'name', direction: 'asc' }]);
  });

  it('reserves space for toolbar above the table', () => {
    render(
      <Table
        data={rows}
        columns={[{ key: 'name', header: 'Name', render: (row) => row.name }]}
        toolbar={<TableToolbar actions={<span>Add</span>} />}
      />
    );

    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('hides toolbar refinements when table data and totalCount are empty', () => {
    render(
      <Table<Row>
        columns={[{ key: 'name', header: 'Name', render: (row) => row.name }]}
        data={[]}
        pagination={{
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          onPageChange: () => {},
        }}
        toolbar={
          <TableToolbar
            actions={<button type="button">Add item</button>}
            search={{ value: '', onChange: () => {}, placeholder: 'Search rows' }}
            filters={filters}
            filterValues={[]}
            onFilterValuesChange={() => {}}
            sortRules={[]}
            onSortRulesChange={() => {}}
            sortableColumns={[{ key: 'name', label: 'Name' }]}
          />
        }
      />
    );

    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Filter/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sort/i })).not.toBeInTheDocument();
  });

  it('keeps toolbar refinements when server returns no rows but filters are active', () => {
    render(
      <Table<Row>
        columns={[{ key: 'name', header: 'Name', render: (row) => row.name }]}
        data={[]}
        pagination={{
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          onPageChange: () => {},
        }}
        toolbar={
          <TableToolbar
            actions={<button type="button">Add item</button>}
            search={{ value: '', onChange: () => {}, placeholder: 'Search rows' }}
            filters={filters}
            filterValues={[{ filterId: 'status', values: ['active'] }]}
            onFilterValuesChange={() => {}}
            sortRules={[]}
            onSortRulesChange={() => {}}
            sortableColumns={[{ key: 'name', label: 'Name' }]}
          />
        }
      />
    );

    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sort/i })).toBeInTheDocument();
  });
});
