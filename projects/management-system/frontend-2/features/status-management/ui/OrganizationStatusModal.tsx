"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { AppFormModal, ColorPicker, Input } from "@fieldflow360/org-ui";
import { Hash, Tags } from "lucide-react";

import type {
  OrganizationStatusFormValues,
  OrganizationStatusModalInitialData,
  OrganizationStatusModalType,
} from "../model/types";

const MAX_TITLE_LENGTH = 150;
const MAX_ORDER_LENGTH = 150;
const DEFAULT_COLOR = "#A855F7";

export type { OrganizationStatusFormValues, OrganizationStatusModalType };

export interface OrganizationStatusModalProps {
  open: boolean;
  mode: "add" | "edit";
  type: OrganizationStatusModalType;
  initialData?: OrganizationStatusModalInitialData;
  canEdit?: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: OrganizationStatusFormValues) => void | Promise<void>;
}

function getModalTitle(
  mode: "add" | "edit",
  type: OrganizationStatusModalType
): string {
  const entity =
    type === "jobStatus"
      ? "job status"
      : type === "leadStatus"
        ? "lead status"
        : type === "paymentStatus"
          ? "payment status"
          : "lead source";
  return mode === "add" ? `Add ${entity}` : `Edit ${entity}`;
}

export function OrganizationStatusModal({
  open,
  mode,
  type,
  initialData,
  canEdit = true,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: OrganizationStatusModalProps) {
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [titleError, setTitleError] = useState("");
  const [orderError, setOrderError] = useState("");

  const showOrderField = type === "jobStatus";
  const isDefaultPaymentStatus =
    type === "paymentStatus" && initialData?.isDefault && mode === "edit";
  const isInProgressLocked =
    type === "jobStatus" &&
    mode === "edit" &&
    (initialData?.jobType === "Repair" ||
      initialData?.jobType === "Excavation") &&
    title.startsWith("In Progress");

  const titleDisabled =
    !canEdit || isDefaultPaymentStatus || isInProgressLocked;

  useEffect(() => {
    if (!open) return;
    setTitle(initialData?.title ?? "");
    setOrder(
      initialData?.number != null && initialData.number !== " "
        ? String(initialData.number)
        : ""
    );
    setColor(initialData?.color ?? DEFAULT_COLOR);
    setTitleError("");
    setOrderError("");
  }, [initialData?.color, initialData?.number, initialData?.title, open]);

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const validate = (): boolean => {
    let valid = true;
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError("Name is required");
      valid = false;
    } else if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      setTitleError(`Maximum ${MAX_TITLE_LENGTH} characters allowed`);
      valid = false;
    } else {
      setTitleError("");
    }

    if (showOrderField) {
      const trimmedOrder = order.trim();
      if (!trimmedOrder) {
        setOrderError("Order is required");
        valid = false;
      } else if (trimmedOrder.length > MAX_ORDER_LENGTH) {
        setOrderError(`Maximum ${MAX_ORDER_LENGTH} characters allowed`);
        valid = false;
      } else if (!/^\d+$/.test(trimmedOrder)) {
        setOrderError("Order must be a whole number");
        valid = false;
      } else {
        setOrderError("");
      }
    }

    if (
      type === "jobStatus" &&
      trimmedTitle.startsWith("In Progress") &&
      trimmedTitle !== "In Progress" &&
      !trimmedTitle.startsWith("In Progress - ")
    ) {
      setTitleError('Use format "In Progress - " for custom in-progress names');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canEdit || !validate()) return;

    await onSubmit({
      id: initialData?.id,
      title: title.trim(),
      color,
      number: showOrderField ? order.trim() : "",
    });
  };

  const canSubmit = useMemo(() => {
    if (!canEdit || titleDisabled) return false;
    if (!title.trim()) return false;
    if (showOrderField && !order.trim()) return false;
    return !titleError && !orderError;
  }, [
    canEdit,
    order,
    orderError,
    showOrderField,
    title,
    titleDisabled,
    titleError,
  ]);

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelLabel="Cancel"
      isOpen={open}
      isSubmitting={isSubmitting}
      maxHeight="calc(100vh - 4rem)"
      submitDisabled={!canSubmit}
      submitLabel={mode === "add" ? "Add" : "Save"}
      title={getModalTitle(mode, type)}
      width={560}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="border-border-subtle bg-bg-surface/40 flex items-center gap-3 rounded-lg border px-3 py-2.5">
          <span
            aria-hidden
            className="h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <div className="min-w-0">
            <p className="text-text-muted text-[10px] font-medium tracking-wide uppercase">
              Preview
            </p>
            <span className="text-text-primary block truncate text-sm font-semibold">
              {title.trim() || "Status"}
            </span>
          </div>
        </div>

        <Input
          required
          disabled={titleDisabled}
          error={titleError}
          helperText={`${title.length}/${MAX_TITLE_LENGTH} characters`}
          label="Name"
          leftIcon={<Tags aria-hidden className="h-4 w-4" strokeWidth={2} />}
          maxLength={MAX_TITLE_LENGTH}
          placeholder="Status name"
          value={title}
          onChange={(event) => {
            let next = event.target.value;
            if (type === "jobStatus" && title.startsWith("In Progress - ")) {
              const prefix = "In Progress - ";
              if (!next.startsWith(prefix)) {
                const suffix = title.substring(prefix.length);
                next = prefix + (next.length > 0 ? suffix : "");
              }
            } else if (
              type === "jobStatus" &&
              next.startsWith("In Progress -") &&
              !next.startsWith("In Progress - ")
            ) {
              if (next === "In Progress -") {
                next = "In Progress - ";
              } else {
                next =
                  "In Progress - " + next.substring("In Progress -".length);
              }
            }
            setTitle(next);
            if (titleError) setTitleError("");
          }}
        />

        {showOrderField ? (
          <Input
            required
            disabled={!canEdit}
            error={orderError}
            label="Display order"
            leftIcon={<Hash aria-hidden className="h-4 w-4" strokeWidth={2} />}
            maxLength={MAX_ORDER_LENGTH}
            placeholder="e.g. 1"
            value={order}
            onChange={(event) => {
              setOrder(event.target.value);
              if (orderError) setOrderError("");
            }}
          />
        ) : null}

        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-1.5">
            <div>
              <p className="text-text-primary text-sm font-medium">Color</p>
              <p className="text-text-muted mt-0.5 text-xs">
                Shown on cards and filters.
              </p>
            </div>
            <span className="text-text-muted font-mono text-xs uppercase">
              {color}
            </span>
          </div>
          <div className="bg-bg-surface/20 overflow-hidden rounded-lg p-3">
            <div
              aria-hidden
              className="mb-3 h-3 w-full rounded-full"
              style={{ backgroundColor: color }}
            />
            <ColorPicker
              disabled={!canEdit}
              showHeader={false}
              value={color}
              onChange={setColor}
            />
          </div>
        </div>
      </div>
    </AppFormModal>
  );
}
