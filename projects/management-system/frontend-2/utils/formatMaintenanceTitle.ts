import { UnitSystem } from "@/constants";

/**
 * Maps maintenance filter names to their display titles
 */
const MAINTENANCE_FILTERS = [
  { title: "Fuel Filter", name: "fuel_filter" },
  { title: "Air Filter", name: "air_filter" },
  { title: "Oil & Filter", name: "oil_filter" },
  { title: "Hydraulic Filter", name: "hydraulic_filter" },
];

/**
 * Formats a maintenance title from backend format to display format
 * @param title - The title from the backend (e.g., "Oil_Filter" or "oil_filter")
 * @returns The formatted display title (e.g., "Oil & Filter")
 */
export function formatMaintenanceTitle(title: string): string {
  if (!title) return title;

  // Normalize the title to match the filter name format (lowercase with underscores)
  const normalizedTitle = title.toLowerCase().replace(/\s+/g, "_");
  const filter = MAINTENANCE_FILTERS.find((f) => f.name === normalizedTitle);

  return filter ? filter.title : title;
}

const MILES_TO_KM = 1.60934;

/**
 * Formats "due soon" maintenance remaining text for equipment badges.
 * Vehicles show distance (mi/km per unit system); machines show hours.
 */
export function formatDueSoonText(
  value: number,
  isVehicle: boolean,
  unitSystem: UnitSystem,
  distanceLabel: string
): string {
  if (isVehicle) {
    const distance =
      unitSystem === UnitSystem.METRIC ? value * MILES_TO_KM : value;
    return `(${distance.toFixed(0)} ${distanceLabel} left)`;
  }
  return `(${value.toFixed(0)} hrs left)`;
}
