import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/api/client";
import {
  DesignRequestDirection,
  DesignRequestStatus,
} from "@/api/types/designRequest";
import type { DesignRequestStatusItem } from "@/api/types/designRequest";
import { QUERY_KEYS } from "@/constants";

import {
  emptyDesignParametersFormValues,
  emptyDesignRequestFormValues,
  isDesignParametersComplete,
  lineTypeParamsFromForm,
} from "../constants";
import {
  ORG_SPACING_MAX_DIGITS,
  formatSpacingForApi,
  validateLineTypeParams,
  validateSpacingValue,
} from "../design-parameters-validation";
import {
  getDesignRequestSubmitErrorMessage,
  isDuplicateActiveDesignRequestError,
} from "../design-request-api-errors";
import {
  blocksNewDesignRequestSubmit,
  buildDesignRequestStatusMap,
  getDesignRequestFooterButtonTitle,
  getDesignRequestFooterStatusMessage,
  getDesignRequestFooterVariant,
  shouldShowDesignRequestFooterButton,
} from "../design-request-lifecycle";
import {
  canResubmitDesignRequest,
  canWriteDesignRequestNotes,
  isActiveDesignRequestStatus,
  isDesignRequestThreadReadOnly,
  shouldShowDesignRequestSubmitForm,
} from "../design-request-status";
import { formatMaxFileSize } from "../format-max-file-size";
import {
  handleDesignRequestWsEvent,
  isDesignRequestWsEventForTarget,
} from "../handle-design-request-ws-event";
import { mapFormToOrgDesignParameters } from "../map-form-to-org-params";
import { mapOrgDesignParametersToForm } from "../map-org-params-to-form";
import { pickLatestDesignRequestStatus } from "../pick-latest-design-request-status";
import {
  canPreviewSharedDesignPdf,
  extractSharedXmlMapLayers,
  getSharedDesignFileErrorMessage,
  getSharedDesignOutputEmptyMessage,
  isSharedDesignFileFailed,
  isSharedDesignFileReady,
} from "../shared-design-output";
import {
  validateDesignParametersForm,
  validateDesignRequestForm,
  validateNoteInput,
  validateSubmitFiles,
} from "../validate-design-request-form";

const validLineTypeFields = {
  min_depth: "4",
  optimal_depth: "4.5",
  max_depth: "5",
  min_slope: "0.1",
  outlet_to_optimal_distance: "100",
};

describe("validateDesignRequestForm", () => {
  it("blocks submission when required depth fields are missing", () => {
    const values = emptyDesignRequestFormValues();
    const result = validateDesignRequestForm(values);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.lineTypes?.main?.min_depth).toBe("Required");
    }
  });

  it("blocks submission when direction is missing", () => {
    const values = emptyDesignRequestFormValues();
    values.spacing = "40";
    for (const lineType of ["main", "submain", "lateral"] as const) {
      values[lineType] = { ...validLineTypeFields };
    }
    const result = validateDesignRequestForm(values);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.direction).toBe("Direction is required");
    }
  });

  it("accepts a fully populated form", () => {
    const values = emptyDesignRequestFormValues();
    values.direction = DesignRequestDirection.OneWay;
    values.spacing = "40";
    for (const lineType of ["main", "submain", "lateral"] as const) {
      values[lineType] = { ...validLineTypeFields };
    }
    expect(validateDesignRequestForm(values).ok).toBe(true);
  });

  it("rejects equal min and optimal depth", () => {
    const errors = validateLineTypeParams(
      {
        ...validLineTypeFields,
        optimal_depth: "4",
      },
      "required"
    );
    expect(errors.optimal_depth).toMatch(/greater than minimum/i);
  });
});

describe("isDesignParametersComplete", () => {
  it("is false when any field is empty", () => {
    expect(isDesignParametersComplete(emptyDesignParametersFormValues())).toBe(
      false
    );
  });

  it("is true when direction, spacing, and all line fields are filled", () => {
    const values = emptyDesignParametersFormValues();
    values.direction = DesignRequestDirection.OneWay;
    values.spacing = "40";
    for (const lineType of ["main", "submain", "lateral"] as const) {
      values[lineType] = {
        min_depth: "4",
        optimal_depth: "4.5",
        max_depth: "5",
        min_slope: "0.1",
        outlet_to_optimal_distance: "100",
      };
    }
    expect(isDesignParametersComplete(values)).toBe(true);
  });
});

