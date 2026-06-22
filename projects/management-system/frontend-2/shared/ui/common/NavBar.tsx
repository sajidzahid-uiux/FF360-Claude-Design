"use client";

import { ReactNode } from "react";

interface NavBarProps {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  moreButtons?: ReactNode;
  className?: string;
}

export default function NavBar({
  tabs,
  activeTab,
  setActiveTab,
  moreButtons,
  className,
}: NavBarProps) {
  return (
    <div className="flex flex-row items-center justify-between">
      <div
        className={`border-border-subtle mt-6 flex flex-row gap-4 border-b ${className}`}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-lg font-semibold transition-colors focus:outline-none ${
              activeTab === tab
                ? "border-accent text-text-primary border-b-2"
                : "text-text-muted hover:text-text-primary"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {moreButtons && moreButtons}
    </div>
  );
}
