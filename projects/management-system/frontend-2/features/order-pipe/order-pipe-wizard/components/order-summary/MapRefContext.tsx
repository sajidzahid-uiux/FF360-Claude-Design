"use client";

import React, { createContext, useContext, useRef } from "react";

import type { BoundaryMapRef } from "@/shared/ui/common/map";

interface MapRefContextValue {
  boundaryMapRef: React.RefObject<BoundaryMapRef | null>;
}

const MapRefContext = createContext<MapRefContextValue | undefined>(undefined);

export function MapRefProvider({ children }: { children: React.ReactNode }) {
  const boundaryMapRef = useRef<BoundaryMapRef>(null);

  return (
    <MapRefContext.Provider value={{ boundaryMapRef }}>
      {children}
    </MapRefContext.Provider>
  );
}

export function useMapRef() {
  const context = useContext(MapRefContext);
  if (context === undefined) {
    throw new Error("useMapRef must be used within a MapRefProvider");
  }
  return context;
}
