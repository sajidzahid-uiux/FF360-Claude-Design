"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@fieldflow360/org-ui";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  content: string;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  arrowClassName?: string;
}

export function Tooltip({
  content,
  children,
  className,
  contentClassName,
  arrowClassName,
}: TooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    transform: "translate(-50%, -100%)",
    arrowPosition: "left-1/2",
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      const padding = 8; // Padding from viewport edges

      // Use a temporary element to measure tooltip dimensions
      const tempDiv = document.createElement("div");
      tempDiv.style.cssText = `
        position: fixed;
        visibility: hidden;
        padding: 8px 12px;
        font-size: 0.875rem;
        max-width: 20rem;
        white-space: normal;
        word-wrap: break-word;
      `;
      tempDiv.textContent = content;
      document.body.appendChild(tempDiv);
      const tooltipWidth = Math.min(tempDiv.offsetWidth, 320); // max-w-xs = 20rem = 320px
      const tooltipHeight = tempDiv.offsetHeight;
      document.body.removeChild(tempDiv);

      // Calculate initial position (centered above trigger)
      let left = rect.left + rect.width / 2;
      let top = rect.top - padding;
      let transform = "translate(-50%, -100%)";
      let arrowPosition = "left-1/2";

      // Check if tooltip would overflow right edge
      if (left + tooltipWidth / 2 > viewportWidth - padding) {
        // Align to right edge with padding
        left = viewportWidth - padding;
        transform = "translate(-100%, -100%)";
        arrowPosition = "right-4";
      }
      // Check if tooltip would overflow left edge
      else if (left - tooltipWidth / 2 < padding) {
        // Align to left edge with padding
        left = padding;
        transform = "translate(0, -100%)";
        arrowPosition = "left-4";
      }

      // Check if tooltip would overflow top edge
      if (top - tooltipHeight < padding) {
        // Show below trigger instead
        top = rect.bottom + padding;
        transform = transform.replace("-100%", "0");
        // Arrow should point up when tooltip is below
        arrowPosition = "left-1/2";
      }

      setPosition({ top, left, transform, arrowPosition });
    }
    setIsHovered(true);
  };

  // Adjust position after tooltip is rendered to ensure it stays in viewport
  useEffect(() => {
    if (isHovered && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 8;

      let adjustedLeft = position.left;
      let adjustedTop = position.top;
      let adjustedTransform = position.transform;

      // Check right edge overflow
      if (tooltipRect.right > viewportWidth - padding) {
        adjustedLeft = viewportWidth - tooltipRect.width - padding;
        adjustedTransform = "translate(0, -100%)";
      }

      // Check left edge overflow
      if (tooltipRect.left < padding) {
        adjustedLeft = padding;
        adjustedTransform = "translate(0, -100%)";
      }

      // Check top edge overflow
      if (tooltipRect.top < padding) {
        const rect = triggerRef.current.getBoundingClientRect();
        adjustedTop = rect.bottom + padding;
        adjustedTransform = adjustedTransform.replace("-100%", "0");
      }

      // Check bottom edge overflow
      if (tooltipRect.bottom > viewportHeight - padding) {
        const rect = triggerRef.current.getBoundingClientRect();
        adjustedTop = rect.top - tooltipRect.height - padding;
        adjustedTransform = adjustedTransform.replace("0", "-100%");
      }

      if (
        adjustedLeft !== position.left ||
        adjustedTop !== position.top ||
        adjustedTransform !== position.transform
      ) {
        setPosition((prev) => ({
          ...prev,
          left: adjustedLeft,
          top: adjustedTop,
          transform: adjustedTransform,
        }));
      }
    }
  }, [isHovered, position.left, position.top, position.transform]);

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const tooltipContent = isHovered && (
    <div
      ref={tooltipRef}
      className={cn(
        "fixed px-3 py-2",
        "bg-bg-surface-elevated text-text-primary rounded-md text-sm shadow-lg",
        "border-border-subtle z-[99999] border",
        "pointer-events-none",
        "max-w-xs text-left",
        contentClassName
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: position.transform,
        minWidth: "max-content",
        whiteSpace: "normal",
      }}
    >
      <div className="relative">
        {content}
        {/* Arrow - position based on tooltip placement */}
        {position.transform.includes("-100%") && (
          <div
            className="absolute top-full -mt-px -translate-x-1/2"
            style={{
              left:
                position.arrowPosition === "left-1/2"
                  ? "50%"
                  : position.arrowPosition === "right-4"
                    ? "calc(100% - 1rem)"
                    : "1rem",
            }}
          >
            <div
              className={cn(
                "bg-bg-surface-elevated border-border-subtle h-2 w-2 rotate-45 border-r border-b",
                arrowClassName
              )}
            />
          </div>
        )}
        {!position.transform.includes("-100%") && (
          <div
            className="absolute bottom-full -mb-px -translate-x-1/2"
            style={{
              left:
                position.arrowPosition === "left-1/2"
                  ? "50%"
                  : position.arrowPosition === "right-4"
                    ? "calc(100% - 1rem)"
                    : "1rem",
            }}
          >
            <div
              className={cn(
                "bg-bg-surface-elevated border-border-subtle h-2 w-2 rotate-45 border-t border-l",
                arrowClassName
              )}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children || (
          <HelpCircle
            className={cn("text-text-muted h-4 w-4 cursor-help", className)}
          />
        )}
      </div>
      {typeof window !== "undefined" &&
        createPortal(tooltipContent, document.body)}
    </>
  );
}
