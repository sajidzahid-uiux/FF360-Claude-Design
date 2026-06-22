import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Table, TableReveal } from '../src';

describe('TableReveal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children when show is true', () => {
    render(
      <TableReveal show>
        <p>Bulk content</p>
      </TableReveal>
    );

    expect(screen.getByText('Bulk content')).toBeInTheDocument();
  });

  it('unmounts after collapse when show becomes false', () => {
    function Harness() {
      const [show, setShow] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setShow(false)}>
            Hide
          </button>
          <TableReveal show={show} durationMs={200}>
            <p>Bulk content</p>
          </TableReveal>
        </>
      );
    }

    render(<Harness />);
    expect(screen.getByText('Bulk content')).toBeInTheDocument();

    act(() => {
      screen.getByRole('button', { name: 'Hide' }).click();
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByText('Bulk content')).not.toBeInTheDocument();
  });
});

describe('Table bulk bar reveal', () => {
  const columns = [{ key: 'name', header: 'Name', render: (row: { name: string }) => row.name }];
  const data = [{ id: 1, name: 'Alpha' }];

  it('reveals bulk bar when selection becomes non-empty', () => {
    const { rerender } = render(
      <Table
        data={data}
        columns={columns}
        selectable
        selectedIds={[]}
        onSelectChange={vi.fn()}
        bulkActions={[{ id: 'archive', label: 'Archive selected', onClick: vi.fn() }]}
      />
    );

    expect(screen.queryByRole('region', { name: 'Bulk actions' })).not.toBeInTheDocument();

    rerender(
      <Table
        data={data}
        columns={columns}
        selectable
        selectedIds={[1]}
        onSelectChange={vi.fn()}
        bulkActions={[{ id: 'archive', label: 'Archive selected', onClick: vi.fn() }]}
      />
    );

    expect(screen.getByRole('region', { name: 'Bulk actions' })).toBeInTheDocument();
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });
});
