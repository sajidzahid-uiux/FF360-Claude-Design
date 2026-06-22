"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { OverlayView } from "@react-google-maps/api";
import { X } from "lucide-react";

import { CONVERSION_FACTORS } from "@/constants";
import { MarqueeText, TouchSlideText } from "@/shared/ui/common";
import type { LatLng } from "@/utils/map.utils";

/**
 * XML pipe size data structure
 */
export interface XmlPipeSize {
  segments?: Array<{ value: number }>;
  max_depth?: number;
  min_depth?: number;
  min_slope?: number;
  pipe_type?: string;
  filter_level?: number;
  outlet_depth?: number;
  optimal_depth?: number;
  last_pt_outlet?: boolean;
  optimal_to_outlet?: number;
}

/**
 * Hovered XML line state
 */
export type HoveredXmlLine = {
  sectionId: string;
  pipeSize: XmlPipeSize;
  position: LatLng;
  mapIndex: number;
  sectionIndex: number;
};

interface XmlLineHoverPopupProps {
  hovered: HoveredXmlLine;
  onClose: () => void;
}

/**
 * Row component for displaying label-value pairs in the popup
 */
function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-text-muted flex-shrink-0 font-medium">{label}</span>
      <div className="min-w-0 flex-1 text-right">
        <TouchSlideText
          className="text-text-primary font-medium"
          maxWidth="w-full"
          text={String(value)}
        />
      </div>
    </div>
  );
}

/**
 * XML Line Hover Popup component for displaying pipe information on hover
 */
export function XmlLineHoverPopup({
  hovered,
  onClose,
}: XmlLineHoverPopupProps) {
  const pipeSize = hovered.pipeSize;

  if (!pipeSize) return null;

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

        {hovered.sectionId &&
          (() => {
            const label = hovered.sectionId.replace(/^xml-\d+-/, "");
            const textClass = "text-text-primary text-base font-semibold";
            return (
              <div className="mb-3 pr-6">
                {label.length > 25 ? (
                  <MarqueeText
                    className={textClass}
                    duration={10}
                    maxWidth="max-w-[220px]"
                    text={label}
                  />
                ) : (
                  <TouchSlideText
                    className={textClass}
                    maxWidth="w-full"
                    text={label}
                  />
                )}
              </div>
            );
          })()}

        <div className="mb-3 border-t border-dotted border-[#a78bfa]" />

        <div className="flex flex-col gap-2">
          {pipeSize.pipe_type && (
            <Row label="Pipe Type" value={pipeSize.pipe_type} />
          )}
          {pipeSize.segments && pipeSize.segments.length > 0 && (
            <Row
              label="Pipe Size"
              value={`${(pipeSize.segments[0].value * CONVERSION_FACTORS.METERS_TO_INCHES).toFixed(2)}"`}
            />
          )}
        </div>
      </div>
    </OverlayView>
  );
}
