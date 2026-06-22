"use client";

import {
  ReactElement,
  cloneElement,
  isValidElement,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import type { DropdownOption } from "@fieldflow360/org-ui";
import { Dropdown as OrgDropdown, cn } from "@fieldflow360/org-ui";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";

import { MenuPanel } from "./MenuPanel";
import { DropdownItem, DropdownProps } from "./types";

const defaultTrigger = (
  <button
    aria-label="Open menu"
    className="hover:bg-bg-hover focus:ring-border-strong inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
    type="button"
  >
    <MoreHorizontal className="h-4 w-4" />
  </button>
);

function isSimpleItem(
  item: DropdownItem
): item is Extract<DropdownItem, { type?: "item" }> {
  return item.type !== "separator" && item.type !== "header";
}

function canUseOrgDropdown({
  items,
  footer,
  header,
  customContent,
  preventCloseOnInteract,
  renderSelectedItem,
}: DropdownProps): boolean {
  if (
    footer ||
    header ||
    customContent ||
    preventCloseOnInteract ||
    renderSelectedItem
  ) {
    return false;
  }

  const visible = items.filter((item) => !("hidden" in item && item.hidden));

  if (
    visible.some(
      (item) =>
        isSimpleItem(item) &&
        Boolean(item.submenu?.some((sub) => !("hidden" in sub && sub.hidden)))
    )
  ) {
    return false;
  }

  return !visible.some(
    (item) => isSimpleItem(item) && typeof item.label !== "string"
  );
}

function itemsToOrgOptions(items: DropdownItem[]): DropdownOption<string>[] {
  return items
    .filter(isSimpleItem)
    .filter((item) => !item.hidden)
    .map((item) => ({
      value: item.id,
      label: typeof item.label === "string" ? item.label : String(item.id),
      icon: item.icon,
      disabled: item.disabled,
      variant: item.destructive ? "danger" : "default",
    }));
}

export const Dropdown = memo(function Dropdown(props: DropdownProps) {
  const {
    items,
    trigger,
    triggerClassName,
    triggerAriaLabel = "Open menu",
    align = "end",
    side = "bottom",
    width = 180,
    contentClassName,
    itemClassName,
    mode = "action",
    selectedValue,
    onValueChange,
    placeholder = "Select an option",
    renderSelectedItem,
    showChevron = mode === "select",
    disabled = false,
    footer,
    header,
    customContent,
    preventCloseOnInteract = false,
    onOpenChange,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  const visible = useMemo(
    () => items.filter((item) => !("hidden" in item && item.hidden)),
    [items]
  );

  const selectedItem = useMemo(() => {
    if (mode === "select" && selectedValue) {
      return visible.find(
        (item) => item.type !== "separator" && item.id === selectedValue
      );
    }
    return null;
  }, [mode, selectedValue, visible]);

  const useOrgDropdown = canUseOrgDropdown(props);

  const orgOptions = useMemo(
    () => (useOrgDropdown ? itemsToOrgOptions(items) : []),
    [items, useOrgDropdown]
  );

  if (visible.length === 0 && !header && !footer && !customContent) {
    return null;
  }

  const selectTrigger =
    mode === "select" && !trigger ? (
      <button
        aria-label={triggerAriaLabel}
        className={cn(
          "hover:bg-bg-hover focus:ring-border-strong border-border-subtle dark:bg-bg-surface/30 flex h-10 min-w-0 items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          width === "full" ? "w-full" : width === "auto" ? "w-auto" : "",
          triggerClassName
        )}
        disabled={disabled}
        style={typeof width === "number" ? { width } : undefined}
        type="button"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          {selectedItem && renderSelectedItem ? (
            renderSelectedItem(selectedItem)
          ) : selectedItem &&
            selectedItem.type !== "separator" &&
            selectedItem.type !== "header" ? (
            <>
              {selectedItem.icon ? (
                <span className="shrink-0">{selectedItem.icon}</span>
              ) : null}
              <span className="flex min-w-0 flex-1 items-center overflow-hidden">
                {selectedItem.label}
              </span>
            </>
          ) : (
            <span className="text-text-muted truncate">{placeholder}</span>
          )}
        </span>
        {showChevron ? (
          isOpen ? (
            <ChevronUp className="h-4 w-4 opacity-50" />
          ) : (
            <ChevronDown className="h-4 w-4 opacity-50" />
          )
        ) : null}
      </button>
    ) : null;

  const finalTrigger = selectTrigger || trigger || defaultTrigger;

  if (useOrgDropdown) {
    return (
      <OrgDropdown
        className={width === "full" ? "w-full" : undefined}
        disabled={disabled}
        fullWidth={width === "full"}
        menuMinWidth={typeof width === "number" ? width : undefined}
        options={orgOptions}
        placeholder={
          typeof placeholder === "string" ? placeholder : "Select an option"
        }
        trigger={
          isValidElement(finalTrigger)
            ? cloneElement(
                finalTrigger as ReactElement<{ "aria-label"?: string }>,
                {
                  "aria-label":
                    (finalTrigger as ReactElement<{ "aria-label"?: string }>)
                      .props["aria-label"] ?? triggerAriaLabel,
                }
              )
            : finalTrigger
        }
        triggerClassName={triggerClassName}
        value={mode === "select" ? selectedValue : undefined}
        onChange={(value) => {
          if (mode === "select") {
            onValueChange?.(value);
            return;
          }

          const item = visible.find(
            (entry) => isSimpleItem(entry) && entry.id === value
          );
          if (item && isSimpleItem(item)) {
            item.onSelect?.(new Event("select"));
          }
        }}
      />
    );
  }

  return (
    <div ref={triggerRef} className="inline-flex">
      {isValidElement(finalTrigger)
        ? cloneElement(
            finalTrigger as ReactElement<{
              "aria-label"?: string;
              onClick?: (event: React.MouseEvent) => void;
            }>,
            {
              "aria-label":
                (finalTrigger as ReactElement<{ "aria-label"?: string }>).props[
                  "aria-label"
                ] ?? triggerAriaLabel,
              onClick: (event: React.MouseEvent) => {
                (
                  finalTrigger as ReactElement<{
                    onClick?: (event: React.MouseEvent) => void;
                  }>
                ).props.onClick?.(event);
                if (!event.defaultPrevented && !disabled) {
                  handleOpenChange(!isOpen);
                }
              },
            }
          )
        : finalTrigger}
      <MenuPanel
        align={align}
        anchorRef={triggerRef}
        contentClassName={contentClassName}
        customContent={customContent}
        footer={footer}
        header={header}
        itemClassName={itemClassName}
        items={items}
        mode={mode}
        open={isOpen}
        preventCloseOnInteract={preventCloseOnInteract}
        selectedValue={selectedValue}
        side={side}
        width={width}
        onOpenChange={handleOpenChange}
        onValueChange={onValueChange}
      />
    </div>
  );
});

Dropdown.displayName = "Dropdown";
