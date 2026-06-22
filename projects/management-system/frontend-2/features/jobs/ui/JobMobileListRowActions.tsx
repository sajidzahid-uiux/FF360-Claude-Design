"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { MapPin } from "lucide-react";

import { Dropdown } from "@/shared/ui/common";
import type { DropdownItem } from "@/shared/ui/common/Dropdown";

interface JobMobileListRowActionsProps {
  onView: () => void;
  onTrack?: () => void;
  overflowItems: DropdownItem[];
}

export function JobMobileListRowActions({
  onView,
  onTrack,
  overflowItems,
}: JobMobileListRowActionsProps) {
  return (
    <div
      className="inline-grid w-max grid-cols-1 gap-1.5"
      data-column-id="actions"
      onClick={(event) => event.stopPropagation()}
    >
      <Button
        aria-label="View details"
        className="w-full"
        size={ComponentSizeEnum.SM}
        title="View details"
        onClick={onView}
      />

      {onTrack ? (
        <Button
          className="w-full"
          leftIcon={<MapPin aria-hidden className="h-3 w-3 shrink-0" />}
          size={ComponentSizeEnum.SM}
          title="On-site tracking"
          variant={ButtonVariantEnum.SURFACE}
          onClick={onTrack}
        />
      ) : null}
      {overflowItems.length > 0 ? (
        <Dropdown align="start" items={overflowItems} width={180} />
      ) : null}
    </div>
  );
}
