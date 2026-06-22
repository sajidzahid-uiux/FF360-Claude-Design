import { useCallback, useMemo } from "react";

import type { Layer, PickingInfo } from "@deck.gl/core";
import {
  IconLayer,
  PathLayer,
  ScatterplotLayer,
  SolidPolygonLayer,
  TextLayer,
} from "@deck.gl/layers";

import { hexToRgba } from "@/shared/lib";
import type {
  HoveredLine,
  HoveredXmlLine,
  VendorMarker,
} from "@/shared/ui/common/map";
import type { KmlGeometry } from "@/utils/kml.utils";

import type { LatLng, MapPoint, MapPointPath } from "../../model/types";
import {
  DECK_BLACK_PIN,
  DECK_BLUE_PIN,
  DECK_GOLD_PIN,
  DECK_GRAY_PIN,
  DECK_RED_PIN,
} from "./deckPinIcons";
import { useAccentHex } from "./useAccentHex";
import { useDeckKmlPointData } from "./useDeckKmlPointData";
import { useDeckKmlPolygonData } from "./useDeckKmlPolygonData";
import { type DeckPathDatum, useDeckPathData } from "./useDeckPathData";
import {
  type DeckPolygonOutline,
  useDeckPolygonData,
} from "./useDeckPolygonData";

type PinIconKey = "blue" | "gray" | "gold";
const PIN_ICON_MAP = {
  blue: DECK_BLUE_PIN,
  gray: DECK_GRAY_PIN,
  gold: DECK_GOLD_PIN,
} as const;

interface VendorMarkerDatum {
  id: number;
  position: MapPoint;
  iconKey: PinIconKey;
  size: number;
  name: string;
  marker: VendorMarker;
}

export interface UseDeckGeometryLayersOptions {
  layerIdPrefix?: string;
  verticesToDraw: Parameters<typeof useDeckPolygonData>[0];
  shpToDraw: Parameters<typeof useDeckPolygonData>[1];
  xmlToDraw: Parameters<typeof useDeckPathData>[0];
  kmlGeometries: KmlGeometry[];
  onPathHover: (xml: HoveredXmlLine | null, kml: HoveredLine | null) => void;
  vendorMarkers?: VendorMarker[];
  secondaryFarmPins?: LatLng[];
  primaryRingIndex?: number;
  selectedVendorId?: number;
  favoriteVendorIds?: number[];
  showVendorMarkerLabels?: boolean;
  onVendorMarkerClick?: (marker: VendorMarker) => void;
  jobLocation?: LatLng;
  userLocation?: LatLng | null;
  organizationLocation?: LatLng | null;
}

