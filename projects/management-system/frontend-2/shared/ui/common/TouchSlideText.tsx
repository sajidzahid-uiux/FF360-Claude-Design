"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";

interface TouchSlideTextProps {
  text: string;
  maxWidth: string;
  className?: string;
}

export const TouchSlideText = ({
  text,
  maxWidth,
  className = "",
}: TouchSlideTextProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [deltaX, setDeltaX] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  // Check if text overflows the container (ResizeObserver: table cells lay out after mount)
  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        setHasOverflow(containerWidth > 0 && textWidth > containerWidth + 1);
      }
    };
    checkOverflow();
    const container = containerRef.current;
    let observer: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(checkOverflow);
      observer.observe(container);
    }
    window.addEventListener("resize", checkOverflow);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [text]);

  // Touch events for mobile/tablet
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasOverflow) return;

    let isTouchDragging = false;
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      isTouchDragging = true;
      setIsDragging(true);
      touchStartX = e.touches[0].pageX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouchDragging) return;
      const x = e.touches[0].pageX;
      const walk = x - touchStartX;
      setDeltaX(walk);
    };

    const handleTouchEnd = () => {
      isTouchDragging = false;
      setIsDragging(false);
      setDeltaX(0); // Snap back
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [hasOverflow]);

  // Mouse events for desktop
  useEffect(() => {
    if (!isDragging) return;
    const handleWindowMouseUp = () => {
      setIsDragging(false);
      setDeltaX(0); // Snap back
    };
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!hasOverflow) return;
    e.stopPropagation();
    setIsDragging(true);
    setStartX(e.pageX);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !hasOverflow) return;
    const x = e.pageX;
    const walk = x - startX;
    setDeltaX(walk);
  };

  // No need for onMouseUp handler on the div anymore

  return (
    <div
      ref={containerRef}
      className={`touch-slide-container ${maxWidth} ${className} ${
        hasOverflow ? "has-overflow" : ""
      }`}
      style={{
        touchAction: "none",
        overflowX: "hidden",
        cursor: isDragging ? "grabbing" : hasOverflow ? "grab" : "auto",
        whiteSpace: "nowrap",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      // onMouseUp removed, handled globally
    >
      <span
        ref={textRef}
        className={`touch-slide-text ${isDragging ? "dragging" : ""}`}
        style={{
          userSelect: "none",
          pointerEvents: "none",
          display: "inline-block",
          transition: isDragging
            ? "none"
            : "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          transform: `translateX(${deltaX}px)`,
        }}
        title={text}
      >
        {text}
      </span>
    </div>
  );
};
