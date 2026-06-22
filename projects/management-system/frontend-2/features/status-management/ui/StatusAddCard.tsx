"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { Plus } from "lucide-react";

interface StatusAddCardProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function StatusAddCard({
  label,
  onClick,
  disabled = false,
}: StatusAddCardProps) {
  return (
    <div className="border-border-subtle flex min-h-[88px] items-center justify-center rounded-xl border border-dashed p-4">
      <Button
        aria-label={label}
        disabled={disabled}
        leftIcon={<Plus aria-hidden className="h-4 w-4" strokeWidth={2} />}
        size={ComponentSizeEnum.SM}
        title={label}
        variant={ButtonVariantEnum.GHOST}
        onClick={onClick}
      />
    </div>
  );
}
