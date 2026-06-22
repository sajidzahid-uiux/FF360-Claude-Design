"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Modal,
  SearchableDropdown,
  type SearchableDropdownOption,
  cn,
} from "@fieldflow360/org-ui";
import { ChevronDown, Filter as FilterIcon, X } from "lucide-react";

import { Badge, Label, SanitizedInput } from "@/shared/ui/primitives";

import {
  CheckboxFilterConfig,
  FilterConfig,
  FilterProps,
  FilterState,
  MultiFilterConfig,
} from "../model/types";

function buildStorageKey(page: string): string {
  return `filters_${page}`;
}

const FILTER_MODAL_WIDTH_CLASS: Record<string, string> = {
  "280px": "max-w-[280px]",
  "320px": "max-w-[320px]",
};

function filterModalWidthClass(modalWidth?: string): string | undefined {
  if (!modalWidth) {
    return undefined;
  }
  return FILTER_MODAL_WIDTH_CLASS[modalWidth] ?? "max-w-md";
}

function FilterItem<T>(props: {
  config: FilterConfig<T>;
  filterKey: string;
  selectedValue: string[] | { startValue: string; endValue: string };
  onChange: (
    key: string,
    value: string[] | { startValue: string; endValue: string }
  ) => void;
}) {
  const { config, filterKey, selectedValue, onChange } = props;
  const { icon, label, type = "checkbox" } = config;
  const [dateModalOpen, setDateModalOpen] = useState(false);

  const checkboxConfig =
    type === "checkbox" || !type ? (config as CheckboxFilterConfig<T>) : null;
  const items = useMemo(
    () => checkboxConfig?.items || [],
    [checkboxConfig?.items]
  );

  const { labelField, idField, multiSelect = true } = checkboxConfig ?? {};
  const selectedIds = Array.isArray(selectedValue) ? selectedValue : [];

  if (type === "date-range") {
    if (!config.dateRange) return null;

    const dateValue =
      typeof selectedValue === "object" && !Array.isArray(selectedValue)
        ? selectedValue
        : { startValue: "", endValue: "" };
    const hasValue = dateValue.startValue || dateValue.endValue;

    return (
      <>
        <Button
          aria-expanded={dateModalOpen}
          className={cn("w-full justify-between", hasValue)}
          leftIcon={
            icon ? <span className="flex-shrink-0">{icon}</span> : undefined
          }
          rightIcon={
            <>
              {hasValue ? (
                <Badge
                  className="ml-1 rounded-sm px-1 font-normal"
                  variant="secondary"
                >
                  {(dateValue.startValue ? 1 : 0) +
                    (dateValue.endValue ? 1 : 0)}
                </Badge>
              ) : null}
              <ChevronDown
                aria-label={label}
                className="ml-2 h-4 w-4 flex-shrink-0 opacity-50"
              />
            </>
          }
          role="combobox"
          title={label}
          variant={ButtonVariantEnum.SURFACE}
          onClick={() => setDateModalOpen(true)}
        />
        <Modal
          isOpen={dateModalOpen}
          size="sm"
          title="Select Date Range"
          onClose={() => setDateModalOpen(false)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {hasValue ? (
                <Button
                  aria-label="Clear"
                  size={ComponentSizeEnum.SM}
                  title="Clear"
                  variant={ButtonVariantEnum.GHOST}
                  onClick={() => {
                    onChange(filterKey, { startValue: "", endValue: "" });
                  }}
                />
              ) : (
                <span />
              )}
            </div>
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label variant="caption">From</Label>
                <SanitizedInput
                  className="h-9"
                  type="date"
                  value={dateValue.startValue}
                  onChange={(event) => {
                    onChange(filterKey, {
                      startValue: event.target.value,
                      endValue: dateValue.endValue,
                    });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label variant="caption">To</Label>
                <SanitizedInput
                  className="h-9"
                  type="date"
                  value={dateValue.endValue}
                  onChange={(event) => {
                    onChange(filterKey, {
                      startValue: dateValue.startValue,
                      endValue: event.target.value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  if (type === "custom") {
    if (!config.customRender) return null;
    return <>{config.customRender()}</>;
  }

  if (!labelField || !idField) return null;

  const options: SearchableDropdownOption<string>[] = items.map((item) => ({
    value: String(item[idField]),
    label: String(item[labelField]),
  }));

  const trigger = ({ isOpen }: { isOpen: boolean }) => (
    <Button
      aria-expanded={isOpen}
      className={cn("justify-between", selectedIds.length > 0)}
      leftIcon={
        icon ? <span className="flex-shrink-0">{icon}</span> : undefined
      }
      rightIcon={
        <>
          {selectedIds.length > 0 ? (
            <Badge
              className="ml-1 rounded-sm px-1 font-normal"
              variant="secondary"
            >
              {selectedIds.length}
            </Badge>
          ) : null}
          <ChevronDown
            aria-label={label}
            className="ml-2 h-4 w-4 flex-shrink-0 opacity-50"
          />
        </>
      }
      role="combobox"
      title={label}
      variant={ButtonVariantEnum.SURFACE}
    />
  );

  if (multiSelect) {
    return (
      <SearchableDropdown
        multiple
        emptyStateText="No results found"
        options={options}
        placeholder={label}
        searchPlaceholder={checkboxConfig?.searchPlaceholder ?? "Search..."}
        trigger={trigger}
        values={selectedIds}
        onValuesChange={(values) => onChange(filterKey, values)}
      />
    );
  }

  return (
    <SearchableDropdown
      emptyStateText="No results found"
      options={options}
      placeholder={label}
      searchPlaceholder={checkboxConfig?.searchPlaceholder ?? "Search..."}
      trigger={trigger}
      value={selectedIds[0]}
      onChange={(value) => onChange(filterKey, value ? [value] : [])}
    />
  );
}

export function Filter(props: FilterProps) {
  const pathname = usePathname();
  const {
    configs = [],
    page,
    filterState,
    onFilterChange,
    direction = "horizontal",
    className,
    showClearAll = true,
    wrapInModal = false,
    modalTitle = "Filters",
    modalWidth,
    buttonLabel = "Filters",
  } = props;

  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const pageKey = page || pathname.replace(/\//g, "-").replace(/^-/, "");
  const storageKey = buildStorageKey(pageKey);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as FilterState;
        const mergedState: FilterState = { ...parsed, ...filterState };

        if (JSON.stringify(mergedState) !== JSON.stringify(filterState)) {
          onFilterChange(mergedState);
        }
      }
    } catch (error) {
      console.error("Error loading filter state:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(filterState));
    } catch (error) {
      console.error("Error saving filter state:", error);
    }
  }, [filterState, storageKey]);

  if (!configs || configs.length === 0) {
    return null;
  }

  const activeFilterCount = configs.reduce((count: number, filter) => {
    const value = filterState[filter.key];
    if (Array.isArray(value)) {
      return count + value.length;
    }
    if (value && typeof value === "object") {
      return count + (value.startValue ? 1 : 0) + (value.endValue ? 1 : 0);
    }
    return count;
  }, 0);

  const hasActiveFilters = activeFilterCount > 0;

  const handleFilterChange = (
    filterKey: string,
    value: string[] | { startValue: string; endValue: string }
  ) => {
    onFilterChange({
      ...filterState,
      [filterKey]: value,
    });
  };

  const handleClearAll = () => {
    const clearedState: FilterState = {};
    configs.forEach((filter: MultiFilterConfig) => {
      if (filter.type === "date-range") {
        clearedState[filter.key] = { startValue: "", endValue: "" };
      } else {
        clearedState[filter.key] = [];
      }
    });
    onFilterChange(clearedState);
  };

  const filtersContent = (
    <div
      className={cn(
        "flex items-center gap-2",
        direction === "vertical" && "flex-col items-stretch",
        !wrapInModal && className
      )}
    >
      {configs.map((filter: MultiFilterConfig) => {
        const selectedValue =
          filterState[filter.key] ||
          (filter.type === "date-range"
            ? { startValue: "", endValue: "" }
            : []);

        return (
          <FilterItem
            key={filter.key}
            config={filter as FilterConfig<Record<string, unknown>>}
            filterKey={filter.key}
            selectedValue={selectedValue}
            onChange={handleFilterChange}
          />
        );
      })}

      {showClearAll && hasActiveFilters && !wrapInModal && (
        <Button
          leftIcon={<X className="h-4 w-4" />}
          size={ComponentSizeEnum.SM}
          title="Clear All"
          variant={ButtonVariantEnum.GHOST}
          onClick={handleClearAll}
        />
      )}
    </div>
  );

  if (wrapInModal) {
    return (
      <>
        <Button
          className={className}
          leftIcon={<FilterIcon className="h-4 w-4" />}
          rightIcon={
            hasActiveFilters ? (
              <Badge
                className="ml-1 rounded-sm px-1 font-normal"
                variant="secondary"
              >
                {activeFilterCount}
              </Badge>
            ) : undefined
          }
          title={buttonLabel}
          variant={ButtonVariantEnum.SURFACE}
          onClick={() => setFiltersModalOpen(true)}
        />
        <Modal
          className={filterModalWidthClass(modalWidth)}
          isOpen={filtersModalOpen}
          size="md"
          title={modalTitle}
          onClose={() => setFiltersModalOpen(false)}
        >
          <div className="space-y-4">
            {showClearAll && hasActiveFilters ? (
              <div className="flex justify-end">
                <Button
                  aria-label="Clear All"
                  size={ComponentSizeEnum.SM}
                  title="Clear All"
                  variant={ButtonVariantEnum.GHOST}
                  onClick={handleClearAll}
                />
              </div>
            ) : null}
            {filtersContent}
          </div>
        </Modal>
      </>
    );
  }

  return filtersContent;
}
