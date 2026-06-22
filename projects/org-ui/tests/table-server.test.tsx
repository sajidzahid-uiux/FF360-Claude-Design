import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TablePagination } from '../src/components/widgets/Table/TablePagination';
import {
  formatTableSortOrderingParam,
  serializeTableServerQuery,
} from '../src/components/widgets/Table/serializeTableServerQuery';
import { useServerTableQuery } from '../src/components/widgets/Table/useServerTableQuery';

function ServerTableQueryProbe({
  onQueryChange,
}: {
  onQueryChange: (query: ReturnType<typeof useServerTableQuery>['query']) => void;
}) {
  const state = useServerTableQuery({
    pageSize: 20,
    searchDebounceMs: 0,
    onQueryChange,
  });

  return (
    <div>
      <span data-testid="page">{state.currentPage}</span>
      <span data-testid="search">{state.debouncedSearch}</span>
      <button type="button" onClick={() => state.setSearch('alpha')}>
        set-search
      </button>
      <button type="button" onClick={() => state.setCurrentPage(2)}>
        set-page
      </button>
    </div>
  );
}

describe('serializeTableServerQuery', () => {
  it('maps page, search, ordering, and filters to API params', () => {
    const params = serializeTableServerQuery(
      {
        page: 2,
        pageSize: 20,
        search: '  acme  ',
        filterValues: [{ filterId: 'status', values: ['active', 'paused'] }],
        sortRules: [
          { columnKey: 'name', direction: 'asc' },
          { columnKey: 'created', direction: 'desc' },
        ],
      },
      {
        filterParamMap: { status: 'statuses' },
      }
    );

    expect(params).toEqual({
      page: 2,
      page_size: 20,
      search: 'acme',
      ordering: ['name', '-created'],
      statuses: ['active', 'paused'],
    });
  });

  it('formats sort rules for Django-style ordering', () => {
    expect(
      formatTableSortOrderingParam({ columnKey: 'name', direction: 'desc' })
    ).toBe('-name');
  });
});

describe('useServerTableQuery', () => {
  it('notifies onQueryChange and resets page when search changes', () => {
    const onQueryChange = vi.fn();

    render(<ServerTableQueryProbe onQueryChange={onQueryChange} />);

    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 20, search: '' })
    );

    act(() => {
      screen.getByRole('button', { name: 'set-page' }).click();
    });
    expect(screen.getByTestId('page')).toHaveTextContent('2');

    act(() => {
      screen.getByRole('button', { name: 'set-search' }).click();
    });
    expect(screen.getByTestId('page')).toHaveTextContent('1');
    expect(screen.getByTestId('search')).toHaveTextContent('alpha');
  });
});

describe('TablePagination server loading', () => {
  it('disables navigation while isLoading', () => {
    render(
      <TablePagination
        pagination={{
          currentPage: 2,
          totalPages: 3,
          totalCount: 25,
          isLoading: true,
          onPageChange: vi.fn(),
        }}
      />
    );

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });
});
