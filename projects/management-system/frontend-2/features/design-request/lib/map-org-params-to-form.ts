import type {
  LineTypeParams,
  OrgDesignParameters,
} from "@/api/types/designRequest";

import {
  type DesignParametersFormValues,
  type LineTypeParamsFormFields,
} from "./constants";

function paramsToFormFields(
  params: LineTypeParams | undefined
): LineTypeParamsFormFields {
  const read = (key: keyof LineTypeParams) => {
    const value = params?.[key];
    if (value == null) return "";
    return String(value);
  };
  return {
    min_depth: read("min_depth"),
    optimal_depth: read("optimal_depth"),
    max_depth: read("max_depth"),
    min_slope: read("min_slope"),
    outlet_to_optimal_distance: read("outlet_to_optimal_distance"),
  };
}

export function mapOrgDesignParametersToForm(
  params: OrgDesignParameters
): DesignParametersFormValues {
  return {
    direction: params.direction ?? "",
    spacing: params.spacing != null ? String(params.spacing) : "",
    main: paramsToFormFields(params.main_params),
    submain: paramsToFormFields(params.submain_params),
    lateral: paramsToFormFields(params.lateral_params),
  };
}

export function mapCmsParamsToForm(
  cmsParams: Record<string, unknown>
): Pick<
  DesignParametersFormValues,
  "spacing" | "main" | "submain" | "lateral"
> {
  const block = (key: string) =>
    paramsToFormFields(
      typeof cmsParams[key] === "object" && cmsParams[key] != null
        ? (cmsParams[key] as LineTypeParams)
        : undefined
    );
  return {
    spacing:
      cmsParams.spacing != null && cmsParams.spacing !== ""
        ? String(cmsParams.spacing)
        : "",
    main: block("main"),
    submain: block("submain"),
    lateral: block("lateral"),
  };
}