describe("validateDesignParametersForm", () => {
  it("allows partial org defaults with empty fields", () => {
    const values = emptyDesignParametersFormValues();
    values.main.min_depth = "4";
    expect(validateDesignParametersForm(values, "partial").ok).toBe(true);
  });

  it("validates filled depth fields in partial mode", () => {
    const values = emptyDesignParametersFormValues();
    values.main.min_depth = "99";
    const result = validateDesignParametersForm(values, "partial");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.lineTypes?.main?.min_depth).toMatch(/between/i);
    }
  });

  it("requires spacing in required mode", () => {
    const values = emptyDesignParametersFormValues();
    const result = validateDesignParametersForm(values, "required");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.spacing).toBe("Required");
    }
  });
});

describe("validateSpacingValue", () => {
  it("allows empty spacing for partial saves", () => {
    expect(validateSpacingValue("", false)).toBeUndefined();
  });

  it("rejects too many decimal places", () => {
    expect(validateSpacingValue("1.234", false)).toMatch(/decimal/i);
  });

  it("enforces org spacing max digits", () => {
    expect(
      validateSpacingValue("1000000", false, ORG_SPACING_MAX_DIGITS)
    ).toMatch(/too large/i);
  });
});

describe("formatSpacingForApi", () => {
  it("rounds to two decimal places for backend decimal fields", () => {
    expect(formatSpacingForApi("40.556")).toBe(40.56);
  });

  it("returns null for empty spacing", () => {
    expect(formatSpacingForApi("")).toBeNull();
  });
});

