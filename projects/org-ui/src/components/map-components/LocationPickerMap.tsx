"use client";

import type { StyleSpecification } from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { PickingInfo } from "@deck.gl/core";
import { IconLayer } from "@deck.gl/layers";
import { DeckGL } from "deck.gl";
import { Input } from "../ui-components/Input";
import { MapZoomControls } from "./MapZoomControls";
import { useTheme } from "../../theme";

import type { Point } from "./LocationPicker";

const DEFAULT_LONGITUDE = -94.778657;
const DEFAULT_LATITUDE = 42.665106;
const DEFAULT_ZOOM = 12;
const MIN_ZOOM = 4;
const MAX_ZOOM = 18;
const MAX_SEARCH_RESULTS = 5;
const MIN_MAP_HEIGHT = 200;
const MAX_MAP_HEIGHT = 800;

function createPinIconUrl(accentColor: string): string {
  return (
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg width="52" height="60" viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><mask id="pin-hole-mask"><rect width="52" height="60" fill="white"/><circle cx="26" cy="22" r="6" fill="black"/></mask></defs><path mask="url(#pin-hole-mask)" d="M41.9922 21.9951C41.9922 31.9787 30.9169 42.3761 27.1978 45.5874C26.8513 45.8479 26.4296 45.9888 25.9961 45.9888C25.5626 45.9888 25.1409 45.8479 24.7944 45.5874C21.0753 42.3761 10 31.9787 10 21.9951C10 17.7527 11.6853 13.684 14.6851 10.6842C17.685 7.68432 21.7537 5.99902 25.9961 5.99902C30.2385 5.99902 34.3072 7.68432 37.307 10.6842C40.3069 13.684 41.9922 17.7527 41.9922 21.9951Z" fill="${accentColor}"/></svg>`
    )
  );
}
const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "esri-world-imagery": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
    },
    "esri-world-transportation": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
    },
    "esri-world-boundaries-and-places": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "esri-world-imagery",
      type: "raster",
      source: "esri-world-imagery",
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: "esri-world-transportation",
      type: "raster",
      source: "esri-world-transportation",
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: "esri-world-boundaries-and-places",
      type: "raster",
      source: "esri-world-boundaries-and-places",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string];
}

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

interface LocationPickerMapProps {
  location?: Point;
  onMapPick: (lng: number, lat: number) => void;
  height?: number | string;
  readOnly?: boolean;
}

function normalizeCoordinates(
  longitude?: number,
  latitude?: number
): { longitude: number; latitude: number } | null {
  if (longitude == null || latitude == null) {
    return null;
  }

  // If values appear swapped (lat out of range, lng in lat range), flip them.
  if (Math.abs(latitude) > 90 && Math.abs(longitude) <= 90) {
    return { longitude: latitude, latitude: longitude };
  }

  // Invalid pair; ignore instead of centering to a bad place.
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return null;
  }

  return { longitude, latitude };
}

function getResultZoom(result: SearchResult): number {
  const [minLat, maxLat, minLon, maxLon] = result.boundingbox.map(Number.parseFloat);
  const maxDiff = Math.max(maxLat - minLat, maxLon - minLon);
  if (maxDiff > 1) return 10;
  if (maxDiff > 0.5) return 11;
  if (maxDiff > 0.1) return 13;
  if (maxDiff > 0.05) return 14;
  return 15;
}

export function LocationPickerMap({
  location,
  onMapPick,
  height = "100%",
  readOnly = false,
}: LocationPickerMapProps) {
  const { accentColor } = useTheme();
  const normalizedCoords = normalizeCoordinates(
    location?.coordinates[0],
    location?.coordinates[1]
  );
  const latitude = normalizedCoords?.latitude;
  const longitude = normalizedCoords?.longitude;
  const [selectedPoint, setSelectedPoint] = useState<[number, number] | null>(
    longitude != null && latitude != null ? [longitude, latitude] : null
  );
  const [viewState, setViewState] = useState<ViewState>({
    longitude: longitude ?? DEFAULT_LONGITUDE,
    latitude: latitude ?? DEFAULT_LATITUDE,
    zoom: DEFAULT_ZOOM,
    pitch: 0,
    bearing: 0,
  });
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hasCenteredOnInitialLocationRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStateRef = useRef<{ startY: number; startHeight: number } | null>(
    null
  );
  const [resizedHeight, setResizedHeight] = useState<number | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const effectiveHeight = resizedHeight ?? height;
  const pinIconUrl = useMemo(
    () => createPinIconUrl(accentColor || "#d9f46e"),
    [accentColor]
  );


  useEffect(() => {
    if (latitude == null || longitude == null) {
      return;
    }
    setSelectedPoint([longitude, latitude]);
    if (!hasCenteredOnInitialLocationRef.current) {
      setViewState((prev) => ({
        ...prev,
        latitude,
        longitude,
        zoom: Math.max(prev.zoom, 14),
      }));
      hasCenteredOnInitialLocationRef.current = true;
    }
  }, [latitude, longitude]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearchError(null);
      return;
    }
    const timer = window.setTimeout(async () => {
      abortRef.current?.abort();
      const abortController = new AbortController();
      abortRef.current = abortController;
      setIsLoading(true);
      setSearchError(null);
      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q", query);
        url.searchParams.set("format", "json");
        url.searchParams.set("limit", String(MAX_SEARCH_RESULTS));
        url.searchParams.set("addressdetails", "1");
        const response = await fetch(url.toString(), {
          signal: abortController.signal,
          headers: {
            Accept: "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to search locations");
        }
        const data: SearchResult[] = await response.json();
        const limitedResults = data.slice(0, MAX_SEARCH_RESULTS);
        setResults(limitedResults);
        if (!limitedResults.length) {
          setSearchError("No results found.");
        }
      } catch (error) {
        const errorName = (error as { name?: string }).name;
        if (errorName !== "AbortError") {
          setSearchError("Search failed. Try again.");
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  const handleMapClick = useCallback(
    (info: PickingInfo) => {
      if (readOnly || !info.coordinate) {
        return;
      }
      const [lng, lat] = info.coordinate;
      setSelectedPoint([lng, lat]);
      onMapPick(lng, lat);
    },
    [onMapPick, readOnly]
  );

  const pinLayers = selectedPoint
    ? [
        new IconLayer<{ coordinates: [number, number] }>({
          id: "location-picker-pin-layer",
          data: [{ coordinates: selectedPoint }],
          pickable: false,
          getPosition: (d) => d.coordinates,
          getIcon: () => ({
            url: pinIconUrl,
            width: 52,
            height: 60,
            anchorY: 46,
          }),
          sizeScale: 1,
          getSize: () => 60,
        }),
      ]
    : [];

  const handleResultSelect = useCallback(
    (result: SearchResult) => {
      const latitudeValue = Number.parseFloat(result.lat);
      const longitudeValue = Number.parseFloat(result.lon);
      setSelectedPoint([longitudeValue, latitudeValue]);
      onMapPick(longitudeValue, latitudeValue);
      setViewState((prev) => ({
        ...prev,
        latitude: latitudeValue,
        longitude: longitudeValue,
        zoom: getResultZoom(result),
      }));
      setQuery(result.display_name);
      setSearchOpen(false);
      setResults([]);
      setSearchError(null);
    },
    [onMapPick]
  );

  const handleZoomIn = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.min(MAX_ZOOM, prev.zoom + 1),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.max(MIN_ZOOM, prev.zoom - 1),
    }));
  }, []);

  const handleResizeMove = useCallback((event: PointerEvent) => {
    const state = resizeStateRef.current;
    if (!state) return;
    const delta = event.clientY - state.startY;
    const next = Math.min(
      MAX_MAP_HEIGHT,
      Math.max(MIN_MAP_HEIGHT, state.startHeight + delta)
    );
    setResizedHeight(next);
  }, []);

  const handleResizeEnd = useCallback(() => {
    resizeStateRef.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("pointermove", handleResizeMove);
    window.removeEventListener("pointerup", handleResizeEnd);
  }, [handleResizeMove]);

  const handleResizeStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const startHeight =
        containerRef.current?.getBoundingClientRect().height ?? MIN_MAP_HEIGHT;
      resizeStateRef.current = { startY: event.clientY, startHeight };
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", handleResizeMove);
      window.addEventListener("pointerup", handleResizeEnd);
    },
    [handleResizeEnd, handleResizeMove]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handleResizeMove);
      window.removeEventListener("pointerup", handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-visible"
      style={{ height: effectiveHeight }}
    >
      <div className="border-border-subtle bg-bg-surface-elevated h-full rounded-2xl border p-0">
        <div className="relative h-full overflow-hidden rounded-2xl">
          <DeckGL
            viewState={viewState}
            onViewStateChange={(event) => {
              const next = event.viewState as ViewState;
              if (next.zoom < MIN_ZOOM) next.zoom = MIN_ZOOM;
              if (next.zoom > MAX_ZOOM) next.zoom = MAX_ZOOM;
              setViewState(next);
            }}
            controller={{ doubleClickZoom: false }}
            layers={pinLayers}
            onClick={handleMapClick}
            getCursor={() => (readOnly ? "default" : "crosshair")}
            style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: "1rem" }}
          >
            <Map
              mapStyle={SATELLITE_STYLE}
              style={{ width: "100%", height: "100%" }}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              attributionControl={false}
              reuseMaps={false}
              onLoad={(event) => {
                const map = event.target;
                if (map.areTilesLoaded()) {
                  setIsMapLoaded(true);
                  return;
                }
                map.once("idle", () => setIsMapLoaded(true));
              }}
            />
          </DeckGL>
          {!isMapLoaded ? (
            <div className="bg-bg-surface-elevated pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl">
              <div className="location-picker-map-shimmer absolute inset-0" />
            </div>
          ) : null}
        </div>
      </div>

      {!readOnly ? (
        <div ref={searchRef} className="absolute left-3 top-3 z-20 w-[min(420px,calc(100%-24px))]" onKeyDown={(event) => event.stopPropagation()}>
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search location..."
          className="w-full"
        />
        {searchOpen && (query.trim() || searchError) ? (
          <div className="border-border-subtle bg-bg-surface-elevated mt-2 rounded-lg border shadow-xl">
            {isLoading ? <div className="text-text-muted px-3 py-2 text-sm">Searching...</div> : null}
            {!isLoading && searchError ? <div className="text-text-secondary px-3 py-2 text-sm">{searchError}</div> : null}
            {!isLoading && !searchError && results.length ? (
              <ul className="max-h-[250px] overflow-y-auto py-1">
                {results.map((result) => (
                  <li key={result.place_id}>
                    <button
                      type="button"
                      onClick={() => handleResultSelect(result)}
                      className="text-text-secondary hover:bg-bg-hover block w-full px-3 py-2 text-left text-sm transition-colors"
                    >
                      <span className="line-clamp-2">{result.display_name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
      ) : null}
      <MapZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize map"
        onPointerDown={handleResizeStart}
        className="group absolute inset-x-0 bottom-0 z-20 flex h-4 translate-y-1/2 cursor-ns-resize items-center justify-center"
      >
        <div className="bg-bg-surface-elevated border-border-subtle flex h-2.5 w-12 items-center justify-center rounded-full border shadow-md transition-colors group-hover:border-text-muted">
          <div className="bg-text-muted h-0.5 w-6 rounded-full" />
        </div>
      </div>
    </div>
  );
}

