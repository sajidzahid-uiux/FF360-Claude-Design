"use client";

import { useEffect, useRef, useState } from "react";

import { HEXAGON_COLORS } from "@/utils/hexagonUtils";

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
  random?: boolean;
  size?: "small" | "medium" | "large";
}

export default function ColorPicker({
  color,
  setColor,
  random = false,
  size = "medium",
}: ColorPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Update container size when component mounts or parent resizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setContainerSize({ width: offsetWidth, height: offsetHeight });
      }
    };

    // Initial size
    updateSize();

    // Create ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate dynamic sizing based on container dimensions and size prop
  const getDynamicSizing = () => {
    const { width, height } = containerSize;

    // Use the smaller dimension to maintain aspect ratio
    const baseSize = Math.min(width, height);

    // Size multipliers
    const sizeMultipliers = {
      small: 18,
      medium: 12,
      large: 10,
    };

    // Calculate hexagon size based on size prop
    const multiplier = sizeMultipliers[size];
    const hexagonSize = Math.max(12, Math.floor(baseSize / multiplier));

    return {
      hexagonSize,
      gap: 0, // No gaps
    };
  };

  const { hexagonSize } = getDynamicSizing();

  // Generate random color from available colors (excluding white)
  const getRandomColor = () => {
    const allColors = HEXAGON_COLORS.flat().filter(
      (color) => color !== "#FFFFFF" && color !== "#ffffff" && color !== "white"
    );
    return allColors[Math.floor(Math.random() * allColors.length)];
  };

  // Set random color on mount if random prop is true and no color is provided
  useEffect(() => {
    if (random && (!color || color === "")) {
      const randomColor = getRandomColor();
      setColor(randomColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [random]); // Only run when random prop changes, not when color changes

  // Handle initial white color replacement
  useEffect(() => {
    if (
      random &&
      (color === "#FFFFFF" || color === "#ffffff" || color === "white")
    ) {
      const randomColor = getRandomColor();
      setColor(randomColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const renderHexagonRow = (row: string[]) => {
    return (
      <div className="flex items-center justify-center">
        {row.map((hexColor, index) => {
          const isSelected = hexColor.toLowerCase() === color.toLowerCase();
          return (
            <div
              key={index}
              className="relative cursor-pointer"
              style={{
                width: `${hexagonSize}px`,
                height: `${Math.floor(hexagonSize * 1.15)}px`,
              }}
              onClick={() => setColor(hexColor)}
            >
              {/* Hexagonal border background */}
              {isSelected && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    backgroundColor: "var(--primary)",
                  }}
                />
              )}
              {/* Main hexagon */}
              <div
                className="absolute"
                style={{
                  width: isSelected ? `${hexagonSize - 4}px` : "100%",
                  height: isSelected
                    ? `${Math.floor((hexagonSize - 4) * 1.15)}px`
                    : "100%",
                  top: isSelected ? "2px" : "0",
                  left: isSelected ? "2px" : "0",
                  clipPath:
                    "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  backgroundColor: hexColor,
                  transition: "all 0.1s ease",
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-col items-center justify-center"
    >
      {containerSize.width > 0 &&
        containerSize.height > 0 &&
        HEXAGON_COLORS.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              marginTop: rowIndex === 0 ? "0" : `-${hexagonSize * 0.25}px`,
            }}
          >
            {renderHexagonRow(row)}
          </div>
        ))}
    </div>
  );
}
