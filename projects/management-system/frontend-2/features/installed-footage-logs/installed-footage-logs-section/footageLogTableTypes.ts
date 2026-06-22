import type { InstalledFootageLogEntry } from "@/api/types/installedFootageLogs";

export interface FootageLogTableProps {
  rows: InstalledFootageLogEntry[];
  isLoading: boolean;
  isError: boolean;
  disabled: boolean;
  actionsBusy: boolean;
  canModifyRow: (e: InstalledFootageLogEntry) => boolean;
  onEdit: (e: InstalledFootageLogEntry) => void;
  onDelete: (e: InstalledFootageLogEntry) => void;
}
