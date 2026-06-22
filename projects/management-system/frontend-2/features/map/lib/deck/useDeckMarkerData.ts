import { useMemo } from "react";

import { MapViewTab } from "@/constants";
import type { RgbaColor } from "@/shared/lib";
import { hexToRgba } from "@/shared/lib";

import type { MapLocation, MapMarkerData, MapPoint } from "../../model/types";
import {
  PIN_ICON_HEIGHT,
  PIN_ICON_WIDTH,
  getPinIconUrl,
  resolveIconKey,
} from "./pinIcons";

export interface DeckMarkerDatum {
  position: MapPoint; // [lng, lat]
  color: RgbaColor;
  radius: number;
  /** Full item data for popup on click (only present for clickable markers) */
  originalItem?: MapMarkerData;
  markerKind: "job" | "lead" | "contact" | "user" | "org";
  /** Pin icon data URL for IconLayer */
  iconUrl: string;
  /** Pin icon dimensions */
  iconWidth: number;
  iconHeight: number;
}

interface LegendEntry {
  color?: string;
  icon_svg?: string;
}

interface LegendResult {
  lead?: LegendEntry;
  job?: LegendEntry;
}

type GetLegendData = (type: string) => LegendResult | null;

/**
 * Transforms filtered jobs/leads/contacts plus user/org locations
 * into a flat array of marker data for deck.gl ScatterplotLayer.
 */
export interface DeckMarkerGroups {
  pins: DeckMarkerDatum[];
  circles: DeckMarkerDatum[];
}

export function useDeckMarkerData(
  filteredData: MapMarkerData[] | undefined,
  contactData: MapMarkerData[],
  activeTab: MapViewTab,
  getLegendData: GetLegendData,
  userLocation: MapLocation | null,
  organizationLocation: MapLocation | null
): DeckMarkerGroups {
  return useMemo(() => {
    const pins: DeckMarkerDatum[] = [];
    const circles: DeckMarkerDatum[] = [];

    // Job/Lead markers
    if (activeTab === MapViewTab.JOBS_LEADS && filteredData) {
      for (const item of filteredData) {
        const { latitude: lat, longitude: lng, object_type: objectType } = item;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

        const { color, colorHex } = resolveMarkerColor(
          item,
          objectType,
          getLegendData
        );
        const rawType = objectType === "lead" ? item.lead_type : item.job_type;
        const iconType = resolveIconType(rawType);
        const legend = getLegendData(iconType);
        const iconSvg =
          objectType === "lead"
            ? legend?.lead?.icon_svg
            : legend?.job?.icon_svg;
        const iconKey = resolveIconKey(objectType, rawType, iconSvg);

        pins.push({
          position: [lng, lat],
          color,
          radius: 8,
          originalItem: item,
          markerKind: objectType === "lead" ? "lead" : "job",
          iconUrl: getPinIconUrl(colorHex, iconKey),
          iconWidth: PIN_ICON_WIDTH,
          iconHeight: PIN_ICON_HEIGHT,
        });
      }
    }

    // Contact markers
    if (activeTab === MapViewTab.CONTACTS) {
      for (const contact of contactData) {
        const { latitude: lat, longitude: lng } = contact;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

        pins.push({
          position: [lng, lat],
          color: [0, 0, 0, 255],
          radius: 8,
          originalItem: contact,
          markerKind: "contact",
          iconUrl: getPinIconUrl("#000000", "contact"),
          iconWidth: PIN_ICON_WIDTH,
          iconHeight: PIN_ICON_HEIGHT,
        });
      }
    }

    // User location — keep as circle (no pin shape)
    if (userLocation) {
      circles.push({
        position: [userLocation.lng, userLocation.lat],
        color: [66, 133, 244, 255], // #4285f4
        radius: 8,
        markerKind: "user",
        iconUrl: "",
        iconWidth: 0,
        iconHeight: 0,
      });
    }

    // Organization location — keep as circle (no pin shape)
    if (organizationLocation) {
      circles.push({
        position: [organizationLocation.lng, organizationLocation.lat],
        color: [245, 158, 11, 255], // #f59e0b
        radius: 8,
        markerKind: "org",
        iconUrl: "",
        iconWidth: 0,
        iconHeight: 0,
      });
    }

    return { pins, circles };
  }, [
    filteredData,
    contactData,
    activeTab,
    getLegendData,
    userLocation,
    organizationLocation,
  ]);
}

function resolveIconType(rawType?: string): string {
  if (!rawType) return "repair";
  const lower = rawType.toLowerCase();
  if (lower.includes("excavation")) return "excavation";
  if (lower.includes("tiling") || lower.includes("drainage")) return "tiling";
  return "repair";
}

function resolveMarkerColor(
  item: MapMarkerData,
  objectType: MapMarkerData["object_type"],
  getLegendData: GetLegendData
): { color: RgbaColor; colorHex: string } {
  const rawType = objectType === "lead" ? item.lead_type : item.job_type;

  if (!rawType) {
    const hex = objectType === "lead" ? "#ef4444" : "#3b82f6";
    return { color: hexToRgba(hex), colorHex: hex };
  }

  const iconType = resolveIconType(rawType);
  const legend = getLegendData(iconType);
  const colorHex =
    objectType === "lead"
      ? legend?.lead?.color || "#ef4444"
      : legend?.job?.color || "#3b82f6";

  return { color: hexToRgba(colorHex), colorHex };
}
