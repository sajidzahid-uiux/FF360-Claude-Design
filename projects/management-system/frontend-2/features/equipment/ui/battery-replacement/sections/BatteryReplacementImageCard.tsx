"use client";

import { type RefObject } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";

import { isPdfUrl } from "@/features/equipment/lib/equipment-detail-helpers";
import type { BatteryImageKind } from "@/features/equipment/model/battery-replacement-ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SanitizedInput,
} from "@/shared/ui/primitives";

interface BatteryReplacementImageCardProps {
  title: string;
  imagePreview: string | null;
  existingUrl?: string | null;
  disabled: boolean;
  isEditing: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onOpenMediaViewer?: (params: { url: string; title: string }) => void;
  onQuickUpload: (file: File, kind: BatteryImageKind) => Promise<void>;
  onSetImage: (file: File) => void;
  kind: BatteryImageKind;
}

export function BatteryReplacementImageCard({
  title,
  imagePreview,
  existingUrl,
  disabled,
  isEditing,
  inputRef,
  onOpenMediaViewer,
  onQuickUpload,
  onSetImage,
  kind,
}: BatteryReplacementImageCardProps) {
  const mediaTitle = `${title}`;

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-bg-surface border-border-subtle relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border">
          {imagePreview ? (
            onOpenMediaViewer ? (
              <button
                className="focus:ring-accent flex h-full w-full items-center justify-center focus:ring-2 focus:outline-none"
                type="button"
                onClick={() =>
                  onOpenMediaViewer({ url: imagePreview, title: mediaTitle })
                }
              >
                <img
                  alt={title}
                  className="h-full w-full cursor-pointer object-contain"
                  src={imagePreview}
                />
              </button>
            ) : (
              <img
                alt={title}
                className="h-full w-full object-contain"
                src={imagePreview}
              />
            )
          ) : isPdfUrl(existingUrl) ? (
            <div className="text-text-muted flex items-center gap-2 text-sm">
              <a
                className="underline"
                href={existingUrl || ""}
                rel="noreferrer"
                target="_blank"
              >
                Open PDF
              </a>
              <Button
                aria-label="Replace"
                disabled={disabled}
                size={ComponentSizeEnum.SM}
                title="Replace"
                variant={ButtonVariantEnum.SURFACE}
                onClick={() => inputRef.current?.click()}
              />
            </div>
          ) : (
            <Button
              aria-label="Replace Image"
              disabled={disabled}
              title="Replace Image"
              variant={ButtonVariantEnum.SURFACE}
              onClick={() => inputRef.current?.click()}
            />
          )}
          {imagePreview ? (
            <div className="absolute right-2 bottom-2 flex gap-2">
              {onOpenMediaViewer ? (
                <button
                  className="bg-bg-app/70 rounded px-2 py-1 text-xs underline"
                  type="button"
                  onClick={() =>
                    onOpenMediaViewer({ url: imagePreview, title: mediaTitle })
                  }
                >
                  Open image
                </button>
              ) : (
                <a
                  className="bg-bg-app/70 rounded px-2 py-1 text-xs underline"
                  href={imagePreview}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open image
                </a>
              )}
              <Button
                aria-label="Replace"
                disabled={disabled}
                size={ComponentSizeEnum.SM}
                title="Replace"
                variant={ButtonVariantEnum.SURFACE}
                onClick={() => inputRef.current?.click()}
              />
            </div>
          ) : null}
          <SanitizedInput
            ref={inputRef}
            accept="image/*,application/pdf"
            className="hidden"
            disabled={disabled}
            type="file"
            onChange={async (e) => {
              const file = e.target.files?.[0] || null;
              if (!file || disabled) return;
              if (isEditing) {
                onSetImage(file);
              } else {
                await onQuickUpload(file, kind);
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
