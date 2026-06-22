"use client";

import { memo, useCallback, useMemo } from "react";

import type { Layer, PickingInfo, Position } from "@deck.gl/core";
import {
  IconLayer,
  PathLayer,
  ScatterplotLayer,
  SolidPolygonLayer,
} from "@deck.gl/layers";

import { MapViewTab } from "@/constants";
import type { HoveredLine, HoveredXmlLine } from "@/shared/ui/common/map";
import type { KmlGeometry } from "@/utils/kml.utils";

import {
  type DeckKmlPointDatum,
  type DeckMarkerDatum,
  type DeckPathDatum,
  type DeckPolygonOutline,
  PIN_ICON_HEIGHT,
  PIN_ICON_WIDTH,
  type StackedGroup,
  getClusterPinIconUrl,
  useAccentHex,
  useDeckGlOverlay,
  useDeckKmlPointData,
  useDeckKmlPolygonData,
  useDeckMarkerData,
  useDeckPathData,
  useDeckPolygonData,
  useStackedPins,
} from "../lib/deck";
import type { MapLocation, MapMarkerData, MapPoint } from "../model/types";

interface DeckGlMapLayersProps {
  mapInstance: google.maps.Map | null;
  verticesToDraw: Array<Array<MapLocation>>;
  shpToDraw: Array<{ data?: Record<string, Array<MapPoint>> }>;
  xmlToDraw: Array<{
    data?: Record<
      string,
      {
        points: Array<MapPoint>;
        color?: string;
        pipe_size?: Record<string, unknown>;
      }
    >;
  }>;
  kmlGeometries: KmlGeometry[];
  filteredData: MapMarkerData[] | undefined;
  contactData: MapMarkerData[];
  activeTab: MapViewTab;
  getLegendData: (type: string) => {
    lead?: { color?: string; icon_svg?: string };
    job?: { color?: string; icon_svg?: string };
  } | null;
  userLocation: MapLocation | null;
  organizationLocation: MapLocation | null;
  onMarkerClick: (item: MapMarkerData) => void;
  onGroupClick: (group: StackedGroup) => void;
  onPathHover: (
    xmlHover: HoveredXmlLine | null,
    kmlHover: HoveredLine | null
  ) => void;
}

