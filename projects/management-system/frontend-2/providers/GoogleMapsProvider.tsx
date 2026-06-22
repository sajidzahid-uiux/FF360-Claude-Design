"use client";
import { ReactNode, createContext, useContext, useMemo } from "react";

import { type Libraries, useJsApiLoader } from "@react-google-maps/api";

import { GOOGLE_MAPS_API_KEY } from "@/constants";

/**
 * Single source of truth for loading the Google Maps JavaScript API.
 *
 * Previously this provider used `<LoadScript>` while individual pages also
 * called `useLoadScript` with a narrower `libraries` array. Mixing the two
 * APIs (and using mismatching library sets) causes `@react-google-maps/api`
 * to inject the Google Maps script twice, which produces the console warning
 * "You have included the Google Maps JavaScript API multiple times on this
 * page". We now load the API exactly once here via `useJsApiLoader` and
 * expose `{ isLoaded, loadError }` via context so consumers can wait without
 * triggering a second loader.
 *
 * `libraries` must be a module-level constant — `useJsApiLoader` warns if
 * the array identity changes between renders.
 */
const GOOGLE_MAPS_LIBRARIES: Libraries = ["drawing", "places"];
const GOOGLE_MAPS_LOADER_ID = "fieldflow-google-maps-script";

type GoogleMapsApiState = {
  isLoaded: boolean;
  loadError: Error | undefined;
};

const GoogleMapsApiContext = createContext<GoogleMapsApiState>({
  isLoaded: false,
  loadError: undefined,
});

export default function GoogleMapsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const value = useMemo<GoogleMapsApiState>(
    () => ({ isLoaded, loadError }),
    [isLoaded, loadError]
  );

  return (
    <GoogleMapsApiContext.Provider value={value}>
      {children}
    </GoogleMapsApiContext.Provider>
  );
}

/**
 * Read the Google Maps API load state. Prefer this over calling
 * `useLoadScript` directly in page-level components — each additional
 * loader causes the API to be injected again.
 */
export function useGoogleMapsApi(): GoogleMapsApiState {
  return useContext(GoogleMapsApiContext);
}
