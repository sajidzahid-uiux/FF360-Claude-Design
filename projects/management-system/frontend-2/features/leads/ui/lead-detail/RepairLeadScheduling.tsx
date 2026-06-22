"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { toast } from "sonner";

import { type Lead, LeadType, type LeadUpdatePayload } from "@/api/types";
import { SchedulingField } from "@/features/leads/ui/SchedulingField";
import { usePatchLead } from "@/hooks/mutations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
} from "@/shared/ui/primitives";

type FormState = {
  start_date: string;
  end_date: string;
  extra_days: string;
};

interface RepairLeadSchedulingProps {
  lead: Lead;
  leadType: LeadType;
  disabled?: boolean;
}

/**
 * Scheduling-only tab for repair leads (start/end/extra days; completed days from API).
 * Mirrors excavation lead timeline without operator or financial sections.
 */
export default function RepairLeadScheduling({
  lead,
  leadType,
  disabled = false,
}: RepairLeadSchedulingProps) {
  const patchLead = usePatchLead();

  const [form, setForm] = useState<FormState>({
    start_date: "",
    end_date: "",
    extra_days: "",
  });

  const [initial, setInitial] = useState<FormState>(form);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!lead) return;

    const next: FormState = {
      start_date: lead.start_date ?? "",
      end_date: lead.end_date ?? "",
      extra_days: lead.extra_days?.toString() ?? "",
    };

    setForm(next);
    setInitial(next);
    setIsEditing(false);
  }, [lead]);

  const hasUnsavedChanges = useMemo(
    () =>
      form.start_date !== initial.start_date ||
      form.end_date !== initial.end_date ||
      form.extra_days !== initial.extra_days,
    [form, initial]
  );

  const totalDays = useMemo(() => {
    if (!form.start_date || !form.end_date) return null;

    const base =
      (new Date(form.end_date).getTime() -
        new Date(form.start_date).getTime()) /
      86400000;

    return Math.max(0, Math.floor(base)) + (Number(form.extra_days) || 0);
  }, [form]);

  const displayDays = lead.completed_days ?? totalDays;

  const updateField =
    (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleDiscard = () => {
    setForm(initial);
    setIsEditing(false);
    toast.info("Changes discarded");
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      toast.info("No changes to save");
      return;
    }

    const payload: LeadUpdatePayload = {};

    if (form.start_date !== initial.start_date) {
      payload.start_date = form.start_date || null;
    }
    if (form.end_date !== initial.end_date) {
      payload.end_date = form.end_date || null;
    }
    if (form.extra_days !== initial.extra_days) {
      payload.extra_days =
        form.extra_days.trim() === "" ? null : Number(form.extra_days);
    }

    try {
      await patchLead.mutateAsync({
        id: lead.id,
        leadType,
        updatedLead: payload,
      });

      setInitial(form);
      setIsEditing(false);
    } catch {
      /* toast handled in hook */
    }
  };

  const isDisabled = disabled || patchLead.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold">Scheduling</CardTitle>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  aria-label="Discard"
                  disabled={isDisabled}
                  size={ComponentSizeEnum.SM}
                  title="Discard"
                  variant={ButtonVariantEnum.SURFACE}
                  onClick={handleDiscard}
                />
                <Button
                  aria-label="Save"
                  disabled={isDisabled}
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
                  onClick={() => setIsEditing(true)}
                />
              )
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-visible">
        <div className="max-w-xl space-y-4">
          <Label variant="section">Timeline</Label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SchedulingField
              disabled={isDisabled || !isEditing}
              id="repair-lead-sched-start"
              label="Start Date"
              type="date"
              value={form.start_date}
              onChange={updateField("start_date")}
            />
            <SchedulingField
              disabled={isDisabled || !isEditing}
              id="repair-lead-sched-end"
              label="End Date"
              type="date"
              value={form.end_date}
              onChange={updateField("end_date")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SchedulingField
              disabled={isDisabled || !isEditing}
              id="repair-lead-sched-extra"
              label="Extra Days"
              min="0"
              placeholder="0"
              type="number"
              value={form.extra_days}
              onChange={updateField("extra_days")}
            />

            <SchedulingField
              disabled
              readOnly
              id="repair-lead-sched-completed"
              label="Completed Days"
              placeholder="—"
              value={displayDays != null ? String(displayDays) : ""}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
