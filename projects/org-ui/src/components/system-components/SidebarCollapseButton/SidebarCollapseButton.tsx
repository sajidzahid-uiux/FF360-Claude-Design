interface SidebarCollapseButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

const ChevronLeftIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 19.5-7.5-7.5 7.5-7.5" /></svg>;
const ChevronRightIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>;

export function SidebarCollapseButton({
  isCollapsed,
  onToggle,
  className,
}: SidebarCollapseButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className={`text-text-muted hover:text-text-primary hover:bg-bg-hover relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md transition-colors ${className ?? ''}`}
    >
      {isCollapsed ? ChevronRightIcon : ChevronLeftIcon}
    </button>
  );
}
