"use client";

import { useRef } from "react";

import { Marker, Polygon, Polyline } from "@react-google-maps/api";

import type { KmlGeometry } from "@/utils/kml.utils";
import type { LatLng } from "@/utils/map.utils";
import {
  getColor,
  getMidpoint,
  makeMarkerIcon,
  toLatLng,
} from "@/utils/map.utils";

/**
 * Hovered line state for KML popup
 */
export type HoveredLine = {
  geometry: KmlGeometry;
  position: LatLng;
  index: number;
};

interface KmlGeometriesLayerProps {
  geometries: KmlGeometry[];
  polylineRefs: React.MutableRefObject<
    Record<number, google.maps.Polyline | undefined>
  >;
  setHoveredKmlLine: (v: HoveredLine | null) => void;
}

/**
 * KML Geometries Layer component for rendering KML geometries on the map
 */
export function KmlGeometriesLayer({
  geometries,
  polylineRefs,
  setHoveredKmlLine,
}: KmlGeometriesLayerProps) {
  const currentHoverIdxRef = useRef<number | null>(null);

  return (
    <>
      {geometries.map((geometry, idx) => {
        const color = getColor(geometry);
        const uniqueKey = geometry.uniqueId ?? `${geometry.name}-${idx}`;

        if (geometry.type === "Point" && geometry.coordinates.length) {
          const pos = toLatLng(geometry.coordinates[0]);
          return (
            <Marker
              key={`kml-point-${uniqueKey}`}
              options={{ icon: makeMarkerIcon(color) }}
              position={pos}
              title={geometry.name || "KML Point"}
            />
          );
        }

        if (geometry.type === "LineString" && geometry.coordinates.length) {
          const path = geometry.coordinates.map(toLatLng);
          const midpoint = getMidpoint(path);

          return (
            <Polyline
              key={`kml-line-${uniqueKey}`}
              options={{
                strokeColor: color,
                strokeOpacity: 1,
                strokeWeight: 2,
                clickable: true,
              }}
              path={path}
              onLoad={(polyline) => {
                if (!polyline) return;

                polylineRefs.current[idx] = polyline;
              }}
              onMouseOut={() => {
                if (currentHoverIdxRef.current !== idx) return;
                currentHoverIdxRef.current = null;

                setHoveredKmlLine(null);
              }}
              onMouseOver={() => {
                if (currentHoverIdxRef.current === idx) return;
                currentHoverIdxRef.current = idx;

                if (geometry.pipe_size) {
                  const hoverData = {
                    geometry,
                    position: midpoint,
                    index: idx,
                  };
                  setHoveredKmlLine(hoverData);
                }
              }}
              onUnmount={(polyline) => {
                if (!polyline) return;
                google.maps.event.clearInstanceListeners(polyline);
                delete polylineRefs.current[idx];
              }}
            />
          );
        }

        if (geometry.type === "Polygon" && geometry.coordinates.length) {
          const path = geometry.coordinates.map(toLatLng);
          return (
            <Polygon
              key={`kml-polygon-${uniqueKey}`}
              options={{
                fillColor: color,
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: color,
                clickable: false,
                editable: false,
                zIndex: 1,
              }}
              path={path}
            />
          );
        }

        return null;
      })}
    </>
  );
}
