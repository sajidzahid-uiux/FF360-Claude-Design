export enum DesignRequestStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  InProgress = "in_progress",
  Shared = "shared",
  Cancelled = "cancelled",
}

export enum DesignRequestDirection {
  OneWay = "1_way",
  TwoWay = "2_way",
}

export type DesignRequestSourceType = "job" | "lead";

export interface LineTypeParams {
  min_depth?: number | null;
  optimal_depth?: number | null;
  max_depth?: number | null;
  min_slope?: number | null;
  outlet_to_optimal_distance?: number | null;
}

export interface OrgDesignParameters {
  direction: DesignRequestDirection | null;
  spacing: string | number | null;
  main_params: LineTypeParams;
  submain_params: LineTypeParams;
  lateral_params: LineTypeParams;
  updated_at: string;
}

export interface DesignRequestStatusItem {
  id: number;
  cms_request_id: string;
  target_id: number;
  target_type: string;
  status: DesignRequestStatus;
  updated_at: string;
}

export interface DesignRequestNoteFile {
  download_url: string | null;
  original_filename: string;
  file_size_bytes: number | null;
}

export interface DesignRequestThreadItem {
  id: number | null;
  is_initial: boolean;
  source: string;
  posted_by_name: string;
  body: string;
  file: DesignRequestNoteFile | null;
  extra_files: DesignRequestNoteFile[];
  created_at: string;
  is_edited: boolean;
  can_delete: boolean;
  can_edit: boolean;
}

export type SharedDesignFileType = "pdf" | "xml" | "shp";

export type SharedDesignFileIngestStatus = "pending" | "ready" | "failed";

export type SharedDesignOutputIngestStatus =
  | "processing"
  | "ready"
  | "partial"
  | "failed";

export interface SharedDesignFileOverlay {
  file: string | null;
  data: Record<string, unknown> | null;
  available: boolean;
}

export interface SharedDesignFile {
  file_type: SharedDesignFileType;
  original_filename: string;
  file_size_bytes: number | null;
  ingest_status: SharedDesignFileIngestStatus;
  error_message: string | null;
  download_url: string | null;
  overlay?: SharedDesignFileOverlay | null;
}

export interface SharedDesignOutput {
  shared_at: string;
  shared_by_name: string;
  ingest_status: SharedDesignOutputIngestStatus;
  files: SharedDesignFile[];
}

export interface SubmitDesignRequestPayload {
  source_type: DesignRequestSourceType;
  source_id: number;
  direction: DesignRequestDirection;
  spacing?: number | null;
  main_params?: LineTypeParams;
  submain_params?: LineTypeParams;
  lateral_params?: LineTypeParams;
  initial_notes?: string;
  files?: File[];
}

export interface CreateDesignRequestNoteBody {
  body?: string;
  file?: File;
}

export type DesignRequestPanelTab = "details" | "chat" | "files";
