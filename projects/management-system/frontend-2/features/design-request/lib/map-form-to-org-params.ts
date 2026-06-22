import type {
  LineTypeParams,
  OrgDesignParameters,
} from "@/api/types/designRequest";
import { DesignRequestDirection } from "@/api/types/designRequest";

import type { DesignParametersFormValues } from "./constants";
import { lineTypeParamsFromForm } from "./constants";
import {
  ORG_SPACING_MAX_DIGITS,
  formatSpacingForApi,
} from "./design-parameters-validation";

export type PatchOrgDesignParametersPayload = Pick<
  OrgDesignParameters,
  "direction" | "spacing" | "main_params" | "submain_params" | "lateral_params"
>;

export function mapFormToOrgDesignParameters(
  values: DesignParametersFormValues
): PatchOrgDesignParametersPayload {
  const spacing = formatSpacingForApi(values.spacing, ORG_SPACING_MAX_DIGITS);
  return {
    direction: values.direction
      ? (values.direction as DesignRequestDirection)
      : null,
    spacing: spacing ?? null,
    main_params: lineTypeParamsFromForm(values.main) as LineTypeParams,
    submain_params: lineTypeParamsFromForm(values.submain) as LineTypeParams,
    lateral_params: lineTypeParamsFromForm(values.lateral) as LineTypeParams,
  };
}
