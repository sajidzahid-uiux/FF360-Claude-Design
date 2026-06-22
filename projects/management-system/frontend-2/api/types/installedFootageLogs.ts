import type { EntityIdField } from "./common";

/** Path / filter segment for installed footage log entries */
export type InstalledFootageLogType = "main" | "lateral" | "raisers";

export interface InstalledFootageLogEntryBase {
  /** Composite from API, e.g. `"main:1858"` */
  id: number | string;
  log_type: InstalledFootageLogType;
  /** Member display name */
  member_name?: string;
  entered_by_name?: string;
  entered_by: number;
  /** ISO date string */
  date: string;
  /** When true, the current user may edit or delete this row (API-enforced). */
  editable?: boolean;
}

export interface MainInstalledFootageLogEntry extends InstalledFootageLogEntryBase {
  log_type: "main";
  installed: number;
  size?: string | number | null;
  pipe_wall_type?: string | null;
}

export interface LateralInstalledFootageLogEntry extends InstalledFootageLogEntryBase {
  log_type: "lateral";
  installed: number;
}

export interface RaisersInstalledFootageLogEntry extends InstalledFootageLogEntryBase {
  log_type: "raisers";
  quantity: number;
}

export type InstalledFootageLogEntry =
  | MainInstalledFootageLogEntry
  | LateralInstalledFootageLogEntry
  | RaisersInstalledFootageLogEntry;

/** Paginated list from GET daily-progress …/logs/ */
export interface PaginatedInstalledFootageLogs {
  count?: number;
  total_count?: number;
  next: string | null;
  previous: string | null;
  page_size?: number;
  current_page?: number;
  total_pages?: number;
  results: InstalledFootageLogEntry[];
}

export function installedFootageLogsTotalCount(
  page: PaginatedInstalledFootageLogs | undefined
): number {
  if (!page) return 0;
  if (typeof page.total_count === "number") return page.total_count;
  if (typeof page.count === "number") return page.count;
  return page.results?.length ?? 0;
}

export interface UpdateInstalledFootageLogBody {
  date?: string;
  installed?: number;
  size?: string | number | null;
  pipe_wall_type?: string | null;
  quantity?: number;
}

export interface UpdateInstalledFootageLogResponse {
  message?: string;
  entry?: InstalledFootageLogEntry;
}

export interface UpdateInstalledFootageLogArgs {
  logType: InstalledFootageLogType;
  id: EntityIdField<InstalledFootageLogEntryBase>;
  body: UpdateInstalledFootageLogBody;
}

export interface DeleteInstalledFootageLogArgs {
  logType: InstalledFootageLogType;
  id: EntityIdField<InstalledFootageLogEntryBase>;
}
