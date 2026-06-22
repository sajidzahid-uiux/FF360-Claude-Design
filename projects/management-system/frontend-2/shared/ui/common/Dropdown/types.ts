import { ReactNode } from "react";

export type DropdownItem =
  | {
      type?: "item";
      id: string;
      label: ReactNode;
      icon?: ReactNode;
      disabled?: boolean;
      hidden?: boolean;
      destructive?: boolean;
      inset?: boolean;
      shortcut?: ReactNode;
      className?: string;
      onSelect?: (event: Event) => void;
      href?: string;
      submenu?: DropdownItem[];
      submenuSide?: "top" | "right" | "bottom" | "left";
    }
  | { type: "separator"; id: string; hidden?: boolean }
  | { type: "header"; id: string; label: string; hidden?: boolean };

export type DropdownProps = {
  items: DropdownItem[];
  trigger?: ReactNode;
  /** Merged onto the built-in select trigger button when mode is select and trigger is not overridden. */
  triggerClassName?: string;
  triggerAriaLabel?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  contentClassName?: string;
  itemClassName?: string;
  width?: number | "auto" | "full";
  mode?: "action" | "select";
  selectedValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: ReactNode;
  renderSelectedItem?: (item: DropdownItem) => ReactNode;
  showChevron?: boolean;
  disabled?: boolean;
  footer?: ReactNode;
  header?: ReactNode;
  customContent?: ReactNode;
  preventCloseOnInteract?: boolean;
  onOpenChange?: (open: boolean) => void;
};
