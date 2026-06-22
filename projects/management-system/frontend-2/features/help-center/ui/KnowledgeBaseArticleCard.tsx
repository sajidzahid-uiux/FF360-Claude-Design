"use client";

import { HELP_APPEAR_CLASS, helpAppearStyle } from "../lib/helpCenterMotion";
import type { KnowledgeBaseItem } from "../model/types";

interface KnowledgeBaseArticleCardProps {
  item: KnowledgeBaseItem;
  appearIndex?: number;
  onClick: () => void;
}

export function KnowledgeBaseArticleCard({
  item,
  appearIndex = 0,
  onClick,
}: KnowledgeBaseArticleCardProps) {
  const previewSrc = item.images[0];

  return (
    <button
      className={`bg-bg-surface-elevated border-border-subtle group flex h-[260px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border px-6 py-5 text-left shadow-sm transition-shadow hover:shadow-md ${HELP_APPEAR_CLASS}`}
      style={helpAppearStyle(appearIndex)}
      type="button"
      onClick={onClick}
    >
      <div className="bg-bg-surface mb-3 flex h-[120px] w-full max-w-[200px] items-center justify-center overflow-hidden rounded-xl">
        {previewSrc ? (
          <img
            alt={item.title}
            className="max-h-[110px] max-w-[180px] object-contain"
            src={previewSrc}
          />
        ) : (
          <span className="text-text-muted text-xs">No preview</span>
        )}
      </div>
      <span className="text-text-primary group-hover:text-accent text-center text-lg font-semibold transition-colors">
        {item.title}
      </span>
    </button>
  );
}
