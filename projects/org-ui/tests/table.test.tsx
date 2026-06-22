import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_TABLE_PAGE_SIZE,
  Table,
  TableBulkBar,
  TableEmptyState,
  TablePagination,
  type Column,
  type TableBulkAction,
} from '../src';

interface Row {
  id: number;
  name: string;
}

const columns: Column<Row>[] = [
  { key: 'name', header: 'Name', render: (row) => row.name },
];

const rows: Row[] = [
  { id: 1, name: 'Alpha' },
  { id: 2, name: 'Beta' },
  { id: 3, name: 'Gamma' },
];

describe('DEFAULT_TABLE_PAGE_SIZE', () => {
  it('defaults to 10 rows per page', () => {
    expect(DEFAULT_TABLE_PAGE_SIZE).toBe(10);
  });
});

describe('TableEmptyState', () => {
  it('renders default title and description', () => {
    render(<TableEmptyState />);

    expect(screen.getByRole('status')).toHaveTextContent('No items yet');
    expect(
      screen.getByText('When records are added, they will appear in this table.')
    ).toBeInTheDocument();
  });

  it('omits description when an empty string is provided', () => {
    render(<TableEmptyState title="Empty" description="" />);

    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(
      screen.queryByText('When records are added, they will appear in this table.')
    ).not.toBeInTheDocument();
  });

  it('renders a custom icon', () => {
    render(<TableEmptyState icon={<span data-testid="custom-icon">icon</span>} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});

describe('TableBulkBar', () => {
  const actions: TableBulkAction[] = [
    { id: 'archive', label: 'Archive selected', onClick: vi.fn() },
    { id: 'delete', label: 'Delete selected', variant: 'danger', onClick: vi.fn() },
  ];

  it('renders nothing when selectedCount is zero', () => {
    const { container } = render(
      <TableBulkBar
        selectedCount={0}
        selectedIds={[]}
        actions={actions}
        onClearSelection={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows selected count and triggers each bulk action', () => {
    const onArchive = vi.fn();
    const onDelete = vi.fn();

    render(
      <TableBulkBar
        selectedCount={2}
        selectedIds={[1, 2]}
        actions={[
          { id: 'archive', label: 'Archive selected', onClick: onArchive },
          { id: 'delete', label: 'Delete selected', onClick: onDelete },
        ]}
        onClearSelection={vi.fn()}
      />
    );

    expect(screen.getByRole('region', { name: 'Bulk actions' })).toBeInTheDocument();
    expect(screen.getByText('2 selected')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Archive selected' }));
    expect(onArchive).toHaveBeenCalledWith([1, 2]);

    fireEvent.click(screen.getByRole('button', { name: 'Delete selected' }));
    expect(onDelete).toHaveBeenCalledWith([1, 2]);
  });

  it('calls onClearSelection when clear is clicked', () => {
    const onClearSelection = vi.fn();

    render(
      <TableBulkBar
        selectedCount={1}
        selectedIds={[5]}
        actions={actions}
        onClearSelection={onClearSelection}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });
});

describe('TablePagination', () => {
  it('renders nothing when totalCount is zero', () => {
    const { container } = render(
      <TablePagination
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          onPageChange: vi.fn(),
        }}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('uses default page size and item label', () => {
    render(
      <TablePagination
        pagination={{
          currentPage: 1,
          totalPages: 2,
          totalCount: 15,
          onPageChange: vi.fn(),
        }}
      />
    );

    expect(screen.getByText(/Showing 1 to 10 of 15 items/)).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('calculates range on the last page with a custom page size', () => {
    render(
      <TablePagination
        pagination={{
          currentPage: 2,
          totalPages: 2,
          totalCount: 12,
          pageSize: 5,
          itemLabel: 'jobs',
          onPageChange: vi.fn(),
        }}
      />
    );

    expect(screen.getByText(/Showing 6 to 12 of 12 jobs/)).toBeInTheDocument();
  });

  it('disables Previous on the first page and Next on the last page', () => {
    const onPageChange = vi.fn();

    const { rerender } = render(
      <TablePagination
        pagination={{
          currentPage: 1,
          totalPages: 3,
          totalCount: 25,
          onPageChange,
        }}
      />
    );

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).not.toBeDisabled();

    rerender(
      <TablePagination
        pagination={{
          currentPage: 3,
          totalPages: 3,
          totalCount: 25,
          onPageChange,
        }}
      />
    );

    expect(screen.getByRole('button', { name: 'Previous page' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('clamps an out-of-range currentPage when navigating', () => {
    const onPageChange = vi.fn();

    render(
      <TablePagination
        pagination={{
          currentPage: 99,
          totalPages: 2,
          totalCount: 12,
          pageSize: 5,
          onPageChange,
        }}
      />
    );

    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});

describe('Table', () => {
  it('renders row data in the table body', () => {
    render(<Table data={rows} columns={columns} />);

    const table = screen.getByRole('table');
    expect(within(table).getByText('Alpha')).toBeInTheDocument();
    expect(within(table).getByText('Beta')).toBeInTheDocument();
    expect(within(table).getByText('Gamma')).toBeInTheDocument();
  });

  it('renders empty state inside the table body with headers visible', () => {
    render(
      <Table
        data={[]}
        columns={columns}
        emptyState={{ title: 'Nothing here', description: 'Add a row first.' }}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Nothing here');
    expect(screen.getByText('Add a row first.')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  });

  it('supports legacy emptyMessage as the empty title', () => {
    render(<Table data={[]} columns={columns} emptyMessage="No data available" />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(
      screen.queryByText('When records are added, they will appear in this table.')
    ).not.toBeInTheDocument();
  });

  it('hides the header when empty and showHeaderWhenEmpty is false', () => {
    render(
      <Table
        data={[]}
        columns={columns}
        showHeaderWhenEmpty={false}
        emptyState={{ title: 'Nothing here' }}
      />
    );

    expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders loading state inside the table body', () => {
    render(<Table data={[]} columns={columns} isLoading loadingText="Loading fields…" />);

    expect(screen.getByText('Loading fields…')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Loading fields…');
  });

  it('does not render bulk bar without bulk actions or selection', () => {
    const { rerender } = render(
      <Table
        data={rows}
        columns={columns}
        selectable
        selectedIds={[1]}
        onSelectChange={vi.fn()}
      />
    );

    expect(screen.queryByRole('region', { name: 'Bulk actions' })).not.toBeInTheDocument();

    rerender(
      <Table
        data={rows}
        columns={columns}
        selectable
        selectedIds={[]}
        onSelectChange={vi.fn()}
        bulkActions={[{ id: 'a', label: 'Archive selected', onClick: vi.fn() }]}
      />
    );

    expect(screen.queryByRole('region', { name: 'Bulk actions' })).not.toBeInTheDocument();
  });

  it('supports row selection and bulk actions', () => {
    const onArchive = vi.fn();
    const bulkActions: TableBulkAction[] = [
      { id: 'archive', label: 'Archive selected', onClick: onArchive },
    ];

    render(
      <Table
        data={rows}
        columns={columns}
        selectable
        selectedIds={[1]}
        onSelectChange={vi.fn()}
        bulkActions={bulkActions}
      />
    );

    expect(screen.getByText('1 selected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Archive selected' }));
    expect(onArchive).toHaveBeenCalledWith([1]);
  });

  it('clears selection from bulk bar', () => {
    const onSelectChange = vi.fn();
    const bulkActions: TableBulkAction[] = [
      { id: 'archive', label: 'Archive selected', onClick: vi.fn() },
    ];

    render(
      <Table
        data={rows}
        columns={columns}
        selectable
        selectedIds={[1, 2]}
        onSelectChange={onSelectChange}
        bulkActions={bulkActions}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onSelectChange).toHaveBeenCalledWith([]);
  });

  it('selects all rows on the page via the header checkbox', () => {
    const onSelectChange = vi.fn();

    render(
      <Table
        data={rows}
        columns={columns}
        selectable
        selectedIds={[]}
        onSelectChange={onSelectChange}
      />
    );

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select all rows on this page' })
    );
    expect(onSelectChange).toHaveBeenCalledWith([1, 2, 3]);
  });

  it('clears selection via the header checkbox when all rows are selected', () => {
    const onSelectChange = vi.fn();

    render(
      <Table
        data={rows}
        columns={columns}
        selectable
        selectedIds={[1, 2, 3]}
        onSelectChange={onSelectChange}
      />
    );

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select all rows on this page' })
    );
    expect(onSelectChange).toHaveBeenCalledWith([]);
  });

  it('sets indeterminate on the header checkbox for partial selection', () => {
    render(
      <Table
        data={rows}
        columns={columns}
        selectable
        selectedIds={[2]}
        onSelectChange={vi.fn()}
      />
    );

    const selectAll = screen.getByRole('checkbox', {
      name: 'Select all rows on this page',
    }) as HTMLInputElement;

    expect(selectAll.indeterminate).toBe(true);
    expect(selectAll).not.toBeChecked();
  });

  it('selects a single row via its checkbox', () => {
    const onSelectChange = vi.fn();

    render(
      <Table
        data={rows}
        columns={columns}
        selectable
        selectedIds={[]}
        onSelectChange={onSelectChange}
      />
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 2' }));
    expect(onSelectChange).toHaveBeenCalledWith([2]);
  });

  it('deselects a single row via its checkbox', () => {
    const onSelectChange = vi.fn();

    render(
      <Table
        data={rows}
        columns={columns}
        selectable
        selectedIds={[2]}
        onSelectChange={onSelectChange}
      />
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 2' }));
    expect(onSelectChange).toHaveBeenCalledWith([]);
  });

  it('does not show select-all checkbox when loading or empty', () => {
    const { rerender } = render(
      <Table data={[]} columns={columns} selectable isLoading />
    );

    expect(
      screen.queryByRole('checkbox', { name: 'Select all rows on this page' })
    ).not.toBeInTheDocument();

    rerender(<Table data={[]} columns={columns} selectable />);

    expect(
      screen.queryByRole('checkbox', { name: 'Select all rows on this page' })
    ).not.toBeInTheDocument();
  });

  it('navigates to the next page from pagination footer', () => {
    const onPageChange = vi.fn();

    render(
      <Table
        data={rows}
        columns={columns}
        pagination={{
          currentPage: 1,
          totalPages: 3,
          totalCount: 25,
          pageSize: DEFAULT_TABLE_PAGE_SIZE,
          itemLabel: 'fields',
          onPageChange,
        }}
      />
    );

    expect(screen.getByText(/Showing 1 to 10 of 25 fields/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('navigates to the previous page from pagination footer', () => {
    const onPageChange = vi.fn();

    render(
      <Table
        data={rows}
        columns={columns}
        pagination={{
          currentPage: 2,
          totalPages: 3,
          totalCount: 25,
          pageSize: DEFAULT_TABLE_PAGE_SIZE,
          itemLabel: 'fields',
          onPageChange,
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('omits pagination footer when totalCount is zero', () => {
    render(
      <Table
        data={[]}
        columns={columns}
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          onPageChange: vi.fn(),
        }}
      />
    );

    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });
});
