"use client";

import { useCallback, useMemo, useState } from "react";

import { Button, ComponentSizeEnum } from "@fieldflow360/org-ui";
import { Plus } from "lucide-react";

import type {
  OrderPipeCategory,
  OrderPipeOption,
  OrderPipeType,
} from "@/api/types";
import {
  type OrderDetailsItem,
  useOrderDetailsContext,
  useVendorContext,
  useVendorFormContext,
} from "@/features/order-pipe/order-pipe-wizard/context";
import { validateOrderPipeItemDraft } from "@/features/order-pipe/order-pipe-wizard/lib/order-pipe-item-validation";
import { useUpdateVendorForm } from "@/hooks/mutations";
import { useOrderPipePermissions } from "@/hooks/permissions";
import { useOrderPipeCategories } from "@/hooks/queries";
import { Dropdown, type DropdownItem } from "@/shared/ui/common";
import { Card, Label, SanitizedInput } from "@/shared/ui/primitives";

import { OrderItemsTable } from "./OrderItemsTable";

function categoryToItem(cat: OrderPipeCategory): DropdownItem {
  return { id: cat.code, label: cat.name, type: "item" };
}

function typeToItem(t: OrderPipeType): DropdownItem {
  return { id: t.code, label: t.name, type: "item" };
}

function optionToItem(opt: OrderPipeOption): DropdownItem {
  return { id: opt.value, label: opt.label, type: "item" };
}

