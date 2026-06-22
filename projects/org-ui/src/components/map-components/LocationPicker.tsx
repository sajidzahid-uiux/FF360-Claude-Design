import { Suspense, lazy, useState } from 'react';
import { Input } from '../ui-components/Input';

export interface Point {
  type: 'Point';
  coordinates: [number, number];
}

export interface LocationPickerProps {
  location?: Point;
  onLocationChange: (location: Point | undefined) => void;
  label?: string;
  required?: boolean;
  error?: string;
  mapHeight?: number | string;
  readOnly?: boolean;
  renderMap?: (args: {
    location?: Point;
    onMapPick: (lng: number, lat: number) => void;
  }) => React.ReactNode;
}

const LazyLocationPickerMap = lazy(async () => {
  const module = await import('./LocationPickerMap');
  return { default: module.LocationPickerMap };
});

const PinIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-4 w-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21c4-4.35 6-7.2 6-10a6 6 0 1 0-12 0c0 2.8 2 5.65 6 10Z"
    />
    <circle cx="12" cy="11" r="2.3" />
  </svg>
);

export function LocationPicker({
  location,
  onLocationChange,
  label = 'Location',
  required = false,
  error,
  mapHeight,
  readOnly = false,
  renderMap,
}: LocationPickerProps) {
  const shouldStretchMap = mapHeight === undefined;
  const latitude = location?.coordinates[1];
  const longitude = location?.coordinates[0];
  const [manualEntry, setManualEntry] = useState(false);

  const handleLatChange = (value: string) => {
    const lat = value === '' ? null : Number.parseFloat(value);
    if (Number.isNaN(lat as number)) return;
    onLocationChange(
      lat != null && longitude != null
        ? { type: 'Point', coordinates: [longitude, lat] }
        : undefined
    );
  };

  const handleLngChange = (value: string) => {
    const lng = value === '' ? null : Number.parseFloat(value);
    if (Number.isNaN(lng as number)) return;
    onLocationChange(
      lng != null && latitude != null
        ? { type: 'Point', coordinates: [lng, latitude] }
        : undefined
    );
  };

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition((position) => {
      onLocationChange({
        type: 'Point',
        coordinates: [position.coords.longitude, position.coords.latitude],
      });
    });
  };

  const handleMapPick = (lng: number, lat: number) => {
    onLocationChange({ type: 'Point', coordinates: [lng, lat] });
  };

  return (
    <div className="space-y-3">
      {!readOnly ? (
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-text-primary text-base font-semibold">
            {label}
            {required ? (
              <span className="ml-1 text-[var(--color-feedback-error)]">*</span>
            ) : null}
          </h3>
          <button
            type="button"
            onClick={() => setManualEntry((prev) => !prev)}
            className="text-text-secondary hover:text-text-primary shrink-0 cursor-pointer text-sm"
          >
            {manualEntry ? 'Use Map' : 'Enter Manually'}
          </button>
        </div>
      ) : label ? (
        <h3 className="text-text-primary text-base font-semibold">{label}</h3>
      ) : null}

      {manualEntry && !readOnly ? (
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            step="any"
            placeholder="Latitude"
            value={latitude ?? ''}
            onChange={(e) => handleLatChange(e.target.value)}
            error={error}
          />
          <Input
            type="number"
            step="any"
            placeholder="Longitude"
            value={longitude ?? ''}
            onChange={(e) => handleLngChange(e.target.value)}
          />
        </div>
      ) : (
        <div
          className={
            shouldStretchMap
              ? "flex min-h-0 flex-1 flex-col gap-3"
              : "space-y-3"
          }
        >
          <div className={shouldStretchMap ? "min-h-0 flex-1" : undefined}>
            {renderMap ? (
              renderMap({ location, onMapPick: handleMapPick })
            ) : (
              <Suspense
                fallback={
                  <div
                    className="border-border-subtle bg-bg-surface-elevated rounded-lg border"
                    style={{ height: mapHeight ?? "100%" }}
                  />
                }
              >
                <LazyLocationPickerMap
                  location={location}
                  onMapPick={handleMapPick}
                  height={mapHeight}
                  readOnly={readOnly}
                />
              </Suspense>
            )}
          </div>
          {!readOnly ? (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-text-secondary text-sm">
                {latitude != null && longitude != null
                  ? `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                  : 'Set location via map or current position'}
              </span>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-text-secondary hover:text-text-primary flex cursor-pointer items-center gap-2 text-sm font-medium"
              >
                {PinIcon}
                Use Current Location
              </button>
            </div>
          ) : latitude != null && longitude != null ? (
            <p className="text-text-muted text-sm">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          ) : (
            <p className="text-text-muted text-sm">No location set.</p>
          )}
          {error ? (
            <p className="text-sm text-[var(--color-feedback-error)]">{error}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

