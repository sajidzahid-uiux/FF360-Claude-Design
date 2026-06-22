"use client";

import { type FormEvent, useCallback, useMemo, useState } from "react";

import {
  AppFormModal,
  Button,
  ButtonVariantEnum,
  Dropdown,
  Input,
} from "@fieldflow360/org-ui";
import { Trash2, X } from "lucide-react";

import type {
  DeliveryLocation,
  OrderItem,
  RemainedOrderedItem,
} from "@/api/types";
import { useUpdateDeliveryLocation } from "@/hooks/mutations";
import { Label } from "@/shared/ui/primitives";

export interface AssignItemsToLocationModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  location: DeliveryLocation;
  orderItems: OrderItem[];
  remainedOrderedItems: RemainedOrderedItem[];
  vendorFormId: number | string;
  /** When provided, a trash icon in the header triggers delete (modal closes then this runs). */
  onRequestDelete?: () => void;
  readOnly?: boolean;
}

type AssignMode = "manual" | "install_all_remaining";

interface AssignRow {
  item_key: string;
  to_install_quantity: number;
  unit: string;
}

function getRemainedByKey(
  remained: RemainedOrderedItem[],
  itemKey: string
): RemainedOrderedItem | undefined {
  return remained.find((r) => r.item_key === itemKey);
}

function getOrderItemByKey(
  orderItems: OrderItem[],
  itemKey: string
): OrderItem | undefined {
  return orderItems.find((o) => o.item_key === itemKey);
}

function getMaxAtLocation(
  remained: RemainedOrderedItem[],
  location: DeliveryLocation,
  itemKey: string
): number {
  const rem = getRemainedByKey(remained, itemKey);
  const atLocation =
    location.items.find((i) => i.item_key === itemKey)?.to_install_quantity ??
    0;
  return (rem?.remained_quantity ?? 0) + atLocation;
}

