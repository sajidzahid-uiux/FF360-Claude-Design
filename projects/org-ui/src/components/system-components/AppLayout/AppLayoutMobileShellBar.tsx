import { ReactNode } from 'react';

const MenuIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-5 w-5"
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
  </svg>
);

export interface AppLayoutMobileShellBarProps {
  appTitle: string;
  logo: ReactNode;
  onToggleSidebar: () => void;
  end?: ReactNode;
}

export function AppLayoutMobileShellBar({
  appTitle,
  logo,
  onToggleSidebar,
  end,
}: AppLayoutMobileShellBarProps) {
  return (
    <div className="border-border-subtle/60 bg-bg-main flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
          className="text-text-muted hover:text-text-primary hover:bg-bg-hover inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors"
        >
          {MenuIcon}
        </button>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center">{logo}</span>
        <span className="text-text-primary truncate text-sm font-semibold">{appTitle}</span>
      </div>
      {end ? <div className="flex shrink-0 items-center gap-2">{end}</div> : null}
    </div>
  );
}
