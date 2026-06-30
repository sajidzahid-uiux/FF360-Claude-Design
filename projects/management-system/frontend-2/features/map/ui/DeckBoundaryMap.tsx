"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button, ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";
import { GoogleMap } from "@react-google-maps/api";
import { Crosshair } from "lucide-react";
import { toast } from "sonner";

import {
  adaptKmlMapsGeometries,
  adaptShpMapsToDraw,
  adaptXmlMapsToDraw,
  useMapCursorCoordinates,
} from "@/features/map/lib";
import { CorePointMarkers } from "@/features/order-pipe/order-pipe-wizard/components/CorePointMarkers";
import { useGoogleMapsApi } from "@/providers";
import { useModalStack } from "@/shared/model/use-modal-stack";
import type { MapPinItem } from "@/shared/ui/common/BoundaryMap";
import type {
  BoundaryMapRef,
  CorePoint,
  HoveredLine,
  HoveredXmlLine,
  VendorMarker,
} from "@/shared/ui/common/map";
import { KmlLineHoverPopup, XmlLineHoverPopup } from "@/shared/ui/common/map";

import {
  useDeckEditLayers,
  useDeckGeometryLayers,
  useDeckGlOverlay,
  useDeckMapPinsLayer,
  useDeckMapRef,
  usePolygonEditMode,
} from "../lib/deck";
import type {
  FarmSelectorItem,
  LatLng,
  MapLatLngAsyncHandler,
  MapLatLngHandler,
} from "../model/types";
import { DeckCorePointFormPanel } from "./DeckCorePointFormPanel";
import { DeckCorePointInfoDialog } from "./DeckCorePointInfoDialog";
import { DeckMapChrome, DeckMapFloatingControls } from "./DeckMapChrome";
import { DeckMapPinInfoDialog } from "./DeckMapPinInfoDialog";
import { FarmSelectorButton } from "./FarmSelectorButton";
import { MapLocationAddMethodDialog } from "./MapLocationAddMethodDialog";
import { MapLocationManualEntryDialog } from "./MapLocationManualEntryDialog";
import { CursorCoordinates } from "./shared/CursorCoordinates";
import { MapDeleteConfirmDialog } from "./shared/MapDeleteConfirmDialog";

export interface DeckBoundaryMapProps {
  vertices?: LatLng[];
  location?: LatLng;
  onChangeVertices?: (vertices: LatLng[]) => void;
  onChangeLocation?: (location: LatLng) => void;
  shpmap?: { data?: unknown };
  xmlmap?: { data?: unknown };
  kmlmap?: { data?: unknown };
  shpmaps?: Array<{ data?: unknown }>;
  xmlmaps?: Array<{ data?: unknown }>;
  kmlmaps?: Array<{ data?: unknown }>;
  className?: string;
  mapHeight?: string | number;
  hideSearch?: boolean;
  hideActionMenu?: boolean;
  /** Suppresses the built-in top-right floating controls (undo / open-in-maps)
   * so a consumer can own that corner with its own overlay. */
  hideFloatingControls?: boolean;
  readOnly?: boolean;
  triggerCenterOnUserLocation?: boolean;
  userLocation?: LatLng | null;
  organizationLocation?: LatLng | null;
  showCorePoints?: boolean;
  corePoints?: CorePoint[];
  onCoreSubmit?: (corePoint: CorePoint) => void;
  onCoreDelete?: (coreId: number) => void;
  canEditCorePoints?: boolean;
  children?: React.ReactNode;
  vendorMarkers?: VendorMarker[];
  selectedVendorId?: number;
  favoriteVendorIds?: number[];
  onVendorMarkerClick?: (marker: VendorMarker) => void;
  showVendorMarkerLabels?: boolean;
  onMapClick?: MapLatLngHandler;
  onUserLocationChange?: (location: LatLng | null) => void;
  mapPins?: MapPinItem[];
  isPinMode?: boolean;
  onPinAdd?: MapLatLngHandler;
  onPinDelete?: (pinId: number) => void;
  vertexRings?: Array<LatLng[]>;
  primaryRingIndex?: number;
  secondaryFarmPins?: LatLng[];
  farmSelectorItems?: FarmSelectorItem[];
}

