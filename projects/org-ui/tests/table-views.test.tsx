import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Table,
  TableActions,
  TableGridCard,
  TableToolbar,
  TableViewModeEnum,
  TableViewSwitcher,
  groupTableItemsByStatus,
  type TableKanbanColumnDefinition,
  type TableViewMode,
} from '../src';

interface Row {
  id: number;
  name: string;
  status: string;
}

const rows: Row[] = [
  { id: 1, name: 'Alpha', status: 'draft' },
  { id: 2, name: 'Beta', status: 'ordered' },
  { id: 3, name: 'Gamma', status: 'draft' },
];

const kanbanColumns: TableKanbanColumnDefinition[] = [
  { key: 'draft', label: 'Draft', color: '#ccc' },
  { key: 'ordered', label: 'Ordered', color: '#00f' },
];

describe('groupTableItemsByStatus', () => {
  it('groups items by status key', () => {
    const groups = groupTableItemsByStatus(rows, kanbanColumns, (row) => row.status);
    expect(groups.get('draft')?.map((r) => r.name)).toEqual(['Alpha', 'Gamma']);
    expect(groups.get('ordered')?.map((r) => r.name)).toEqual(['Beta']);
  });
});

describe('TableViewSwitcher', () => {
  it('renders list and grid by default', () => {
    render(
      <TableViewSwitcher
        value={TableViewModeEnum.LIST}
        onValueChange={vi.fn()}
      />
    );

    expect(screen.getByRole('tab', { name: 'List view' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Grid view' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Kanban view' })).not.toBeInTheDocument();
  });

  it('shows kanban when enabled', () => {
    render(
      <TableViewSwitcher
        value={TableViewModeEnum.KANBAN}
        onValueChange={vi.fn()}
        showKanban
      />
    );

    expect(screen.getByRole('tab', { name: 'Kanban view' })).toBeInTheDocument();
  });

  it('calls onValueChange when a tab is clicked', () => {
    const onValueChange = vi.fn();
    render(
      <TableViewSwitcher
        value={TableViewModeEnum.LIST}
        onValueChange={onValueChange}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Grid view' }));
    expect(onValueChange).toHaveBeenCalledWith(TableViewModeEnum.GRID);
  });
});

describe('TableGridCard', () => {
  it('renders title, header content, body, and selection', () => {
    const onSelectedChange = vi.fn();
    render(
      <TableGridCard
        title="North Field"
        headerContent="Acme Farms"
        selectable
        selected={false}
        onSelectedChange={onSelectedChange}
        actions={<button type="button">Edit</button>}
      >
        <p>Body copy</p>
      </TableGridCard>
    );

    expect(screen.getByText('North Field')).toBeInTheDocument();
    expect(screen.getByText('Acme Farms')).toBeInTheDocument();
    expect(screen.getByText('Body copy')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select card' }));
    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });
});

describe('Table multi-view', () => {
  function MultiViewHarness() {
    const [view, setView] = useState<TableViewMode>(TableViewModeEnum.LIST);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

    return (
      <Table
        view={view}
        data={rows}
        columns={[{ key: 'name', header: 'Name', render: (row) => row.name }]}
        selectable
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        toolbar={
          <TableToolbar
            view={view}
            onViewChange={setView}
            showViewSwitcher
            showKanbanView
          />
        }
        grid={{
          renderCard: (row, context) => (
            <TableGridCard
              title={row.name}
              selectable
              selected={context.selected}
              onSelectedChange={context.onSelectedChange}
            >
              {row.status}
            </TableGridCard>
          ),
        }}
        kanban={{
          columns: kanbanColumns,
          getItemStatus: (row) => row.status,
          renderCard: (row, context) => (
            <TableGridCard
              title={row.name}
              selectable
              selected={context.selected}
              onSelectedChange={context.onSelectedChange}
            >
              {row.status}
            </TableGridCard>
          ),
        }}
      />
    );
  }

  it('switches from list table to grid cards', () => {
    render(<MultiViewHarness />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Grid view' }));

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getAllByText('Alpha').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('article').length).toBe(3);
  });

  it('marks kanban cards as draggable when enabled', () => {
    render(
      <Table
        view={TableViewModeEnum.KANBAN}
        data={rows}
        columns={[{ key: 'name', header: 'Name', render: (row) => row.name }]}
        kanban={{
          columns: kanbanColumns,
          getItemStatus: (row) => row.status,
          draggable: true,
          onItemMove: vi.fn(),
          renderCard: (row) => (
            <TableGridCard title={row.name}>{row.status}</TableGridCard>
          ),
        }}
      />
    );

    const draftColumn = screen.getByRole('region', { name: 'Draft column' });
    const draggableCard = within(draftColumn)
      .getByText('Alpha')
      .closest('[draggable="true"]');
    expect(draggableCard).toBeTruthy();
  });

  it('renders kanban columns with status labels', () => {
    render(<MultiViewHarness />);

    fireEvent.click(screen.getByRole('tab', { name: 'Kanban view' }));

    expect(screen.getByRole('region', { name: 'Draft column' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Ordered column' })).toBeInTheDocument();

    const draftColumn = screen.getByRole('region', { name: 'Draft column' });
    expect(within(draftColumn).getByText('Alpha')).toBeInTheDocument();
    expect(within(draftColumn).getByText('Gamma')).toBeInTheDocument();
  });

  it('supports selection in grid view', () => {
    render(<MultiViewHarness />);

    fireEvent.click(screen.getByRole('tab', { name: 'Grid view' }));
    const checkboxes = screen.getAllByRole('checkbox', { name: 'Select card' });
    fireEvent.click(checkboxes[0]);

    expect(checkboxes[0]).toBeChecked();
  });

  it('applies hover-reveal group classes to inline card actions on desktop', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(
      <TableGridCard
        title="Alpha"
        actions={
          <TableActions
            item={{ id: 1, name: 'Alpha', status: 'draft' }}
            actions={[{ label: 'Edit', onClick: () => undefined }]}
          />
        }
      >
        Body
      </TableGridCard>
    );

    const actionsEl = container.querySelector('.table-row-actions');
    expect(actionsEl).toBeTruthy();
    expect(actionsEl?.className).toMatch(/group-hover\/table-card:opacity-100/);
    expect(actionsEl?.getAttribute('data-table-actions-layout')).toBe('inline');
  });

  it('renders grid view via Table view prop', () => {
    render(
      <Table
        view={TableViewModeEnum.GRID}
        data={rows}
        columns={[{ key: 'name', header: 'Name', render: (row) => row.name }]}
        grid={{
          renderCard: (row) => (
            <TableGridCard title={row.name}>{row.status}</TableGridCard>
          ),
        }}
      />
    );

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getAllByRole('article').length).toBe(3);
  });

  it('hides view switcher when showViewSwitcher is false', () => {
    render(
      <Table
        data={rows}
        columns={[{ key: 'name', header: 'Name', render: (row) => row.name }]}
        toolbar={
          <TableToolbar
            view={TableViewModeEnum.LIST}
            onViewChange={vi.fn()}
            showViewSwitcher={false}
          />
        }
      />
    );

    expect(screen.queryByRole('tablist', { name: 'View mode' })).not.toBeInTheDocument();
  });
});