export const DeckGlMapLayers = memo(function DeckGlMapLayers({
  mapInstance,
  verticesToDraw,
  shpToDraw,
  xmlToDraw,
  kmlGeometries,
  filteredData,
  contactData,
  activeTab,
  getLegendData,
  userLocation,
  organizationLocation,
  onMarkerClick,
  onGroupClick,
  onPathHover,
}: DeckGlMapLayersProps) {
  const accentHex = useAccentHex();

  const polygonData = useDeckPolygonData(verticesToDraw, shpToDraw);
  const pathData = useDeckPathData(xmlToDraw, kmlGeometries);
  const { pins, circles } = useDeckMarkerData(
    filteredData,
    contactData,
    activeTab,
    getLegendData,
    userLocation,
    organizationLocation
  );
  const kmlPointData = useDeckKmlPointData(kmlGeometries);
  const kmlPolygonData = useDeckKmlPolygonData(kmlGeometries);
  const { singlePins, stackedGroups } = useStackedPins(pins);

  const showGeometry = activeTab === MapViewTab.JOBS_LEADS;

  const handlePathHover = useCallback(
    (info: PickingInfo<DeckPathDatum>) => {
      if (!info.object || (!info.object.pipeSize && !info.object.name)) {
        onPathHover(null, null);
        return;
      }

      if (info.object.sourceType === "xml" && !info.object.pipeSize) {
        onPathHover(null, null);
        return;
      }

      const datum = info.object;
      const position = { lat: datum.midpoint[1], lng: datum.midpoint[0] };

      if (datum.sourceType === "xml") {
        onPathHover(
          {
            sectionId: datum.sectionId,
            pipeSize: datum.pipeSize as HoveredXmlLine["pipeSize"],
            position,
            mapIndex: 0,
            sectionIndex: 0,
          },
          null
        );
      } else {
        onPathHover(null, {
          geometry: {
            pipe_size: datum.pipeSize,
            name: datum.name,
          } as unknown as KmlGeometry,
          position,
          index: 0,
        });
      }
    },
    [onPathHover]
  );

  const handleMarkerClick = useCallback(
    (info: PickingInfo<DeckMarkerDatum>) => {
      if (!info.object?.originalItem) return;
      const kind = info.object.markerKind;
      if (kind === "user" || kind === "org") return;
      onMarkerClick(info.object.originalItem);
    },
    [onMarkerClick]
  );

  const handleGroupClick = useCallback(
    (info: PickingInfo<StackedGroup>) => {
      if (!info.object) return;
      onGroupClick(info.object);
    },
    [onGroupClick]
  );

  const layers: Layer[] = useMemo(() => {
    const result: Layer[] = [];

    // Geometry layers only render on the Jobs/Leads tab
    if (showGeometry) {
      const { binary: polyBin, outlines: polyOutlines } = polygonData;
      const { binary: kmlBin, outlines: kmlOutlines } = kmlPolygonData;

      if (polyBin.length > 0) {
        result.push(
          new SolidPolygonLayer({
            id: "farm-shp-fills",
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
            id: "farm-shp-outlines",
            data: polyOutlines,
            getPath: (d) => d.path as unknown as Position[],
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
            id: "kml-polygon-fills",
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
            id: "kml-polygon-outlines",
            data: kmlOutlines,
            getPath: (d) => d.path as unknown as Position[],
            getColor: (d) => d.color,
            getWidth: 2,
            widthUnits: "pixels",
            widthMinPixels: 1,
            pickable: false,
          })
        );
      }

      // XML + KML paths (polylines)
      if (pathData.length > 0) {
        result.push(
          new PathLayer<DeckPathDatum>({
            id: "xml-kml-paths",
            data: pathData,
            getPath: (d) => d.path as Position[],
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

      // KML points
      if (kmlPointData.length > 0) {
        result.push(
          new ScatterplotLayer<DeckKmlPointDatum>({
            id: "kml-points",
            data: kmlPointData,
            getPosition: (d) => d.position,
            getFillColor: (d) => d.color,
            getRadius: (d) => d.radius,
            radiusUnits: "pixels",
            pickable: false,
          })
        );
      }
    }

    if (stackedGroups.length > 0) {
      result.push(
        new IconLayer<StackedGroup>({
          id: "stacked-group-pins",
          data: stackedGroups,
          getPosition: (d) => d.position,
          getIcon: (d) => ({
            url: getClusterPinIconUrl(d.items.length, accentHex),
            width: PIN_ICON_WIDTH,
            height: PIN_ICON_HEIGHT,
            anchorX: PIN_ICON_WIDTH * 0.5,
            anchorY: PIN_ICON_HEIGHT * 0.9,
          }),
          getSize: 40,
          sizeUnits: "pixels",
          pickable: true,
          onClick: handleGroupClick,
        })
      );
    }

    if (singlePins.length > 0) {
      result.push(
        new IconLayer<DeckMarkerDatum>({
          id: "pin-markers",
          data: singlePins,
          getPosition: (d) => d.position,
          getIcon: (d) => ({
            url: d.iconUrl,
            width: d.iconWidth,
            height: d.iconHeight,
            anchorX: d.iconWidth * 0.5,
            anchorY: d.iconHeight * 0.9,
          }),
          getSize: 40,
          sizeUnits: "pixels",
          pickable: true,
          onClick: handleMarkerClick,
        })
      );
    }

    if (circles.length > 0) {
      result.push(
        new ScatterplotLayer<DeckMarkerDatum>({
          id: "location-circles",
          data: circles,
          getPosition: (d) => d.position,
          getFillColor: (d) => d.color,
          getLineColor: [255, 255, 255, 255],
          getRadius: (d) => d.radius,
          radiusUnits: "pixels",
          lineWidthMinPixels: 2,
          stroked: true,
          filled: true,
          pickable: false,
        })
      );
    }

    return result;
  }, [
    showGeometry,
    polygonData,
    kmlPolygonData,
    pathData,
    kmlPointData,
    stackedGroups,
    singlePins,
    circles,
    accentHex,
    handlePathHover,
    handleMarkerClick,
    handleGroupClick,
  ]);

  useDeckGlOverlay(mapInstance, layers);

  return null;
});
