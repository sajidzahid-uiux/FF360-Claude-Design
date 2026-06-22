import {
  Archive,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';

const TABLE_ACTION_ICON_CLASS = 'h-4 w-4 shrink-0';

function TableActionIcon({
  icon: Icon,
  className = TABLE_ACTION_ICON_CLASS,
}: {
  icon: ComponentType<LucideProps>;
  className?: string;
}) {
  return <Icon className={className} aria-hidden strokeWidth={2} />;
}

/** Lucide icons sized for row action menus and bulk action buttons. */
export const tableActionIcons = {
  more: <TableActionIcon icon={MoreHorizontal} className="h-5 w-5 shrink-0" />,
  view: <TableActionIcon icon={Eye} />,
  edit: <TableActionIcon icon={Pencil} />,
  delete: <TableActionIcon icon={Trash2} />,
  archive: <TableActionIcon icon={Archive} />,
} as const;

export { Archive, Eye, MoreHorizontal, Pencil, Trash2 };
