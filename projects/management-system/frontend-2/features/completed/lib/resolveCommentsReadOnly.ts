export interface ResolveCommentsReadOnlyInput {
  isTrashed?: boolean;
  toggleArchive?: boolean;
  fromCompleted?: boolean;
  completedJob?: boolean;
  cancelled?: boolean;
  /** From job payload when card props omit terminal flags. */
  entityCancelled?: boolean;
  jobStatusTitle?: string | null;
  hasJobWrite: boolean;
  hasCompletedCanceledPageWrite: boolean;
}

export function isTerminalCoCaJob(
  input: Pick<
    ResolveCommentsReadOnlyInput,
    | "fromCompleted"
    | "completedJob"
    | "cancelled"
    | "entityCancelled"
    | "jobStatusTitle"
  >
): boolean {
  if (input.fromCompleted || input.completedJob || input.cancelled) {
    return true;
  }
  if (input.entityCancelled) return true;
  if (input.jobStatusTitle === "Completed") return true;
  return false;
}

export function canAddCommentsOnTerminalJob(
  input: ResolveCommentsReadOnlyInput
): boolean {
  if (input.isTrashed || input.toggleArchive) return false;
  if (!input.hasJobWrite) return false;

  if (!isTerminalCoCaJob(input)) return true;

  return input.hasCompletedCanceledPageWrite;
}

export function resolveCommentsReadOnly(
  input: ResolveCommentsReadOnlyInput
): boolean {
  return !canAddCommentsOnTerminalJob(input);
}
