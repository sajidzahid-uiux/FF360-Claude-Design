"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Input,
} from "@fieldflow360/org-ui";
import { Archive, CalendarClock, Clock, Save } from "lucide-react";
import { toast } from "sonner";

import { useSettings } from "@/hooks";

interface SystemSettingsViewProps {
  canEdit?: boolean;
}

interface SettingsFormState {
  near_maintenance_warning_threshold: number | "";
  not_completed_maintenance_warning_threshold: number | "";
  archiving_threshold: number | "";
}

const UNIT_SUFFIX_CLASS = "text-text-muted text-xs font-medium";

function UnitSuffix({ label }: { label: string }) {
  return <span className={UNIT_SUFFIX_CLASS}>{label}</span>;
}

export function SystemSettingsView({
  canEdit = true,
}: SystemSettingsViewProps) {
  const {
    settingsPatchMutation,
    data: settings,
    isLoading: settingsLoading,
  } = useSettings();

  const [form, setForm] = useState<SettingsFormState>({
    near_maintenance_warning_threshold: "",
    not_completed_maintenance_warning_threshold: "",
    archiving_threshold: "",
  });

  useEffect(() => {
    if (!settings) return;
    setForm({
      near_maintenance_warning_threshold:
        settings.near_maintenance_warning_threshold ?? "",
      not_completed_maintenance_warning_threshold:
        settings.not_completed_maintenance_warning_threshold ?? "",
      archiving_threshold: settings.archiving_threshold ?? "",
    });
  }, [settings]);

  const archivingMonths = useMemo(() => {
    if (form.archiving_threshold === "") return "";
    return String(Math.round(Number(form.archiving_threshold) / 30));
  }, [form.archiving_threshold]);

  const hasChanges = useMemo(() => {
    if (!settings) return false;
    return (
      form.near_maintenance_warning_threshold !==
        settings.near_maintenance_warning_threshold ||
      form.not_completed_maintenance_warning_threshold !==
        settings.not_completed_maintenance_warning_threshold ||
      form.archiving_threshold !== settings.archiving_threshold
    );
  }, [form, settings]);

  const validateNumeric = useCallback(
    (
      field: keyof SettingsFormState,
      raw: string,
      max: number,
      label: string
    ) => {
      if (raw.length > 150) {
        toast.error(`${label}: maximum 150 characters`);
        return false;
      }
      if (raw !== "" && (Number.isNaN(Number(raw)) || Number(raw) > max)) {
        toast.error(`${label}: maximum value is ${max}`);
        return false;
      }
      return true;
    },
    []
  );

  const handleNumericChange = useCallback(
    (name: keyof SettingsFormState, raw: string) => {
      if (raw !== "" && (Number.isNaN(Number(raw)) || Number(raw) < 0)) {
        return;
      }

      let value: number | "" = raw === "" ? "" : Number(raw);

      if (name === "archiving_threshold" && value !== "") {
        value = Number(value) * 30;
      }

      setForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSave = useCallback(() => {
    if (!canEdit) {
      toast.error("You don't have permission to save settings");
      return;
    }

    const reminderDays = String(
      form.not_completed_maintenance_warning_threshold
    );
    const nearingHours = String(form.near_maintenance_warning_threshold);
    const months = archivingMonths;

    if (
      !validateNumeric(
        "not_completed_maintenance_warning_threshold",
        reminderDays,
        365,
        "Equipment maintenance reminder"
      ) ||
      !validateNumeric(
        "near_maintenance_warning_threshold",
        nearingHours,
        200,
        "Equipment nearing maintenance"
      ) ||
      !validateNumeric("archiving_threshold", months, 24, "Automatic archiving")
    ) {
      return;
    }

    const toNullableNumber = (value: number | ""): number | null | undefined =>
      value === "" ? null : value;

    settingsPatchMutation.mutate({
      newSettings: {
        near_maintenance_warning_threshold: toNullableNumber(
          form.near_maintenance_warning_threshold
        ),
        not_completed_maintenance_warning_threshold: toNullableNumber(
          form.not_completed_maintenance_warning_threshold
        ),
        archiving_threshold: toNullableNumber(form.archiving_threshold),
      },
    });
  }, [archivingMonths, canEdit, form, settingsPatchMutation, validateNumeric]);

  const reminderValue = form.not_completed_maintenance_warning_threshold;
  const nearingValue = form.near_maintenance_warning_threshold;

  return (
    <div className="flex flex-col gap-6">
      {hasChanges ? (
        <div className="border-border-subtle bg-bg-surface-elevated flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
          <p className="text-text-muted text-sm">You have unsaved changes.</p>
          <Button
            aria-label="Save changes"
            disabled={settingsLoading || !canEdit}
            leftIcon={<Save aria-hidden className="h-4 w-4" strokeWidth={2} />}
            size={ComponentSizeEnum.SM}
            title="Save changes"
            variant={ButtonVariantEnum.ACCENT}
            onClick={handleSave}
          />
        </div>
      ) : null}

      <section className="border-border-subtle bg-bg-surface-elevated flex flex-col gap-5 rounded-xl border p-4 md:p-6">
        <div className="space-y-1">
          <h2 className="text-text-primary text-lg font-semibold">
            Equipment maintenance
          </h2>
          <p className="text-text-muted text-sm">
            Configure reminder timing and alerts before scheduled maintenance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            disabled={!canEdit}
            helperText={
              reminderValue !== ""
                ? `Send maintenance reminders every ${reminderValue} days`
                : "How often to send maintenance reminders"
            }
            inputMode="numeric"
            label="Maintenance reminder interval"
            leftIcon={
              <CalendarClock aria-hidden className="h-4 w-4" strokeWidth={2} />
            }
            max={365}
            maxLength={150}
            min={0}
            name="not_completed_maintenance_warning_threshold"
            placeholder="7"
            rightIcon={<UnitSuffix label="Days" />}
            type="number"
            value={reminderValue}
            onBlur={(event) =>
              validateNumeric(
                "not_completed_maintenance_warning_threshold",
                event.target.value,
                365,
                "Equipment maintenance reminder"
              )
            }
            onChange={(event) =>
              handleNumericChange(
                "not_completed_maintenance_warning_threshold",
                event.target.value
              )
            }
          />

          <Input
            disabled={!canEdit}
            helperText={
              nearingValue !== ""
                ? `Alert when equipment is within ${nearingValue} hours of scheduled maintenance`
                : "Hours before maintenance when alerts are sent"
            }
            inputMode="numeric"
            label="Nearing maintenance threshold"
            leftIcon={<Clock aria-hidden className="h-4 w-4" strokeWidth={2} />}
            max={200}
            maxLength={150}
            min={0}
            name="near_maintenance_warning_threshold"
            placeholder="15"
            rightIcon={<UnitSuffix label="Hours" />}
            type="number"
            value={nearingValue}
            onBlur={(event) =>
              validateNumeric(
                "near_maintenance_warning_threshold",
                event.target.value,
                200,
                "Equipment nearing maintenance"
              )
            }
            onChange={(event) =>
              handleNumericChange(
                "near_maintenance_warning_threshold",
                event.target.value
              )
            }
          />
        </div>
      </section>

      <section className="border-border-subtle bg-bg-surface-elevated flex flex-col gap-5 rounded-xl border p-4 md:p-6">
        <div className="space-y-1">
          <h2 className="text-text-primary text-lg font-semibold">
            Automatic archiving
          </h2>
          <p className="text-text-muted text-sm">
            Completed jobs can be archived automatically after a set period.
          </p>
        </div>

        <div className="max-w-md">
          <Input
            disabled={!canEdit}
            helperText={
              archivingMonths !== ""
                ? `Automatically archive completed jobs after ${archivingMonths} months`
                : "Archive completed jobs after this many months"
            }
            inputMode="numeric"
            label="Archive completed jobs after"
            leftIcon={
              <Archive aria-hidden className="h-4 w-4" strokeWidth={2} />
            }
            max={24}
            maxLength={150}
            min={0}
            name="archiving_threshold"
            placeholder="6"
            rightIcon={<UnitSuffix label="Months" />}
            type="number"
            value={archivingMonths}
            onBlur={(event) =>
              validateNumeric(
                "archiving_threshold",
                event.target.value,
                24,
                "Automatic archiving"
              )
            }
            onChange={(event) =>
              handleNumericChange("archiving_threshold", event.target.value)
            }
          />
        </div>
      </section>
    </div>
  );
}
