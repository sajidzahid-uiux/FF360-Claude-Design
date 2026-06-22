import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type {
  CreateDesignRequestNoteBody,
  DesignRequestStatusItem,
  DesignRequestThreadItem,
  OrgDesignParameters,
  SharedDesignOutput,
  SubmitDesignRequestPayload,
} from "../types/designRequest";

function appendJsonParams(
  formData: FormData,
  key: string,
  params: Record<string, number | null | undefined> | undefined
) {
  if (!params) return;
  const cleaned: Record<string, number> = {};
  Object.entries(params).forEach(([paramKey, value]) => {
    if (value != null && !Number.isNaN(value)) {
      cleaned[paramKey] = value;
    }
  });
  if (Object.keys(cleaned).length > 0) {
    formData.append(key, JSON.stringify(cleaned));
  }
}

function buildSubmitFormData(payload: SubmitDesignRequestPayload): FormData {
  const formData = new FormData();
  formData.append("source_type", payload.source_type);
  formData.append("source_id", String(payload.source_id));
  formData.append("direction", payload.direction);
  if (payload.spacing != null && payload.spacing !== 0) {
    formData.append("spacing", String(payload.spacing));
  }
  appendJsonParams(
    formData,
    "main_params",
    payload.main_params as Record<string, number | null | undefined>
  );
  appendJsonParams(
    formData,
    "submain_params",
    payload.submain_params as Record<string, number | null | undefined>
  );
  appendJsonParams(
    formData,
    "lateral_params",
    payload.lateral_params as Record<string, number | null | undefined>
  );
  if (payload.initial_notes?.trim()) {
    formData.append("initial_notes", payload.initial_notes.trim());
  }
  payload.files?.forEach((file) => {
    formData.append("files", file);
  });
  return formData;
}

export class DesignRequestService {
  static async getOrgDesignParameters(
    organizationId: string
  ): Promise<OrgDesignParameters> {
    return apiClient.get<OrgDesignParameters>(
      API_ENDPOINTS.tdIntegration.designParameters(organizationId)
    );
  }

  static async patchOrgDesignParameters(
    organizationId: string,
    payload: Partial<
      Pick<
        OrgDesignParameters,
        | "direction"
        | "spacing"
        | "main_params"
        | "submain_params"
        | "lateral_params"
      >
    >
  ): Promise<OrgDesignParameters> {
    return apiClient.patch<OrgDesignParameters>(
      API_ENDPOINTS.tdIntegration.designParameters(organizationId),
      payload
    );
  }

  static async getStatusesForTargets(
    organizationId: string,
    params: { jobIds?: number[]; leadIds?: number[] }
  ): Promise<DesignRequestStatusItem[]> {
    const search = new URLSearchParams();
    if (params.jobIds?.length) {
      search.set("job_ids", params.jobIds.join(","));
    } else if (params.leadIds?.length) {
      search.set("lead_ids", params.leadIds.join(","));
    }
    const query = search.toString();
    const endpoint = `${API_ENDPOINTS.tdIntegration.designRequestStatuses(organizationId)}${query ? `?${query}` : ""}`;
    return apiClient.get<DesignRequestStatusItem[]>(endpoint);
  }

  static async submit(
    organizationId: string,
    payload: SubmitDesignRequestPayload
  ): Promise<DesignRequestStatusItem> {
    const formData = buildSubmitFormData(payload);
    return apiClient.post<DesignRequestStatusItem>(
      API_ENDPOINTS.tdIntegration.designRequests(organizationId),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  }

  static async listNotes(
    organizationId: string,
    requestId: number
  ): Promise<DesignRequestThreadItem[]> {
    return apiClient.get<DesignRequestThreadItem[]>(
      API_ENDPOINTS.tdIntegration.designRequestNotes(organizationId, requestId)
    );
  }

  static async createNote(
    organizationId: string,
    requestId: number,
    body: CreateDesignRequestNoteBody
  ): Promise<DesignRequestThreadItem> {
    const formData = new FormData();
    const trimmedBody = (body.body ?? "").trim();
    if (trimmedBody) {
      formData.append("body", trimmedBody);
    }
    if (body.file) {
      formData.append("file", body.file);
    }
    return apiClient.post<DesignRequestThreadItem>(
      API_ENDPOINTS.tdIntegration.designRequestNotes(organizationId, requestId),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  }

  static async updateNote(
    organizationId: string,
    requestId: number,
    noteId: number,
    body: string
  ): Promise<DesignRequestThreadItem> {
    return apiClient.patch<DesignRequestThreadItem>(
      API_ENDPOINTS.tdIntegration.designRequestNoteDetail(
        organizationId,
        requestId,
        noteId
      ),
      { body: body.trim() }
    );
  }

  static async deleteNote(
    organizationId: string,
    requestId: number,
    noteId: number
  ): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.tdIntegration.designRequestNoteDetail(
        organizationId,
        requestId,
        noteId
      )
    );
  }

  static async getSharedOutput(
    organizationId: string,
    requestId: number
  ): Promise<SharedDesignOutput | null> {
    return apiClient.get<SharedDesignOutput | null>(
      API_ENDPOINTS.tdIntegration.designRequestSharedOutput(
        organizationId,
        requestId
      )
    );
  }
}