describe("validateNoteInput", () => {
  it("requires body or file", () => {
    expect(validateNoteInput("", null)).toMatch(/either text or a file/i);
  });

  it("rejects oversized note files with max size in message", () => {
    const file = new File(["x"], "big.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(file, "size", { value: 11 * 1024 * 1024 });
    expect(validateNoteInput("", file)).toMatch(/10 MB/i);
  });

  it("rejects whitespace-only note without a file", () => {
    expect(validateNoteInput("   ", null)).toMatch(/either text or a file/i);
  });
});

describe("validateSubmitFiles", () => {
  it("rejects disallowed extensions", () => {
    const file = new File(["x"], "notes.exe", {
      type: "application/octet-stream",
    });
    expect(validateSubmitFiles([file], [".pdf"], 50 * 1024 * 1024)).toMatch(
      /not allowed/i
    );
  });

  it("includes max size in oversized file errors", () => {
    const file = new File(["x"], "big.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 51 * 1024 * 1024 });
    expect(validateSubmitFiles([file], [".pdf"], 50 * 1024 * 1024)).toMatch(
      /50 MB/i
    );
  });
});

describe("mapOrgDesignParametersToForm", () => {
  it("prefills direction, spacing, and line params from org defaults", () => {
    const form = mapOrgDesignParametersToForm({
      direction: DesignRequestDirection.OneWay,
      spacing: "2",
      main_params: { min_depth: 4 },
      submain_params: { min_depth: 3 },
      lateral_params: { min_depth: 2 },
      updated_at: "2026-01-01T00:00:00Z",
    });
    expect(form.direction).toBe(DesignRequestDirection.OneWay);
    expect(form.spacing).toBe("2");
    expect(form.main.min_depth).toBe("4");
  });

  it("returns empty direction when org has no default", () => {
    const form = mapOrgDesignParametersToForm({
      direction: null,
      spacing: null,
      main_params: {},
      submain_params: {},
      lateral_params: {},
      updated_at: "2026-01-01T00:00:00Z",
    });
    expect(form.direction).toBe("");
    expect(form.spacing).toBe("");
  });
});

describe("mapFormToOrgDesignParameters", () => {
  it("maps empty strings to null for partial defaults", () => {
    const payload = mapFormToOrgDesignParameters(
      emptyDesignParametersFormValues()
    );
    expect(payload.direction).toBeNull();
    expect(payload.spacing).toBeNull();
    expect(payload.main_params.min_depth).toBeNull();
  });
});

describe("lineTypeParamsFromForm", () => {
  it("parses numeric strings into API params", () => {
    const params = lineTypeParamsFromForm({
      min_depth: "4",
      optimal_depth: "4,5",
      max_depth: "5",
      min_slope: "0.1",
      outlet_to_optimal_distance: "100",
    });
    expect(params.min_depth).toBe(4);
    expect(params.optimal_depth).toBe(4.5);
    expect(params.max_depth).toBe(5);
  });
});

describe("design-request-api-errors", () => {
  it("detects duplicate active request errors", () => {
    const err = new ApiError(
      "bad",
      400,
      {
        non_field_errors: [
          "An active design request already exists for this job or lead.",
        ],
      },
      {} as never
    );
    expect(isDuplicateActiveDesignRequestError(err)).toBe(true);
    expect(getDesignRequestSubmitErrorMessage(err)).toMatch(/already exists/i);
  });
});

describe("isActiveDesignRequestStatus", () => {
  it("treats rejected requests as inactive so a new request can be submitted", () => {
    expect(isActiveDesignRequestStatus("pending")).toBe(true);
    expect(isActiveDesignRequestStatus("rejected")).toBe(false);
  });
});

describe("canResubmitDesignRequest", () => {
  it("allows resubmit only after rejection", () => {
    expect(canResubmitDesignRequest("rejected")).toBe(true);
    expect(canResubmitDesignRequest("shared")).toBe(false);
    expect(canResubmitDesignRequest("cancelled")).toBe(false);
    expect(canResubmitDesignRequest("pending")).toBe(false);
  });
});

describe("design request lifecycle", () => {
  const item = (
    targetId: number,
    status: DesignRequestStatus,
    updatedAt: string
  ): DesignRequestStatusItem => ({
    id: targetId,
    cms_request_id: `cms-${targetId}`,
    target_id: targetId,
    target_type: "job",
    status,
    updated_at: updatedAt,
  });

  it("builds a map with the latest status per target", () => {
    const map = buildDesignRequestStatusMap([
      item(1, DesignRequestStatus.Rejected, "2026-01-01T00:00:00Z"),
      item(1, DesignRequestStatus.Pending, "2026-02-01T00:00:00Z"),
      item(2, DesignRequestStatus.Shared, "2026-01-15T00:00:00Z"),
    ]);
    expect(map.get(1)).toBe(DesignRequestStatus.Pending);
    expect(map.get(2)).toBe(DesignRequestStatus.Shared);
  });

  it("blocks new submits for active and shared requests", () => {
    expect(blocksNewDesignRequestSubmit(DesignRequestStatus.Pending)).toBe(
      true
    );
    expect(blocksNewDesignRequestSubmit(DesignRequestStatus.Shared)).toBe(true);
    expect(blocksNewDesignRequestSubmit(DesignRequestStatus.Rejected)).toBe(
      false
    );
    expect(blocksNewDesignRequestSubmit(null)).toBe(false);
  });

  it("shows request button only when no status and user can submit", () => {
    expect(getDesignRequestFooterVariant(null, true)).toBe("request");
    expect(getDesignRequestFooterVariant(null, false)).toBe("view_only");
  });

  it("replaces request button with completed state when design is shared", () => {
    expect(
      getDesignRequestFooterVariant(DesignRequestStatus.Shared, true)
    ).toBe("completed");
    expect(
      getDesignRequestFooterStatusMessage(
        getDesignRequestFooterVariant(DesignRequestStatus.Shared, true)
      )
    ).toBe("Design completed");
    expect(
      shouldShowDesignRequestFooterButton(
        getDesignRequestFooterVariant(DesignRequestStatus.Shared, true)
      )
    ).toBe(false);
    expect(
      getDesignRequestFooterButtonTitle(
        getDesignRequestFooterVariant(DesignRequestStatus.Shared, true)
      )
    ).toBe("View design");
  });

  it("shows in-progress messaging instead of a new request for active statuses", () => {
    const variant = getDesignRequestFooterVariant(
      DesignRequestStatus.Pending,
      true
    );
    expect(variant).toBe("open");
    expect(getDesignRequestFooterStatusMessage(variant)).toBe(
      "Design request in progress"
    );
    expect(getDesignRequestFooterButtonTitle(variant)).toBe(
      "FieldFlow360 Design"
    );
  });
});

const statusItem = (status: DesignRequestStatus): DesignRequestStatusItem => ({
  id: 1,
  cms_request_id: "cms-1",
  target_id: 10,
  target_type: "job",
  status,
  updated_at: "2026-01-01T00:00:00Z",
});

describe("design request notes thread", () => {
  it("allows notes while request is pending, approved, in progress, or shared", () => {
    expect(canWriteDesignRequestNotes("pending")).toBe(true);
    expect(canWriteDesignRequestNotes("approved")).toBe(true);
    expect(canWriteDesignRequestNotes("in_progress")).toBe(true);
    expect(canWriteDesignRequestNotes("shared")).toBe(true);
  });

  it("blocks notes when request is rejected or cancelled", () => {
    expect(canWriteDesignRequestNotes("rejected")).toBe(false);
    expect(canWriteDesignRequestNotes("cancelled")).toBe(false);
    expect(isDesignRequestThreadReadOnly("rejected")).toBe(true);
  });

  it("keeps thread visible after submit instead of replacing it with the submit form", () => {
    expect(shouldShowDesignRequestSubmitForm(null, false)).toBe(true);
    expect(
      shouldShowDesignRequestSubmitForm(
        statusItem(DesignRequestStatus.Pending),
        false
      )
    ).toBe(false);
    expect(
      shouldShowDesignRequestSubmitForm(
        statusItem(DesignRequestStatus.Rejected),
        false
      )
    ).toBe(false);
  });

  it("shows submit form again only when user enters resubmit mode", () => {
    expect(
      shouldShowDesignRequestSubmitForm(
        statusItem(DesignRequestStatus.Rejected),
        true
      )
    ).toBe(true);
    expect(canResubmitDesignRequest("rejected")).toBe(true);
    expect(canResubmitDesignRequest("pending")).toBe(false);
  });
});

describe("formatMaxFileSize", () => {
  it("formats bytes for validation messages", () => {
    expect(formatMaxFileSize(10 * 1024 * 1024)).toBe("10 MB");
  });
});

describe("shared design output", () => {
  const readyPdf = {
    file_type: "pdf" as const,
    original_filename: "report.pdf",
    file_size_bytes: 1024,
    ingest_status: "ready" as const,
    error_message: null,
    download_url: "https://example.com/report.pdf",
  };

  it("detects previewable PDFs", () => {
    expect(canPreviewSharedDesignPdf(readyPdf)).toBe(true);
    expect(canPreviewSharedDesignPdf({ ...readyPdf, file_type: "xml" })).toBe(
      false
    );
  });

  it("extracts XML overlay layers for the job map", () => {
    const layers = extractSharedXmlMapLayers({
      shared_at: "2026-01-01T00:00:00Z",
      shared_by_name: "FF360",
      ingest_status: "ready",
      files: [
        {
          file_type: "xml",
          original_filename: "design.xml.zip",
          file_size_bytes: 100,
          ingest_status: "ready",
          error_message: null,
          download_url: "https://example.com/design.zip",
          overlay: {
            file: null,
            available: true,
            data: { main: { points: [[1, 2]] } },
          },
        },
      ],
    });
    expect(layers).toHaveLength(1);
    expect(layers[0]?.data).toEqual({ main: { points: [[1, 2]] } });
  });

  it("shows empty state when nothing has been shared", () => {
    expect(
      getSharedDesignOutputEmptyMessage(null, {
        isLoading: false,
        isError: false,
        isForbidden: false,
      })
    ).toMatch(/has been shared/i);
  });

  it("surfaces file ingest failures", () => {
    const failed = {
      file_type: "xml" as const,
      original_filename: "bad.zip",
      file_size_bytes: null,
      ingest_status: "failed" as const,
      error_message: "Invalid ZIP archive.",
      download_url: null,
    };
    expect(isSharedDesignFileFailed(failed)).toBe(true);
    expect(isSharedDesignFileReady(failed)).toBe(false);
    expect(getSharedDesignFileErrorMessage(failed)).toBe(
      "Invalid ZIP archive."
    );
  });
});

describe("pickLatestDesignRequestStatus", () => {
  it("returns the most recently updated request", () => {
    const latest = pickLatestDesignRequestStatus([
      {
        id: 1,
        cms_request_id: "a",
        target_id: 1,
        target_type: "job",
        status: DesignRequestStatus.Rejected,
        updated_at: "2026-01-01T00:00:00Z",
      },
      {
        id: 2,
        cms_request_id: "b",
        target_id: 1,
        target_type: "job",
        status: DesignRequestStatus.Pending,
        updated_at: "2026-02-01T00:00:00Z",
      },
    ]);
    expect(latest?.id).toBe(2);
  });
});

describe("handleDesignRequestWsEvent", () => {
  const context = {
    organizationId: "org-1",
    sourceType: "job" as const,
    sourceId: 10,
    trackedRequestIds: [5],
  };

  it("ignores events for unrelated requests when ids are known", () => {
    expect(
      isDesignRequestWsEventForTarget(
        { event: "note_added", design_request_id: 99 },
        [5]
      )
    ).toBe(false);
  });

  it("invalidates target status queries on status change", () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    handleDesignRequestWsEvent(
      queryClient,
      {
        event: "design_request_status_changed",
        design_request_id: 5,
        cms_request_id: "cms-1",
        status: "approved",
      },
      context
    );

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.DESIGN_REQUEST_STATUS, "org-1", "job", 10],
    });
  });

  it("invalidates notes cache on note events", () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    handleDesignRequestWsEvent(
      queryClient,
      { event: "note_added", design_request_id: 5 },
      context
    );

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.DESIGN_REQUEST_NOTES, "org-1", 5],
    });
  });
});
