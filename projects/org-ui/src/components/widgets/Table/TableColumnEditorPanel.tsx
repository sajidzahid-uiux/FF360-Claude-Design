import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { DragEvent, useCallback, useMemo, useState } from 'react';

import { ComponentSizeEnum } from '../../../constants';
import { cn } from '../../../utils/cn';
import { Checkbox } from '../../ui-components/Checkbox';
import { resolveListDropIndex } from './kanbanDragUtils';
import {
  mergeColumnPreferences,
  moveColumnInPreferences,
  reorderColumnInPreferences,
  toggleColumnVisibility,
  type TableColumnDefinition,
  type TableColumnPreferences,
} from './tableColumnPreferences';

const COLUMN_DRAG_MIME = 'application/x-fieldflow-table-column';

export interface TableColumnEditorPanelProps {
  definitions: TableColumnDefinition[];
  preferences: TableColumnPreferences;
  onPreferencesChange: (preferences: TableColumnPreferences) => void;
  onReset?: () => void;
  /** When false, omits intro copy and reset (used inside {@link TableSettingsPanel}). */
  showHeader?: boolean;
}

export function TableColumnEditorPanel({
  definitions,
  preferences,
  onPreferencesChange,
  onReset,
  showHeader = true,
}: TableColumnEditorPanelProps) {
  const [query, setQuery] = useState('');
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const merged = useMemo(
    () => mergeColumnPreferences(preferences, definitions),
    [definitions, preferences]
  );

  const hideableDefinitions = definitions.filter((def) => def.hideable !== false);
  const pinnedDefinitions = definitions.filter((def) => def.hideable === false);
  const hiddenSet = new Set(merged.hiddenKeys);

  const orderedHideable = merged.order
    .map((key) => hideableDefinitions.find((def) => def.key === key))
    .filter((def): def is TableColumnDefinition => def !== undefined);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredHideable = normalizedQuery
    ? orderedHideable.filter((def) => def.label.toLowerCase().includes(normalizedQuery))
    : orderedHideable;

  const showSearch = hideableDefinitions.length > 6;
  const dragEnabled = !normalizedQuery;

  const clearDragState = useCallback(() => {
    setDraggingKey(null);
    setDropIndex(null);
  }, []);

  const handleVisibilityChange = (columnKey: string, visible: boolean) => {
    onPreferencesChange(
      toggleColumnVisibility(preferences, definitions, columnKey, visible)
    );
  };

  const handleMove = (columnKey: string, direction: 'up' | 'down') => {
    onPreferencesChange(moveColumnInPreferences(preferences, definitions, columnKey, direction));
  };

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLButtonElement>, columnKey: string) => {
      if (!dragEnabled) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData(COLUMN_DRAG_MIME, columnKey);
      event.dataTransfer.effectAllowed = 'move';
      setDraggingKey(columnKey);
    },
    [dragEnabled]
  );

  const handleDragOverList = useCallback(
    (event: DragEvent<HTMLUListElement>) => {
      if (!dragEnabled || !event.dataTransfer?.types.includes(COLUMN_DRAG_MIME)) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setDropIndex(resolveListDropIndex(event.currentTarget, event.clientY));
    },
    [dragEnabled]
  );

  const handleDropOnList = useCallback(
    (event: DragEvent<HTMLUListElement>) => {
      if (!dragEnabled) return;
      event.preventDefault();
      const columnKey = event.dataTransfer.getData(COLUMN_DRAG_MIME);
      if (!columnKey) {
        clearDragState();
        return;
      }

      const toIndex = resolveListDropIndex(event.currentTarget, event.clientY);
      onPreferencesChange(
        reorderColumnInPreferences(preferences, definitions, columnKey, toIndex)
      );
      clearDragState();
    },
    [clearDragState, definitions, dragEnabled, onPreferencesChange, preferences]
  );

  const listItems = dragEnabled ? orderedHideable : filteredHideable;

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      {showHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-text-muted text-xs leading-relaxed">
            Show, hide, and reorder columns. Drag the handle or use arrows. Changes
            apply to the list view.
          </p>
          {onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="text-text-secondary hover:text-text-primary shrink-0 text-xs font-medium underline-offset-2 hover:underline"
            >
              Reset
            </button>
          ) : null}
        </div>
      ) : null}

      {showSearch ? (
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find column…"
          aria-label="Find column"
          className="border-border-subtle bg-bg-surface text-text-primary placeholder:text-text-muted focus:border-accent h-9 w-full rounded-lg border px-3 text-sm outline-none"
        />
      ) : null}

      {normalizedQuery ? (
        <p className="text-text-muted text-xs">
          Clear search to drag and reorder columns.
        </p>
      ) : null}

      <ul
        className="flex flex-col gap-1"
        role="list"
        onDragOver={handleDragOverList}
        onDrop={handleDropOnList}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node)) return;
          setDropIndex(null);
        }}
      >
        {listItems.length === 0 ? (
          <li className="text-text-muted px-1 py-2 text-sm">No columns match your search.</li>
        ) : (
          listItems.map((def, index) => {
            const isVisible = !hiddenSet.has(def.key);
            const orderIndex = orderedHideable.findIndex((entry) => entry.key === def.key);
            const canMoveUp = orderIndex > 0;
            const canMoveDown = orderIndex >= 0 && orderIndex < orderedHideable.length - 1;
            const visibleHideableCount = orderedHideable.filter(
              (entry) => !hiddenSet.has(entry.key)
            ).length;
            const canHide = isVisible ? visibleHideableCount > 1 : true;
            const isDragging = draggingKey === def.key;
            const showDropBefore = dropIndex === index && draggingKey !== null && !isDragging;

            return (
              <li
                key={def.key}
                data-list-drop-item
                className={cn(
                  'relative flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
                  'hover:bg-bg-hover',
                  !isVisible && 'opacity-60',
                  isDragging && 'opacity-45'
                )}
              >
                {showDropBefore ? (
                  <span
                    className="bg-accent absolute -top-0.5 right-2 left-2 z-[1] h-0.5 rounded-full"
                    aria-hidden
                  />
                ) : null}
                <button
                  type="button"
                  draggable={dragEnabled}
                  disabled={!dragEnabled}
                  aria-label={`Drag to reorder ${def.label}`}
                  title={dragEnabled ? 'Drag to reorder' : 'Clear search to reorder'}
                  onDragStart={(event) => handleDragStart(event, def.key)}
                  onDragEnd={clearDragState}
                  className={cn(
                    'text-text-muted hover:text-text-primary inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors',
                    dragEnabled
                      ? 'hover:bg-bg-surface cursor-grab active:cursor-grabbing'
                      : 'cursor-not-allowed opacity-40'
                  )}
                >
                  <GripVertical className="h-4 w-4" aria-hidden strokeWidth={2} />
                </button>
                <Checkbox
                  size={ComponentSizeEnum.SM}
                  checked={isVisible}
                  disabled={!canHide && isVisible}
                  onChange={(event) =>
                    handleVisibilityChange(def.key, event.target.checked)
                  }
                  label={def.label}
                  className="min-w-0 flex-1"
                />
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    disabled={!canMoveUp}
                    aria-label={`Move ${def.label} up`}
                    title="Move up"
                    onClick={() => handleMove(def.key, 'up')}
                    className="text-text-muted hover:text-text-primary hover:bg-bg-surface disabled:hover:text-text-muted inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronUp className="h-4 w-4" aria-hidden strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    disabled={!canMoveDown}
                    aria-label={`Move ${def.label} down`}
                    title="Move down"
                    onClick={() => handleMove(def.key, 'down')}
                    className="text-text-muted hover:text-text-primary hover:bg-bg-surface disabled:hover:text-text-muted inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden strokeWidth={2} />
                  </button>
                </div>
              </li>
            );
          })
        )}
        {dragEnabled &&
        dropIndex === listItems.length &&
        draggingKey !== null &&
        listItems.length > 0 ? (
          <li aria-hidden className="relative h-0.5 w-full">
            <span className="bg-accent absolute inset-x-2 top-0 h-0.5 rounded-full" />
          </li>
        ) : null}
      </ul>

      {pinnedDefinitions.length > 0 ? (
        <div className="border-border-subtle/80 border-t pt-2">
          <p className="text-text-muted mb-1.5 text-[11px] font-medium uppercase tracking-wide">
            Always visible
          </p>
          <ul className="flex flex-col gap-1" role="list">
            {pinnedDefinitions.map((def) => (
              <li
                key={def.key}
                className="text-text-secondary flex items-center gap-2 rounded-lg px-2 py-1 text-sm"
              >
                <Checkbox
                  size={ComponentSizeEnum.SM}
                  checked
                  disabled
                  label={def.label}
                  className="min-w-0 flex-1"
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
