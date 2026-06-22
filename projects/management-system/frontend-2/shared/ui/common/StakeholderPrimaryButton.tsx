"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";
import { Star } from "lucide-react";

interface StakeholderPrimaryButtonProps {
  isPrimary: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

export function StakeholderPrimaryButton({
  isPrimary,
  disabled = false,
  onClick,
  className,
}: StakeholderPrimaryButtonProps) {
  return (
    <Button
      className={className}
      disabled={disabled}
      leftIcon={
        <Star className={cn("h-3.5 w-3.5", isPrimary ? "fill-current" : "")} />
      }
      size={ComponentSizeEnum.SM}
      title="Primary"
      variant={
        isPrimary ? ButtonVariantEnum.DEFAULT : ButtonVariantEnum.SURFACE
      }
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
    />
  );
}