const US_CENTER = { lat: 39.8283, lng: -98.5795 };

export const DeckBoundaryMap = forwardRef<BoundaryMapRef, DeckBoundaryMapProps>(
  function DeckBoundaryMapInner(
    {
      vertices = [],
      location,
      onChangeVertices = () => {},
      onChangeLocation = () => {},
      shpmap,
      xmlmap,
      kmlmap,
      shpmaps,
      xmlmaps,
      kmlmaps,
      className = "",
      mapHeight = "500px",
      hideSearch = false,
      hideActionMenu = false,
      hideFloatingControls = false,
      readOnly = false,
      triggerCenterOnUserLocation = false,
      userLocation: propUserLocation,
      organizationLocation = null,
      showCorePoints = false,
      corePoints = [],
      onCoreSubmit,
      onCoreDelete,
      canEditCorePoints = true,
      children,
      vendorMarkers = [],
      selectedVendorId,
      favoriteVendorIds,
      onVendorMarkerClick,
      showVendorMarkerLabels = false,
      onMapClick,
      onUserLocationChange,
      mapPins = [],
      isPinMode = false,
      onPinAdd,
      onPinDelete,
      vertexRings = [],
      primaryRingIndex,
      secondaryFarmPins = [],
      farmSelectorItems = [],
    },
    ref
  ) {
    const { isLoaded } = useGoogleMapsApi();
    const { stack, openModal, closeModalKey } = useModalStack();

    const mapRef = useRef<google.maps.Map | null>(null);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(
      null
    );
    const hasInitialFocusDone = useRef(false);
    const initialCenterRef = useRef<LatLng>(location ?? US_CENTER);

    const [internalUserLoc, setInternalUserLoc] = useState<LatLng | null>(null);
    const [hoveredXmlLine, setHoveredXmlLine] = useState<HoveredXmlLine | null>(
      null
    );
    const [hoveredKmlLine, setHoveredKmlLine] = useState<HoveredLine | null>(
      null
    );
    const {
      coordinates: cursorCoordinates,
      handleMouseMove,
      handleMouseOut,
    } = useMapCursorCoordinates();

    const [isCorePointMode, setIsCorePointMode] = useState(false);
    const [showCorePointForm, setShowCorePointForm] = useState(false);
    const [pendingCorePoint, setPendingCorePoint] = useState<LatLng | null>(
      null
    );
    const [corePointDescription, setCorePointDescription] = useState("");
    const [editingCorePoint, setEditingCorePoint] = useState<CorePoint | null>(
      null
    );
    const [selectedCorePoint, setSelectedCorePoint] =
      useState<CorePoint | null>(null);
    const showCorePointInfo = stack.some((f) => f.key === "view-core-point");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isCoreLocationMethodDialogOpen, setIsCoreLocationMethodDialogOpen] =
      useState(false);
    const [isCoreLocationManualDialogOpen, setIsCoreLocationManualDialogOpen] =
      useState(false);

    const [selectedPin, setSelectedPin] = useState<MapPinItem | null>(null);
    const showPinInfo = stack.some((f) => f.key === "view-map-pin");
    const [showPinDeleteConfirm, setShowPinDeleteConfirm] = useState(false);

    const normalizedVertices = useMemo(
      () =>
        vertices.map((v) => ({
          lat: Number(v.lat),
          lng: Number(v.lng),
        })),
      [vertices]
    );

    const polygonEdit = usePolygonEditMode({
      vertices: normalizedVertices,
      readOnly,
      onChangeVertices,
      onChangeLocation,
    });

    useEffect(() => {
      if (propUserLocation !== undefined) return;
      if (!navigator.geolocation) return;

      const geoOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      };

      const handleSuccess = (position: GeolocationPosition) => {
        setInternalUserLoc({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      };

      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        () => {},
        geoOptions
      );

      const id = navigator.geolocation.watchPosition(
        handleSuccess,
        () => setInternalUserLoc(null),
        geoOptions
      );
      return () => navigator.geolocation.clearWatch(id);
    }, [propUserLocation]);

    const effectiveUserLocation =
      propUserLocation !== undefined ? propUserLocation : internalUserLoc;

    useEffect(() => {
      onUserLocationChange?.(effectiveUserLocation ?? null);
    }, [effectiveUserLocation, onUserLocationChange]);

    const verticesToDraw = useMemo(() => {
      if (vertexRings.length > 0) return vertexRings;
      return normalizedVertices.length > 0 ? [normalizedVertices] : [];
    }, [vertexRings, normalizedVertices]);

    const shpToDraw = useMemo(() => {
      const maps = shpmaps ?? (shpmap ? [shpmap] : []);
      return adaptShpMapsToDraw(maps);
    }, [shpmap, shpmaps]);
    const xmlToDraw = useMemo(() => {
      const maps = xmlmaps ?? (xmlmap ? [xmlmap] : []);
      return adaptXmlMapsToDraw(maps);
    }, [xmlmap, xmlmaps]);
    const kmlGeometries = useMemo(() => {
      const maps = kmlmaps ?? (kmlmap ? [kmlmap] : []);
      return adaptKmlMapsGeometries(maps);
    }, [kmlmap, kmlmaps]);

    const handlePathHover = useCallback(
      (xmlHover: HoveredXmlLine | null, kmlHover: HoveredLine | null) => {
        setHoveredXmlLine(xmlHover);
        setHoveredKmlLine(kmlHover);
      },
      []
    );

    const geometryLayers = useDeckGeometryLayers({
      layerIdPrefix: "boundary",
      verticesToDraw: readOnly ? verticesToDraw : [],
      shpToDraw,
      xmlToDraw,
      kmlGeometries,
      onPathHover: handlePathHover,
      vendorMarkers,
      secondaryFarmPins,
      primaryRingIndex,
      selectedVendorId,
      favoriteVendorIds,
      showVendorMarkerLabels,
      onVendorMarkerClick,
      jobLocation: readOnly ? location : undefined,
      userLocation: effectiveUserLocation,
      organizationLocation,
    });

    const editLayers = useDeckEditLayers({
      vertices: readOnly ? [] : normalizedVertices,
      location: readOnly ? undefined : location,
      isCustomPolygonMode: polygonEdit.isCustomPolygonMode,
      isPolygonClosed: polygonEdit.isPolygonClosed,
      onClosePolygon: polygonEdit.closePolygon,
    });

    const pinLayers = useDeckMapPinsLayer({
      mapPins,
      onPinClick: (pin) => {
        setSelectedPin(pin);
        if (pin.id != null) {
          openModal("view-map-pin", { id: String(pin.id) });
        }
      },
    });

    const allLayers = useMemo(
      () => [...geometryLayers, ...editLayers, ...pinLayers],
      [geometryLayers, editLayers, pinLayers]
    );

    useDeckGlOverlay(mapInstance, allLayers);

    // The info dialogs are URL-driven: derive the entity to show from the
    // frame id (look it up in the live list), falling back to the entity
    // captured on click for flows that opened it imperatively.
    const corePointFrame = stack.find((f) => f.key === "view-core-point");
    const infoCorePoint = useMemo<CorePoint | null>(() => {
      const id = corePointFrame?.params.id;
      if (id == null) return null;
      return (
        corePoints.find((c) => String(c.id) === id) ?? selectedCorePoint ?? null
      );
    }, [corePointFrame, corePoints, selectedCorePoint]);

    const pinFrame = stack.find((f) => f.key === "view-map-pin");
    const infoPin = useMemo<MapPinItem | null>(() => {
      const id = pinFrame?.params.id;
      if (id == null) return null;
      return (
        mapPins.find((p) => String(p.id) === id) ?? selectedPin ?? null
      );
    }, [pinFrame, mapPins, selectedPin]);

    const startCorePointMode = useCallback(() => {
      setIsCorePointMode(true);
      toast.info("Click on the map to place a core point.");
    }, []);

    const cancelCorePointMode = useCallback(() => {
      setIsCorePointMode(false);
    }, []);

    const applyCorePointCoordinates = useCallback(
      (location: LatLng, resetDetails = false) => {
        setIsCorePointMode(false);
        setPendingCorePoint(location);
        if (resetDetails) {
          setCorePointDescription("");
          setEditingCorePoint(null);
        }
        setShowCorePointForm(true);
      },
      []
    );

    const prepareCorePointAtLocation = useCallback<MapLatLngHandler>(
      (lat, lng) => {
        applyCorePointCoordinates({ lat, lng }, !editingCorePoint);
      },
      [applyCorePointCoordinates, editingCorePoint]
    );

    useDeckMapRef(ref, {
      mapRef,
      userLocation: effectiveUserLocation,
      organizationLocation,
      isCorePointMode: () => isCorePointMode,
      startCorePointMode,
      cancelCorePointMode,
      prepareCorePointAtLocation,
    });

    useEffect(() => {
      if (
        triggerCenterOnUserLocation &&
        effectiveUserLocation &&
        mapRef.current
      ) {
        mapRef.current.panTo(effectiveUserLocation);
        mapRef.current.setZoom(15);
      }
    }, [triggerCenterOnUserLocation, effectiveUserLocation]);

    const focusOnFarmOrLocation = useCallback(() => {
      if (!mapRef.current) return;

      const rings =
        vertexRings.length > 0
          ? vertexRings
          : normalizedVertices.length >= 3
            ? [normalizedVertices]
            : [];

      const hasRing = rings.some((ring) => ring.length >= 3);
      if (hasRing) {
        const bounds = new google.maps.LatLngBounds();
        for (const ring of rings) {
          for (const v of ring) {
            bounds.extend(v);
          }
        }
        mapRef.current.fitBounds(bounds, 40);
      } else if (location) {
        mapRef.current.panTo(location);
        mapRef.current.setZoom(15);
      }
    }, [normalizedVertices, vertexRings, location]);

    useEffect(() => {
      if (!mapInstance || hasInitialFocusDone.current) return;
      hasInitialFocusDone.current = true;
      focusOnFarmOrLocation();
      // One-time focus when the map mounts; do not refocus when vertices/location load later.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapInstance]);

    const handleMapClick = useCallback(
      (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        if (onMapClick) {
          onMapClick(lat, lng);
          return;
        }

        if (isPinMode) {
          onPinAdd?.(lat, lng);
          return;
        }

        if (isCorePointMode) {
          setPendingCorePoint({ lat, lng });
          if (!editingCorePoint) {
            setCorePointDescription("");
            setEditingCorePoint(null);
          }
          setShowCorePointForm(true);
          return;
        }

        polygonEdit.handleMapClickForEdit(lat, lng);
      },
      [
        onMapClick,
        isPinMode,
        onPinAdd,
        isCorePointMode,
        editingCorePoint,
        polygonEdit,
      ]
    );

    const handleCorePointFormCancel = useCallback(() => {
      setShowCorePointForm(false);
      setPendingCorePoint(null);
      setEditingCorePoint(null);
      setCorePointDescription("");
      setIsCorePointMode(false);
    }, []);

    const handleCoreLocationMapSelection = useCallback(() => {
      setShowCorePointForm(false);
      setIsCorePointMode(true);
      toast.info("Click on the map to place a core point.");
    }, []);

    const handleCoreLocationManualOpen = useCallback(() => {
      setIsCoreLocationManualDialogOpen(true);
    }, []);

    const handleCoreLocationManualSubmit = useCallback<MapLatLngAsyncHandler>(
      async (lat, lng) => {
        const location: LatLng = { lat, lng };
        applyCorePointCoordinates(location, false);
        mapRef.current?.panTo(location);
        mapRef.current?.setZoom(15);
      },
      [applyCorePointCoordinates]
    );

    const handleCoreLocationMyLocation = useCallback(() => {
      if (!effectiveUserLocation) return;
      applyCorePointCoordinates(effectiveUserLocation, false);
      mapRef.current?.panTo(effectiveUserLocation);
      mapRef.current?.setZoom(15);
    }, [applyCorePointCoordinates, effectiveUserLocation]);

    const handleCorePointFormSave = useCallback(() => {
      if (!pendingCorePoint || !onCoreSubmit) {
        return;
      }

      if (editingCorePoint?.id) {
        onCoreSubmit({
          id: editingCorePoint.id,
          name: editingCorePoint.name,
          description: corePointDescription.trim() || undefined,
          latitude: pendingCorePoint.lat,
          longitude: pendingCorePoint.lng,
        });
      } else {
        onCoreSubmit({
          description: corePointDescription.trim() || undefined,
          latitude: pendingCorePoint.lat,
          longitude: pendingCorePoint.lng,
        });
      }
      handleCorePointFormCancel();
    }, [
      pendingCorePoint,
      corePointDescription,
      editingCorePoint,
      onCoreSubmit,
      handleCorePointFormCancel,
    ]);

    const handleCorePointClick = useCallback(
      (corePoint: CorePoint) => {
        setSelectedCorePoint(corePoint);
        if (corePoint.id != null) {
          openModal("view-core-point", { id: String(corePoint.id) });
        }
      },
      [openModal]
    );

    const handleCorePointChangeLocation = useCallback(() => {
      if (!selectedCorePoint || !canEditCorePoints) return;
      setEditingCorePoint(selectedCorePoint);
      setCorePointDescription(selectedCorePoint.description || "");
      setPendingCorePoint({
        lat: selectedCorePoint.latitude,
        lng: selectedCorePoint.longitude,
      });
      closeModalKey("view-core-point");
      setIsCoreLocationMethodDialogOpen(true);
    }, [canEditCorePoints, selectedCorePoint, closeModalKey]);

    const handleCorePointDeleteRequest = useCallback(() => {
      closeModalKey("view-core-point");
      setShowDeleteConfirm(true);
    }, [closeModalKey]);

    const handleCorePointDeleteConfirm = useCallback(() => {
      if (selectedCorePoint?.id && onCoreDelete) {
        onCoreDelete(selectedCorePoint.id);
      }
      setShowDeleteConfirm(false);
      closeModalKey("view-core-point");
      setSelectedCorePoint(null);
    }, [selectedCorePoint, onCoreDelete, closeModalKey]);

    const handlePinDeleteRequest = useCallback(() => {
      closeModalKey("view-map-pin");
      setShowPinDeleteConfirm(true);
    }, [closeModalKey]);

    const handlePinDeleteConfirm = useCallback(() => {
      if (selectedPin?.id != null) onPinDelete?.(selectedPin.id);
      setShowPinDeleteConfirm(false);
      setSelectedPin(null);
    }, [selectedPin, onPinDelete]);

    const onMapLoad = useCallback((map: google.maps.Map) => {
      mapRef.current = map;
      map.setMapTypeId("hybrid");
      setMapInstance(map);
    }, []);

    const containerStyle = useMemo(
      () => ({ width: "100%", height: mapHeight }),
      [mapHeight]
    );

    if (!isLoaded) {
      return (
        <div
          className="flex items-center justify-center"
          style={{ height: mapHeight }}
        >
          <Loader centerInContainer={false} size={ComponentSizeEnum.MD} />
        </div>
      );
    }

    return (
      <div className={`relative ${className}`}>
        <DeckMapChrome
          hasLocation={!!location}
          hideActionMenu={hideActionMenu}
          hideSearch={hideSearch}
          isCustomPolygonMode={polygonEdit.isCustomPolygonMode}
          isMarkerMode={polygonEdit.isMarkerMode}
          mapRef={mapRef}
          readOnly={readOnly}
          verticesCount={normalizedVertices.length}
          onChangeLocation={onChangeLocation}
          onClear={polygonEdit.clearDrawing}
          onStartMarker={polygonEdit.startCustomMarkerPlacement}
          onStartPolygon={polygonEdit.startCustomPolygonDrawing}
        />

        <div
          className={`relative ${isCorePointMode || isPinMode ? "cursor-crosshair" : ""}`}
        >
          {farmSelectorItems.length > 0 ? (
            <FarmSelectorButton farms={farmSelectorItems} mapRef={mapRef} />
          ) : (
            <div className="absolute top-2 left-2 z-[1]">
              <Button
                iconOnly
                aria-label="Focus on farm boundary or location"
                leftIcon={<Crosshair aria-hidden className="h-4 w-4" />}
                onClick={focusOnFarmOrLocation}
              />
            </div>
          )}

          {hideFloatingControls ? null : (
            <DeckMapFloatingControls
              openInMapsLocation={location}
              readOnly={readOnly}
              verticesCount={normalizedVertices.length}
              onUndo={polygonEdit.handleUndo}
            />
          )}

          <GoogleMap
            center={initialCenterRef.current}
            mapContainerStyle={containerStyle}
            options={{
              mapTypeId: "hybrid",
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              zoomControl: true,
              draggableCursor:
                isCorePointMode || isPinMode ? "crosshair" : undefined,
            }}
            zoom={15}
            onClick={handleMapClick}
            onLoad={onMapLoad}
            onMouseMove={(e) => {
              if (e.latLng) {
                handleMouseMove({
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng(),
                });
              }
            }}
            onMouseOut={handleMouseOut}
          >
            {hoveredKmlLine &&
              (hoveredKmlLine.geometry?.pipe_size ||
                hoveredKmlLine.geometry?.name) && (
                <KmlLineHoverPopup
                  hovered={hoveredKmlLine}
                  onClose={() => setHoveredKmlLine(null)}
                />
              )}
            {hoveredXmlLine && hoveredXmlLine.pipeSize && (
              <XmlLineHoverPopup
                hovered={hoveredXmlLine}
                onClose={() => setHoveredXmlLine(null)}
              />
            )}
            <CorePointMarkers
              corePoints={corePoints}
              showCorePoints={showCorePoints}
              onCorePointClick={handleCorePointClick}
            />
            {children}
          </GoogleMap>

          <CursorCoordinates coordinates={cursorCoordinates} />

          <DeckCorePointFormPanel
            description={corePointDescription}
            isEditing={!!editingCorePoint}
            open={showCorePointForm && !!pendingCorePoint}
            onCancel={handleCorePointFormCancel}
            onDescriptionChange={setCorePointDescription}
            onSave={handleCorePointFormSave}
          />
        </div>

        <DeckCorePointInfoDialog
          canDelete={!!onCoreDelete && canEditCorePoints}
          canEdit={canEditCorePoints}
          corePoint={infoCorePoint}
          open={showCorePointInfo}
          onChangeLocation={handleCorePointChangeLocation}
          onOpenChange={(o) => {
            if (!o) closeModalKey("view-core-point");
          }}
          onRequestDelete={handleCorePointDeleteRequest}
        />

        <MapDeleteConfirmDialog
          itemName={selectedCorePoint?.name}
          open={showDeleteConfirm}
          title="Delete Core Point"
          onConfirm={handleCorePointDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        />

        <DeckMapPinInfoDialog
          canDelete={!!onPinDelete}
          open={showPinInfo}
          pin={infoPin}
          onOpenChange={(o) => {
            if (!o) closeModalKey("view-map-pin");
          }}
          onRequestDelete={handlePinDeleteRequest}
        />

        <MapDeleteConfirmDialog
          itemName={selectedPin?.name}
          open={showPinDeleteConfirm}
          title="Delete Pin"
          onConfirm={handlePinDeleteConfirm}
          onOpenChange={setShowPinDeleteConfirm}
        />

        <MapLocationAddMethodDialog
          description="Choose how you want to update the core point location."
          manualEntryLabel="Enter coordinates manually"
          mapSelectionLabel="Select on map"
          myLocationLabel="Use current location"
          myLocationVisibility="always"
          open={isCoreLocationMethodDialogOpen}
          title="Change core point location"
          userLocationAvailable={effectiveUserLocation != null}
          onChooseManual={handleCoreLocationManualOpen}
          onChooseMapClick={handleCoreLocationMapSelection}
          onChooseMyLocation={handleCoreLocationMyLocation}
          onOpenChange={setIsCoreLocationMethodDialogOpen}
        />

        <MapLocationManualEntryDialog
          description="Enter the latitude and longitude for this core point."
          initialLatitude={pendingCorePoint?.lat.toString() ?? ""}
          initialLongitude={pendingCorePoint?.lng.toString() ?? ""}
          open={isCoreLocationManualDialogOpen}
          submitLabel="Update location"
          title="Enter core point coordinates"
          onOpenChange={setIsCoreLocationManualDialogOpen}
          onSubmit={handleCoreLocationManualSubmit}
        />
      </div>
    );
  }
);

DeckBoundaryMap.displayName = "DeckBoundaryMap";
