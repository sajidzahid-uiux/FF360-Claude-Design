"use client";

import { useMemo, useState } from "react";

import {
  Dropdown,
  Input,
  TabsSwitcher,
  TabsSwitcherViewEnum,
} from "@fieldflow360/org-ui";

import { DesignRequestDirection } from "@/api/types/designRequest";

import {
  DIRECTION_OPTIONS,
  type DesignParametersFormValues,
  LINE_TYPE_TABS,
  type LineTypeKey,
  type LineTypeParamsFormFields,
} from "../../lib/constants";
import {
  ORG_SPACING_MAX_DIGITS,
  sanitizeNumericInput,
  sanitizeSpacingInput,
  spacingMaxValue,
} from "../../lib/design-parameters-validation";
import type { DesignParametersFormErrors } from "../../lib/validate-design-request-form";

export interface DesignParametersFieldsProps {
  values: DesignParametersFormValues;
  errors?: DesignParametersFormErrors;
  onChange: (values: DesignParametersFormValues) => void;
  onLineTypeFieldChange: (
    lineType: LineTypeKey,
    field: keyof LineTypeParamsFormFields,
    value: string
  ) => void;
  disabled?: boolean;
  spacingPlaceholder?: string;
  spacingMaxDigits?: number;
  defaultActiveLineType?: LineTypeKey;
}

export function DesignParametersFields({
  values,
  errors,
  onChange,
  onLineTypeFieldChange,
  disabled = false,
  spacingPlaceholder = "(ft)",
  spacingMaxDigits = ORG_SPACING_MAX_DIGITS,
  defaultActiveLineType = "submain",
}: DesignParametersFieldsProps) {
  const [activeLineType, setActiveLineType] = useState<LineTypeKey>(
    defaultActiveLineType
  );

  const lineTypeTabs = useMemo(
    () =>
      LINE_TYPE_TABS.map((tab) => ({
        value: tab.id,
        label: tab.label,
      })),
    []
  );

  const activeFields = values[activeLineType];
  const activeErrors = errors?.lineTypes?.[activeLineType] ?? {};

  const handleNumericChange = (
    lineType: LineTypeKey,
    field: keyof LineTypeParamsFormFields,
    raw: string
  ) => {
    onLineTypeFieldChange(lineType, field, sanitizeNumericInput(raw));
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Dropdown
          disabled={disabled}
          label="Direction"
          options={DIRECTION_OPTIONS}
          placeholder="Select direction"
          value={values.direction || undefined}
          onChange={(value) =>
            onChange({
              ...values,
              direction: value as DesignRequestDirection,
            })
          }
        />
        <Input
          disabled={disabled}
          error={errors?.spacing}
          label="Spacing"
          max={spacingMaxValue(spacingMaxDigits)}
          min={0}
          placeholder={spacingPlaceholder}
          step={0.01}
          type="number"
          value={values.spacing}
          onChange={(e) =>
            onChange({
              ...values,
              spacing: sanitizeSpacingInput(e.target.value),
            })
          }
        />
      </div>

      <TabsSwitcher
        items={lineTypeTabs}
        value={activeLineType}
        view={TabsSwitcherViewEnum.UNDERLINED}
        onChange={(tab) => setActiveLineType(tab)}
      />

      <div className="space-y-3">
        <h4 className="text-text-primary text-sm font-semibold">
          Depth Organization Settings
        </h4>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            disabled={disabled}
            error={activeErrors.min_depth}
            inputMode="decimal"
            label="Minimum Depth"
            type="number"
            value={activeFields.min_depth}
            onChange={(e) =>
              handleNumericChange(activeLineType, "min_depth", e.target.value)
            }
          />
          <Input
            disabled={disabled}
            error={activeErrors.optimal_depth}
            inputMode="decimal"
            label="Optimal Depth"
            type="number"
            value={activeFields.optimal_depth}
            onChange={(e) =>
              handleNumericChange(
                activeLineType,
                "optimal_depth",
                e.target.value
              )
            }
          />
          <Input
            disabled={disabled}
            error={activeErrors.max_depth}
            inputMode="decimal"
            label="Maximum Depth"
            type="number"
            value={activeFields.max_depth}
            onChange={(e) =>
              handleNumericChange(activeLineType, "max_depth", e.target.value)
            }
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            disabled={disabled}
            error={activeErrors.min_slope}
            inputMode="decimal"
            label="Minimum Slope"
            value={activeFields.min_slope}
            onChange={(e) =>
              handleNumericChange(activeLineType, "min_slope", e.target.value)
            }
          />
          <Input
            disabled={disabled}
            error={activeErrors.outlet_to_optimal_distance}
            inputMode="decimal"
            label="Outlet to Optimal"
            type="number"
            value={activeFields.outlet_to_optimal_distance}
            onChange={(e) =>
              handleNumericChange(
                activeLineType,
                "outlet_to_optimal_distance",
                e.target.value
              )
            }
          />
        </div>
        <p className="text-text-muted text-xs">
          Depths must follow: Min &lt; Optimal &lt; Max depth
        </p>
      </div>
    </div>
  );
}
