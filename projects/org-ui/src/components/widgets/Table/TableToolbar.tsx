import { ArrowUpDown, ListFilter, Plus, Settings2, X } from 'lucide-react';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { ComponentSizeEnum } from '../../../constants';
import { cn } from '../../../utils/cn';
import { Checkbox } from '../../ui-components/Checkbox';
import { Dropdown } from '../../ui-components/Dropdown';
import { SearchInput } from '../../ui-components/SearchInput';
import { TableColumnEditorPanel } from './TableColumnEditorPanel';
import { TableSettingsPanel } from './TableSettingsPanel';
import { TableToolbarPanel } from './TableToolbarPanel';
import { TableViewSwitcher } from './TableViewSwitcher';
import { resolveTableToolbarRefinements } from './resolveTableToolbarRefinements';
import type { TableColumnEditorConfig } from './tableColumnEditorTypes';
import { countCustomizedColumns, createDefaultColumnPreferences } from './tableColumnPreferences';
import {
  clearTableFilters,
  clearTableSortRules,
  countActiveTableFilters,
  toggleTableFilterOption,
} from './tableDataUtils';
import type { TableSettingsConfig } from './tableSettingsTypes';
import type {
  TableFilterDefinition,
  TableFilterValue,
  TableSearchConfig,
  TableSortDirection,
  TableSortRule,
} from './tableTypes';
import { TableVariantEnum, type TableVariant } from './tableVariantTypes';
import type { TableViewMode } from './tableViewTypes';

export interface TableSortableColumn {
  key: string;
  label: string;
}

/**
 * "Remember for this list" toggle surfaced in the sticky footer of the filter
 * and sort panels. The host owns persistence (e.g. localStorage); the toolbar
 * only reflects `remembered` and reports changes via `onRememberedChange`.
 */
export interface TableRefinementPersistence {
  remembered: boolean;
  onRememberedChange: (remembered: boolean) => void;
  /** Override the checkbox label (defaults differ for filter vs sort). */
  label?: string;
}

export interface TableToolbarProps {
  /** Primary actions such as “Add field” — rendered on the right. */
  actions?: ReactNode;
  /** List / grid / kanban switcher. Set `showViewSwitcher={false}` to hide (e.g. tile design). */
  view?: TableViewMode;
  onViewChange?: (view: TableViewMode) => void;
  showViewSwitcher?: boolean;
  showKanbanView?: boolean;
  search?: TableSearchConfig;
  filters?: TableFilterDefinition[];
  filterValues?: TableFilterValue[];
  onFilterValuesChange?: (values: TableFilterValue[]) => void;
  sortRules?: TableSortRule[];
  onSortRulesChange?: (rules: TableSortRule[]) => void;
  sortableColumns?: TableSortableColumn[];
  /** Adds a "Remember filters for this list" toggle to the filter panel footer. */
  filterPersistence?: TableRefinementPersistence;
  /** Adds a "Remember sort for this list" toggle to the sort panel footer. */
  sortPersistence?: TableRefinementPersistence;
  /**
   * Column visibility and table variant — prefer with {@link useTablePreferences}.
   * @deprecated Use `tableSettings` for columns + card/plain variant together.
   */
  columnEditor?: TableColumnEditorConfig;
  /** Table style (card/plain) and column layout. */
  tableSettings?: TableSettingsConfig;
  /** Match {@link Table} `variant` — plain omits toolbar divider lines. */
  variant?: TableVariant;
  className?: string;
  /** Force show/hide search, filter, and sort. When omitted, derived from counts + loading. */
  showRefinements?: boolean;
  /** When true (default), hides search/filter/sort while the dataset is empty and not loading. */
  hideRefinementsWhenEmpty?: boolean;
  /** Total rows in the dataset (server pagination `totalCount`). */
  totalCount?: number;
  /** Current page row count — fallback when `totalCount` is omitted. */
  rowCount?: number;
  isLoading?: boolean;
}

type ToolbarPanel = 'filter' | 'sort' | 'settings';

export type { TableColumnEditorConfig } from './tableColumnEditorTypes';
export type { TableSettingsConfig } from './tableSettingsTypes';

function ToolbarIconToggle({
  label,
  icon,
  active,
  badge,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        'text-text-muted hover:text-text-primary relative inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150',
        'hover:bg-bg-hover',
        active && 'bg-bg-hover text-text-primary'
      )}
    >
      <span className="inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      {badge !== undefined && badge > 0 ? (
        <span className="bg-accent text-black absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  );
}

