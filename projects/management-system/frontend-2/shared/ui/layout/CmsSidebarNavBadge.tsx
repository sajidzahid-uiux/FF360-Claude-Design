import { AccentCountBadge } from "./AccentCountBadge";

interface CmsSidebarNavBadgeProps {
  count: number;
  title?: string;
}

export function CmsSidebarNavBadge({ count, title }: CmsSidebarNavBadgeProps) {
  return <AccentCountBadge className="ml-1.5" count={count} title={title} />;
}
