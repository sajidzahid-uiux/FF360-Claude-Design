// hexagonUtils.ts
import { hslToRgb, rgbToHex } from "@/shared/lib";

// Calculate distance between two points
const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

// Generate unique colors for each position
const generateUniqueColor = (row: number, col: number) => {
  const centerRow = 6;
  const centerCol = 6;

  // Only the exact center gets pure white
  if (row === centerRow && col === centerCol) {
    return "#FFFFFF";
  }

  // Create a unique seed based on position
  const seed = row * 13 + col;

  // Use position-based hue generation for better distribution
  const totalPositions = 127; // Total hexagons in grid
  const hue = ((seed * 360) / totalPositions) % 360;

  // Calculate distance from center for saturation and lightness
  const distFromCenter = distance(row, col, centerRow, centerCol);
  const maxDistFromCenter = 6;
  const normalizedDist = Math.min(distFromCenter / maxDistFromCenter, 1);

  // Vary saturation and lightness based on distance from center
  // Outer hexagons: higher saturation, varied lightness
  // Inner hexagons: lower saturation, higher lightness
  const saturation = 60 + normalizedDist * 40; // 60-100%
  const lightness = 30 + normalizedDist * 40; // 30-70%

  // Add some variation based on position to avoid similar colors
  const hueVariation = ((col * 7 + row * 11) % 30) - 15; // ±15 degrees
  const finalHue = (hue + hueVariation + 360) % 360;

  const [r, g, b] = hslToRgb(finalHue, saturation, lightness);
  return rgbToHex(r, g, b);
};

// Generate the hexagon grid with proper color mixing
export const generateHexagonGrid = (): string[][] => {
  const grid: string[][] = [];
  const rowSizes = [7, 8, 9, 10, 11, 12, 13, 12, 11, 10, 9, 8, 7];

  for (let row = 0; row < 13; row++) {
    const rowColors: string[] = [];
    const rowSize = rowSizes[row];
    const startOffset = Math.floor((13 - rowSize) / 2); // Center the row

    for (let col = 0; col < rowSize; col++) {
      const actualCol = col + startOffset;
      const color = generateUniqueColor(row, actualCol);
      rowColors.push(color);
    }
    grid.push(rowColors);
  }

  return grid;
};

// Pre-generated hexagon grid - updated with correct colors from console output
export const HEXAGON_COLORS: string[][] = [
  ["#ff8b66", "#ffa466", "#ff7166", "#ff8a66", "#ffa366", "#ffbc66", "#ff8866"],
  [
    "#ffec66",
    "#feb661",
    "#fbca55",
    "#f9e34d",
    "#f3f94a",
    "#f9c54d",
    "#fbe455",
    "#fbfe61",
  ],
  [
    "#e1fd5c",
    "#bef94a",
    "#98f53c",
    "#73f134",
    "#b1f031",
    "#94f134",
    "#7cf53c",
    "#6af94a",
    "#affd5c",
  ],
  [
    "#80fe61",
    "#4ff94a",
    "#37f350",
    "#4fec27",
    "#25e71d",
    "#19e633",
    "#1de758",
    "#27ec81",
    "#37f34d",
    "#4af97b",
  ],
  [
    "#55fbb9",
    "#3cf5ca",
    "#27ec7c",
    "#1adf8f",
    "#1dc89f",
    "#1dc0b3",
    "#1dc882",
    "#1adfae",
    "#27ecdc",
    "#3ce6f5",
    "#55fbd1",
  ],
  [
    "#66dbff",
    "#4df9e8",
    "#34e5f1",
    "#1db9e7",
    "#1d85c8",
    "#1fa2aa",
    "#1f809c",
    "#1f75aa",
    "#1d6ac8",
    "#1d57e7",
    "#34aaf1",
    "#4d9cf9",
  ],
  [
    "#66adff",
    "#4a7ff9",
    "#314bf0",
    "#1f19e6",
    "#1d50c0",
    "#1f319c",
    "#FFFFFF",
    "#361f9c",
    "#1d36c0",
    "#1c19e6",
    "#5231f0",
    "#854af9",
    "#6666ff",
  ],
  [
    "#9966ff",
    "#a34df9",
    "#5234f1",
    "#5f1de7",
    "#701dc8",
    "#7a1faa",
    "#851f9c",
    "#621faa",
    "#8b1dc8",
    "#c11de7",
    "#ec34f1",
    "#bb4df9",
  ],
  [
    "#d955fb",
    "#ed3cf5",
    "#ec27d4",
    "#df1aa7",
    "#c01dc8",
    "#c01dad",
    "#c81d99",
    "#df1a88",
    "#ec27d8",
    "#f53cc3",
    "#fb55b3",
  ],
  [
    "#fe61a1",
    "#f94a75",
    "#f337a4",
    "#ec2779",
    "#e71d50",
    "#e6192c",
    "#e72c1d",
    "#ec275b",
    "#f33749",
    "#f9564a",
  ],
  [
    "#fd655c",
    "#f9704a",
    "#f5833c",
    "#f19b34",
    "#f05931",
    "#f17a34",
    "#f59f3c",
    "#f9c44a",
    "#fd975c",
  ],
  [
    "#ffe866",
    "#fcfe61",
    "#defb55",
    "#f9de4d",
    "#f8f94a",
    "#dcf94d",
    "#c4fb55",
    "#fefe61",
  ],
  ["#cfff66", "#b6ff66", "#9dff66", "#84ff66", "#b7ff66", "#9eff66", "#85ff66"],
];

// Export the grid generation function for testing/debugging
export { generateHexagonGrid as _generateHexagonGrid };
