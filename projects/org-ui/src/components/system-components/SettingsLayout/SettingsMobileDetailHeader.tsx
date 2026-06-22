const ChevronLeftIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-4 w-4"
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 19.5-7.5-7.5 7.5-7.5" />
  </svg>
);

export interface SettingsMobileDetailHeaderProps {
  backLabel: string;
  onBack: () => void;
}

export function SettingsMobileDetailHeader({ backLabel, onBack }: SettingsMobileDetailHeaderProps) {
  return (
    <div
      data-testid="ff-settings-mobile-detail-header"
      className="border-border-subtle bg-bg-main shrink-0 border-b px-4 py-3"
    >
      <button
        type="button"
        onClick={onBack}
        aria-label={`Back to ${backLabel}`}
        className="text-text-secondary hover:text-text-primary hover:bg-bg-hover inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-sm font-medium transition-colors"
      >
        {ChevronLeftIcon}
        <span>{backLabel}</span>
      </button>
    </div>
  );
}
