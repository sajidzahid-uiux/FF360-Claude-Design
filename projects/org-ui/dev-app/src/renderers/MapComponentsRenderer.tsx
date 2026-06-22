import {
  LocationPicker,
  LocationPickerMap,
  MapZoomControls,
  type LocationPoint,
} from "@fieldflow360/org-ui";
import { useState } from "react";
import { CodePreview } from "../ui-app/ui-app-components";
import { Section } from "../ui-app/ui-app-components/Section";

export const MapComponentsRenderer = () => {
  const [location, setLocation] = useState<LocationPoint | undefined>({
    type: "Point",
    coordinates: [-122.39476, 37.78967],
  });
  const [zoomPreview, setZoomPreview] = useState(12);

  return (
    <Section>
      <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
        Map Components
      </h2>

      <CodePreview
        title="LocationPicker usage"
        code={`<LocationPicker
  location={location}
  onLocationChange={setLocation}
  required
/>`}
      />

      <LocationPicker location={location} onLocationChange={setLocation} required />

      <div className="mt-8">
        <CodePreview
          title="LocationPickerMap usage"
          code={`<LocationPickerMap
  location={location}
  onMapPick={(lng, lat) =>
    setLocation({ type: "Point", coordinates: [lng, lat] })
  }
  height={300}
/>`}
        />
        <LocationPickerMap
          location={location}
          onMapPick={(lng, lat) =>
            setLocation({ type: "Point", coordinates: [lng, lat] })
          }
          height={300}
        />
      </div>

      <div className="mt-8">
        <CodePreview
          title="MapZoomControls usage"
          code={`<MapZoomControls
  onZoomIn={() => setZoom((z) => z + 1)}
  onZoomOut={() => setZoom((z) => z - 1)}
/>`}
        />
        <div className="border-border-subtle bg-bg-surface-elevated relative h-36 rounded-lg border">
          <div className="text-text-secondary absolute left-3 top-3 text-sm">
            Zoom preview value: <span className="text-text-primary font-semibold">{zoomPreview}</span>
          </div>
          <MapZoomControls
            onZoomIn={() => setZoomPreview((value) => value + 1)}
            onZoomOut={() => setZoomPreview((value) => value - 1)}
          />
        </div>
      </div>
    </Section>
  );
};

