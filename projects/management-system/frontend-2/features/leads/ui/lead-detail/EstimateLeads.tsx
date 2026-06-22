"use client";

import { useEffect, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { Lead, LeadType, LeadUpdatePayload } from "@/api/types";
import { usePatchLead } from "@/hooks/mutations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  SanitizedInput,
} from "@/shared/ui/primitives";

interface EstimateLeadsProps {
  lead: Lead;
  leadType: LeadType;
  disabled?: boolean;
}

export default function EstimateLeads({
  lead,
  leadType,
  disabled = false,
}: EstimateLeadsProps) {
  const patchLead = usePatchLead();
  const [estimateNumber, setEstimateNumber] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [originalEstimateNumber, setOriginalEstimateNumber] =
    useState<string>("");

  // Initialize form value from lead data
  useEffect(() => {
    if (lead) {
      const estimate = lead.estimate_number?.toString() || "";
      setEstimateNumber(estimate);
      setOriginalEstimateNumber(estimate);
      setIsEditing(false);
    }
  }, [lead]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return estimateNumber !== originalEstimateNumber;
  };

  // Handle edit
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle discard
  const handleDiscard = () => {
    setEstimateNumber(originalEstimateNumber);
    setIsEditing(false);
    toast.info("Changes discarded");
  };

  // Handle save
  const handleSave = async () => {
    if (!hasUnsavedChanges()) {
      toast.info("No changes to save");
      return;
    }

    const updatedLead: LeadUpdatePayload = {};

    if (estimateNumber !== originalEstimateNumber) {
      updatedLead.estimate_number = estimateNumber || null;
    }

    try {
      await patchLead.mutateAsync({
        id: lead.id,
        leadType,
        updatedLead,
      });

      // Update original value
      setOriginalEstimateNumber(estimateNumber);
      setIsEditing(false);
      toast.success("Estimate saved successfully");
    } catch (error: unknown) {
      console.error("Error saving estimate:", error);
      // Error handling is done in the hook
      toast.error("Failed to save estimate");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold">
            Estimate Section
          </CardTitle>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  aria-label="Discard"
                  disabled={disabled || patchLead.isPending}
                  size={ComponentSizeEnum.SM}
                  title="Discard"
                  variant={ButtonVariantEnum.SURFACE}
                  onClick={handleDiscard}
                />
                <Button
                  aria-label="Save"
                  disabled={disabled || patchLead.isPending}
                  loading={patchLead.isPending}
                  size={ComponentSizeEnum.SM}
                  title="Save"
                  onClick={handleSave}
                />
              </>
            ) : (
              !disabled && (
                <Button
                  aria-label="Edit"
                  disabled={patchLead.isPending}
                  size={ComponentSizeEnum.SM}
                  title="Edit"
                  variant={ButtonVariantEnum.SURFACE}
                  onClick={handleEdit}
                />
              )
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="estimate-number" variant="lg">
            Estimate Lead Number
          </Label>
          <SanitizedInput
            className="w-1/4"
            disabled={disabled || patchLead.isPending || !isEditing}
            id="estimate-number"
            maxLength={100}
            placeholder="Enter estimate number"
            type="text"
            value={estimateNumber}
            onChange={(e) => setEstimateNumber(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
