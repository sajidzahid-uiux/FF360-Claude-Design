"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { DesignRequestService } from "@/api/services";
import { QUERY_KEYS } from "@/constants";
import { DesignParametersFields } from "@/features/design-request";
import {
  type DesignParametersFormValues,
  type LineTypeKey,
  designParametersEqual,
  emptyDesignParametersFormValues,
  isDesignParametersComplete,
} from "@/features/design-request/lib/constants";
import { mapFormToOrgDesignParameters } from "@/features/design-request/lib/map-form-to-org-params";
import { mapOrgDesignParametersToForm } from "@/features/design-request/lib/map-org-params-to-form";
import {
  type DesignParametersFormErrors,
  validateDesignParametersForm,
} from "@/features/design-request/lib/validate-design-request-form";
import { useRouteIds } from "@/hooks";
import { Card, CardContent, CardFooter } from "@/shared/ui/primitives";

export function OrgDesignParametersSettings() {
  const { orgId: organizationId } = useRouteIds();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<DesignParametersFormValues>(
    emptyDesignParametersFormValues()
  );
  const [savedValues, setSavedValues] =
    useState<DesignParametersFormValues | null>(null);
  const [errors, setErrors] = useState<DesignParametersFormErrors>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.ORG_DESIGN_PARAMETERS, organizationId],
    queryFn: () => DesignRequestService.getOrgDesignParameters(organizationId!),
    enabled: Boolean(organizationId),
  });

  useEffect(() => {
    if (!data) return;
    const mapped = mapOrgDesignParametersToForm(data);
    setValues(mapped);
    setSavedValues(mapped);
  }, [data]);

  const isDirty = useMemo(
    () => savedValues != null && !designParametersEqual(values, savedValues),
    [savedValues, values]
  );

  const isComplete = useMemo(
    () => isDesignParametersComplete(values),
    [values]
  );

  const canSave = isDirty && isComplete;

  const saveMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof mapFormToOrgDesignParameters>) =>
      DesignRequestService.patchOrgDesignParameters(organizationId!, payload),
    onSuccess: (saved) => {
      queryClient.setQueryData(
        [QUERY_KEYS.ORG_DESIGN_PARAMETERS, organizationId],
        saved
      );
      const mapped = mapOrgDesignParametersToForm(saved);
      setValues(mapped);
      setSavedValues(mapped);
      setErrors({});
      toast.success("Design parameters saved");
    },
    onError: () => {
      toast.error("Failed to save design parameters");
    },
  });

  const handleLineTypeFieldChange = useCallback(
    (
      lineType: LineTypeKey,
      field: keyof DesignParametersFormValues["main"],
      value: string
    ) => {
      setValues((prev) => ({
        ...prev,
        [lineType]: {
          ...prev[lineType],
          [field]: value,
        },
      }));
    },
    []
  );

  const handleChange = useCallback((next: DesignParametersFormValues) => {
    setValues(next);
  }, []);

  const handleSave = useCallback(() => {
    const validation = validateDesignParametersForm(values, "required");
    if (!validation.ok) {
      setErrors(validation.errors);
      toast.error("Fix validation errors before saving");
      return;
    }
    setErrors({});
    saveMutation.mutate(mapFormToOrgDesignParameters(values));
  }, [saveMutation, values]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="text-text-muted h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-text-muted py-12 text-center">
        Failed to load design parameters.
      </p>
    );
  }

  return (
    <Card>
      <CardContent className="px-6 pt-0 pb-6">
        <DesignParametersFields
          errors={errors}
          values={values}
          onChange={handleChange}
          onLineTypeFieldChange={handleLineTypeFieldChange}
        />
      </CardContent>
      <CardFooter className="flex items-center justify-end">
        <Button
          disabled={saveMutation.isPending || !canSave}
          leftIcon={
            saveMutation.isPending ? (
              <Loader2
                aria-label={
                  saveMutation.isPending
                    ? "Saving..."
                    : "Save Design Parameters"
                }
                className="h-4 w-4 animate-spin"
              />
            ) : (
              <Save className="h-4 w-4" />
            )
          }
          title={
            saveMutation.isPending ? "Saving..." : "Save Design Parameters"
          }
          variant={ButtonVariantEnum.ACCENT}
          onClick={handleSave}
        />
      </CardFooter>
    </Card>
  );
}
