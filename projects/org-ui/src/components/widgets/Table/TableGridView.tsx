import { cn } from '../../../utils/cn';
import { Loader } from '../Loader';
import { TableEmptyState, type TableEmptyStateProps } from './TableEmptyState';
import { tableCollectionCanvasClass } from './tableCollectionStyles';
import type { TableGridViewConfig, TableItemRenderContext } from './tableViewTypes';

export interface TableGridViewProps<T extends { id: string | number }> {
  data: T[];
  config: TableGridViewConfig<T>;
  isLoading?: boolean;
  loadingText?: string;
  emptyState?: TableEmptyStateProps;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectChange?: (ids: (string | number)[]) => void;
  className?: string;
}

function buildItemContext<T extends { id: string | number }>(
  item: T,
  selectedIds: (string | number)[],
  onSelectChange?: (ids: (string | number)[]) => void
): TableItemRenderContext {
  const selected = selectedIds.includes(item.id);
  return {
    selected,
    onSelectedChange: (next) => {
      if (!onSelectChange) return;
      if (next) {
        if (!selectedIds.includes(item.id)) {
          onSelectChange([...selectedIds, item.id]);
        }
        return;
      }
      onSelectChange(selectedIds.filter((id) => id !== item.id));
    },
  };
}

export function TableGridView<T extends { id: string | number }>({
  data,
  config,
  isLoading,
  loadingText = 'Loading…',
  emptyState,
  selectedIds = [],
  onSelectChange,
  className,
}: TableGridViewProps<T>) {
  const minColumnWidth = config.minColumnWidth ?? 'minmax(16rem, 1fr)';

  if (isLoading) {
    return <Loader text={loadingText} centerInContainer={false} className="py-14" />;
  }

  if (data.length === 0) {
    return <TableEmptyState {...(emptyState ?? { title: 'No items yet' })} />;
  }

  return (
    <div
      className={cn(
        'table-view-body-enter grid w-full min-w-0 gap-3 p-4 sm:gap-4',
        tableCollectionCanvasClass,
        className
      )}
      style={{
        gridTemplateColumns: `repeat(auto-fill, ${minColumnWidth})`,
      }}
    >
      {data.map((item) => {
        const context = buildItemContext(item, selectedIds, onSelectChange);
        return (
          <div key={item.id} className="min-w-0">
            {config.renderCard(item, context)}
          </div>
        );
      })}
    </div>
  );
}