function SortDirectionToggle({
  value,
  onChange,
}: {
  value: TableSortDirection;
  onChange: (direction: TableSortDirection) => void;
}) {
  return (
    <div
      className="border-border-subtle bg-bg-surface flex shrink-0 rounded-lg border p-0.5"
      role="group"
      aria-label="Sort direction"
    >
      {(['asc', 'desc'] as const).map((direction) => (
        <button
          key={direction}
          type="button"
          aria-pressed={value === direction}
          onClick={() => onChange(direction)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-semibold uppercase transition-colors',
            value === direction
              ? 'bg-accent text-black shadow-sm'
              : 'text-text-muted hover:text-text-primary'
          )}
        >
          {direction}
        </button>
      ))}
    </div>
  );
}

function ToolbarIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="text-text-muted hover:bg-bg-hover hover:text-text-primary inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
    >
      {children}
    </button>
  );
}

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
        selected
          ? 'border-accent bg-accent-light text-text-primary'
          : 'border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary bg-bg-surface'
      )}
    >
      {label}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <span
      className="bg-border-subtle/80 mx-0.5 hidden h-6 w-px shrink-0 self-center sm:block"
      aria-hidden
    />
  );
}

/**
 * Sticky bottom bar for the filter / sort panels: a "remember for this list"
 * checkbox on the left and a Done action on the right. Negative margins pull it
 * flush to the popover edges so it reads as a footer.
 */
function RefinementFooter({
  persistence,
  label,
  onDone,
}: {
  persistence: TableRefinementPersistence;
  label: string;
  onDone: () => void;
}) {
  return (
    <div className="border-border-subtle bg-bg-surface-elevated sticky bottom-0 z-10 -mx-5 -mb-5 mt-4 flex items-center justify-between gap-3 border-t px-5 py-3">
      <Checkbox
        checked={persistence.remembered}
        onChange={(event) => persistence.onRememberedChange(event.target.checked)}
        label={persistence.label ?? label}
        size={ComponentSizeEnum.SM}
      />
      <button
        type="button"
        onClick={onDone}
        className="bg-accent hover:bg-accent/90 inline-flex h-8 shrink-0 items-center rounded-md px-3.5 text-xs font-semibold text-black transition-colors"
      >
        Done
      </button>
    </div>
  );
}

