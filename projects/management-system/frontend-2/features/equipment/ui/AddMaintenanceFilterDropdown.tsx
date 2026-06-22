"use client";

import { useCallback, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Dropdown,
  type DropdownOption,
} from "@fieldflow360/org-ui";
import { PlusCircle } from "lucide-react";

export interface MaintenanceFilterOption {
  name: string;
  title: string;
}

export interface AddMaintenanceFilterDropdownProps {
  availableFilters: MaintenanceFilterOption[];
  onFilterSelect: (filter: MaintenanceFilterOption) => void;
  disabled?: boolean;
  buttonText?: string;
}

export function AddMaintenanceFilterDropdown({
  availableFilters,
  onFilterSelect,
  disabled = false,
  buttonText = "Add Filter",
}: AddMaintenanceFilterDropdownProps) {
  const [menuValue, setMenuValue] = useState<string | undefined>();

  const filterByName = useMemo(() => {
    const map = new Map<string, MaintenanceFilterOption>();
    for (const filter of availableFilters) {
      map.set(filter.name, filter);
    }
    return map;
  }, [availableFilters]);

  const options = useMemo(
    (): DropdownOption<string>[] =>
      availableFilters.map((filter) => ({
        value: filter.name,
        label: filter.title,
      })),
    [availableFilters]
  );

  const handleChange = useCallback(
    (value: string) => {
      const filter = filterByName.get(value);
      if (filter) {
        onFilterSelect(filter);
      }
      setMenuValue(undefined);
    },
    [filterByName, onFilterSelect]
  );

  if (availableFilters.length === 0) {
    return null;
  }

  return (
    <Dropdown
      className="w-auto"
      disabled={disabled}
      fullWidth={false}
      menuMinWidth={200}
      options={options}
      placeholder={buttonText}
      trigger={({ disabled: triggerDisabled }) => (
        <Button
          disabled={triggerDisabled}
          leftIcon={
            <PlusCircle
              aria-hidden
              aria-label={buttonText}
              className="h-3.5 w-3.5"
              strokeWidth={2}
            />
          }
          size={ComponentSizeEnum.SM}
          title={buttonText}
          variant={ButtonVariantEnum.DEFAULT}
        />
      )}
      value={menuValue}
      onChange={handleChange}
    />
  );
}
