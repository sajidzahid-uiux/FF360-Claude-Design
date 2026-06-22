interface MapZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  disabled?: boolean;
  className?: string;
}

const PlusIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-5 w-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  </svg>
);

const MinusIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-5 w-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
  </svg>
);

export function MapZoomControls({
  onZoomIn,
  onZoomOut,
  disabled = false,
  className = "",
}: MapZoomControlsProps) {
  return (
    <div
      className={`border-border-strong bg-bg-surface-elevated absolute right-4 bottom-4 z-10 flex flex-col gap-px overflow-hidden rounded-lg border shadow-md ${className}`}
    >
      <button
        type="button"
        onClick={onZoomIn}
        disabled={disabled}
        className="text-text-secondary hover:bg-bg-hover disabled:text-text-muted flex h-10 w-10 cursor-pointer items-center justify-center bg-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        title="Zoom in"
        aria-label="Zoom in"
      >
        {PlusIcon}
      </button>
      <div className="bg-border-strong h-px" />
      <button
        type="button"
        onClick={onZoomOut}
        disabled={disabled}
        className="text-text-secondary hover:bg-bg-hover disabled:text-text-muted flex h-10 w-10 cursor-pointer items-center justify-center bg-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        title="Zoom out"
        aria-label="Zoom out"
      >
        {MinusIcon}
      </button>
    </div>
  );
}

export type { MapZoomControlsProps };

