"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ComponentSizeEnum,
  Dropdown,
  Toggle,
} from "@fieldflow360/org-ui";
import { toast } from "sonner";

import { type Lead, LeadType, LeadUpdatePayload } from "@/api/types";
import { buildPaymentStatusDropdownOptions } from "@/features/jobs";
import {
  buildOperatorDropdownOptions,
  resolveOperatorDropdownValue,
} from "@/features/team";
import { usePaymentStatuses, useTeamData } from "@/hooks";
import { usePatchLead } from "@/hooks/mutations";
import { DetailViewEditActions } from "@/shared/ui/common";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  SanitizedInput,
} from "@/shared/ui/primitives";

interface FinancialAndSchedulingProps {
  lead: Lead;
  leadType: LeadType;
  disabled?: boolean;
}

export default function FinancialAndScheduling({
  lead,
  leadType,
  disabled = false,
}: FinancialAndSchedulingProps) {
  const patchLead = usePatchLead();
  const { data: teamMembers, isLoading: teamLoading } = useTeamData();
  const { data: paymentStatuses = [] } = usePaymentStatuses();

  // Timeline states
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [extraDays, setExtraDays] = useState<string>("");

  // Operator state (for excavation)
  const [operatorId, setOperatorId] = useState<string>("");

  // Project Status states (for tiling)
  const [compCamProject, setCompCamProject] = useState<boolean>(false);
  const [locateCompleted, setLocateCompleted] = useState<boolean>(false);
  const [locateExpireDate, setLocateExpireDate] = useState<string>("");

  // Sales Info states
  const [salesPrice, setSalesPrice] = useState<string>("");

  // Payment status state (tiling only)
  const [paymentStatusId, setPaymentStatusId] = useState<string>("");

  // Edit mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Original values for discard
  const [originalStartDate, setOriginalStartDate] = useState<string>("");
  const [originalEndDate, setOriginalEndDate] = useState<string>("");
  const [originalExtraDays, setOriginalExtraDays] = useState<string>("");
  const [originalOperatorId, setOriginalOperatorId] = useState<string>("");
  const [originalCompCamProject, setOriginalCompCamProject] =
    useState<boolean>(false);
  const [originalLocateCompleted, setOriginalLocateCompleted] =
    useState<boolean>(false);
  const [originalLocateExpireDate, setOriginalLocateExpireDate] =
    useState<string>("");
  const [originalSalesPrice, setOriginalSalesPrice] = useState<string>("");
  const [originalPaymentStatusId, setOriginalPaymentStatusId] =
    useState<string>("");

  // Initialize form values from lead data
  useEffect(() => {
    if (lead) {
      const start = lead.start_date || "";
      const end = lead.end_date || "";
      const extra = lead.extra_days?.toString() || "";
      const operator = lead.operator?.toString() || "none";
      const compCam = lead.comp_cam_project || false;
      const locate = lead.locate_completed || false;
      const locateExpire = lead.locate_expire_date || "";
      const sales = lead.sales_price || "";
      const paymentStatus = lead.payment_status?.toString() || "none";

      setStartDate(start);
      setEndDate(end);
      setExtraDays(extra);
      setOperatorId(operator);
      setCompCamProject(compCam);
      setLocateCompleted(locate);
      setLocateExpireDate(locateExpire);
      setSalesPrice(sales);
      setPaymentStatusId(paymentStatus);

      setOriginalStartDate(start);
      setOriginalEndDate(end);
      setOriginalExtraDays(extra);
      setOriginalOperatorId(operator);
      setOriginalCompCamProject(compCam);
      setOriginalLocateCompleted(locate);
      setOriginalLocateExpireDate(locateExpire);
      setOriginalSalesPrice(sales);
      setOriginalPaymentStatusId(paymentStatus);

      setIsEditing(false);
    }
  }, [lead]);

  const operatorOptions = useMemo(
    () =>
      teamLoading
        ? [{ value: "loading", label: "Loading…", disabled: true }]
        : buildOperatorDropdownOptions(teamMembers),
    [teamLoading, teamMembers]
  );

  const paymentStatusOptions = useMemo(
    () => buildPaymentStatusDropdownOptions(paymentStatuses),
    [paymentStatuses]
  );

  // Check if there are any unsaved changes
  const hasUnsavedChanges = () => {
    const baseChanges =
      startDate !== originalStartDate ||
      endDate !== originalEndDate ||
      extraDays !== originalExtraDays ||
      salesPrice !== originalSalesPrice;

    if (leadType === LeadType.EXCAVATION) {
      return baseChanges || operatorId !== originalOperatorId;
    } else {
      return (
        baseChanges ||
        compCamProject !== originalCompCamProject ||
        locateCompleted !== originalLocateCompleted ||
        locateExpireDate !== originalLocateExpireDate ||
        paymentStatusId !== originalPaymentStatusId
      );
    }
  };

  // Handle edit
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle discard
  const handleDiscard = () => {
    setStartDate(originalStartDate);
    setEndDate(originalEndDate);
    setExtraDays(originalExtraDays);
    setOperatorId(originalOperatorId);
    setCompCamProject(originalCompCamProject);
    setLocateCompleted(originalLocateCompleted);
    setLocateExpireDate(originalLocateExpireDate);
    setSalesPrice(originalSalesPrice);
    setPaymentStatusId(originalPaymentStatusId);
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

    // Timeline fields
    if (startDate !== originalStartDate) {
      updatedLead.start_date = startDate || null;
    }
    if (endDate !== originalEndDate) {
      updatedLead.end_date = endDate || null;
    }
    if (extraDays !== originalExtraDays) {
      updatedLead.extra_days = extraDays ? parseInt(extraDays) : null;
    }

    // Operator field (excavation only)
    if (leadType === LeadType.EXCAVATION) {
      if (operatorId !== originalOperatorId) {
        updatedLead.operator =
          operatorId && operatorId !== "none" ? parseInt(operatorId) : null;
      }
    }

    // Project Status fields (tiling only)
    if (leadType === LeadType.TILING) {
      if (compCamProject !== originalCompCamProject) {
        updatedLead.comp_cam_project = compCamProject;
      }
      if (locateCompleted !== originalLocateCompleted) {
        updatedLead.locate_completed = locateCompleted;
      }
      if (locateExpireDate !== originalLocateExpireDate) {
        updatedLead.locate_expire_date = locateExpireDate || null;
      }
      if (paymentStatusId !== originalPaymentStatusId) {
        updatedLead.payment_status =
          paymentStatusId && paymentStatusId !== "none"
            ? parseInt(paymentStatusId)
            : null;
      }
    }

    // Sales Info fields
    if (salesPrice !== originalSalesPrice) {
      updatedLead.sales_price = salesPrice || null;
    }

    try {
      await patchLead.mutateAsync({
        id: lead.id,
        leadType,
        updatedLead,
      });

      // Update original values
      setOriginalStartDate(startDate);
      setOriginalEndDate(endDate);
      setOriginalExtraDays(extraDays);
      setOriginalOperatorId(operatorId);
      setOriginalCompCamProject(compCamProject);
      setOriginalLocateCompleted(locateCompleted);
      setOriginalLocateExpireDate(locateExpireDate);
      setOriginalSalesPrice(salesPrice);
      setOriginalPaymentStatusId(paymentStatusId);

      setIsEditing(false);
    } catch (error: unknown) {
      console.error("Error saving financial and scheduling:", error);
      // Error handling is done in the hook
    }
  };

  // Calculate total/completed days
  const totalDays =
    startDate && endDate
      ? Math.max(
          0,
          Math.floor(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + (parseInt(extraDays) || 0)
        )
      : null;

  const displayDays =
    leadType === LeadType.TILING
      ? (lead.total_days ?? totalDays)
      : (lead.completed_days ?? totalDays);

  // For excavation leads, show three sections
  if (leadType === LeadType.EXCAVATION) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold">
              Financial & Scheduling
            </CardTitle>
            <div className="flex gap-2">
              <DetailViewEditActions
                canEdit={!disabled}
                editAriaLabel="Edit financial & scheduling"
                editLabel="Edit"
                isEditing={isEditing}
                isSaving={patchLead.isPending}
                saveLabel="Save"
                size={ComponentSizeEnum.SM}
                onCancel={handleDiscard}
                onEdit={handleEdit}
                onSave={handleSave}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-visible">
          <div className="flex flex-col gap-6 overflow-visible xl:flex-row">
            {/* Operator Information Section */}
            <div className="flex-1">
              <Label variant="sectionBlock">Operator Information</Label>
              <div className="space-y-2">
                <Label htmlFor="operator" variant="inputBlock">
                  Operator Name
                </Label>
                <Dropdown
                  fullWidth
                  disabled={
                    disabled || patchLead.isPending || !isEditing || teamLoading
                  }
                  label="Operator name"
                  options={operatorOptions}
                  placeholder="Select operator…"
                  value={resolveOperatorDropdownValue(operatorId)}
                  onChange={(value) => setOperatorId(value)}
                />
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="bg-border hidden w-px self-stretch xl:block" />

            {/* Financial Details Section */}
            <div className="w-full flex-1 xl:max-w-sm">
              <Label variant="sectionBlock">Financial Details</Label>
              <div className="space-y-2">
                <Label htmlFor="sales-price" variant="inputBlock">
                  Sales Price
                </Label>
                <SanitizedInput
                  disabled={disabled || patchLead.isPending || !isEditing}
                  id="sales-price"
                  min="0"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={salesPrice}
                  onChange={(e) => setSalesPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="bg-border hidden w-px self-stretch xl:block" />

            {/* Timeline Section */}
            <div className="flex-1 overflow-visible">
              <Label variant="sectionBlock">Timeline</Label>
              <div className="space-y-4">
                {/* Start Date and End Date on same row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="relative z-10 space-y-2 overflow-visible">
                    <Label htmlFor="start-date" variant="inputBlock">
                      Start Date
                    </Label>
                    <SanitizedInput
                      className="relative z-10 w-full max-w-full min-w-[12rem]"
                      disabled={disabled || patchLead.isPending || !isEditing}
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="relative z-10 space-y-2 overflow-visible">
                    <Label htmlFor="end-date" variant="inputBlock">
                      End Date
                    </Label>
                    <SanitizedInput
                      className="relative z-10 w-full max-w-full min-w-[12rem]"
                      disabled={disabled || patchLead.isPending || !isEditing}
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                {/* Extra Days and Completed Days on same row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="extra-days" variant="inputBlock">
                      Extra Days
                    </Label>
                    <SanitizedInput
                      className="w-full"
                      disabled={disabled || patchLead.isPending || !isEditing}
                      id="extra-days"
                      min="0"
                      placeholder="0"
                      type="number"
                      value={extraDays}
                      onChange={(e) => setExtraDays(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="completed-days" variant="inputBlock">
                      Completed Days
                    </Label>
                    <SanitizedInput
                      disabled
                      readOnly
                      className="bg-bg-surface w-full"
                      id="completed-days"
                      placeholder="0"
                      type="number"
                      value={displayDays?.toString() || ""}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For tiling leads, keep the existing layout
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Financial & Scheduling</h2>
          <div className="flex gap-2">
            <DetailViewEditActions
              canEdit={!disabled}
              editAriaLabel="Edit financial & scheduling"
              editLabel="Edit"
              isEditing={isEditing}
              isSaving={patchLead.isPending}
              saveLabel="Save"
              size={ComponentSizeEnum.SM}
              onCancel={handleDiscard}
              onEdit={handleEdit}
              onSave={handleSave}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-visible">
        <div className="flex flex-col gap-6 overflow-visible xl:flex-row">
          {/* Scheduling & Timeline Section */}
          <div className="flex-1 overflow-visible">
            <Label variant="sectionBlock">Scheduling & Timeline</Label>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="relative z-10 space-y-2 overflow-visible">
                  <Label htmlFor="start-date" variant="field">
                    Start Date
                  </Label>
                  <div
                    className={
                      !isEditing && !disabled && !patchLead.isPending
                        ? "relative z-10 cursor-pointer overflow-visible"
                        : "relative z-10 overflow-visible"
                    }
                    onClick={() => {
                      if (!isEditing && !disabled && !patchLead.isPending) {
                        setIsEditing(true);
                      }
                    }}
                  >
                    <SanitizedInput
                      className="relative z-10 w-full max-w-full min-w-[12rem]"
                      disabled={disabled || patchLead.isPending || !isEditing}
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="relative z-10 space-y-2 overflow-visible">
                  <Label htmlFor="end-date" variant="field">
                    End Date
                  </Label>
                  <div
                    className={
                      !isEditing && !disabled && !patchLead.isPending
                        ? "relative z-10 cursor-pointer overflow-visible"
                        : "relative z-10 overflow-visible"
                    }
                    onClick={() => {
                      if (!isEditing && !disabled && !patchLead.isPending) {
                        setIsEditing(true);
                      }
                    }}
                  >
                    <SanitizedInput
                      className="relative z-10 w-full max-w-full min-w-[12rem]"
                      disabled={disabled || patchLead.isPending || !isEditing}
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="extra-days" variant="field">
                  Extra Days
                </Label>
                <SanitizedInput
                  className="w-full whitespace-nowrap"
                  disabled={disabled || patchLead.isPending || !isEditing}
                  id="extra-days"
                  min="0"
                  placeholder="0"
                  type="number"
                  value={extraDays}
                  onChange={(e) => setExtraDays(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total-days" variant="field">
                  {leadType === LeadType.TILING
                    ? "Total Days"
                    : "Completed Days"}
                </Label>
                <SanitizedInput
                  disabled
                  readOnly
                  className="bg-bg-surface w-full whitespace-nowrap"
                  id="total-days"
                  placeholder="0"
                  type="number"
                  value={displayDays?.toString() || ""}
                />
              </div>
            </div>
          </div>

          {/* Project Status Section (Tiling only) */}
          {leadType === LeadType.TILING && (
            <>
              <div className="bg-border hidden w-px self-stretch xl:block" />
              <div className="w-full flex-1 xl:max-w-xs">
                <Label variant="sectionBlock">Project Status</Label>
                <div className="space-y-4">
                  {/* Comp Cam Project Toggle */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="comp-cam-project" variant="field">
                      Comp Cam Project
                    </Label>
                    <Toggle
                      aria-label="Comp Cam Project"
                      checked={compCamProject}
                      disabled={disabled || patchLead.isPending || !isEditing}
                      onChange={setCompCamProject}
                    />
                  </div>

                  {/* Locate Completed Toggle */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="locate-completed" variant="field">
                      Locate Completed
                    </Label>
                    <Toggle
                      aria-label="Locate Completed"
                      checked={locateCompleted}
                      disabled={disabled || patchLead.isPending || !isEditing}
                      onChange={setLocateCompleted}
                    />
                  </div>

                  {/* Locate Expire Date */}
                  <div className="space-y-2">
                    <Label htmlFor="locate-expire-date" variant="field">
                      Locate Expiry Date
                    </Label>
                    <div
                      className={
                        !isEditing && !disabled && !patchLead.isPending
                          ? "relative z-10 cursor-pointer overflow-visible"
                          : "relative z-10 overflow-visible"
                      }
                      onClick={() => {
                        if (!isEditing && !disabled && !patchLead.isPending) {
                          setIsEditing(true);
                        }
                      }}
                    >
                      <SanitizedInput
                        className="relative z-10 w-full max-w-full min-w-[12rem]"
                        disabled={disabled || patchLead.isPending || !isEditing}
                        id="locate-expire-date"
                        type="date"
                        value={locateExpireDate}
                        onChange={(e) => setLocateExpireDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Sales Info Section */}
          <div className="bg-border hidden w-px self-stretch xl:block" />
          <div className="w-full flex-1 xl:max-w-sm">
            <Label variant="sectionBlock">Sales Info</Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sales-price" variant="field">
                  Sales Price
                </Label>
                <SanitizedInput
                  disabled={disabled || patchLead.isPending || !isEditing}
                  id="sales-price"
                  min="0"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={salesPrice}
                  onChange={(e) => setSalesPrice(e.target.value)}
                />
              </div>
              {leadType === LeadType.TILING && (
                <div className="space-y-2">
                  <Label htmlFor="payment-status" variant="field">
                    Payment Status
                  </Label>
                  <Dropdown
                    fullWidth
                    disabled={disabled || patchLead.isPending || !isEditing}
                    label="Payment status"
                    options={paymentStatusOptions}
                    placeholder="Select payment status…"
                    value={paymentStatusId || "none"}
                    onChange={(value) => setPaymentStatusId(value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