export function CreateOrderCard() {
  const { selectedVendor } = useVendorContext();
  const { orderItems, addItem, removeItem, getItemsPayload } =
    useOrderDetailsContext();
  const { vendorFormId } = useVendorFormContext();
  const updateVendorForm = useUpdateVendorForm();
  const { canWrite } = useOrderPipePermissions();
  const readOnly = !canWrite;
  const [categoryCode, setCategoryCode] = useState("");
  const [typeCode, setTypeCode] = useState("");
  const [optionValue, setOptionValue] = useState("");
  const [quantity, setQuantity] = useState("");

  const providerId = selectedVendor?.provider?.id ?? null;

  const { categories, isLoading: categoriesLoading } = useOrderPipeCategories({
    providerId,
    enabled: true,
  });

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.display_order - b.display_order),
    [categories]
  );

  const selectedCategory = useMemo(
    () => sortedCategories.find((c) => c.code === categoryCode) ?? null,
    [sortedCategories, categoryCode]
  );

  const hasTypes = (selectedCategory?.types?.length ?? 0) > 0;
  const sortedTypes = useMemo(() => {
    if (!selectedCategory?.types) return [];
    return [...selectedCategory.types].sort(
      (a, b) => a.display_order - b.display_order
    );
  }, [selectedCategory?.types]);

  const selectedType = useMemo(
    () => sortedTypes.find((t) => t.code === typeCode) ?? null,
    [sortedTypes, typeCode]
  );

  const sortedOptions = useMemo(() => {
    const optionsSource = hasTypes
      ? (selectedType?.options ?? [])
      : (selectedCategory?.options ?? []);
    return [...optionsSource].sort((a, b) => a.display_order - b.display_order);
  }, [hasTypes, selectedType?.options, selectedCategory?.options]);

  const selectedOption = useMemo(
    () => sortedOptions.find((o) => o.value === optionValue) ?? null,
    [sortedOptions, optionValue]
  );

  const categoryItems: DropdownItem[] = useMemo(
    () => sortedCategories.map(categoryToItem),
    [sortedCategories]
  );

  const typeItems: DropdownItem[] = useMemo(
    () => sortedTypes.map(typeToItem),
    [sortedTypes]
  );

  const optionItems: DropdownItem[] = useMemo(
    () => sortedOptions.map(optionToItem),
    [sortedOptions]
  );

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryCode(value);
    setTypeCode("");
    setOptionValue("");
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setTypeCode(value);
    setOptionValue("");
  }, []);

  const handleAddOrder = useCallback(() => {
    const validationError = validateOrderPipeItemDraft({
      categoryCode,
      typeCode,
      optionValue,
      quantity,
      hasTypes,
    });
    if (validationError) return;

    const qty = Number.parseInt(quantity, 10);
    if (!selectedCategory || !selectedOption) return;
    if (hasTypes && !selectedType) return;

    const item: OrderDetailsItem = {
      pipe_type: selectedCategory.code,
      sub_type: hasTypes ? selectedType!.code : undefined,
      size: selectedOption.value,
      quantity: qty,
      optionLabel: selectedOption.label,
    };
    addItem(item);
    setQuantity("");
    setOptionValue("");

    // Patch vendor form with items on Add Order (getItemsPayload is pre-update, so append new item)
    if (vendorFormId != null) {
      const currentPayload = getItemsPayload();
      const newItemPayload = {
        pipe_type: item.pipe_type,
        ...(item.sub_type != null && item.sub_type !== ""
          ? { sub_type: item.sub_type }
          : {}),
        size: item.size,
        quantity: item.quantity,
      };
      updateVendorForm.mutate({
        vendorFormId,
        payload: { items: [...currentPayload, newItemPayload] },
      });
    }
  }, [
    categoryCode,
    typeCode,
    optionValue,
    quantity,
    hasTypes,
    selectedCategory,
    selectedType,
    selectedOption,
    addItem,
    vendorFormId,
    getItemsPayload,
    updateVendorForm,
  ]);

  const handleRemoveItem = useCallback(
    (index: number) => {
      const item = orderItems[index];
      if (!item) return;

      removeItem(index);
      if (vendorFormId == null) return;
      const nextItems = orderItems.filter((_, i) => i !== index);
      const itemsPayload = nextItems.map(
        ({ pipe_type, sub_type, size, quantity }) => ({
          pipe_type,
          ...(sub_type != null && sub_type !== "" ? { sub_type } : {}),
          size,
          quantity,
        })
      );
      updateVendorForm.mutate({
        vendorFormId,
        payload: { items: itemsPayload },
      });
    },
    [orderItems, removeItem, vendorFormId, updateVendorForm]
  );

  const canAdd =
    selectedCategory &&
    selectedOption &&
    (!hasTypes || selectedType) &&
    Number.parseInt(quantity, 10) >= 1;

  return (
    <Card className="flex h-full flex-col p-4 lg:p-4">
      <div className="mb-3 flex items-center justify-between gap-2 lg:mb-4">
        <h2 className="text-xl leading-none font-semibold tracking-tight lg:text-2xl">
          Create Order
        </h2>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-4">
          <div className="min-w-0 flex-1 space-y-2 lg:max-w-[38%] lg:flex-[0_0_38%]">
            <Label htmlFor="category" variant="field">
              Category
            </Label>
            <Dropdown
              disabled={readOnly}
              items={categoryItems}
              mode="select"
              placeholder={categoriesLoading ? "Loading..." : "Select category"}
              selectedValue={categoryCode}
              width="full"
              onValueChange={handleCategoryChange}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap gap-4 lg:min-w-0 lg:flex-[1_1_62%] lg:flex-nowrap">
            {hasTypes ? (
              <div className="min-w-0 flex-[1_1_120px] space-y-2">
                <Label htmlFor="type" variant="field">
                  Type
                </Label>
                <Dropdown
                  disabled={readOnly}
                  items={typeItems}
                  mode="select"
                  placeholder="Select type"
                  selectedValue={typeCode}
                  width="full"
                  onValueChange={handleTypeChange}
                />
              </div>
            ) : null}

            <div className="min-w-0 flex-[1_1_120px] space-y-2">
              <Label htmlFor="option" variant="field">
                Option
              </Label>
              <Dropdown
                disabled={
                  readOnly || (hasTypes ? !selectedType : !selectedCategory)
                }
                items={optionItems}
                mode="select"
                placeholder={
                  hasTypes && !selectedType
                    ? "Select type first"
                    : "Select option"
                }
                selectedValue={optionValue}
                width="full"
                onValueChange={setOptionValue}
              />
            </div>

            <div className="w-[90px] flex-shrink-0 space-y-2">
              <Label htmlFor="quantity" variant="field">
                Quantity
              </Label>
              <SanitizedInput
                className="w-full"
                disabled={readOnly}
                id="quantity"
                min={1}
                placeholder="0"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button
          fullWidth
          disabled={readOnly || !canAdd}
          leftIcon={<Plus className="h-5 w-5" />}
          size={ComponentSizeEnum.LG}
          title="Add Order"
          onClick={handleAddOrder}
        />
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col border-t pt-4">
        <h2 className="mb-3 flex-shrink-0 text-xl leading-none font-semibold tracking-tight lg:text-2xl">
          Order Items
        </h2>

        <OrderItemsTable
          orderItems={orderItems}
          readOnly={readOnly}
          onRemoveItem={handleRemoveItem}
        />
      </div>
    </Card>
  );
}
