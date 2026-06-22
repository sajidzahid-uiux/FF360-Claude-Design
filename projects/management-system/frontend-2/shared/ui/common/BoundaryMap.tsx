"use client";
import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import {
  GoogleMap,
  Marker,
  MarkerF,
  OverlayView,
  Polygon,
  Polyline,
} from "@react-google-maps/api";
import {
  ArrowRight,
  Crosshair,
  ExternalLink,
  MapPin,
  SquarePen,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type {
  GeoLatLng,
  GeoLatLngHandler,
  GeoLatLngNullable,
  VertexRings,
} from "@/api/types/geo";
import {
  FARM_BOUNDARY_FILL_HEX,
  FARM_BOUNDARY_FILL_OPACITY,
  FARM_BOUNDARY_STROKE_HEX,
  FARM_BOUNDARY_STROKE_OPACITY,
  SHP_FILL_HEX,
  SHP_FILL_OPACITY,
  SHP_STROKE_HEX,
  SHP_STROKE_OPACITY,
} from "@/constants/mapPolygonColors";
import { transformVertices } from "@/features/job-lead/ui/show-more-card/utils/vertexTransform";
import { useAccentHex } from "@/features/map/lib/deck";
import type { MapPinItem } from "@/features/map/model/mapPinItem";
import type { FarmSelectorItem } from "@/features/map/model/types";
import { FarmSelectorButton } from "@/features/map/ui";
import {
  CorePointInfoModal,
  DeleteCorePointConfirmModal,
  DeletePinConfirmModal,
  PinInfoModal,
} from "@/features/map/ui/boundary-map/modals";
import { useShortenGoogleUrl } from "@/hooks";
import type {
  GoogleDrawingManager,
  GooglePlacePrediction,
  GooglePlaceResult,
  GooglePlacesServiceStatus,
} from "@/shared/lib";
import {
  Label,
  SanitizedInput,
  SanitizedTextarea,
} from "@/shared/ui/primitives";
import { type KmlGeometry, parseBackendKml } from "@/utils/kml.utils";

import { type HoveredLine, KmlGeometriesLayer } from "./KmlGeometriesLayer";
import { KmlLineHoverPopup } from "./KmlLineHoverPopup";
import { KmlStatus } from "./KmlStatus";
import { XmlGeometriesLayer, type XmlMapData } from "./XmlGeometriesLayer";
import { type HoveredXmlLine, XmlLineHoverPopup } from "./XmlLineHoverPopup";

// Make sure you have NEXT_PUBLIC_GOOGLE_MAPS_API_KEY set in your .env file

interface ShpMapData {
  id: number;
  file: string;
  data: {
    [key: string]: [number, number][];
  };
}

// XmlMapData is now imported from XmlGeometriesLayer

interface KmlMapData {
  id: number;
  file: string;
  data?: unknown; // KML data structure (can be parsed from KML file)
}

type Prediction = GooglePlacePrediction;

export interface CorePoint {
  id?: number;
  name?: string;
  description?: string;
  latitude: number;
  longitude: number;
}

export type { MapPinItem } from "@/features/map/model/mapPinItem";

export type VendorMarkerType = "exact" | "approximate";

export interface VendorMarker {
  id: number;
  lat: number;
  long: number;
  name: string;
  /** Default "exact". Use "approximate" for state-only locations. */
  markerType?: VendorMarkerType;
}

interface BoundaryMapProps {
  vertices?: GeoLatLng[];
  location?: GeoLatLng;
  onChangeVertices: (vertices: GeoLatLng[]) => void;
  onChangeLocation: (location: GeoLatLng) => void;
  shpmap?: ShpMapData;
  xmlmap?: XmlMapData;
  kmlmap?: KmlMapData;
  className?: string;
  /** Height of the Google Map canvas (default 500px). Search/controls are additional. */
  mapHeight?: string | number;
  hideSearch?: boolean;
  hideActionMenu?: boolean;
  readOnly?: boolean;
  triggerCenterOnUserLocation?: boolean;
  userLocation?: GeoLatLngNullable;
  organizationLocation?: GeoLatLngNullable;
  showCorePoints?: boolean;
  corePoints?: CorePoint[];
  onCoreSubmit?: (corePoint: CorePoint) => void;
  onCoreDelete?: (coreId: number) => void;
  canEditCorePoints?: boolean;
  children?: React.ReactNode;
  vendorMarkers?: VendorMarker[];
  selectedVendorId?: number;
  /** When set, markers whose id is in this list are shown golden (e.g. favorite vendors). */
  favoriteVendorIds?: number[];
  /** When true, only favorite markers are golden; selected (but not favorited) stays default color. Use on Favorite Vendors page. */
  goldenOnlyWhenFavorite?: boolean;
  onVendorMarkerClick?: (marker: VendorMarker) => void;
  /** When set, map clicks call this with lat/lng (e.g. for adding delivery pins). */
  onMapClick?: GeoLatLngHandler;
  /** When true, show each vendor marker's name as a label above the pin (e.g. "Location 1"). */
  showVendorMarkerLabels?: boolean;
  showLocationWithVendorMarkers?: boolean;
  /** Called when the map’s user location (internal or prop) changes. Use for e.g. enabling "My Location" button. */
  onUserLocationChange?: (location: GeoLatLngNullable) => void;
  mapPins?: MapPinItem[];
  isPinMode?: boolean;
  onPinAdd?: GeoLatLngHandler;
  onPinDelete?: (pinId: number) => void;
  vertexRings?: VertexRings;
  primaryRingIndex?: number;
  secondaryFarmPins?: GeoLatLng[];
  farmSelectorItems?: FarmSelectorItem[];
}

export interface BoundaryMapRef {
  centerOnShpMap: (shpmap: ShpMapData) => void;
  centerOnXmlMap: (xmlmap: XmlMapData) => void;
  centerOnKmlMap: (kmlmap: KmlMapData) => void;
  centerOnUserLocation: () => void;
  centerOnOrganizationLocation: () => void;
  centerOnLocation: GeoLatLngHandler;
  startCorePointMode: () => void;
  cancelCorePointMode: () => void;
  isCorePointMode: () => boolean;
  prepareCorePointAtLocation: GeoLatLngHandler;
}

const defaultCenter = { lat: 39.8283, lng: -98.5795 };

const getPinSvgUrl = (pinName: string): string => {
  const num = pinName.replace(/^Pin\s*/i, "");
  return `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="%2310b981" stroke="%23fff" stroke-width="1.5"/><text x="14" y="14" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="bold" fill="%23fff" font-family="Arial,sans-serif">${num}</text></svg>`;
};

const BoundaryMap = forwardRef<BoundaryMapRef, BoundaryMapProps>(
  (
    {
      vertices = [],
      location,
      onChangeVertices,
      onChangeLocation,
      shpmap,
      xmlmap,
      kmlmap,
      className = "",
      mapHeight = "500px",
      hideSearch = false,
      hideActionMenu = false,
      readOnly = false,
      triggerCenterOnUserLocation = false,
      userLocation: propUserLocation = null,
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
      goldenOnlyWhenFavorite = false,
      onVendorMarkerClick,
      onMapClick,
      showVendorMarkerLabels = false,
      showLocationWithVendorMarkers = false,
      onUserLocationChange,
      mapPins = [],
      isPinMode = false,
      onPinAdd,
      onPinDelete,
      vertexRings,
      primaryRingIndex,
      secondaryFarmPins = [],
      farmSelectorItems = [],
    },
    ref
  ) => {
    const accentHex = useAccentHex();

    // Normalize vertices so we support both [lng, lat][] and { lat, lng }[] (e.g. old farm data)
    const normalizedVertices = useMemo(
      () => transformVertices(Array.isArray(vertices) ? vertices : []),
      [vertices]
    );

    const [googleMapLink, setGoogleMapLink] = useState("");
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isDrawingManagerReady, setIsDrawingManagerReady] = useState(false);
    const [drawingManagerRetryCount, setDrawingManagerRetryCount] = useState(0);
    const [drawingManagerError, setDrawingManagerError] = useState<
      string | null
    >(null);

    // Custom drawing state
    const [isCustomPolygonMode, setIsCustomPolygonMode] = useState(false);
    const [isMarkerMode, setIsMarkerMode] = useState(false);
    const [isPolygonClosed, setIsPolygonClosed] = useState(false);

    // Core point state
    const [isCorePointMode, setIsCorePointMode] = useState(false);
    const [pendingCorePoint, setPendingCorePoint] = useState<GeoLatLng | null>(
      null
    );
    const [showCorePointForm, setShowCorePointForm] = useState(false);
    const [showCorePointInfo, setShowCorePointInfo] = useState(false);
    const [selectedCorePoint, setSelectedCorePoint] =
      useState<CorePoint | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Pin info dialog state
    const [selectedPin, setSelectedPin] = useState<MapPinItem | null>(null);
    const [showPinInfo, setShowPinInfo] = useState(false);
    const [showPinDeleteConfirm, setShowPinDeleteConfirm] = useState(false);
    const [editingCorePoint, setEditingCorePoint] = useState<CorePoint | null>(
      null
    );
    const [corePointDescription, setCorePointDescription] = useState("");

    // User location tracking state
    const [userLocation, setUserLocation] = useState<{
      lat: number;
      lng: number;
    } | null>(null);

    // Use passed userLocation if available, otherwise use internal tracking
    const effectiveUserLocation = propUserLocation || userLocation;

    // Notify parent when effective user location changes (e.g. for CenterOnLocation button)
    useEffect(() => {
      onUserLocationChange?.(effectiveUserLocation);
    }, [effectiveUserLocation, onUserLocationChange]);

    // Cursor coordinates state
    const [cursorCoordinates, setCursorCoordinates] = useState<{
      lat: number;
      lng: number;
    } | null>(null);

    // KML parsed data state
    const [kmlGeometries, setKmlGeometries] = useState<KmlGeometry[]>([]);
    const [kmlLoading, setKmlLoading] = useState(false);
    const [kmlError, setKmlError] = useState<string | null>(null);
    const [hoveredKmlLine, setHoveredKmlLine] = useState<HoveredLine | null>(
      null
    );
    const polylineRefs = useRef<
      Record<number, google.maps.Polyline | undefined>
    >({});

    // XML hover state
    const [hoveredXmlLine, setHoveredXmlLine] = useState<HoveredXmlLine | null>(
      null
    );
    const xmlPolylineRefs = useRef<
      Record<string, google.maps.Polyline | undefined>
    >({});

    const mapRef = useRef<google.maps.Map | null>(null);
    const mapCanvasRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const el = mapCanvasRef.current;
      const map = mapRef.current;
      if (!el || !map || !isMapLoaded) return;

      const triggerResize = () => {
        if (typeof google !== "undefined" && google.maps?.event) {
          google.maps.event.trigger(map, "resize");
        }
      };

      const observer = new ResizeObserver(() => {
        triggerResize();
      });
      observer.observe(el);
      triggerResize();

      return () => observer.disconnect();
    }, [isMapLoaded]);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const hasInitialFocusDone = useRef(false);
    const drawingManagerRef = useRef<GoogleDrawingManager | null>(null);
    const { expandGoogleUrl } = useShortenGoogleUrl();

    // Track initial center to avoid re-centering on every render
    const initialCenterRef = useRef<GeoLatLng>(location || defaultCenter);

    // Check if a click is near the first vertex (to close polygon)
    const isNearFirstVertex = useCallback(
      (clickLat: number, clickLng: number, tolerance = 0.00005) => {
        if (normalizedVertices?.length < 3) return false;
        const firstVertex = normalizedVertices[0];
        const latDiff = Math.abs(clickLat - firstVertex.lat);
        const lngDiff = Math.abs(clickLng - firstVertex.lng);
        return latDiff < tolerance && lngDiff < tolerance;
      },
      [normalizedVertices]
    );

    // Handle closing the polygon
    const closePolygon = useCallback(() => {
      if (normalizedVertices?.length >= 3) {
        setIsCustomPolygonMode(false);
        setIsPolygonClosed(true);
        toast.success("Polygon closed!");
      }
    }, [normalizedVertices?.length]);

    // Handle double-click to complete polygon
    const handleMapDoubleClick = useCallback(() => {
      if (isCustomPolygonMode && normalizedVertices?.length >= 3) {
        closePolygon();
      }
    }, [isCustomPolygonMode, closePolygon, normalizedVertices?.length]);

    // Handle map clicks for custom drawing
    const handleMapClick = useCallback(
      (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;

        const clickLat = e.latLng.lat();
        const clickLng = e.latLng.lng();

        if (onMapClick) {
          onMapClick(clickLat, clickLng);
          return;
        }

        if (isPinMode) {
          onPinAdd?.(clickLat, clickLng);
          return;
        }

        if (isCorePointMode) {
          // Allow core points even when readOnly
          setPendingCorePoint({ lat: clickLat, lng: clickLng });

          setCorePointDescription("");
          setEditingCorePoint(null);
          setShowCorePointForm(true);
        } else if (!readOnly && isCustomPolygonMode) {
          // Check if clicking near first vertex to close polygon
          if (isNearFirstVertex(clickLat, clickLng)) {
            closePolygon();
            return;
          }

          // Add new vertex
          const newVertex = {
            lat: clickLat,
            lng: clickLng,
          };

          const updatedVertices = [...normalizedVertices, newVertex];
          onChangeVertices(updatedVertices);
        } else if (!readOnly && isMarkerMode) {
          const newLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };
          onChangeLocation(newLocation);
          setIsMarkerMode(false);
          toast.success("Marker placed!");
        }
      },
      [
        onMapClick,
        isPinMode,
        onPinAdd,
        isCorePointMode,
        isCustomPolygonMode,
        isMarkerMode,
        normalizedVertices,
        onChangeVertices,
        onChangeLocation,
        readOnly,
        isNearFirstVertex,
        closePolygon,
      ]
    );

    // Set up direct map click listeners
    useEffect(() => {
      if (!mapRef.current || !isMapLoaded) return;

      const mapClickListener = google.maps.event.addListener(
        mapRef.current,
        "click",
        (e: google.maps.MapMouseEvent) => {
          handleMapClick(e);
        }
      );

      const mapDoubleClickListener = google.maps.event.addListener(
        mapRef.current,
        "dblclick",
        () => {
          handleMapDoubleClick();
        }
      );

      return () => {
        if (mapClickListener) {
          google.maps.event.removeListener(mapClickListener);
        }
        if (mapDoubleClickListener) {
          google.maps.event.removeListener(mapDoubleClickListener);
        }
      };
    }, [isMapLoaded, handleMapClick, handleMapDoubleClick]);

    const isLink = (text: string) => {
      return (
        text.includes("goo.gl") ||
        text.includes("maps.app.goo.gl") ||
        text.includes("/search/") ||
        text.includes("@") ||
        text.includes("/place/")
      );
    };

    const containerStyle = {
      width: "100%",
      height: typeof mapHeight === "number" ? `${mapHeight}px` : mapHeight,
    };

    // Check if Google Maps API and Drawing library are loaded
    const isGoogleMapsReady = () => {
      return (
        window.google &&
        window.google.maps &&
        window.google.maps.drawing &&
        window.google.maps.places
      );
    };

    // Manual retry function for DrawingManager
    const retryDrawingManager = useCallback(() => {
      setDrawingManagerError(null);
      setDrawingManagerRetryCount(0);
      setIsDrawingManagerReady(false);

      setTimeout(() => {
        if (isGoogleMapsReady()) {
          setIsDrawingManagerReady(true);
        } else {
          setDrawingManagerError("Google Maps Drawing library not available");
        }
      }, 500);
    }, []);

    // Retry mechanism for DrawingManager initialization
    useEffect(() => {
      if (
        isMapLoaded &&
        !isDrawingManagerReady &&
        drawingManagerRetryCount < 3
      ) {
        const timer = setTimeout(
          () => {
            if (isGoogleMapsReady()) {
              setIsDrawingManagerReady(true);
              setDrawingManagerError(null);
            } else {
              setDrawingManagerRetryCount((prev) => prev + 1);
              if (drawingManagerRetryCount >= 2) {
                setDrawingManagerError(
                  "Failed to load Drawing Manager. Please refresh the page."
                );
              }
            }
          },
          1000 * (drawingManagerRetryCount + 1)
        );

        return () => clearTimeout(timer);
      }
    }, [isMapLoaded, isDrawingManagerReady, drawingManagerRetryCount]);

    // Additional check for DrawingManager availability after map loads
    useEffect(() => {
      if (isMapLoaded && !isDrawingManagerReady) {
        const checkDrawingManager = () => {
          if (isGoogleMapsReady()) {
            setIsDrawingManagerReady(true);
            setDrawingManagerError(null);
          }
        };

        checkDrawingManager();
        const timer = setTimeout(checkDrawingManager, 500);
        return () => clearTimeout(timer);
      }
    }, [isMapLoaded, isDrawingManagerReady]);

    // Reset drawing manager state when map reloads
    useEffect(() => {
      if (!isMapLoaded) {
        setIsDrawingManagerReady(false);
        setDrawingManagerRetryCount(0);
        setDrawingManagerError(null);
      }
    }, [isMapLoaded]);

    // User location tracking effect
    useEffect(() => {
      if (!navigator.geolocation) {
        return;
      }

      const options = {
        enableHighAccuracy: true, // Force GPS instead of network/IP location
        timeout: 30000, // Increased timeout to allow GPS to get a fix
        maximumAge: 0, // Don't use cached location, always get fresh GPS data
      };

      const handleSuccess = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      };

      const handleError = (error: GeolocationPositionError) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            break;
          case error.POSITION_UNAVAILABLE:
            break;
          case error.TIMEOUT:
            break;
          default:
            break;
        }
      };

      // Get initial high-accuracy position
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        options
      );

      // Start watching user's position with high accuracy
      const id = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options
      );

      // Cleanup function
      return () => {
        if (id) {
          navigator.geolocation.clearWatch(id);
        }
      };
    }, []);

    // Autocomplete logic
    useEffect(() => {
      if (!window.google || !window.google.maps || !window.google.maps.places)
        return;
      if (!googleMapLink.trim() || googleMapLink.startsWith("http")) {
        setPredictions([]);
        return;
      }
      const autocompleteService =
        new window.google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        { input: googleMapLink },
        (preds: GooglePlacePrediction[] | null) => {
          setPredictions(
            preds
              ? preds.map((p) => ({
                  description: p.description,
                  place_id: p.place_id,
                }))
              : []
          );
        }
      );
    }, [googleMapLink]);

    const handlePredictionClick = (prediction: Prediction) => {
      setGoogleMapLink(prediction.description);
      setPredictions([]);
      setShowDropdown(false);
      if (
        window.google &&
        window.google.maps &&
        window.google.maps.places &&
        mapRef.current
      ) {
        const service = new window.google.maps.places.PlacesService(
          mapRef.current
        );
        service.getDetails(
          { placeId: prediction.place_id },
          (
            place: GooglePlaceResult | null,
            status: GooglePlacesServiceStatus
          ) => {
            if (
              status === "OK" &&
              place &&
              place.geometry &&
              place.geometry.location
            ) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              onChangeLocation({ lat, lng });
              mapRef.current?.panTo({ lat, lng });
            } else {
              toast.error(
                "Could not get location details for the selected place."
              );
            }
          }
        );
      }
    };

    const handleGoogleMapLink = async () => {
      try {
        let expandedUrl = googleMapLink;
        if (
          googleMapLink.includes("goo.gl") ||
          googleMapLink.includes("maps.app.goo.gl")
        ) {
          expandedUrl = await expandGoogleUrl
            .mutateAsync(googleMapLink)
            .then(
              (data) => data.full_url || data.expanded_url || googleMapLink
            );
        }

        let lat, lng;

        if (expandedUrl.includes("/search/")) {
          const coordsPart = expandedUrl.split("/search/")[1].split("?")[0];
          const coords = coordsPart.replace(/\s/g, "").split(",");
          if (coords?.length >= 2) {
            lat = parseFloat(coords[0]);
            lng = parseFloat(coords[1].replace(/^\+/, ""));
          }
        } else if (expandedUrl.includes("@")) {
          const coordsPart = expandedUrl.split("@")[1].split(",");
          if (coordsPart?.length >= 2) {
            lat = parseFloat(coordsPart[0].trim());
            lng = parseFloat(coordsPart[1].trim());
          }
        } else if (expandedUrl.includes("/place/")) {
          const atIndex = expandedUrl.indexOf("@");
          if (atIndex !== -1) {
            const coordsPart = expandedUrl.substring(atIndex + 1).split(",");
            if (coordsPart?.length >= 2) {
              lat = parseFloat(coordsPart[0].trim());
              lng = parseFloat(coordsPart[1].trim());
            }
          }
        }

        if (
          lat !== undefined &&
          lng !== undefined &&
          !isNaN(lat) &&
          !isNaN(lng)
        ) {
          onChangeLocation({ lat, lng });
          if (mapRef.current) {
            mapRef.current.panTo({ lat, lng });
          }
        } else {
          toast.error(
            "Invalid Google Maps link. Please ensure the URL contains location coordinates."
          );
        }
      } catch (error) {
        console.error("Error processing Google Maps link:", error);
        toast.error("Failed to process the link. Please check the URL.");
      }
    };

    // Function to center map on user's location
    const centerOnUserLocation = useCallback(() => {
      if (effectiveUserLocation && mapRef.current) {
        mapRef.current.panTo(effectiveUserLocation);
        mapRef.current.setZoom(15); // Zoom in when centering on user
      }
    }, [effectiveUserLocation]);

    // Function to center map on organization's location
    const centerOnOrganizationLocation = useCallback(() => {
      if (organizationLocation && mapRef.current) {
        mapRef.current.panTo(organizationLocation);
        mapRef.current.setZoom(15); // Zoom in when centering on organization
      }
    }, [organizationLocation]);

    // Function to center map on a lat/lng point (e.g. delivery location)
    const centerOnLocation = useCallback((lat: number, lng: number) => {
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(18);
      }
    }, []);

    const focusOnFarmOrLocation = useCallback(() => {
      if (!mapRef.current) return;
      if (normalizedVertices?.length >= 3) {
        const bounds = new google.maps.LatLngBounds();
        normalizedVertices.forEach((v) => bounds.extend(v));
        mapRef.current.fitBounds(bounds);
      } else if (location) {
        mapRef.current.panTo(location);
        mapRef.current.setZoom(15);
      }
    }, [normalizedVertices, location]);

    // Handle mouse move to track cursor coordinates
    const handleMapMouseMove = (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        setCursorCoordinates({
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        });
      }
    };

    // Handle mouse leave to clear cursor coordinates
    const handleMapMouseLeave = () => {
      setCursorCoordinates(null);
    };

    const centerOnShpMap = (shpmap: ShpMapData) => {
      try {
        if (!shpmap?.data) {
          toast.error("No shape file data available");
          return;
        }
        const allPoints = Object.values(shpmap.data)
          .flat()
          .map(([lng, lat]) => ({ lat, lng }));

        if (allPoints?.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          allPoints.forEach((p) => bounds.extend(p));
          mapRef.current?.fitBounds(bounds);
        } else {
          toast.error("No valid points found in shape file");
        }
      } catch (error) {
        console.error("Error centering on shape file:", error);
        toast.error("Failed to center on shape file. Please try again.");
      }
    };

    const centerOnXmlMap = (xmlmap: XmlMapData) => {
      try {
        if (!xmlmap?.data) {
          toast.error("No XML file data available");
          return;
        }
        const allPoints = Object.values(xmlmap.data)
          .flatMap((shape) => shape.points)
          .map(([lat, lng]) => ({ lat, lng }));

        if (allPoints?.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          allPoints.forEach((p) => bounds.extend(p));
          mapRef.current?.fitBounds(bounds);
        } else {
          toast.error("No valid points found in XML file");
        }
      } catch (error) {
        console.error("Error centering on XML file:", error);
        toast.error("Failed to center on XML file. Please try again.");
      }
    };

    const centerOnKmlMap = (kmlmap: KmlMapData) => {
      try {
        if (!kmlmap?.data) {
          toast.error("No KML data available");
          return;
        }

        if (kmlGeometries.length === 0) {
          toast.info("KML data is processing. Please wait...");
          return;
        }

        // Extract all coordinates from KML geometries
        const allPoints: GeoLatLng[] = [];
        kmlGeometries.forEach((geometry) => {
          if (geometry.type === "Point" && geometry.coordinates.length > 0) {
            const [lng, lat] = geometry.coordinates[0];
            allPoints.push({ lat, lng });
          } else if (
            geometry.type === "LineString" ||
            geometry.type === "Polygon"
          ) {
            geometry.coordinates.forEach((coord) => {
              const [lng, lat] = coord;
              allPoints.push({ lat, lng });
            });
          }
        });

        if (allPoints.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          allPoints.forEach((p) => bounds.extend(p));
          mapRef.current?.fitBounds(bounds);
        } else {
          toast.error("No valid coordinates found in KML file");
        }
      } catch (error) {
        console.error("Error centering on KML file:", error);
        toast.error("Failed to center on KML file. Please try again.");
      }
    };

    // Process KML data when kmlmap changes (data comes pre-parsed from backend)
    useEffect(() => {
      const data = kmlmap?.data;

      if (!data) {
        setKmlGeometries([]);
        setKmlError(null);
        setKmlLoading(false);
        return;
      }

      setKmlLoading(true);
      setKmlError(null);

      try {
        const geometries = parseBackendKml(data);

        if (geometries.length === 0) {
          const msg = "No supported geometry types found in KML file";
          setKmlGeometries([]);
          setKmlError(msg);
          toast.error(
            "No supported Placemarks found. Supported: Point, LineString, Polygon."
          );
          return;
        }

        setKmlGeometries(geometries);
      } catch (e) {
        console.error("Error processing KML data:", e);
        const msg =
          e instanceof Error
            ? e.message
            : "Failed to process KML data. Please check the file format.";
        setKmlGeometries([]);
        setKmlError(msg);
        toast.error(msg);
      } finally {
        setKmlLoading(false);
      }
    }, [kmlmap?.data]);

    useImperativeHandle(ref, () => ({
      centerOnShpMap,
      centerOnXmlMap,
      centerOnKmlMap,
      centerOnUserLocation,
      centerOnOrganizationLocation,
      centerOnLocation,
      startCorePointMode: startCorePointPlacement,
      cancelCorePointMode,
      isCorePointMode: () => isCorePointMode,
      prepareCorePointAtLocation: (lat: number, lng: number) => {
        setIsCorePointMode(false);
        setPendingCorePoint({ lat, lng });
        if (!editingCorePoint) {
          setCorePointDescription("");
          setEditingCorePoint(null);
        }
        setShowCorePointForm(true);
      },
    }));

    // Trigger centering on user location when prop changes
    useEffect(() => {
      if (triggerCenterOnUserLocation && effectiveUserLocation) {
        centerOnUserLocation();
      }
    }, [
      triggerCenterOnUserLocation,
      effectiveUserLocation,
      centerOnUserLocation,
    ]);

    useEffect(() => {
      if (hasInitialFocusDone.current || !isMapLoaded || !mapRef.current)
        return;
      if (normalizedVertices?.length >= 3 || location) {
        focusOnFarmOrLocation();
        hasInitialFocusDone.current = true;
      }
    }, [isMapLoaded, normalizedVertices, location, focusOnFarmOrLocation]);

    const handleUndo = () => {
      if (normalizedVertices?.length > 0) {
        const newVertices = normalizedVertices.slice(0, -1);
        onChangeVertices(newVertices);

        // If we had a closed polygon and removed a vertex, it's now open
        if (isPolygonClosed) {
          setIsPolygonClosed(false);
        }

        toast.success("Last vertex undone");
      } else {
        toast.error("No vertices to undo");
      }
    };

    const startCustomPolygonDrawing = () => {
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setDrawingMode(null);
      }

      setIsCustomPolygonMode(true);
      setIsMarkerMode(false);
      setIsPolygonClosed(false);

      toast.info(
        "Click on the map to add vertices. Click the first vertex to close the polygon."
      );
    };

    const startCustomMarkerPlacement = () => {
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setDrawingMode(null);
      }

      setIsMarkerMode(true);
      setIsCustomPolygonMode(false);
      setIsCorePointMode(false);

      toast.info("Click on the map to place a marker.");
    };

    const startCorePointPlacement = () => {
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setDrawingMode(null);
      }

      setIsCorePointMode(true);
      setIsCustomPolygonMode(false);
      setIsMarkerMode(false);

      toast.info("Click on the map to place a core point.");
    };

    const cancelCorePointMode = () => {
      setIsCorePointMode(false);
    };

    const handleCorePointClick = (corePoint: CorePoint) => {
      // Show info dialog instead of directly editing
      setSelectedCorePoint(corePoint);
      setShowCorePointInfo(true);
    };

    const handleEditCorePoint = () => {
      if (!selectedCorePoint || !canEditCorePoints) return;

      setEditingCorePoint(selectedCorePoint);
      setCorePointDescription(selectedCorePoint.description || "");
      setPendingCorePoint({
        lat: selectedCorePoint.latitude,
        lng: selectedCorePoint.longitude,
      });
      setShowCorePointInfo(false);
      setShowCorePointForm(true);
    };

    const handleDeleteCorePoint = () => {
      if (!selectedCorePoint || !onCoreDelete || !canEditCorePoints) return;
      setShowDeleteConfirm(true);
    };

    const confirmDeleteCorePoint = () => {
      if (!selectedCorePoint?.id || !onCoreDelete) return;
      onCoreDelete(selectedCorePoint.id);
      setShowDeleteConfirm(false);
      setShowCorePointInfo(false);
      setSelectedCorePoint(null);
    };

    const handleCorePointFormCancel = () => {
      setShowCorePointForm(false);
      setPendingCorePoint(null);
      setEditingCorePoint(null);

      setCorePointDescription("");
      setIsCorePointMode(false);
    };

    const handleCorePointFormSave = () => {
      if (!pendingCorePoint || !onCoreSubmit) {
        return;
      }

      const corePointData: CorePoint = {
        ...(editingCorePoint?.id && { id: editingCorePoint.id }),
        ...(editingCorePoint?.id && editingCorePoint.name
          ? { name: editingCorePoint.name }
          : {}),
        description: corePointDescription.trim() || undefined,
        latitude: pendingCorePoint.lat,
        longitude: pendingCorePoint.lng,
      };

      onCoreSubmit(corePointData);
      // Reset core point mode after saving
      setShowCorePointForm(false);
      setPendingCorePoint(null);
      setEditingCorePoint(null);

      setCorePointDescription("");
      setIsCorePointMode(false);
    };

    const clearDrawing = () => {
      onChangeVertices([]);
      setIsCustomPolygonMode(false);
      setIsMarkerMode(false);
      setIsPolygonClosed(false);
      toast.success("Drawing cleared");
    };

    return (
      <div className={`relative ${className}`}>
        {!hideSearch && (
          <div className="relative mb-4 flex w-full items-center gap-2">
            <SanitizedInput
              ref={inputRef}
              autoComplete="off"
              className="h-12 w-full rounded border px-3"
              placeholder="Search / Paste Location Link"
              type="text"
              value={googleMapLink}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              onChange={(e) => {
                setGoogleMapLink(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            <Button
              iconOnly
              aria-label="Go to location"
              disabled={!isLink(googleMapLink) && googleMapLink.trim() !== ""}
              leftIcon={<ArrowRight className="h-5 w-5" />}
              size={ComponentSizeEnum.LG}
              onClick={handleGoogleMapLink}
            />
            {showDropdown && predictions?.length > 0 && (
              <div className="absolute top-full left-0 z-10 max-h-60 w-full overflow-y-auto rounded border border-gray-200 bg-white shadow-md">
                {predictions.map((pred) => (
                  <div
                    key={pred.place_id}
                    className="cursor-pointer px-4 py-2 text-black hover:bg-gray-100"
                    onMouseDown={() => handlePredictionClick(pred)}
                  >
                    {pred.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Custom Drawing Controls */}
        {(!readOnly || showCorePoints) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {!readOnly && !hideActionMenu && (
              <Button
                leftIcon={<SquarePen className="h-3 w-3" />}
                size={ComponentSizeEnum.SM}
                title={`Draw Polygon${isCustomPolygonMode ? " ✓" : ""}`}
                variant={
                  isCustomPolygonMode
                    ? ButtonVariantEnum.DEFAULT
                    : ButtonVariantEnum.SURFACE
                }
                onClick={startCustomPolygonDrawing}
              />
            )}
            {!readOnly && (
              <Button
                leftIcon={<MapPin className="h-3 w-3" />}
                size={ComponentSizeEnum.SM}
                title={`Place Marker${isMarkerMode ? " ✓" : ""}`}
                variant={
                  isMarkerMode
                    ? ButtonVariantEnum.DEFAULT
                    : ButtonVariantEnum.SURFACE
                }
                onClick={startCustomMarkerPlacement}
              />
            )}
            {!readOnly && !hideActionMenu && (
              <Button
                aria-label="Clear"
                disabled={normalizedVertices?.length === 0 && !location}
                size={ComponentSizeEnum.SM}
                title="Clear"
                variant={ButtonVariantEnum.SURFACE}
                onClick={clearDrawing}
              />
            )}
          </div>
        )}

        <div
          ref={mapCanvasRef}
          className={`relative ${isCorePointMode || isPinMode ? "cursor-crosshair" : ""}`}
          style={containerStyle}
        >
          {farmSelectorItems.length > 0 ? (
            <FarmSelectorButton farms={farmSelectorItems} mapRef={mapRef} />
          ) : (
            <Button
              iconOnly
              aria-label="Focus on farm boundary or location"
              className="absolute top-2 left-2 z-[1]"
              leftIcon={<Crosshair className="h-4 w-4" />}
              size={ComponentSizeEnum.SM}
              onClick={focusOnFarmOrLocation}
            />
          )}

          <div className="absolute top-2 right-2 z-[1] flex gap-1">
            {/* Undo Button */}
            {!readOnly && (
              <Button
                iconOnly
                aria-label={`Undo last vertex (${normalizedVertices?.length} vertices)`}
                disabled={normalizedVertices?.length === 0}
                leftIcon={<Undo2 className="h-4 w-4" />}
                size={ComponentSizeEnum.SM}
                variant={ButtonVariantEnum.GHOST}
                onClick={handleUndo}
              />
            )}
            <Button
              iconOnly
              aria-label="Open in Google Maps"
              leftIcon={<ExternalLink className="h-4 w-4" />}
              size={ComponentSizeEnum.SM}
              variant={ButtonVariantEnum.GHOST}
              onClick={() => {
                if (location) {
                  const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
                  window.open(url, "_blank");
                }
              }}
            />
          </div>

          {/* Drawing Mode Indicator */}
          {/* {(isCustomPolygonMode || isMarkerMode) && (
            <div className="absolute top-2 left-2 z-[1] bg-orange-500 text-white px-2 py-1 rounded text-xs">
              {isCustomPolygonMode
                ? `Drawing Polygon (${normalizedVertices.length} vertices)${
                    normalizedVertices.length >= 3 ? " - Click first vertex to close" : ""
                  }`
                : "Place Marker"}
            </div>
          )} */}

          {/* Drawing Manager Error/Retry UI */}
          {drawingManagerError && (
            <div className="absolute top-[-12px] left-[-5px] z-[2] max-w-xs rounded p-2">
              <p className="mb-2 text-sm text-red-700">{drawingManagerError}</p>
              <Button
                aria-label="Retry Drawing Tools"
                size={ComponentSizeEnum.SM}
                title="Retry Drawing Tools"
                variant={ButtonVariantEnum.SURFACE}
                onClick={retryDrawingManager}
              />
            </div>
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
            onLoad={(map) => {
              mapRef.current = map;
              setIsMapLoaded(true);
              const center = location ?? initialCenterRef.current;
              window.requestAnimationFrame(() => {
                if (typeof google !== "undefined" && google.maps?.event) {
                  google.maps.event.trigger(map, "resize");
                }
                map.panTo(center);
              });
            }}
            onMouseMove={handleMapMouseMove}
            onMouseOut={handleMapMouseLeave}
            onUnmount={() => {
              setIsMapLoaded(false);
              setIsDrawingManagerReady(false);
              setDrawingManagerError(null);
            }}
          >
            {/* Render polygon or polyline based on state */}
            {normalizedVertices && normalizedVertices?.length > 0 && (
              <>
                {/* Show first vertex marker when drawing and have 3+ vertices */}
                {isCustomPolygonMode && normalizedVertices?.length >= 3 && (
                  <Marker
                    options={{
                      icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="%23ff9800" stroke="%23fff" stroke-width="2"/><circle cx="8" cy="8" r="2" fill="%23fff"/></svg>',
                        scaledSize: new google.maps.Size(16, 16),
                        anchor: new google.maps.Point(8, 8),
                      },
                      clickable: true,
                      title: "Click to close polygon",
                    }}
                    position={normalizedVertices[0]}
                    onClick={closePolygon}
                  />
                )}

                {isPolygonClosed ||
                (!isCustomPolygonMode && normalizedVertices?.length >= 3) ? (
                  /* Closed polygon */
                  <Polygon
                    options={{
                      fillColor: FARM_BOUNDARY_FILL_HEX,
                      fillOpacity: FARM_BOUNDARY_FILL_OPACITY,
                      strokeWeight: 2,
                      strokeColor: FARM_BOUNDARY_STROKE_HEX,
                      strokeOpacity: FARM_BOUNDARY_STROKE_OPACITY,
                      clickable: false,
                      editable: false,
                      zIndex: 1,
                    }}
                    path={normalizedVertices}
                  />
                ) : (
                  /* Open polyline */
                  <Polyline
                    options={{
                      strokeColor: isCustomPolygonMode ? "#ff9800" : "#2196f3",
                      strokeOpacity: 1.0,
                      strokeWeight: 2,
                    }}
                    path={normalizedVertices}
                  />
                )}
              </>
            )}

            {/* Render multi-farm rings (view-details mode) */}
            {vertexRings &&
              vertexRings.length > 0 &&
              vertexRings.map((ring, idx) => {
                const isPrimary = idx === primaryRingIndex;
                return (
                  <Polygon
                    key={`farm-ring-${idx}`}
                    options={{
                      fillColor: isPrimary ? accentHex : FARM_BOUNDARY_FILL_HEX,
                      fillOpacity: isPrimary
                        ? 0.22
                        : FARM_BOUNDARY_FILL_OPACITY,
                      strokeWeight: 2,
                      strokeColor: isPrimary
                        ? accentHex
                        : FARM_BOUNDARY_STROKE_HEX,
                      strokeOpacity: FARM_BOUNDARY_STROKE_OPACITY,
                      clickable: false,
                      editable: false,
                      zIndex: isPrimary ? 2 : 1,
                    }}
                    path={ring}
                  />
                );
              })}

            {/* Secondary farm pins (black) */}
            {secondaryFarmPins.map((pin, idx) => (
              <MarkerF
                key={`secondary-farm-${idx}`}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32"><path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z" fill="%231F2937" stroke="%23fff" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="%23fff"/></svg>',
                  scaledSize: new window.google.maps.Size(24, 32),
                  anchor: new window.google.maps.Point(12, 32),
                }}
                position={pin}
              />
            ))}

            {/* Render SHP map */}
            {shpmap?.data &&
              Object.entries(shpmap.data).map(([key, points], idx) => (
                <Polygon
                  key={`shp-${key}-${idx}`}
                  options={{
                    fillColor: SHP_FILL_HEX,
                    fillOpacity: SHP_FILL_OPACITY,
                    strokeWeight: 2,
                    strokeColor: SHP_STROKE_HEX,
                    strokeOpacity: SHP_STROKE_OPACITY,
                    clickable: false,
                    editable: false,
                    zIndex: 1,
                  }}
                  path={points.map(([lng, lat]) => ({
                    lat, // SHP data comes in [lng, lat] format from backend
                    lng, // So we swap them for Google Maps
                  }))}
                />
              ))}
            {/* Render XML map */}
            {xmlmap && (
              <XmlGeometriesLayer
                polylineRefs={xmlPolylineRefs}
                setHoveredXmlLine={setHoveredXmlLine}
                xmlMaps={[xmlmap]}
              />
            )}
            {/* Render KML map - parsed geometries */}
            <KmlStatus
              error={kmlError}
              loading={kmlLoading && !!kmlmap?.data}
            />
            {!kmlLoading && !kmlError && (
              <KmlGeometriesLayer
                geometries={kmlGeometries}
                polylineRefs={polylineRefs}
                setHoveredKmlLine={setHoveredKmlLine}
              />
            )}

            {hoveredKmlLine && hoveredKmlLine.geometry.pipe_size && (
              <KmlLineHoverPopup
                hovered={hoveredKmlLine}
                onClose={() => setHoveredKmlLine(null)}
              />
            )}

            {hoveredXmlLine && (
              <XmlLineHoverPopup
                hovered={hoveredXmlLine}
                onClose={() => setHoveredXmlLine(null)}
              />
            )}

            {/* Render marker from state - skip when showing vendor markers unless showLocationWithVendorMarkers (e.g. vendor + delivery pins) */}
            {location &&
              (vendorMarkers.length === 0 || showLocationWithVendorMarkers) && (
                <Marker position={location} />
              )}

            {/* User Location Marker */}
            {effectiveUserLocation && (
              <MarkerF
                icon={{
                  url: "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%228%22%20fill%3D%22%234285f4%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%223%22/%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%223%22%20fill%3D%22%23ffffff%22/%3E%3C/svg%3E",
                  scaledSize: new window.google.maps.Size(20, 20),
                  anchor: new window.google.maps.Point(10, 10),
                }}
                position={effectiveUserLocation}
                title="Your current location"
              />
            )}

            {/* Organization Location Marker */}
            {organizationLocation && (
              <MarkerF
                icon={{
                  url: "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%228%22%20fill%3D%22%23f59e0b%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%223%22/%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%223%22%20fill%3D%22%23ffffff%22/%3E%3C/svg%3E",
                  scaledSize: new window.google.maps.Size(20, 20),
                  anchor: new window.google.maps.Point(10, 10),
                }}
                position={organizationLocation}
                title="Organization Headquarters"
                zIndex={1000}
              />
            )}

            {/* Core Points Markers */}
            {showCorePoints && corePoints && corePoints.length > 0 && (
              <>
                {corePoints.map((corePoint) => (
                  <Marker
                    key={
                      corePoint.id ||
                      `${corePoint.latitude}-${corePoint.longitude}`
                    }
                    options={{
                      icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23ef4444" stroke="%23fff" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="%23fff"/></svg>',
                        scaledSize: new google.maps.Size(24, 24),
                        anchor: new google.maps.Point(12, 12),
                      },
                      clickable: true,
                      title: corePoint.name,
                    }}
                    position={{
                      lat: corePoint.latitude,
                      lng: corePoint.longitude,
                    }}
                    onClick={() => handleCorePointClick(corePoint)}
                  />
                ))}
              </>
            )}

            {/* Map Pins */}
            {mapPins &&
              mapPins.length > 0 &&
              mapPins.map((pin) => (
                <Fragment key={`pin-${pin.id}`}>
                  <Marker
                    options={{
                      icon: {
                        url: getPinSvgUrl(pin.name),
                        scaledSize: new google.maps.Size(28, 36),
                        anchor: new google.maps.Point(14, 36),
                      },
                      clickable: true,
                      title: pin.name,
                    }}
                    position={{ lat: pin.latitude, lng: pin.longitude }}
                    onClick={() => {
                      setSelectedPin(pin);
                      setShowPinInfo(true);
                    }}
                  />
                </Fragment>
              ))}

            {/* Vendor Markers - key includes isSelected so icon updates when selection changes */}
            {vendorMarkers.length > 0 &&
              vendorMarkers.map((marker) => {
                const lat = Number(marker.lat);
                const lng = Number(marker.long);
                if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
                const isSelected =
                  selectedVendorId != null &&
                  Number(marker.id) === Number(selectedVendorId);
                const isFavorite =
                  favoriteVendorIds != null &&
                  favoriteVendorIds.some(
                    (fid) => Number(fid) === Number(marker.id)
                  );
                const isGolden = goldenOnlyWhenFavorite
                  ? isFavorite
                  : isSelected || isFavorite;

                const isApproximate = marker.markerType === "approximate";
                const fillColor = isGolden
                  ? "#F59E0B"
                  : isApproximate
                    ? "#6B7280"
                    : "#3B82F6";
                const pinPath =
                  "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";
                return (
                  <Fragment
                    key={`vendor-${marker.id}-${marker.markerType ?? "exact"}-${isGolden}`}
                  >
                    <Marker
                      icon={{
                        path: pinPath,
                        fillColor,
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#ffffff",
                        scale: isSelected ? 2 : 1.5,
                        anchor: new google.maps.Point(12, 22),
                      }}
                      position={{ lat, lng }}
                      title={marker.name}
                      onClick={() => onVendorMarkerClick?.(marker)}
                    />
                    {showVendorMarkerLabels && marker.name && (
                      <OverlayView
                        getPixelPositionOffset={(w, h) => ({
                          x: Math.round(-w / 2),
                          y: -h - 8,
                        })}
                        mapPaneName={OverlayView.OVERLAY_LAYER}
                        position={{ lat, lng }}
                      >
                        <div
                          className="bg-accent text-text-inverse pointer-events-none inline-block w-max rounded px-2 py-1 text-xs font-medium whitespace-nowrap shadow"
                          style={{ marginBottom: 2 }}
                        >
                          {marker.name}
                        </div>
                      </OverlayView>
                    )}
                  </Fragment>
                );
              })}

            {/* Custom Markers (children) */}
            {children}

            {/* Cursor Coordinates Display */}
            {cursorCoordinates && (
              <div className="absolute top-4 left-4 z-10 rounded-lg bg-black/70 px-3 py-2 text-white shadow-lg">
                <div className="font-mono text-xs">
                  <div>Lat: {cursorCoordinates.lat.toFixed(6)}</div>
                  <div>Long: {cursorCoordinates.lng.toFixed(6)}</div>
                </div>
              </div>
            )}

            {/* Core Point Form */}
            {showCorePointForm && pendingCorePoint && (
              <div className="bg-bg-surface-elevated absolute top-1/2 left-1/2 z-[100] max-w-[400px] min-w-[300px] -translate-x-1/2 -translate-y-1/2 transform rounded-lg border p-4 shadow-lg">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {editingCorePoint ? "Edit Core Point" : "Add Core Point"}
                  </h3>
                  <Button
                    iconOnly
                    aria-label="Close"
                    leftIcon={<X className="h-4 w-4" />}
                    size={ComponentSizeEnum.SM}
                    variant={ButtonVariantEnum.GHOST}
                    onClick={handleCorePointFormCancel}
                  />
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="core-description">Description</Label>
                    <SanitizedTextarea
                      autoFocus
                      id="core-description"
                      placeholder="Enter core point description (optional)"
                      rows={3}
                      value={corePointDescription}
                      onChange={(e) => setCorePointDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      aria-label="Cancel"
                      className="flex-1"
                      title="Cancel"
                      variant={ButtonVariantEnum.SURFACE}
                      onClick={handleCorePointFormCancel}
                    />
                    <Button
                      aria-label="Save"
                      className="flex-1"
                      title="Save"
                      onClick={handleCorePointFormSave}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Core Point Info Dialog */}
            <CorePointInfoModal
              canEdit={canEditCorePoints}
              corePoint={selectedCorePoint}
              open={showCorePointInfo}
              onClose={() => setShowCorePointInfo(false)}
              onDelete={onCoreDelete ? handleDeleteCorePoint : undefined}
              onEdit={handleEditCorePoint}
            />

            <DeleteCorePointConfirmModal
              corePoint={selectedCorePoint}
              open={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              onConfirm={confirmDeleteCorePoint}
            />

            <PinInfoModal
              open={showPinInfo}
              pin={selectedPin}
              onClose={() => setShowPinInfo(false)}
              onDelete={
                onPinDelete
                  ? () => {
                      setShowPinInfo(false);
                      setShowPinDeleteConfirm(true);
                    }
                  : undefined
              }
            />

            <DeletePinConfirmModal
              open={showPinDeleteConfirm}
              pin={selectedPin}
              onClose={() => setShowPinDeleteConfirm(false)}
              onConfirm={(pinId) => {
                onPinDelete?.(pinId);
                setSelectedPin(null);
              }}
            />
          </GoogleMap>
        </div>
      </div>
    );
  }
);

BoundaryMap.displayName = "BoundaryMap";

export default BoundaryMap;
