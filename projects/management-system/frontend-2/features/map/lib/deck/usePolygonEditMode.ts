import { useCallback, useState } from "react";

import { toast } from "sonner";

import type { LatLng, MapLatLngClickHandler } from "../../model/types";
import { addVertex, isNearFirstVertex, undoVertex } from "../polygonEdit";

export interface UsePolygonEditModeOptions {
  vertices: LatLng[];
  readOnly: boolean;
  onChangeVertices: (vertices: LatLng[]) => void;
  onChangeLocation: (location: LatLng) => void;
}

export interface UsePolygonEditModeResult {
  isCustomPolygonMode: boolean;
  isMarkerMode: boolean;
  isPolygonClosed: boolean;
  startCustomPolygonDrawing: () => void;
  startCustomMarkerPlacement: () => void;
  clearDrawing: () => void;
  handleUndo: () => void;
  handleMapClickForEdit: MapLatLngClickHandler;
  closePolygon: () => void;
}

/**
 * Click-to-draw polygon and place-marker modes (deck.gl-native editing UX).
 * Returns true from handleMapClickForEdit when the click was consumed.
 */
export function usePolygonEditMode({
  vertices,
  readOnly,
  onChangeVertices,
  onChangeLocation,
}: UsePolygonEditModeOptions): UsePolygonEditModeResult {
  const [isCustomPolygonMode, setIsCustomPolygonMode] = useState(false);
  const [isMarkerMode, setIsMarkerMode] = useState(false);
  const [isPolygonClosed, setIsPolygonClosed] = useState(
    () => vertices.length >= 3
  );

  const closePolygon = useCallback(() => {
    if (vertices.length >= 3) {
      setIsCustomPolygonMode(false);
      setIsPolygonClosed(true);
      toast.success("Polygon closed!");
    }
  }, [vertices.length]);

  const startCustomPolygonDrawing = useCallback(() => {
    setIsCustomPolygonMode(true);
    setIsMarkerMode(false);
    setIsPolygonClosed(false);
    toast.info(
      "Click on the map to add vertices. Click the first vertex to close the polygon."
    );
  }, []);

  const startCustomMarkerPlacement = useCallback(() => {
    setIsMarkerMode(true);
    setIsCustomPolygonMode(false);
    toast.info("Click on the map to place a marker.");
  }, []);

  const clearDrawing = useCallback(() => {
    onChangeVertices([]);
    setIsCustomPolygonMode(false);
    setIsMarkerMode(false);
    setIsPolygonClosed(false);
    toast.success("Drawing cleared");
  }, [onChangeVertices]);

  const handleUndo = useCallback(() => {
    if (vertices.length > 0) {
      onChangeVertices(undoVertex(vertices));
      if (isPolygonClosed) setIsPolygonClosed(false);
      toast.success("Last vertex undone");
    } else {
      toast.error("No vertices to undo");
    }
  }, [vertices, onChangeVertices, isPolygonClosed]);

  const handleMapClickForEdit = useCallback(
    (lat: number, lng: number): boolean => {
      if (readOnly) return false;

      if (isCustomPolygonMode) {
        if (isNearFirstVertex(vertices, lat, lng)) {
          closePolygon();
          return true;
        }
        onChangeVertices(addVertex(vertices, lat, lng));
        return true;
      }

      if (isMarkerMode) {
        onChangeLocation({ lat, lng });
        setIsMarkerMode(false);
        toast.success("Marker placed!");
        return true;
      }

      return false;
    },
    [
      readOnly,
      isCustomPolygonMode,
      isMarkerMode,
      vertices,
      closePolygon,
      onChangeVertices,
      onChangeLocation,
    ]
  );

  return {
    isCustomPolygonMode,
    isMarkerMode,
    isPolygonClosed,
    startCustomPolygonDrawing,
    startCustomMarkerPlacement,
    clearDrawing,
    handleUndo,
    handleMapClickForEdit,
    closePolygon,
  };
}
