import {
  Button,
  ButtonVariantEnum,
  Column,
  DEFAULT_TABLE_PAGE_SIZE,
  Table,
  TableActions,
  TableGridCard,
  TableToolbar,
  TableViewModeEnum,
  TableVariantEnum,
  tableActionIcons,
  useTablePreferences,
  applyTableFilters,
  applyTableSearch,
  applyTableSort,
  type TableBulkAction,
  type TableFilterDefinition,
  type TableFilterValue,
  type TableItemRenderContext,
  type TableKanbanColumnDefinition,
  type TableKanbanMoveEvent,
  type TableAction,
  type TableSortRule,
  type TableViewMode,
} from '@fieldflow360/org-ui';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { CodePreview } from '../ui-app-components';
import { Section } from '../ui-app-components/Section';

type PipelineStatus = 'draft' | 'ordered' | 'delivered';

interface DemoRow {
  id: number;
  name: string;
  owner: string;
  status: 'Active' | 'Paused';
  pipelineStatus: PipelineStatus;
}

const allRows: DemoRow[] = [
  {
    id: 1,
    name: 'North Field',
    owner: 'Acme Farms',
    status: 'Active',
    pipelineStatus: 'ordered',
  },
  {
    id: 2,
    name: 'South Plot',
    owner: 'Green Valley',
    status: 'Paused',
    pipelineStatus: 'draft',
  },
  {
    id: 3,
    name: 'Canal Line 7',
    owner: 'Blue Creek',
    status: 'Active',
    pipelineStatus: 'delivered',
  },
  {
    id: 4,
    name: 'West Basin',
    owner: 'Acme Farms',
    status: 'Active',
    pipelineStatus: 'ordered',
  },
  {
    id: 5,
    name: 'Ridge Parcel',
    owner: 'Summit Co-op',
    status: 'Paused',
    pipelineStatus: 'draft',
  },
  {
    id: 6,
    name: 'Delta Wetland',
    owner: 'Blue Creek',
    status: 'Active',
    pipelineStatus: 'delivered',
  },
  {
    id: 7,
    name: 'Orchard Block',
    owner: 'Green Valley',
    status: 'Active',
    pipelineStatus: 'ordered',
  },
  {
    id: 8,
    name: 'Pump Station 2',
    owner: 'Summit Co-op',
    status: 'Paused',
    pipelineStatus: 'draft',
  },
  {
    id: 9,
    name: 'East Terrace',
    owner: 'Acme Farms',
    status: 'Active',
    pipelineStatus: 'delivered',
  },
  {
    id: 10,
    name: 'Hilltop Drain',
    owner: 'Blue Creek',
    status: 'Active',
    pipelineStatus: 'ordered',
  },
  {
    id: 11,
    name: 'Creek Bend',
    owner: 'Green Valley',
    status: 'Paused',
    pipelineStatus: 'draft',
  },
  {
    id: 12,
    name: 'Lower Meadow',
    owner: 'Summit Co-op',
    status: 'Active',
    pipelineStatus: 'delivered',
  },
];

const filterDefinitions: TableFilterDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    options: [
      { value: 'Active', label: 'Active' },
      { value: 'Paused', label: 'Paused' },
    ],
  },
  {
    id: 'owner',
    label: 'Owner',
    options: [
      { value: 'Acme Farms', label: 'Acme Farms' },
      { value: 'Green Valley', label: 'Green Valley' },
      { value: 'Blue Creek', label: 'Blue Creek' },
      { value: 'Summit Co-op', label: 'Summit Co-op' },
    ],
  },
];

const kanbanColumns: TableKanbanColumnDefinition[] = [
  { key: 'draft', label: 'Draft', color: '#94a3b8' },
  { key: 'ordered', label: 'Ordered', color: '#0ea5e9' },
  { key: 'delivered', label: 'Delivered', color: '#22c55e' },
];

const demoRowActions: TableAction<DemoRow>[] = [
  { label: 'View Details', icon: tableActionIcons.view, onClick: () => undefined },
  { label: 'Edit', icon: tableActionIcons.edit, onClick: () => undefined },
  {
    label: 'Delete',
    icon: tableActionIcons.delete,
    variant: 'danger',
    onClick: () => undefined,
  },
];

