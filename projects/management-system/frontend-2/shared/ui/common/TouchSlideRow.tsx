"use client";

import { MouseEvent, ReactNode, useEffect, useRef, useState } from "react";

interface TouchSlideRowProps {
  children: ReactNode;
  maxWidth: string;
  className?: string;
  title?: string;
  /** Changes when row content changes; used to re-measure overflow. */
  contentKey?: string;
}

export function TouchSlideRow({
  children,
  maxWidth,
  className = "",
  title,
  contentKey = "",
}: TouchSlideRowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [deltaX, setDeltaX] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current && containerRef.current) {
        const contentWidth = contentRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        setHasOverflow(containerWidth > 0 && contentWidth > containerWidth + 1);
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
  }, [contentKey]);

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
      setDeltaX(0);
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

  useEffect(() => {
    if (!isDragging) return;
    const handleWindowMouseUp = () => {
      setIsDragging(false);
      setDeltaX(0);
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
    >
      <div
        ref={contentRef}
        className={`touch-slide-text inline-flex items-center gap-1.5 ${isDragging ? "dragging" : ""}`}
        style={{
          userSelect: "none",
          pointerEvents: "none",
          transition: isDragging
            ? "none"
            : "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          transform: `translateX(${deltaX}px)`,
        }}
        title={title}
      >
        {children}
      </div>
    </div>
  );
}
