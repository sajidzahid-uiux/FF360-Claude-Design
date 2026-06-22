"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Modal,
} from "@fieldflow360/org-ui";
import { ExternalLink, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export interface MediaViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  type: "image" | "pdf";
  title: string;
}

export function MediaViewer({
  open,
  onOpenChange,
  url,
  type,
  title,
}: MediaViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }, []);
  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  }, []);
  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (open) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [open]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [pan.x, pan.y]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPan({
        x: dragStart.current.panX + e.clientX - dragStart.current.x,
        y: dragStart.current.panY + e.clientY - dragStart.current.y,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!url || !open) return null;

  return (
    <Modal
      className="max-w-5xl"
      isOpen={open}
      size="2xl"
      title={title}
      onClose={() => onOpenChange(false)}
    >
      {type === "image" ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button
            iconOnly
            aria-label="Zoom out"
            disabled={zoom <= MIN_ZOOM}
            leftIcon={<ZoomOut className="size-4" />}
            variant={ButtonVariantEnum.SURFACE}
            onClick={zoomOut}
          />
          <Button
            iconOnly
            aria-label="Zoom in"
            disabled={zoom >= MAX_ZOOM}
            leftIcon={<ZoomIn className="size-4" />}
            variant={ButtonVariantEnum.SURFACE}
            onClick={zoomIn}
          />
          <Button
            iconOnly
            aria-label="Reset zoom"
            disabled={zoom === 1}
            leftIcon={<RotateCcw className="size-4" />}
            variant={ButtonVariantEnum.SURFACE}
            onClick={resetZoom}
          />
          <span className="text-text-muted text-sm">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      ) : (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <p className="text-text-muted text-sm">
            Scroll to move through pages. Use the viewer toolbar for zoom and
            page controls.
          </p>
          <Button
            aria-label="Open in new tab"
            leftIcon={<ExternalLink className="size-4" />}
            size={ComponentSizeEnum.SM}
            title="Open in new tab"
            variant={ButtonVariantEnum.SURFACE}
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          />
        </div>
      )}
      {type === "pdf" ? (
        <div className="border-border-subtle flex min-h-[65vh] flex-col overflow-hidden rounded-md border">
          <iframe
            allow="fullscreen"
            className="bg-bg-surface min-h-[65vh] w-full flex-1 border-0"
            src={url}
            title={title}
          />
        </div>
      ) : (
        <div
          className="border-border-subtle min-h-[60vh] overflow-hidden rounded-md border"
          role="presentation"
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div className="flex min-h-[60vh] items-center justify-center p-4">
            <div
              className="origin-center select-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
            >
              <img
                alt={title}
                className="pointer-events-none max-h-[75vh] max-w-full object-contain"
                draggable={false}
                src={url}
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
