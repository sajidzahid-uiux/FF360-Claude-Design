"use client";

import { Button, ButtonVariantEnum, Modal } from "@fieldflow360/org-ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface KnowledgeBaseCarouselDialogProps {
  isOpen: boolean;
  sectionTitle: string | null;
  itemTitle: string | null;
  images: string[];
  carouselIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelectIndex: (index: number) => void;
}

export function KnowledgeBaseCarouselDialog({
  isOpen,
  sectionTitle,
  itemTitle,
  images,
  carouselIndex,
  onClose,
  onPrev,
  onNext,
  onSelectIndex,
}: KnowledgeBaseCarouselDialogProps) {
  const title = sectionTitle ?? "Knowledge Base";
  const hasImages = images.length > 0;

  return (
    <Modal isOpen={isOpen} size="2xl" title={title} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {itemTitle ? (
          <p className="text-text-muted text-sm font-medium">{itemTitle}</p>
        ) : null}

        <div className="relative flex min-h-[50vh] items-center justify-center rounded-lg bg-black/5 dark:bg-white/5">
          {images.length > 1 ? (
            <>
              <button
                aria-label="Previous slide"
                className="bg-bg-surface-elevated border-border-subtle absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full border p-2 shadow-md"
                type="button"
                onClick={onPrev}
              >
                <ChevronLeft aria-hidden className="h-5 w-5" />
              </button>
              <button
                aria-label="Next slide"
                className="bg-bg-surface-elevated border-border-subtle absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full border p-2 shadow-md"
                type="button"
                onClick={onNext}
              >
                <ChevronRight aria-hidden className="h-5 w-5" />
              </button>
            </>
          ) : null}

          {hasImages ? (
            <img
              alt={itemTitle ?? "Knowledge base slide"}
              className="max-h-[65vh] w-auto max-w-full object-contain"
              src={images[carouselIndex]}
            />
          ) : (
            <span className="text-text-muted text-sm">No image available</span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-text-muted text-sm">
            {hasImages ? `${carouselIndex + 1} of ${images.length}` : "0 of 0"}
          </span>
          {images.length > 1 ? (
            <div className="flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === carouselIndex ? "bg-accent" : "bg-text-muted/30"
                  }`}
                  type="button"
                  onClick={() => onSelectIndex(index)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end">
          <Button
            aria-label="Close"
            title="Close"
            variant={ButtonVariantEnum.SURFACE}
            onClick={onClose}
          />
        </div>
      </div>
    </Modal>
  );
}