export function TableToolbar({
  actions,
  view,
  onViewChange,
  showViewSwitcher,
  showKanbanView = false,
  search,
  filters = [],
  filterValues = [],
  onFilterValuesChange,
  sortRules = [],
  onSortRulesChange,
  sortableColumns = [],
  filterPersistence,
  sortPersistence,
  columnEditor,
  tableSettings,
  className,
  showRefinements,
  hideRefinementsWhenEmpty = true,
  totalCount,
  rowCount,
  isLoading = false,
}: TableToolbarProps) {
  const [openPanel, setOpenPanel] = useState<ToolbarPanel | null>(null);
  const refinementsRef = useRef<HTMLDivElement>(null);

  const activeFilterCount = useMemo(
    () => countActiveTableFilters(filterValues),
    [filterValues]
  );

  const sortActive = sortRules.length > 0;

  const refinementsVisible = resolveTableToolbarRefinements({
    showRefinements,
    hideRefinementsWhenEmpty,
    totalCount,
    rowCount,
    isLoading,
    activeFilterCount,
    searchQuery: search?.value,
    hasActiveSort: sortActive,
  });

  const hasSearch = Boolean(search) && refinementsVisible;
  const hasFilters = filters.length > 0 && Boolean(onFilterValuesChange) && refinementsVisible;
  const hasSort =
    sortableColumns.length > 0 && Boolean(onSortRulesChange) && refinementsVisible;
  const resolvedColumnEditor = tableSettings?.columnEditor ?? columnEditor;
  const hasTableSettings =
    Boolean(
      tableSettings ??
      resolvedColumnEditor?.definitions.some((def) => def.hideable !== false)
    ) && refinementsVisible;
  const showSwitcher =
    showViewSwitcher !== false && Boolean(onViewChange) && view !== undefined;
  const hasRefinements = hasFilters || hasSort || hasTableSettings;

  const tableSettingsBadgeCount = useMemo(() => {
    if (tableSettings) {
      const defaults = createDefaultColumnPreferences(
        tableSettings.columnEditor.definitions
      );
      const columnCount = countCustomizedColumns(
        tableSettings.columnEditor.preferences,
        defaults
      );
      const defaultVariant = tableSettings.defaultVariant ?? TableVariantEnum.CARD;
      const variantCount = tableSettings.variant !== defaultVariant ? 1 : 0;
      return columnCount + variantCount;
    }
    if (!resolvedColumnEditor) return 0;
    const defaults = createDefaultColumnPreferences(resolvedColumnEditor.definitions);
    return countCustomizedColumns(resolvedColumnEditor.preferences, defaults);
  }, [resolvedColumnEditor, tableSettings]);

  const togglePanel = useCallback((panel: ToolbarPanel) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  }, []);

  const closePanel = useCallback(() => {
    setOpenPanel(null);
  }, []);

  const handleFilterToggle = useCallback(
    (filterId: string, optionValue: string, multiple?: boolean) => {
      if (!onFilterValuesChange) return;
      onFilterValuesChange(
        toggleTableFilterOption(filterValues, filterId, optionValue, multiple ?? true)
      );
    },
    [filterValues, onFilterValuesChange]
  );

  const handleResetFilters = useCallback(() => {
    onFilterValuesChange?.(clearTableFilters());
  }, [onFilterValuesChange]);

  const handleResetSort = useCallback(() => {
    onSortRulesChange?.(clearTableSortRules());
  }, [onSortRulesChange]);

  const handleAddSortRule = useCallback(() => {
    if (!onSortRulesChange) return;
    const usedKeys = new Set(sortRules.map((rule) => rule.columnKey));
    const nextColumn = sortableColumns.find((column) => !usedKeys.has(column.key));
    if (!nextColumn) return;
    onSortRulesChange([...sortRules, { columnKey: nextColumn.key, direction: 'asc' }]);
  }, [onSortRulesChange, sortRules, sortableColumns]);

  const handleSortColumnChange = useCallback(
    (index: number, columnKey: string) => {
      if (!onSortRulesChange) return;
      onSortRulesChange(
        sortRules.map((rule, ruleIndex) =>
          ruleIndex === index ? { ...rule, columnKey } : rule
        )
      );
    },
    [onSortRulesChange, sortRules]
  );

  const handleSortDirectionChange = useCallback(
    (index: number, direction: TableSortDirection) => {
      if (!onSortRulesChange) return;
      onSortRulesChange(
        sortRules.map((rule, ruleIndex) =>
          ruleIndex === index ? { ...rule, direction } : rule
        )
      );
    },
    [onSortRulesChange, sortRules]
  );

  const handleRemoveSortRule = useCallback(
    (index: number) => {
      if (!onSortRulesChange) return;
      onSortRulesChange(sortRules.filter((_, ruleIndex) => ruleIndex !== index));
    },
    [onSortRulesChange, sortRules]
  );

  const canAddSortRule = sortRules.length < sortableColumns.length;

  const panelContent = useMemo(() => {
    if (openPanel === 'filter' && hasFilters) {
      return (
        <div className="flex w-full min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-text-muted text-xs leading-relaxed">
              Select one or more values per group. Matching uses all active groups.
            </p>
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-text-secondary hover:text-text-primary shrink-0 text-xs font-medium underline-offset-2 hover:underline"
              >
                Reset filters
              </button>
            ) : null}
          </div>
          {filters.map((filter) => {
            const activeValues =
              filterValues.find((entry) => entry.filterId === filter.id)?.values ?? [];

            return (
              <div key={filter.id} className="flex flex-col gap-1.5">
                <span className="text-text-muted text-xs font-medium uppercase tracking-wide">
                  {filter.label}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {filter.options.map((option) => (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      selected={activeValues.includes(option.value)}
                      onClick={() =>
                        handleFilterToggle(filter.id, option.value, filter.multiple)
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {filterPersistence ? (
            <RefinementFooter
              persistence={filterPersistence}
              label="Remember filters for this list"
              onDone={closePanel}
            />
          ) : null}
        </div>
      );
    }

    if (openPanel === 'settings' && hasTableSettings && tableSettings) {
      return <TableSettingsPanel settings={tableSettings} />;
    }

    if (openPanel === 'settings' && hasTableSettings && resolvedColumnEditor) {
      return (
        <TableColumnEditorPanel
          definitions={resolvedColumnEditor.definitions}
          preferences={resolvedColumnEditor.preferences}
          onPreferencesChange={resolvedColumnEditor.onPreferencesChange}
          onReset={resolvedColumnEditor.onReset}
        />
      );
    }

    if (openPanel === 'sort' && hasSort) {
      return (
        <div className="flex w-full min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-text-muted text-xs leading-relaxed">
              Rules apply top to bottom.
            </p>
            {sortActive ? (
              <button
                type="button"
                onClick={handleResetSort}
                className="text-text-secondary hover:text-text-primary shrink-0 text-xs font-medium underline-offset-2 hover:underline"
              >
                Reset sort
              </button>
            ) : null}
          </div>
          {sortRules.map((rule, index) => (
            <div
              key={`${rule.columnKey}-${index}`}
              className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2"
            >
              <div className="min-w-0">
                <Dropdown
                  options={sortableColumns.map((column) => ({
                    value: column.key,
                    label: column.label,
                  }))}
                  value={rule.columnKey}
                  onChange={(value) => handleSortColumnChange(index, value)}
                  placeholder="Column"
                  fullWidth
                />
              </div>
              <SortDirectionToggle
                value={rule.direction}
                onChange={(direction) => handleSortDirectionChange(index, direction)}
              />
              <ToolbarIconButton
                label="Remove sort"
                onClick={() => handleRemoveSortRule(index)}
              >
                <X className="h-4 w-4" aria-hidden strokeWidth={2} />
              </ToolbarIconButton>
            </div>
          ))}

          {canAddSortRule ? (
            <button
              type="button"
              onClick={handleAddSortRule}
              className="text-text-secondary hover:text-text-primary inline-flex h-9 items-center gap-1.5 self-start rounded-lg px-1 text-sm font-medium transition-colors hover:bg-bg-hover"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2} />
              Add sort
            </button>
          ) : null}
          {sortPersistence ? (
            <RefinementFooter
              persistence={sortPersistence}
              label="Remember sort for this list"
              onDone={closePanel}
            />
          ) : null}
        </div>
      );
    }

    return null;
  }, [
    activeFilterCount,
    canAddSortRule,
    closePanel,
    filterPersistence,
    sortPersistence,
    handleResetFilters,
    handleResetSort,
    hasTableSettings,
    resolvedColumnEditor,
    tableSettings,
    filterValues,
    filters,
    handleAddSortRule,
    handleFilterToggle,
    handleRemoveSortRule,
    handleSortColumnChange,
    handleSortDirectionChange,
    hasFilters,
    hasSort,
    openPanel,
    sortActive,
    sortRules,
    sortableColumns,
  ]);

  const panelOpen = openPanel !== null && hasRefinements;

  if (!hasSearch && !hasRefinements && !actions && !showSwitcher) {
    return null;
  }

  return (
    <div className={cn('flex w-full min-w-0 flex-col', className)}>
      <div className="flex min-h-10 w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-3">
        {showSwitcher && view && onViewChange ? (
          <>
            <TableViewSwitcher
              value={view}
              onValueChange={onViewChange}
              showKanban={showKanbanView}
            />
            {(hasSearch || hasRefinements || actions) ? <ToolbarDivider /> : null}
          </>
        ) : null}

        {hasSearch ? (
          <div className="flex h-10 min-w-0 w-full flex-1 basis-[12rem] items-center sm:max-w-md">
            <SearchInput
              variant="underlined"
              value={search?.value ?? ''}
              onChange={(event) => search?.onChange(event.target.value)}
              onClear={() => search?.onChange('')}
              placeholder={search?.placeholder ?? 'Search…'}
              className="h-10 w-full min-w-0 text-sm leading-none"
              aria-label={search?.placeholder ?? 'Search table'}
            />
          </div>
        ) : null}

        {hasRefinements ? (
          <div
            ref={refinementsRef}
            className="border-border-subtle/80 flex h-10 shrink-0 items-center gap-0.5 rounded-lg border p-0.5"
            role="group"
            aria-label="Refine results"
          >
            {hasFilters ? (
              <ToolbarIconToggle
                label="Filter"
                icon={<ListFilter aria-hidden strokeWidth={2} />}
                active={openPanel === 'filter' || activeFilterCount > 0}
                badge={activeFilterCount}
                onClick={() => togglePanel('filter')}
              />
            ) : null}
            {hasSort ? (
              <ToolbarIconToggle
                label="Sort"
                icon={<ArrowUpDown aria-hidden strokeWidth={2} />}
                active={openPanel === 'sort' || sortActive}
                badge={sortRules.length}
                onClick={() => togglePanel('sort')}
              />
            ) : null}
            {hasTableSettings ? (
              <ToolbarIconToggle
                label="Table settings"
                icon={<Settings2 aria-hidden strokeWidth={2} />}
                active={openPanel === 'settings' || tableSettingsBadgeCount > 0}
                badge={tableSettingsBadgeCount > 0 ? tableSettingsBadgeCount : undefined}
                onClick={() => togglePanel('settings')}
              />
            ) : null}
          </div>
        ) : null}

        {actions ? (
          <div className="ml-auto flex h-10 shrink-0 items-center justify-end gap-2 [&_button]:h-9 [&_button]:min-h-9 [&_button]:px-3 [&_button]:text-sm">
            {actions}
          </div>
        ) : null}
      </div>

      {hasRefinements ? (
        <TableToolbarPanel
          open={panelOpen}
          anchorRef={refinementsRef}
          onClose={closePanel}
        >
          {panelContent}
        </TableToolbarPanel>
      ) : null}
    </div>
  );
}
