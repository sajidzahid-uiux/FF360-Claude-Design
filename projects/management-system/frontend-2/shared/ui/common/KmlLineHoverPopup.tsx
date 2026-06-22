"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { OverlayView } from "@react-google-maps/api";
import { X } from "lucide-react";

import { MarqueeText, TouchSlideText } from "@/shared/ui/common";

import type { HoveredLine } from "./KmlGeometriesLayer";

interface KmlLineHoverPopupProps {
  hovered: HoveredLine;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-text-muted flex-shrink-0 font-medium">{label}</span>
      <div className="min-w-0 flex-1 text-right">
        <TouchSlideText
          className="text-text-primary font-medium"
          maxWidth="w-full"
          text={value}
        />
      </div>
    </div>
  );
}

export function KmlLineHoverPopup({
  hovered,
  onClose,
}: KmlLineHoverPopupProps) {
  const geom = hovered.geometry;

  if (!geom.pipe_size && !geom.name) return null;

  return (
    <OverlayView
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      position={hovered.position}
    >
      <div
        className="bg-bg-surface-elevated relative left-1/2 z-[1000] w-[280px] -translate-x-1/2 rounded-xl border border-[#a78bfa] p-3 shadow-xl sm:left-auto sm:translate-x-0 sm:p-4"
        onClick={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Button
          iconOnly
          aria-label="Close"
          className="absolute top-2 right-2 z-10 m-1"
          leftIcon={<X className="h-3 w-3" />}
          size={ComponentSizeEnum.SM}
          variant={ButtonVariantEnum.GHOST}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
        />

        {geom.name &&
          (() => {
            const textClass = "text-text-primary text-base font-semibold";
            return (
              <div className={`pr-6 ${geom.pipe_size ? "mb-3" : ""}`}>
                {geom.name.length > 25 ? (
                  <MarqueeText
                    className={textClass}
                    duration={10}
                    maxWidth="max-w-[220px]"
                    text={geom.name}
                  />
                ) : (
                  <TouchSlideText
                    className={textClass}
                    maxWidth="w-full"
                    text={geom.name}
                  />
                )}
              </div>
            );
          })()}

        {geom.pipe_size && (
          <>
            <div className="mb-3 border-t border-dotted border-[#a78bfa]" />
            <div className="flex flex-col gap-2">
              {geom.pipe_size?.pipe_type && (
                <Row label="Pipe Type" value={geom.pipe_size.pipe_type} />
              )}
              {geom.pipe_size?.pipe_size !== undefined && (
                <Row
                  label="Pipe Size"
                  value={`${Number(geom.pipe_size.pipe_size).toFixed(2)}"`}
                />
              )}
            </div>
          </>
        )}
      </div>
    </OverlayView>
  );
}