export function AssignItemsToLocationModal({
  open = true,
  onOpenChange,
  onClose,
  location,
  orderItems,
  remainedOrderedItems,
  vendorFormId,
  onRequestDelete,
  readOnly = false,
}: AssignItemsToLocationModalProps) {
  const [mode, setMode] = useState<AssignMode>("manual");
  const [addSelectValue, setAddSelectValue] = useState("");
  const [rows, setRows] = useState<AssignRow[]>(() =>
    location.items.map((i) => ({
      item_key: i.item_key,
      to_install_quantity: i.to_install_quantity,
      unit: i.unit,
    }))
  );

  const updateLocation = useUpdateDeliveryLocation(vendorFormId);

  const handleRequestClose = useCallback(() => {
    onClose?.();
    onOpenChange?.(false);
  }, [onClose, onOpenChange]);

  const assignableRemained = useMemo(() => {
    const inRows = new Set(rows.map((r) => r.item_key));
    return remainedOrderedItems.filter(
      (r) => r.remained_quantity > 0 && !inRows.has(r.item_key)
    );
  }, [remainedOrderedItems, rows]);

  const addItem = useCallback(
    (itemKey: string) => {
      const rem = getRemainedByKey(remainedOrderedItems, itemKey);
      if (!rem || rem.remained_quantity < 1) return;
      setRows((prev) => [
        ...prev,
        {
          item_key: itemKey,
          to_install_quantity: Math.min(1, rem.remained_quantity),
          unit: rem.unit,
        },
      ]);
      setAddSelectValue("");
    },
    [remainedOrderedItems]
  );

  const removeRow = useCallback((itemKey: string) => {
    setRows((prev) => prev.filter((r) => r.item_key !== itemKey));
  }, []);

  const setToInstall = useCallback(
    (itemKey: string, value: number) => {
      const max = getMaxAtLocation(remainedOrderedItems, location, itemKey);
      const clamped = Math.max(
        0,
        Math.min(max, Math.floor(Number(value) || 0))
      );
      setRows((prev) =>
        prev.map((r) =>
          r.item_key === itemKey ? { ...r, to_install_quantity: clamped } : r
        )
      );
    },
    [remainedOrderedItems, location]
  );

  const canSave = useMemo(() => {
    if (mode === "install_all_remaining") return true;
    if (mode === "manual" && rows.length === 0) return true;
    if (rows.length === 0) return false;
    return rows.every(
      (r) =>
        r.to_install_quantity >= 1 &&
        r.to_install_quantity <=
          getMaxAtLocation(remainedOrderedItems, location, r.item_key)
    );
  }, [mode, rows, remainedOrderedItems, location]);

  const handleSave = useCallback(() => {
    if (!canSave || updateLocation.isPending) return;

    if (mode === "install_all_remaining") {
      updateLocation.mutate(
        {
          locationId: location.id,
          payload: { install_all_remaining: true },
        },
        {
          onSuccess: () => handleRequestClose(),
        }
      );
      return;
    }

    const items = rows
      .filter((r) => r.to_install_quantity >= 1)
      .map((r) => ({
        item_key: r.item_key,
        to_install_quantity: r.to_install_quantity,
      }));
    updateLocation.mutate(
      { locationId: location.id, payload: { items } },
      { onSuccess: () => handleRequestClose() }
    );
  }, [canSave, mode, location.id, rows, updateLocation, handleRequestClose]);

  const installAllDisabled = remainedOrderedItems.every(
    (r) => r.remained_quantity <= 0
  );

  const handleDeleteClick = useCallback(() => {
    handleRequestClose();
    onRequestDelete?.();
  }, [handleRequestClose, onRequestDelete]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleSave();
  };

  const handleClose = () => {
    if (!updateLocation.isPending) {
      handleRequestClose();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelLabel="Cancel"
      isOpen={open}
      isSubmitting={updateLocation.isPending}
      submitDisabled={readOnly || !canSave}
      submitLabel="Save Changes"
      title={location.label}
      width={512}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      {!readOnly && onRequestDelete != null ? (
        <div className="flex justify-end">
          <Button
            iconOnly
            aria-label="Delete location"
            leftIcon={<Trash2 className="h-4 w-4" />}
            variant={ButtonVariantEnum.GHOST}
            onClick={handleDeleteClick}
          />
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center space-x-2">
            <input
              checked={mode === "install_all_remaining"}
              disabled={readOnly || installAllDisabled}
              id="install-all-remaining"
              type="checkbox"
              onChange={(e) =>
                setMode(e.target.checked ? "install_all_remaining" : "manual")
              }
            />
            <Label
              className="cursor-pointer text-sm font-normal"
              htmlFor="install-all-remaining"
            >
              Install all items to this location
            </Label>
          </div>
          <p className="text-text-muted text-sm">
            Choose items you want to install at this location
          </p>
        </div>

        {mode === "manual" && (
          <>
            <div className="flex flex-1 gap-2">
              <Dropdown
                fullWidth
                disabled={readOnly || assignableRemained.length === 0}
                options={assignableRemained.map((row) => ({
                  value: row.item_key,
                  label: `${row.name} — ${row.remained_quantity} ${row.unit} left`,
                }))}
                placeholder={
                  assignableRemained.length === 0
                    ? "No remaining items"
                    : "Add remaining item..."
                }
                value={addSelectValue || undefined}
                onChange={(value) => {
                  addItem(value);
                }}
              />
            </div>

            <div className="border-border-subtle max-h-[280px] overflow-y-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border-subtle bg-bg-surface/50 border-b">
                    <th className="px-3 py-2 text-left font-medium">Item</th>
                    <th className="px-3 py-2 text-left font-medium">Qty</th>
                    <th className="px-3 py-2 text-left font-medium">
                      To-Install
                    </th>
                    <th aria-hidden className="w-10 px-1 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const orderItem = getOrderItemByKey(
                      orderItems,
                      row.item_key
                    );
                    const maxQty = getMaxAtLocation(
                      remainedOrderedItems,
                      location,
                      row.item_key
                    );
                    return (
                      <tr
                        key={row.item_key}
                        className="border-border-subtle border-b last:border-b-0"
                      >
                        <td className="px-3 py-2 font-medium">
                          {orderItem?.name ?? row.item_key}
                        </td>
                        <td className="text-text-muted px-3 py-2">
                          {orderItem?.total_quantity ?? "—"} ({row.unit})
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <Input
                              className="h-8 w-20 text-sm"
                              disabled={readOnly}
                              max={maxQty}
                              min={1}
                              type="number"
                              value={row.to_install_quantity}
                              onChange={(e) =>
                                setToInstall(
                                  row.item_key,
                                  e.target.valueAsNumber
                                )
                              }
                            />
                            <span className="text-text-muted text-xs">
                              ({row.unit})
                            </span>
                          </div>
                        </td>
                        <td className="px-1 py-2">
                          {!readOnly && (
                            <Button
                              iconOnly
                              aria-label={`Remove ${row.item_key}`}
                              leftIcon={<X className="h-4 w-4" />}
                              variant={ButtonVariantEnum.GHOST}
                              onClick={() => removeRow(row.item_key)}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {rows.length === 0 && (
                <p className="text-text-muted px-3 py-4 text-sm">
                  Add items from the dropdown above. Each item must have
                  To-Install ≥ 1 and ≤ remaining quantity.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </AppFormModal>
  );
}
