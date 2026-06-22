import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useClientTableQuery } from '../src/components/widgets/Table/useClientTableQuery';

interface Row {
  id: number;
  name: string;
}

const sourceRows: Row[] = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  name: `row-${index + 1}`,
}));

function ClientTableProbe({
  rows,
  processRows,
}: {
  rows: Row[];
  processRows?: (rows: Row[], query: { search: string }) => Row[];
}) {
  const table = useClientTableQuery({
    rows,
    pageSize: 10,
    itemLabel: 'rows',
    processRows,
  });

  const controls = table.buildListControls({
    searchPlaceholder: 'Search…',
  });

  return (
    <div>
      <span data-testid="page-count">{table.pageRows.length}</span>
      <span data-testid="processed-count">{table.processedRows.length}</span>
      <span data-testid="current-page">{table.currentPage}</span>
      <span data-testid="search">{table.search}</span>
      <span data-testid="controls-search">{controls?.searchQuery ?? ''}</span>
      <button type="button" onClick={() => table.setSearch('row-2')}>
        set-search
      </button>
      <button type="button" onClick={() => table.setCurrentPage(2)}>
        set-page
      </button>
    </div>
  );
}

describe('useClientTableQuery', () => {
  it('paginates rows client-side', () => {
    render(<ClientTableProbe rows={sourceRows} />);

    expect(screen.getByTestId('page-count')).toHaveTextContent('10');
    expect(screen.getByTestId('processed-count')).toHaveTextContent('25');
    expect(screen.getByTestId('current-page')).toHaveTextContent('1');
  });

  it('resets page when search changes', async () => {
    render(
      <ClientTableProbe
        rows={sourceRows}
        processRows={(rows, query) =>
          rows.filter((row) => row.name === query.search)
        }
      />
    );

    act(() => {
      screen.getByRole('button', { name: 'set-page' }).click();
    });
    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent('2');
    });

    act(() => {
      screen.getByRole('button', { name: 'set-search' }).click();
    });
    expect(screen.getByTestId('current-page')).toHaveTextContent('1');
    expect(screen.getByTestId('processed-count')).toHaveTextContent('1');
    expect(screen.getByTestId('search')).toHaveTextContent('row-2');
    expect(screen.getByTestId('controls-search')).toHaveTextContent('row-2');
  });
});
