import {
  Archive,
  ArchiveRestore,
  CheckCircle,
  Download,
  Edit,
  Eye,
  History,
  MapPin,
  PauseCircle,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

import type { DropdownItem } from "@/shared/ui/common/Dropdown";

export const action = {
  view: (onSelect: () => void): DropdownItem => ({
    id: "view",
    label: "View details",
    icon: <Eye className="h-4 w-4" />,
    onSelect,
  }),

  logs: (onSelect: () => void): DropdownItem => ({
    id: "logs",
    label: "Logs",
    icon: <History className="h-4 w-4" />,
    onSelect,
  }),

  edit: (onSelect: () => void, enabled = true): DropdownItem => ({
    id: "edit",
    label: "Edit",
    icon: <Edit className="h-4 w-4" />,
    onSelect,
    disabled: !enabled,
  }),

  trash: (onSelect: () => void, enabled = true): DropdownItem => ({
    id: "trash",
    label: "Trash",
    icon: <Trash2 className="h-4 w-4" />,
    onSelect,
    disabled: !enabled,
    destructive: true,
  }),

  archive: (
    onSelect: () => void,
    archived: boolean,
    enabled = true
  ): DropdownItem => ({
    id: archived ? "unarchive" : "archive",
    label: archived ? "Unarchive" : "Archive",
    icon: archived ? (
      <ArchiveRestore className="h-4 w-4" />
    ) : (
      <Archive className="h-4 w-4" />
    ),
    onSelect,
    disabled: !enabled,
  }),

  track: (onSelect: () => void, enabled = true): DropdownItem => ({
    id: "track",
    label: "On-site tracking",
    icon: <MapPin className="h-4 w-4" />,
    onSelect,
    disabled: !enabled,
  }),

  hold: (
    onSelect: () => void,
    onHold: boolean,
    enabled = true
  ): DropdownItem => ({
    id: onHold ? "resume" : "hold",
    label: onHold ? "Resume" : "On Hold",
    icon: onHold ? (
      <CheckCircle className="h-4 w-4" />
    ) : (
      <PauseCircle className="h-4 w-4" />
    ),
    onSelect,
    disabled: !enabled,
  }),

  cancel: (onSelect: () => void, enabled = true): DropdownItem => ({
    id: "cancel",
    label: "Canceled",
    icon: <X className="h-4 w-4" />,
    onSelect,
    disabled: !enabled,
    destructive: true,
  }),

  download: (onSelect: () => void, enabled = true): DropdownItem => ({
    id: "download",
    label: "Download",
    icon: <Download className="h-4 w-4" />,
    onSelect,
    disabled: !enabled,
  }),

  activate: (
    onSelect: () => void,
    isActive: boolean,
    enabled = true
  ): DropdownItem => ({
    id: isActive ? "deactivate" : "reactivate",
    label: isActive ? "Deactivate" : "Reactivate",
    icon: isActive ? (
      <Trash2 className="h-4 w-4" />
    ) : (
      <RotateCcw className="h-4 w-4" />
    ),
    onSelect,
    disabled: !enabled,
    destructive: isActive,
  }),

  delete: (onSelect: () => void, enabled = true): DropdownItem => ({
    id: "delete",
    label: "Delete",
    icon: <Trash2 className="h-4 w-4" />,
    onSelect,
    disabled: !enabled,
    destructive: true,
  }),

  resume: (onSelect: () => void, enabled = true): DropdownItem => ({
    id: "resume",
    label: "Resume",
    icon: <CheckCircle className="h-4 w-4" />,
    onSelect,
    disabled: !enabled,
  }),

  restore: (onSelect: () => void, enabled = true): DropdownItem => ({
    id: "restore",
    label: "Restore",
    icon: <RotateCcw className="h-4 w-4" />,
    onSelect,
    disabled: !enabled,
  }),
};

export function buildRowActions(params: {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canArchive: boolean;
  canTrack: boolean;
  isArchived: boolean;
  canActivate?: boolean;
  isActive?: boolean;
  onHold?: boolean;
  canRestore?: boolean;

  onView: () => void;
  onLogs?: () => void;
  onEdit?: () => void;
  onTrash?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onTrack?: () => void;
  onHoldResume?: () => void;
  onCancel?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  onResume?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onRestore?: () => void;

  customActions?: DropdownItem[];
}): DropdownItem[] {
  const items: DropdownItem[] = [];

  if (params.canView) items.push(action.view(params.onView));
  if (params.onLogs) items.push(action.logs(params.onLogs));
  if (params.onEdit && params.canEdit) items.push(action.edit(params.onEdit));
  if (params.onRestore && params.canRestore)
    items.push(action.restore(params.onRestore));

  if (params.onTrack && params.canTrack)
    items.push(action.track(params.onTrack));

  if (params.onHoldResume && params.onHold !== undefined)
    items.push(action.hold(params.onHoldResume, params.onHold));
  if (params.onDownload) items.push(action.download(params.onDownload));
  if (params.onResume) items.push(action.resume(params.onResume));

  // Add custom actions
  if (params.customActions && params.customActions.length > 0) {
    if (items.length > 0) {
      items.push({ type: "separator", id: "sep-custom" });
    }
    items.push(...params.customActions);
  }

  // archive/unarchive
  if (params.canArchive) {
    if (items.length > 0) {
      items.push({ type: "separator", id: "sep-archive" });
    }
    items.push(
      action.archive(
        params.isArchived
          ? (params.onUnarchive ?? (() => {}))
          : (params.onArchive ?? (() => {})),
        params.isArchived,
        true
      )
    );
  }

  // activate/deactivate
  if (params.canActivate && params.isActive !== undefined) {
    if (items.length > 0) {
      items.push({ type: "separator", id: "sep-activate" });
    }
    items.push(
      action.activate(
        params.isActive
          ? (params.onDeactivate ?? (() => {}))
          : (params.onActivate ?? (() => {})),
        params.isActive,
        true
      )
    );
  }

  // destructive group
  const destructive: DropdownItem[] = [];
  if (params.onTrash && params.canDelete)
    destructive.push(action.trash(params.onTrash));
  if (params.onDelete && params.canDelete)
    destructive.push(action.delete(params.onDelete));
  if (params.onCancel) destructive.push(action.cancel(params.onCancel));

  if (destructive.length) {
    if (items.length > 0) {
      items.push({ type: "separator", id: "sep-destructive" });
    }
    items.push(...destructive);
  }

  return items;
}
