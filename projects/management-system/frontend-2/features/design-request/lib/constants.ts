import {
  DesignRequestDirection,
  type LineTypeParams,
} from "@/api/types/designRequest";

export const DESIGN_REQUEST_ACTIVE_STATUSES = [
  "pending",
  "approved",
  "in_progress",
] as const;

export const DESIGN_REQUEST_NOTE_WRITABLE_STATUSES = [
  "pending",
  "approved",
  "in_progress",
  "shared",
] as const;

export const DESIGN_REQUEST_SUBMIT_FILE_MAX_BYTES = 50 * 1024 * 1024;
export const DESIGN_REQUEST_NOTE_FILE_MAX_BYTES = 10 * 1024 * 1024;

export const DESIGN_REQUEST_SUBMIT_ALLOWED_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".csv",
  ".zip",
  ".xml",
  ".shp",
  ".las",
  ".tif",
] as const;

export const DESIGN_REQUEST_NOTE_ALLOWED_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".csv",
  ".zip",
  ".xml",
  ".shp",
] as const;

export type LineTypeKey = "main" | "submain" | "lateral";

export const LINE_TYPE_TABS: { id: LineTypeKey; label: string }[] = [
  { id: "main", label: "Main" },
  { id: "submain", label: "Sub-Main" },
  { id: "lateral", label: "Laterals" },
];

export const DIRECTION_OPTIONS = [
  { value: DesignRequestDirection.OneWay, label: "1-Way" },
  { value: DesignRequestDirection.TwoWay, label: "2-Way" },
];

export interface DesignParametersFormValues {
  direction: DesignRequestDirection | "";
  spacing: string;
  main: LineTypeParamsFormFields;
  submain: LineTypeParamsFormFields;
  lateral: LineTypeParamsFormFields;
}

export interface DesignRequestFormValues extends DesignParametersFormValues {
  initialNotes: string;
  files: File[];
}

export interface LineTypeParamsFormFields {
  min_depth: string;
  optimal_depth: string;
  max_depth: string;
  min_slope: string;
  outlet_to_optimal_distance: string;
}

export function emptyLineTypeFields(): LineTypeParamsFormFields {
  return {
    min_depth: "",
    optimal_depth: "",
    max_depth: "",
    min_slope: "",
    outlet_to_optimal_distance: "",
  };
}

export function emptyDesignParametersFormValues(): DesignParametersFormValues {
  return {
    direction: "",
    spacing: "",
    main: emptyLineTypeFields(),
    submain: emptyLineTypeFields(),
    lateral: emptyLineTypeFields(),
  };
}

const LINE_TYPE_PARAM_FIELDS: (keyof LineTypeParamsFormFields)[] = [
  "min_depth",
  "optimal_depth",
  "max_depth",
  "min_slope",
  "outlet_to_optimal_distance",
];

export function designParametersEqual(
  a: DesignParametersFormValues,
  b: DesignParametersFormValues
): boolean {
  if (a.direction !== b.direction || a.spacing !== b.spacing) {
    return false;
  }
  for (const lineType of LINE_TYPE_TABS) {
    for (const field of LINE_TYPE_PARAM_FIELDS) {
      if (a[lineType.id][field] !== b[lineType.id][field]) {
        return false;
      }
    }
  }
  return true;
}

export function isDesignParametersComplete(
  values: DesignParametersFormValues
): boolean {
  if (!values.direction || !values.spacing.trim()) {
    return false;
  }
  for (const lineType of LINE_TYPE_TABS) {
    for (const field of LINE_TYPE_PARAM_FIELDS) {
      if (!values[lineType.id][field].trim()) {
        return false;
      }
    }
  }
  return true;
}

export function emptyDesignRequestFormValues(): DesignRequestFormValues {
  return {
    ...emptyDesignParametersFormValues(),
    initialNotes: "",
    files: [],
  };
}

export function lineTypeParamsFromForm(
  fields: LineTypeParamsFormFields
): LineTypeParams {
  const parse = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const num = Number(trimmed.replace(",", "."));
    return Number.isFinite(num) ? num : undefined;
  };
  return {
    min_depth: parse(fields.min_depth) ?? null,
    optimal_depth: parse(fields.optimal_depth) ?? null,
    max_depth: parse(fields.max_depth) ?? null,
    min_slope: parse(fields.min_slope) ?? null,
    outlet_to_optimal_distance:
      parse(fields.outlet_to_optimal_distance) ?? null,
  };
}
