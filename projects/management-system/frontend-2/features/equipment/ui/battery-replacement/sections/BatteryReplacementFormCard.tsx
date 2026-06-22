"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";

import type { BatteryType } from "@/api/types/equipmentBattery";
import { BATTERY_LIFETIME_OPTIONS } from "@/features/equipment/lib/battery-replacement-constants";
import { Dropdown } from "@/shared/ui/common";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  SanitizedInput,
  SanitizedTextarea,
} from "@/shared/ui/primitives";

interface BatteryReplacementFormCardProps {
  isEditing: boolean;
  disabled: boolean;
  isSaving: boolean;
  batteryTypeId: string;
  replacementDate: string;
  lifetime: string;
  warranty: string;
  nextReplacementDate: string;
  newTypeName: string;
  typeOptions: BatteryType[];
  createBatteryTypePending: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onBatteryTypeChange: (value: string) => void;
  onReplacementDateChange: (value: string) => void;
  onLifetimeChange: (value: string) => void;
  onWarrantyChange: (value: string) => void;
  onNewTypeNameChange: (value: string) => void;
  onAddBatteryType: () => void;
}

export function BatteryReplacementFormCard({
  isEditing,
  disabled,
  isSaving,
  batteryTypeId,
  replacementDate,
  lifetime,
  warranty,
  nextReplacementDate,
  newTypeName,
  typeOptions,
  createBatteryTypePending,
  onEdit,
  onCancel,
  onSave,
  onBatteryTypeChange,
  onReplacementDateChange,
  onLifetimeChange,
  onWarrantyChange,
  onNewTypeNameChange,
  onAddBatteryType,
}: BatteryReplacementFormCardProps) {
  return (
    <Card className="lg:col-span-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Battery Replacement</CardTitle>
        {!isEditing ? (
          <Button
            aria-label="Edit"
            disabled={disabled}
            size={ComponentSizeEnum.SM}
            title="Edit"
            variant={ButtonVariantEnum.SURFACE}
            onClick={onEdit}
          />
        ) : (
          <div className="flex gap-2">
            <Button
              aria-label="Cancel"
              disabled={isSaving}
              size={ComponentSizeEnum.SM}
              title="Cancel"
              variant={ButtonVariantEnum.SURFACE}
              onClick={onCancel}
            />
            <Button
              aria-label="Save"
              disabled={isSaving}
              loading={isSaving}
              size={ComponentSizeEnum.SM}
              title="Save"
              onClick={onSave}
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Battery Type</Label>
          <Dropdown
            preventCloseOnInteract
            align="start"
            disabled={!isEditing || disabled}
            header={
              isEditing && !disabled ? (
                <div
                  className="border-border-subtle border-b p-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex gap-2">
                    <SanitizedInput
                      placeholder="Add new battery type"
                      value={newTypeName}
                      onChange={(e) => onNewTypeNameChange(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          await onAddBatteryType();
                        }
                      }}
                    />
                    <Button
                      aria-label="Add"
                      disabled={createBatteryTypePending}
                      loading={createBatteryTypePending}
                      size={ComponentSizeEnum.SM}
                      title="Add"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await onAddBatteryType();
                      }}
                    />
                  </div>
                </div>
              ) : undefined
            }
            items={
              typeOptions.length === 0
                ? [
                    {
                      id: "none",
                      label: "No battery types yet",
                      disabled: true,
                    },
                  ]
                : typeOptions.map((t) => ({
                    id: String(t.id),
                    label: t.name,
                  }))
            }
            mode="select"
            placeholder="Battery Type"
            selectedValue={batteryTypeId}
            width="full"
            onValueChange={onBatteryTypeChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Replacement Date</Label>
            <SanitizedInput
              disabled={!isEditing || disabled}
              placeholder="Replacement Date"
              type="date"
              value={replacementDate}
              onChange={(e) => onReplacementDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Battery Lifetime</Label>
            <Dropdown
              align="start"
              disabled={!isEditing || disabled}
              items={[...BATTERY_LIFETIME_OPTIONS]}
              mode="select"
              placeholder="Battery Lifetime"
              selectedValue={lifetime}
              width="full"
              onValueChange={onLifetimeChange}
            />
          </div>
          <div className="space-y-2">
            <Label>Next Replacement Date</Label>
            <SanitizedInput
              disabled
              placeholder="Replacement Date"
              type="date"
              value={nextReplacementDate}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Warranty Details</Label>
          <SanitizedTextarea
            className="resize-none"
            disabled={!isEditing || disabled}
            placeholder="Warranty Details"
            value={warranty}
            onChange={(e) => onWarrantyChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