export function useDeckGeometryLayers({
  layerIdPrefix = "deck-geo",
  verticesToDraw,
  shpToDraw,
  xmlToDraw,
  kmlGeometries,
  onPathHover,
  vendorMarkers = [],
  secondaryFarmPins = [],
  primaryRingIndex,
  selectedVendorId,
  favoriteVendorIds,
  showVendorMarkerLabels = false,
  onVendorMarkerClick,
  jobLocation,
  userLocation,
  organizationLocation,
}: UseDeckGeometryLayersOptions): Layer[] {
  const accentHex = useAccentHex();

  const primaryRingOverride = useMemo(() => {
    if (primaryRingIndex === undefined) return undefined;
    return {
      index: primaryRingIndex,
      fill: hexToRgba(accentHex, 80) as [number, number, number, number],
      line: hexToRgba(accentHex, 255) as [number, number, number, number],
    };
  }, [primaryRingIndex, accentHex]);

  const polygonData = useDeckPolygonData(
    verticesToDraw,
    shpToDraw,
    primaryRingOverride
  );
  const pathData = useDeckPathData(xmlToDraw, kmlGeometries);
  const kmlPointData = useDeckKmlPointData(kmlGeometries);
  const kmlPolygonData = useDeckKmlPolygonData(kmlGeometries);

  const handlePathHover = useCallback(
    (info: { object?: DeckPathDatum | null }) => {
      const obj = info.object;
      if (!obj || (!obj.pipeSize && !obj.name)) {
        onPathHover(null, null);
        return;
      }
      if (obj.sourceType === "xml" && !obj.pipeSize) {
        onPathHover(null, null);
        return;
      }
      const position = { lat: obj.midpoint[1], lng: obj.midpoint[0] };
      if (obj.sourceType === "xml") {
        onPathHover(
          {
            sectionId: obj.sectionId,
            pipeSize: obj.pipeSize as HoveredXmlLine["pipeSize"],
            position,
            mapIndex: 0,
            sectionIndex: 0,
          },
          null
        );
      } else {
        onPathHover(null, {
          geometry: {
            pipe_size: obj.pipeSize,
            name: obj.name,
          } as unknown as KmlGeometry,
          position,
          index: 0,
        });
      }
    },
    [onPathHover]
  );

  const vendorData = useMemo<VendorMarkerDatum[]>(() => {
    if (!vendorMarkers.length) return [];
    return vendorMarkers
      .map((marker) => {
        const lat = Number(marker.lat);
        const lng = Number(marker.long);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const isSelected =
          selectedVendorId != null &&
          Number(marker.id) === Number(selectedVendorId);
        const isFavorite =
          favoriteVendorIds != null &&
          favoriteVendorIds.includes(Number(marker.id));
        const isApproximate = marker.markerType === "approximate";
        const iconKey: PinIconKey =
          isSelected || isFavorite ? "gold" : isApproximate ? "gray" : "blue";
        return {
          id: marker.id,
          position: [lng, lat] as MapPoint,
          iconKey,
          size: isSelected ? 52 : 38,
          name: marker.name ?? "",
          marker,
        };
      })
      .filter((d): d is VendorMarkerDatum => d !== null);
  }, [vendorMarkers, selectedVendorId, favoriteVendorIds]);

  const handleVendorClick = useCallback(
    (info: PickingInfo<VendorMarkerDatum>) => {
      if (info.object) onVendorMarkerClick?.(info.object.marker);
    },
    [onVendorMarkerClick]
  );

  return useMemo(() => {
    const result: Layer[] = [];
    const { binary: polyBin, outlines: polyOutlines } = polygonData;
    const { binary: kmlBin, outlines: kmlOutlines } = kmlPolygonData;

    if (polyBin.length > 0) {
      result.push(
        new SolidPolygonLayer({
          id: `${layerIdPrefix}-farm-shp-fills`,
          data: {
            length: polyBin.length,
            startIndices: polyBin.startIndices,
            attributes: {
              getPolygon: { value: polyBin.positions, size: 2 },
              getFillColor: { value: polyBin.fillColors, size: 4 },
            },
          },
          _normalize: false,
          filled: true,
          extruded: false,
          pickable: false,
        })
      );
    }

    if (polyOutlines.length > 0) {
      result.push(
        new PathLayer<DeckPolygonOutline>({
          id: `${layerIdPrefix}-farm-shp-outlines`,
          data: polyOutlines,
          getPath: (d) => d.path as MapPointPath,
          getColor: (d) => d.color,
          getWidth: 2,
          widthUnits: "pixels",
          widthMinPixels: 1,
          pickable: false,
        })
      );
    }

    if (kmlBin.length > 0) {
      result.push(
        new SolidPolygonLayer({
          id: `${layerIdPrefix}-kml-polygon-fills`,
          data: {
            length: kmlBin.length,
            startIndices: kmlBin.startIndices,
            attributes: {
              getPolygon: { value: kmlBin.positions, size: 2 },
              getFillColor: { value: kmlBin.fillColors, size: 4 },
            },
          },
          _normalize: false,
          filled: true,
          extruded: false,
          pickable: false,
        })
      );
    }

    if (kmlOutlines.length > 0) {
      result.push(
        new PathLayer<DeckPolygonOutline>({
          id: `${layerIdPrefix}-kml-polygon-outlines`,
          data: kmlOutlines,
          getPath: (d) => d.path as MapPointPath,
          getColor: (d) => d.color,
          getWidth: 2,
          widthUnits: "pixels",
          widthMinPixels: 1,
          pickable: false,
        })
      );
    }

    if (pathData.length > 0) {
      result.push(
        new PathLayer<DeckPathDatum>({
          id: `${layerIdPrefix}-xml-kml-paths`,
          data: pathData,
          getPath: (d) => d.path,
          getColor: (d) => d.color,
          getWidth: (d) => d.width,
          widthUnits: "pixels",
          widthMinPixels: 2,
          pickable: true,
          onHover: handlePathHover,
          autoHighlight: true,
          highlightColor: [255, 255, 0, 128],
        })
      );
    }

    if (kmlPointData.length > 0) {
      result.push(
        new ScatterplotLayer({
          id: `${layerIdPrefix}-kml-points`,
          data: kmlPointData,
          getPosition: (d) => d.position,
          getFillColor: (d) => d.color,
          getRadius: (d) => d.radius,
          radiusUnits: "pixels",
          pickable: false,
        })
      );
    }

    if (userLocation) {
      result.push(
        new ScatterplotLayer({
          id: `${layerIdPrefix}-user-location`,
          data: [
            { position: [userLocation.lng, userLocation.lat] as MapPoint },
          ],
          getPosition: (d) => d.position,
          getFillColor: [66, 133, 244, 255],
          getRadius: 8,
          radiusUnits: "pixels",
          stroked: true,
          getLineColor: [255, 255, 255, 255],
          getLineWidth: 3,
          lineWidthUnits: "pixels",
          pickable: false,
        })
      );
    }

    if (organizationLocation) {
      result.push(
        new ScatterplotLayer({
          id: `${layerIdPrefix}-org-location`,
          data: [
            {
              position: [
                organizationLocation.lng,
                organizationLocation.lat,
              ] as [number, number],
            },
          ],
          getPosition: (d) => d.position,
          getFillColor: [234, 67, 53, 255],
          getRadius: 8,
          radiusUnits: "pixels",
          stroked: true,
          getLineColor: [255, 255, 255, 255],
          getLineWidth: 3,
          lineWidthUnits: "pixels",
          pickable: false,
        })
      );
    }

    if (jobLocation) {
      result.push(
        new IconLayer({
          id: `${layerIdPrefix}-job-location`,
          data: [{ position: [jobLocation.lng, jobLocation.lat] as MapPoint }],
          getPosition: (d) => d.position,
          getIcon: () => DECK_RED_PIN,
          getSize: 36,
          sizeScale: 1,
          sizeUnits: "pixels",
          pickable: false,
        })
      );
    }

    if (secondaryFarmPins.length > 0) {
      result.push(
        new IconLayer({
          id: `${layerIdPrefix}-secondary-farm-pins`,
          data: secondaryFarmPins.map((p) => ({
            position: [p.lng, p.lat] as MapPoint,
          })),
          getPosition: (d) => d.position,
          getIcon: () => DECK_BLACK_PIN,
          getSize: 36,
          sizeScale: 1,
          sizeUnits: "pixels",
          pickable: false,
        })
      );
    }

    if (vendorData.length > 0) {
      result.push(
        new IconLayer<VendorMarkerDatum>({
          id: `${layerIdPrefix}-vendor-pins`,
          data: vendorData,
          getPosition: (d) => d.position,
          getIcon: (d) => PIN_ICON_MAP[d.iconKey],
          getSize: (d) => d.size,
          sizeScale: 1,
          sizeUnits: "pixels",
          pickable: true,
          onClick: handleVendorClick,
        })
      );

      if (showVendorMarkerLabels) {
        result.push(
          new TextLayer<VendorMarkerDatum>({
            id: `${layerIdPrefix}-vendor-labels`,
            data: vendorData.filter((d) => d.name),
            getPosition: (d) => d.position,
            getText: (d) => d.name,
            getSize: 12,
            getColor: [255, 255, 255, 255],
            getPixelOffset: (d) => [0, d.size === 52 ? -68 : -50],
            background: true,
            getBackgroundColor: [15, 23, 42, 220],
            backgroundPadding: [6, 3, 6, 3],
            billboard: true,
            fontFamily: '"Inter", system-ui, sans-serif',
            fontWeight: "500",
            pickable: false,
          })
        );
      }
    }

    return result;
  }, [
    layerIdPrefix,
    polygonData,
    kmlPolygonData,
    pathData,
    kmlPointData,
    handlePathHover,
    vendorData,
    showVendorMarkerLabels,
    handleVendorClick,
    userLocation,
    organizationLocation,
    jobLocation,
    secondaryFarmPins,
  ]);
}
