"use client";

import type { ChangeEvent, RefObject } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";
import { ImageIcon, Upload } from "lucide-react";

export interface EquipmentDetailImageSlotProps {
  label: string;
  src: string | null;
  accept: string;
  editable?: boolean;
  disabled?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  onFileChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onView?: () => void;
}

export function EquipmentDetailImageSlot({
  label,
  src,
  accept,
  editable = false,
  disabled = false,
  inputRef,
  onFileChange,
  onView,
}: EquipmentDetailImageSlotProps) {
  const emptyLabel = `No ${label.toLowerCase()}`;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-text-muted text-xs font-medium">{label}</p>
      <div
        className={cn(
          "border-border-subtle bg-bg-surface relative aspect-[4/3] w-full overflow-hidden rounded-lg border",
          !src && "bg-bg-app"
        )}
      >
        {src ? (
          <>
            {onView && !editable ? (
              <button
                className="focus-visible:ring-accent flex h-full w-full items-center justify-center p-2 focus:outline-none focus-visible:ring-2"
                type="button"
                onClick={onView}
              >
                <img
                  alt={label}
                  className="max-h-full max-w-full cursor-pointer object-contain"
                  src={src}
                />
              </button>
            ) : (
              <img
                alt={label}
                className="h-full w-full object-contain p-2"
                src={src}
              />
            )}
            {editable && !disabled ? (
              <div className="absolute right-2 bottom-2">
                <Button
                  leftIcon={
                    <Upload
                      aria-hidden
                      className="h-3.5 w-3.5"
                      strokeWidth={2}
                    />
                  }
                  size={ComponentSizeEnum.SM}
                  title="Replace"
                  variant={ButtonVariantEnum.SURFACE}
                  onClick={() => inputRef?.current?.click()}
                />
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-text-muted flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-xs">
            <ImageIcon
              aria-hidden
              className="h-8 w-8 opacity-40"
              strokeWidth={1.5}
            />
            <span>{emptyLabel}</span>
            {editable && !disabled ? (
              <Button
                leftIcon={
                  <Upload aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
                }
                size={ComponentSizeEnum.SM}
                title="Upload"
                variant={ButtonVariantEnum.SURFACE}
                onClick={() => inputRef?.current?.click()}
              />
            ) : null}
          </div>
        )}

        {editable && !disabled ? (
          <input
            ref={inputRef}
            accept={accept}
            className="hidden"
            type="file"
            onChange={onFileChange}
          />
        ) : null}
      </div>
    </div>
  );
}
