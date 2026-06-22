"use client";

import { Textarea } from "@fieldflow360/org-ui";

import {
  type DesignRequestFormValues,
  type LineTypeKey,
} from "../../lib/constants";
import { REQUEST_SPACING_MAX_DIGITS } from "../../lib/design-parameters-validation";
import type { DesignRequestFormErrors } from "../../lib/validate-design-request-form";
import { DesignParametersFields } from "../shared/DesignParametersFields";

export interface DesignRequestSubmitFormProps {
  values: DesignRequestFormValues;
  errors: DesignRequestFormErrors;
  onChange: (values: DesignRequestFormValues) => void;
  onLineTypeFieldChange: (
    lineType: LineTypeKey,
    field: keyof DesignRequestFormValues["main"],
    value: string
  ) => void;
}

export function DesignRequestSubmitForm({
  values,
  errors,
  onChange,
  onLineTypeFieldChange,
}: DesignRequestSubmitFormProps) {
  return (
    <div className="space-y-5">
      <DesignParametersFields
        errors={errors}
        spacingMaxDigits={REQUEST_SPACING_MAX_DIGITS}
        values={values}
        onChange={(next) => onChange({ ...values, ...next })}
        onLineTypeFieldChange={onLineTypeFieldChange}
      />

      <Textarea
        label="Initial Notes (optional)"
        placeholder="Add notes for the design team..."
        value={values.initialNotes}
        onChange={(e) => onChange({ ...values, initialNotes: e.target.value })}
      />

      <div className="space-y-2">
        <label className="text-text-primary text-sm font-medium">
          Attachments (optional)
        </label>
        <input
          multiple
          type="file"
          onChange={(e) =>
            onChange({
              ...values,
              files: e.target.files ? Array.from(e.target.files) : [],
            })
          }
        />
        {values.files.length > 0 ? (
          <ul className="text-text-muted text-xs">
            {values.files.map((file) => (
              <li key={`${file.name}-${file.size}`}>{file.name}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <p className="font-semibold">What happens next?</p>
        <p className="mt-1">
          Your request will be sent to Tile Design FieldFlow360 organization.
          Once approved, you&apos;ll gain access to chat and file sharing
          features to collaborate with the design team.
        </p>
      </div>
    </div>
  );
}
