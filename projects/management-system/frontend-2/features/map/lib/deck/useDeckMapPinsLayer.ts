import { useCallback, useMemo } from "react";

import type { Layer, PickingInfo } from "@deck.gl/core";
import { IconLayer } from "@deck.gl/layers";

import type { MapPinItem } from "@/features/map/model/mapPinItem";
import { DEFAULT_PIN_CATEGORY_COLOR } from "@/features/pin-categories/lib/pinCategoryColors";

import type { MapPoint } from "../../model/types";
import { buildDeckCirclePinIcon } from "./deckPinIcons";

const PIN_ICON_SIZE = 36;

interface MapPinDatum {
  id: number;
  position: MapPoint;
  pin: MapPinItem;
}

export interface UseDeckMapPinsLayerOptions {
  mapPins: MapPinItem[];
  onPinClick?: (pin: MapPinItem) => void;
}

export function useDeckMapPinsLayer({
  mapPins,
  onPinClick,
}: UseDeckMapPinsLayerOptions): Layer[] {
  const data = useMemo<MapPinDatum[]>(
    () =>
      mapPins.map((pin) => ({
        id: pin.id,
        position: [pin.longitude, pin.latitude] as MapPoint,
        pin,
      })),
    [mapPins]
  );

  const handleClick = useCallback(
    (info: PickingInfo<MapPinDatum>) => {
      if (info.object) onPinClick?.(info.object.pin);
    },
    [onPinClick]
  );

  return useMemo(() => {
    if (data.length === 0) return [];
    return [
      new IconLayer<MapPinDatum>({
        id: "deck-map-pins",
        data,
        getPosition: (d) => d.position,
        getIcon: (d) =>
          buildDeckCirclePinIcon(
            d.pin.categoryColor || DEFAULT_PIN_CATEGORY_COLOR
          ),
        getSize: PIN_ICON_SIZE,
        sizeScale: 1,
        sizeUnits: "pixels",
        pickable: !!onPinClick,
        onClick: handleClick,
      }),
    ];
  }, [data, onPinClick, handleClick]);
}
