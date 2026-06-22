export type BulkConfirmationAction =
  | "delete"
  | "trash"
  | "archive"
  | "unarchive";

export interface BulkConfirmationCopy {
  title: string;
  description: string;
  confirmButtonText: string;
}

export interface BulkConfirmationCopyOptions {
  count: number;
  entitySingular: string;
  entityPlural: string;
  action: BulkConfirmationAction;
  /** Appended to delete descriptions, e.g. " This cannot be undone." */
  suffix?: string;
  confirmSingle?: string;
  confirmPlural?: string;
}

function capitalizeLabel(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const ACTION_DEFAULTS: Record<
  BulkConfirmationAction,
  {
    verb: string;
    permanentVerb: string;
    confirmSingle: string;
    confirmPlural: string;
    trashNote?: string;
  }
> = {
  delete: {
    verb: "delete",
    permanentVerb: "permanently delete",
    confirmSingle: "Delete",
    confirmPlural: "Delete All",
  },
  trash: {
    verb: "trash",
    permanentVerb: "trash",
    confirmSingle: "Trash",
    confirmPlural: "Trash All",
    trashNote: " This action is not permanent and items can be restored.",
  },
  archive: {
    verb: "archive",
    permanentVerb: "archive",
    confirmSingle: "Archive",
    confirmPlural: "Archive All",
  },
  unarchive: {
    verb: "unarchive",
    permanentVerb: "unarchive",
    confirmSingle: "Unarchive",
    confirmPlural: "Unarchive All",
  },
};

export function bulkConfirmationCopy({
  count,
  entitySingular,
  entityPlural,
  action,
  suffix = "",
  confirmSingle,
  confirmPlural,
}: BulkConfirmationCopyOptions): BulkConfirmationCopy {
  const isSingle = count === 1;
  const config = ACTION_DEFAULTS[action];
  const titleSingular = capitalizeLabel(entitySingular);
  const titlePlural = capitalizeLabel(entityPlural);
  const usePermanentVerb = action === "delete";
  const verb = usePermanentVerb ? config.permanentVerb : config.verb;
  const trashNote = action === "trash" ? (config.trashNote ?? "") : "";

  return {
    title: isSingle
      ? `${config.confirmSingle} ${titleSingular}`
      : `${config.confirmSingle} ${count} ${titlePlural}`,
    description: isSingle
      ? `Are you sure you want to ${verb} this ${entitySingular}?${trashNote}${suffix}`
      : `Are you sure you want to ${verb} ${count} ${entityPlural}?${trashNote}${suffix}`,
    confirmButtonText:
      (isSingle ? confirmSingle : confirmPlural) ??
      (isSingle ? config.confirmSingle : config.confirmPlural),
  };
}

export function bulkActionSuccessMessage(
  count: number,
  entitySingular: string,
  entityPlural: string,
  pastTense: string
): string {
  if (count === 1) {
    return `${capitalizeLabel(entitySingular)} ${pastTense}.`;
  }
  return `${count} ${entityPlural} ${pastTense}.`;
}

export function bulkDeleteSuccessMessage(
  count: number,
  entitySingular: string,
  entityPlural: string,
  options?: { pastTense?: string }
): string {
  return bulkActionSuccessMessage(
    count,
    entitySingular,
    entityPlural,
    options?.pastTense ?? "deleted"
  );
}