function useDemoColumns(): Column<DemoRow>[] {
  return useMemo(
    () => [
      { key: 'name', header: 'Name', sortable: true, render: (row) => row.name },
      { key: 'owner', header: 'Owner', sortable: true, render: (row) => row.owner },
      {
        key: 'status',
        header: 'Status',
        width: '120px',
        sortable: true,
        render: (row) => (
          <span
            className={
              row.status === 'Active'
                ? 'inline-flex rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400'
                : 'bg-bg-hover text-text-muted inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium'
            }
          >
            {row.status}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        hideable: false,
        align: 'right',
        width: '1%',
        headerClassName: 'w-[1%] pr-3 pl-2',
        cellClassName: 'w-[1%] pr-3 pl-2',
        render: (row) => <TableActions item={row} actions={demoRowActions} />,
      },
    ],
    []
  );
}

function getRowSearchText(row: DemoRow): string {
  return `${row.name} ${row.owner} ${row.status}`;
}

function getRowSortValue(row: DemoRow, columnKey: string): string {
  if (columnKey === 'owner') return row.owner;
  if (columnKey === 'status') return row.status;
  return row.name;
}

function renderCardActions(row: DemoRow) {
  return <TableActions item={row} actions={demoRowActions} />;
}

function renderGridCard(row: DemoRow, context: TableItemRenderContext) {
  return (
    <TableGridCard
      title={row.name}
      headerContent={
        <span className="text-text-muted">
          {row.owner} · {row.status}
        </span>
      }
      actions={renderCardActions(row)}
      selectable
      selected={context.selected}
      onSelectedChange={context.onSelectedChange}
    >
      <p className="text-text-secondary text-xs leading-relaxed">
        Pipeline:{' '}
        <span className="text-text-primary font-medium capitalize">
          {row.pipelineStatus}
        </span>
      </p>
    </TableGridCard>
  );
}

function renderKanbanCard(row: DemoRow, context: TableItemRenderContext) {
  return (
    <TableGridCard
      title={row.name}
      headerContent={<span className="text-text-muted">{row.owner}</span>}
      actions={renderCardActions(row)}
      selectable
      selected={context.selected}
      onSelectedChange={context.onSelectedChange}
    >
      <span
        className={
          row.status === 'Active'
            ? 'inline-flex rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400'
            : 'bg-bg-hover text-text-muted inline-flex rounded-full px-2 py-0.5 text-xs font-medium'
        }
      >
        {row.status}
      </span>
    </TableGridCard>
  );
}

export const TableRenderer = () => {
  const allColumns = useDemoColumns();
  const tablePreferences = useTablePreferences(allColumns, {
    storageKey: 'org-ui-dev-table-columns',
    defaultVariant: TableVariantEnum.CARD,
  });
  const columns = tablePreferences.applyColumns(allColumns);
  const [kanbanRows, setKanbanRows] = useState(allRows);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastBulkAction, setLastBulkAction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<TableFilterValue[]>([]);
  const [sortRules, setSortRules] = useState<TableSortRule[]>([]);
  const [viewMode, setViewMode] = useState<TableViewMode>(TableViewModeEnum.LIST);

  const handleKanbanMove = useCallback((event: TableKanbanMoveEvent<DemoRow>) => {
    setKanbanRows((current) =>
      current.map((row) =>
        row.id === event.item.id
          ? { ...row, pipelineStatus: event.toColumnKey as PipelineStatus }
          : row
      )
    );
  }, []);

  const processedRows = useMemo(() => {
    let rows = [...kanbanRows];
    rows = applyTableSearch(rows, searchQuery, getRowSearchText);
    rows = applyTableFilters(rows, filterValues, {
      status: (row, values) => values.includes(row.status),
      owner: (row, values) => values.includes(row.owner),
    });
    rows = applyTableSort(rows, sortRules, getRowSortValue);
    return rows;
  }, [kanbanRows, searchQuery, filterValues, sortRules]);

  const pageSize = DEFAULT_TABLE_PAGE_SIZE;
  const totalCount = processedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageRows = processedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleArchiveSelected = useCallback((ids: (string | number)[]) => {
    setLastBulkAction(`Archived ${ids.length} item(s): ${ids.join(', ')}`);
    setSelectedIds([]);
  }, []);

  const handleDeleteSelected = useCallback((ids: (string | number)[]) => {
    setLastBulkAction(`Deleted ${ids.length} item(s): ${ids.join(', ')}`);
    setSelectedIds([]);
  }, []);

  const bulkActions: TableBulkAction[] = useMemo(
    () => [
      {
        id: 'archive',
        label: 'Archive selected',
        icon: tableActionIcons.archive,
        onClick: handleArchiveSelected,
      },
      {
        id: 'delete',
        label: 'Delete selected',
        icon: tableActionIcons.delete,
        variant: 'danger',
        onClick: handleDeleteSelected,
      },
    ],
    [handleArchiveSelected, handleDeleteSelected]
  );

  const sortableColumns = useMemo(
    () => [
      { key: 'name', label: 'Name' },
      { key: 'owner', label: 'Owner' },
      { key: 'status', label: 'Status' },
    ],
    []
  );

  const toolbar = (
    <TableToolbar
      view={viewMode}
      onViewChange={setViewMode}
      showViewSwitcher
      showKanbanView
      search={{
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: 'Search fields…',
      }}
      filters={filterDefinitions}
      filterValues={filterValues}
      onFilterValuesChange={(values) => {
        setFilterValues(values);
        setCurrentPage(1);
      }}
      sortRules={sortRules}
      onSortRulesChange={setSortRules}
      sortableColumns={sortableColumns}
      tableSettings={tablePreferences.tableSettings}
      actions={
        <Button
          title="Add field"
          variant={ButtonVariantEnum.DEFAULT}
          leftIcon={<Plus className="h-4 w-4" aria-hidden strokeWidth={2} />}
        />
      }
    />
  );

  return (
    <Section>
      <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
        Table
      </h2>

      <CodePreview
        title="List, grid, and kanban with shared toolbar"
        code={`<Table
  view={viewMode}
  toolbar={
    <TableToolbar
      view={viewMode}
      onViewChange={setViewMode}
      showViewSwitcher
      showKanbanView
    />
  }
  grid={{ renderCard: (row, ctx) => <TableGridCard ... /> }}
  kanban={{
    columns: statusColumns,
    getItemStatus: (row) => row.pipelineStatus,
    renderCard: renderKanbanCard,
  }}
/>`}
      />

      {lastBulkAction ? (
        <p className="text-text-secondary mb-4 rounded-md border border-border-subtle bg-bg-surface px-3 py-2 text-sm">
          Last bulk action: {lastBulkAction}
        </p>
      ) : null}

      <Table
        view={viewMode}
        toolbar={toolbar}
        variant={tablePreferences.variant}
        grid={{ renderCard: renderGridCard }}
        kanban={{
          columns: kanbanColumns,
          getItemStatus: (row) => row.pipelineStatus,
          renderCard: renderKanbanCard,
          draggable: true,
          onItemMove: handleKanbanMove,
        }}
        data={pageRows}
        columns={columns}
        selectable
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        bulkActions={bulkActions}
        sortRules={sortRules}
        onSortRulesChange={setSortRules}
        pagination={{
          currentPage: safePage,
          totalPages,
          totalCount,
          pageSize,
          itemLabel: 'fields',
          onPageChange: (page) => {
            setCurrentPage(page);
            setSelectedIds([]);
          },
        }}
        emptyState={{
          title: 'No matching fields',
          description: 'Try adjusting search, filters, or sort.',
        }}
      />

      <h3 className="text-text-primary mt-10 mb-3 text-lg font-semibold">
        List only (no view switcher)
      </h3>
      <p className="text-text-secondary mb-3 text-sm">
        Omit <code className="text-xs">showViewSwitcher</code> / view props on{' '}
        <code className="text-xs">TableToolbar</code> for apps like tile design.
      </p>
      <Table
        data={pageRows.slice(0, 4)}
        columns={columns}
        toolbar={
          <TableToolbar
            search={{
              value: searchQuery,
              onChange: setSearchQuery,
              placeholder: 'Search…',
            }}
            actions={
              <Button
                title="Add field"
                variant={ButtonVariantEnum.DEFAULT}
                leftIcon={<Plus className="h-4 w-4" aria-hidden strokeWidth={2} />}
              />
            }
          />
        }
      />

      <h3 className="text-text-primary mt-10 mb-3 text-lg font-semibold">Empty state</h3>
      <Table
        data={[]}
        columns={columns}
        toolbar={
          <TableToolbar
            actions={
              <Button
                title="Add field"
                variant={ButtonVariantEnum.DEFAULT}
                leftIcon={<Plus className="h-4 w-4" aria-hidden strokeWidth={2} />}
              />
            }
          />
        }
        emptyState={{
          title: 'No fields yet',
          description: 'Create a field to see it listed here.',
        }}
      />

      <h3 className="text-text-primary mt-10 mb-3 text-lg font-semibold">Loading</h3>
      <Table
        data={[]}
        columns={columns}
        isLoading
        loadingText="Loading fields…"
        toolbar={
          <TableToolbar
            actions={
              <Button
                title="Add field"
                variant={ButtonVariantEnum.DEFAULT}
                leftIcon={<Plus className="h-4 w-4" aria-hidden strokeWidth={2} />}
              />
            }
          />
        }
      />
    </Section>
  );
};
