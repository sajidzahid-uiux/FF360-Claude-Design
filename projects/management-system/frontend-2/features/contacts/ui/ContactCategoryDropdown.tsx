"use client";

import { useMemo } from "react";

import {
  Button,
  ButtonVariantEnum,
  SearchableDropdown,
  cn,
} from "@fieldflow360/org-ui";
import { ChevronDown } from "lucide-react";

import type { ContactCategory } from "@/api/types";
import { Label } from "@/shared/ui/primitives";

interface ContactCategoryDropdownProps {
  categories: ContactCategory[] | undefined;
  selectedIds: number[];
  onToggle: (categoryId: number) => void;
  lockedCategoryIds?: number[];
  readOnly?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
}

export function ContactCategoryDropdown({
  categories,
  selectedIds,
  onToggle,
  lockedCategoryIds = [],
  readOnly = false,
  isLoading = false,
  hasError = false,
}: ContactCategoryDropdownProps) {
  const normalizedSelected = selectedIds.map((id) => Number(id));
  const normalizedLocked = lockedCategoryIds.map((id) => Number(id));
  const selectedCategories = (categories ?? []).filter((cat) =>
    normalizedSelected.includes(Number(cat.id))
  );

  const triggerLabel =
    selectedCategories.length === 0
      ? "Select categories"
      : `${selectedCategories.length} selected`;

  const options = useMemo(
    () =>
      (categories ?? []).map((category) => ({
        value: String(category.id),
        label: category.name,
        disabled: readOnly || normalizedLocked.includes(Number(category.id)),
      })),
    [categories, normalizedLocked, readOnly]
  );

  const selectedValues = useMemo(
    () => normalizedSelected.map(String),
    [normalizedSelected]
  );

  const handleValuesChange = (values: string[]) => {
    const next = new Set(values.map(Number));
    const previous = new Set(normalizedSelected);

    for (const id of next) {
      if (!previous.has(id)) {
        onToggle(id);
      }
    }
    for (const id of previous) {
      if (!next.has(id)) {
        onToggle(id);
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label variant="field">Contact Category</Label>

      {isLoading || hasError ? (
        <p className="text-text-muted text-sm">
          {hasError ? "Error loading categories" : "Loading categories..."}
        </p>
      ) : (
        <>
          <SearchableDropdown
            multiple
            disabled={readOnly}
            emptyStateText="No categories found"
            options={options}
            placeholder="Select categories"
            searchPlaceholder="Search categories..."
            trigger={() => (
              <Button
                aria-label={triggerLabel}
                className={cn("mt-1 w-full justify-between", readOnly)}
                disabled={readOnly}
                rightIcon={
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                }
                title={triggerLabel}
                variant={ButtonVariantEnum.SURFACE}
              />
            )}
            values={selectedValues}
            onValuesChange={handleValuesChange}
          />

          <div className="flex min-h-[28px] flex-wrap gap-2">
            {selectedCategories.length === 0 ? (
              <span className="text-text-muted text-sm">
                No categories selected
              </span>
            ) : (
              selectedCategories.map((category) => {
                const isLocked = normalizedLocked.includes(Number(category.id));

                return (
                  <span
                    key={category.id}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: category.color || "#3b82f6" }}
                  >
                    {category.name}
                    {!readOnly && !isLocked ? (
                      <button
                        aria-label={`Remove ${category.name}`}
                        className="ml-0.5 hover:opacity-80"
                        type="button"
                        onClick={() => onToggle(category.id)}
                      >
                        ×
                      </button>
                    ) : null}
                  </span>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
