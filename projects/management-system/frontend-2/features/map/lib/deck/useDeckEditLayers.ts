import { useMemo } from "react";

import type { Layer } from "@deck.gl/core";
import {
  IconLayer,
  PathLayer,
  ScatterplotLayer,
  SolidPolygonLayer,
} from "@deck.gl/layers";

import {
  FARM_BOUNDARY_FILL_RGBA,
  FARM_BOUNDARY_STROKE_RGBA,
} from "@/constants/mapPolygonColors";

import type { MapPoint, MapPointPath } from "../../model/types";
import type { GeoLatLng } from "../polygonEdit";
import { shouldRenderClosedPolygon } from "../polygonEdit";
import { DECK_LOCATION_PIN } from "./deckPinIcons";
import { buildPolygonBinary } from "./deckPolygonBinary";

const VERTEX_RADIUS_PX = 6;
/** Slightly larger than other vertices so the close target is visible, but smaller than before. */
const FIRST_VERTEX_RADIUS_PX = 7;

export interface UseDeckEditLayersOptions {
  vertices: GeoLatLng[];
  location?: GeoLatLng;
  isCustomPolygonMode: boolean;
  isPolygonClosed: boolean;
  onClosePolygon?: () => void;
}

export function useDeckEditLayers({
  vertices,
  location,
  isCustomPolygonMode,
  isPolygonClosed,
  onClosePolygon,
}: UseDeckEditLayersOptions): Layer[] {
  return useMemo(() => {
    const layers: Layer[] = [];
    const closed = shouldRenderClosedPolygon(
      vertices,
      isPolygonClosed,
      isCustomPolygonMode
    );

    if (vertices.length > 0) {
      const path: MapPointPath = vertices.map(
        (v) => [v.lng, v.lat] as MapPoint
      );
      if (closed && vertices.length >= 3) {
        path.push([vertices[0].lng, vertices[0].lat]);
      }

      if (closed && vertices.length >= 3) {
        const { binary } = buildPolygonBinary([
          {
            verts: vertices.map((v) => [v.lng, v.lat]),
            fill: FARM_BOUNDARY_FILL_RGBA,
            line: FARM_BOUNDARY_STROKE_RGBA,
          },
        ]);

        layers.push(
          new SolidPolygonLayer({
            id: "deck-edit-polygon-fill",
            data: {
              length: binary.length,
              startIndices: binary.startIndices,
              attributes: {
                getPolygon: { value: binary.positions, size: 2 },
                getFillColor: { value: binary.fillColors, size: 4 },
              },
            },
            _normalize: false,
            filled: true,
            extruded: false,
            pickable: false,
          })
        );
      }

      layers.push(
        new PathLayer({
          id: "deck-edit-polygon-outline",
          data: [{ path }],
          getPath: (d: { path: MapPointPath }) => d.path,
          getColor: FARM_BOUNDARY_STROKE_RGBA,
          getWidth: 2,
          widthUnits: "pixels",
          pickable: false,
        })
      );

      if (isCustomPolygonMode) {
        const vertexData = vertices.map((v, i) => ({
          position: [v.lng, v.lat] as MapPoint,
          isFirst: i === 0,
        }));

        layers.push(
          new ScatterplotLayer({
            id: "deck-edit-vertices",
            data: vertexData,
            getPosition: (d) => d.position,
            getFillColor: (d) =>
              d.isFirst && vertices.length >= 3
                ? [255, 152, 0, 255]
                : [255, 255, 255, 255],
            getRadius: (d) =>
              d.isFirst && vertices.length >= 3
                ? FIRST_VERTEX_RADIUS_PX
                : VERTEX_RADIUS_PX,
            radiusUnits: "pixels",
            stroked: true,
            getLineColor: FARM_BOUNDARY_STROKE_RGBA,
            getLineWidth: 2,
            lineWidthUnits: "pixels",
            pickable: vertices.length >= 3 && !!onClosePolygon,
            onClick: (info) => {
              const obj = info.object as { isFirst: boolean } | undefined;
              if (obj?.isFirst && onClosePolygon) onClosePolygon();
            },
          })
        );
      }
    }

    if (location) {
      layers.push(
        new IconLayer({
          id: "deck-edit-location-pin",
          data: [{ position: [location.lng, location.lat] as MapPoint }],
          getPosition: (d) => d.position,
          getIcon: () => DECK_LOCATION_PIN,
          getSize: 36,
          sizeScale: 1,
          sizeUnits: "pixels",
          pickable: false,
        })
      );
    }

    return layers;
  }, [
    vertices,
    location,
    isCustomPolygonMode,
    isPolygonClosed,
    onClosePolygon,
  ]);
}
