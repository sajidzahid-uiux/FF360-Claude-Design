"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface MonthStepperProps {
  label: string;
  isCurrentMonth: boolean;
  onPrev: () => void;
  onNext: () => void;
  onJumpToCurrent: () => void;
  currentLabel?: string;
  unitLabel?: string;
  className?: string;
}

export function MonthStepper({
  label,
  isCurrentMonth,
  onPrev,
  onNext,
  onJumpToCurrent,
  currentLabel = "This Month",
  unitLabel = "month",
  className,
}: MonthStepperProps) {
  return (
    <>
      <div
        className={cn(
          "bg-bg-app flex items-center justify-between px-4 py-3 md:hidden",
          className
        )}
      >
        <Button
          iconOnly
          aria-label={`Previous ${unitLabel}`}
          leftIcon={
            <ChevronLeft aria-hidden className="h-6 w-6" strokeWidth={2} />
          }
          size={ComponentSizeEnum.MD}
          variant={ButtonVariantEnum.GHOST}
          onClick={onPrev}
        />
        <span className="text-text-primary text-[18px] leading-7 font-bold">
          {label}
        </span>
        <Button
          iconOnly
          aria-label={`Next ${unitLabel}`}
          leftIcon={
            <ChevronRight aria-hidden className="h-6 w-6" strokeWidth={2.25} />
          }
          size={ComponentSizeEnum.MD}
          variant={ButtonVariantEnum.GHOST}
          onClick={onNext}
        />
      </div>

      <div
        className={cn(
          "bg-bg-app hidden items-center justify-center gap-4 py-3 md:flex",
          className
        )}
      >
        <Button
          iconOnly
          aria-label={`Previous ${unitLabel}`}
          leftIcon={
            <ChevronLeft
              aria-hidden
              className="h-[18px] w-[18px]"
              strokeWidth={2}
            />
          }
          size={ComponentSizeEnum.SM}
          variant={ButtonVariantEnum.SURFACE}
          onClick={onPrev}
        />

        <span className="text-text-primary text-[12px] leading-[22px] font-bold underline underline-offset-4">
          {label}
        </span>

        {isCurrentMonth ? null : (
          <Button
            aria-label={currentLabel}
            size={ComponentSizeEnum.SM}
            title={currentLabel}
            variant={ButtonVariantEnum.GHOST}
            onClick={onJumpToCurrent}
          />
        )}

        <Button
          iconOnly
          aria-label={`Next ${unitLabel}`}
          leftIcon={
            <ChevronRight
              aria-hidden
              className="h-[18px] w-[18px]"
              strokeWidth={2}
            />
          }
          size={ComponentSizeEnum.SM}
          variant={ButtonVariantEnum.SURFACE}
          onClick={onNext}
        />
      </div>
    </>
  );
}
