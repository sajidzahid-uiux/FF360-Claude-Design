"use client";

interface MapHeaderProps {
  locationError: string | null;
}

export const MapHeader = ({ locationError }: MapHeaderProps) => {
  return (
    <div>
      <h1 className="text-text-primary text-lg leading-tight font-semibold sm:text-xl">
        Map View
      </h1>
      <p className="text-text-muted hidden text-sm sm:block">
        Filter locations by type and status
      </p>
      {locationError && (
        <p className="text-feedback-error mt-1 text-xs">{locationError}</p>
      )}
    </div>
  );
};
