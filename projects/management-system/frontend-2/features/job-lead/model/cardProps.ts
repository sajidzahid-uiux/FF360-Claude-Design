export interface CardProps<TData> {
  data: TData;
  isSelected: boolean;
  onArchive: (id: number) => void;
  onDeselect: (id: number) => void;
  onRowDoubleClick?: (id: number, isArchived: boolean) => void;
  onSelect: (id: number) => void;
  onShowMore: () => void;
  onTrash: (id: number) => void;
  onUnarchive: (id: number) => void;
  readOnly?: boolean;
  showJobStatus?: boolean;
}
