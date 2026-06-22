"use client";

import { useRef } from "react";

import { Polyline } from "@react-google-maps/api";

import type { LatLng } from "@/utils/map.utils";
import { getMidpoint } from "@/utils/map.utils";

import type { HoveredXmlLine, XmlPipeSize } from "./XmlLineHoverPopup";

/**
 * XML section data structure
 */
export interface XmlSectionData {
  points: Array<[number, number]>;
  color?: string;
  pipe_size?: XmlPipeSize;
}

/**
 * XML map data structure
 */
export interface XmlMapData {
  id: number;
  file: string;
  data: Record<string, XmlSectionData>;
}

interface XmlGeometriesLayerProps {
  xmlMaps: XmlMapData[];
  polylineRefs: React.MutableRefObject<
    Record<string, google.maps.Polyline | undefined>
  >;
  setHoveredXmlLine: (v: HoveredXmlLine | null) => void;
}

/**
 * Validates and filters coordinates to ensure they are valid
 */
function validateAndFilterPoints(points: Array<[number, number]>): LatLng[] {
  return points
    .filter((p) => {
      return (
        Array.isArray(p) &&
        p.length >= 2 &&
        p[0] != null &&
        p[1] != null &&
        typeof p[0] === "number" &&
        typeof p[1] === "number" &&
        !isNaN(p[0]) &&
        !isNaN(p[1]) &&
        isFinite(p[0]) &&
        isFinite(p[1]) &&
        p[0] !== 0 &&
        p[1] !== 0
      );
    })
    .map((p: number[]) => {
      const lat = p[0];
      const lng = p[1];
      // Additional validation before creating the object
      if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
        console.warn("Invalid XML coordinates found:", {
          lat,
          lng,
          original: p,
        });
        return null;
      }
      return { lat, lng };
    })
    .filter((point): point is LatLng => point !== null);
}

/**
 * XML Geometries Layer component for rendering XML geometries on the map
 */
export function XmlGeometriesLayer({
  xmlMaps,
  polylineRefs,
  setHoveredXmlLine,
}: XmlGeometriesLayerProps) {
  const currentHoverKeyRef = useRef<string | null>(null);
  return (
    <>
      {xmlMaps.map((xmlmap, mapIndex) => {
        if (!xmlmap || !xmlmap.data || typeof xmlmap.data !== "object") {
          return null;
        }

        // The data structure is: { sectionId: { points: [[lat, lng], ...], color: '#hex', pipe_size?: {...} } }
        return Object.entries(xmlmap.data).map(
          ([sectionId, sectionData], idx: number) => {
            if (
              !sectionData ||
              !sectionData.points ||
              !Array.isArray(sectionData.points)
            ) {
              return null;
            }

            // Validate and filter points to ensure they have valid coordinates
            const validPoints = validateAndFilterPoints(sectionData.points);

            // Only render if we have at least 2 valid points (minimum for a polyline)
            if (validPoints.length < 2) {
              return null;
            }

            const polylineKey = `xml-${mapIndex}-${sectionId}-${idx}`;
            const midpoint = getMidpoint(validPoints);

            return (
              <Polyline
                key={polylineKey}
                options={{
                  strokeColor: sectionData.color || "#2545fa",
                  strokeOpacity: 1.0,
                  strokeWeight: 2,
                  clickable: true,
                }}
                path={validPoints}
                onLoad={(polyline) => {
                  if (!polyline) return;
                  polylineRefs.current[polylineKey] = polyline;
                }}
                onMouseOut={() => {
                  if (currentHoverKeyRef.current !== polylineKey) return;
                  currentHoverKeyRef.current = null;

                  setHoveredXmlLine(null);
                }}
                onMouseOver={() => {
                  if (currentHoverKeyRef.current === polylineKey) return;
                  currentHoverKeyRef.current = polylineKey;

                  if (sectionData.pipe_size) {
                    setHoveredXmlLine({
                      sectionId,
                      pipeSize: sectionData.pipe_size,
                      position: midpoint,
                      mapIndex,
                      sectionIndex: idx,
                    });
                  }
                }}
                onUnmount={(polyline) => {
                  if (!polyline) return;
                  google.maps.event.clearInstanceListeners(polyline);
                  delete polylineRefs.current[polylineKey];
                }}
              />
            );
          }
        );
      })}
    </>
  );
}
