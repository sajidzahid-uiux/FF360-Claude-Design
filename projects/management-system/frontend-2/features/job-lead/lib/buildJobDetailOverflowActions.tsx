import type { TableAction } from "@fieldflow360/org-ui";
import {
  Archive,
  ArchiveRestore,
  CheckCircle,
  History,
  PauseCircle,
  Trash2,
  X,
} from "lucide-react";

/** Sentinel item for `TableActions` on the job detail header (not a table row). */
export type JobDetailOverflowMenuItem = {
  readonly kind: "job-detail-overflow";
};

export const JOB_DETAIL_OVERFLOW_MENU_ITEM: JobDetailOverflowMenuItem = {
  kind: "job-detail-overflow",
};

export interface JobDetailOverflowActionParams {
  isArchived: boolean;
  onHold: boolean;
  cancelled: boolean;
  completedJob: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onLogs?: () => void;
  onArchive: () => void;
  onTrashOrDelete: () => void;
  onResume?: () => void;
  onToggleHold?: () => void;
  onCancel?: () => void;
}

export function buildJobDetailOverflowActions(
  params: JobDetailOverflowActionParams
): TableAction<JobDetailOverflowMenuItem>[] {
  const actions: TableAction<JobDetailOverflowMenuItem>[] = [];

  if (params.onLogs) {
    actions.push({
      label: "Logs",
      icon: <History aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => params.onLogs?.(),
    });
  }

  if (
    params.onToggleHold &&
    !params.completedJob &&
    !params.cancelled &&
    !params.isArchived &&
    params.canEdit
  ) {
    actions.push({
      label: params.onHold ? "Resume" : "On hold",
      icon: params.onHold ? (
        <CheckCircle aria-hidden className="h-4 w-4" strokeWidth={2} />
      ) : (
        <PauseCircle aria-hidden className="h-4 w-4" strokeWidth={2} />
      ),
      onClick: () => params.onToggleHold?.(),
    });
  }

  if (
    params.onResume &&
    params.cancelled &&
    !params.isArchived &&
    params.canEdit
  ) {
    actions.push({
      label: "Resume",
      icon: <CheckCircle aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => params.onResume?.(),
    });
  }

  if (params.canEdit) {
    actions.push({
      label: params.isArchived ? "Unarchive" : "Archive",
      icon: params.isArchived ? (
        <ArchiveRestore aria-hidden className="h-4 w-4" strokeWidth={2} />
      ) : (
        <Archive aria-hidden className="h-4 w-4" strokeWidth={2} />
      ),
      onClick: () => params.onArchive(),
    });
  }

  if (!params.isArchived && params.canDelete) {
    const destructiveLabel =
      params.completedJob || params.cancelled ? "Delete" : "Trash";
    actions.push({
      label: destructiveLabel,
      icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
      variant: "danger",
      onClick: () => params.onTrashOrDelete(),
    });
  }

  if (
    params.onCancel &&
    !params.completedJob &&
    !params.cancelled &&
    !params.isArchived &&
    params.canEdit
  ) {
    actions.push({
      label: "Canceled",
      icon: <X aria-hidden className="h-4 w-4" strokeWidth={2} />,
      variant: "danger",
      onClick: () => params.onCancel?.(),
    });
  }

  return actions;
}
