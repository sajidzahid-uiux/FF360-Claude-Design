"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  SearchInput,
} from "@fieldflow360/org-ui";
import { Layers } from "lucide-react";

import { useModalStack } from "@/shared/model/use-modal-stack";
import { Filter, FilterState, FilterType } from "@/shared/ui/common";

import { HELP_APPEAR_CLASS, helpAppearStyle } from "../lib/helpCenterMotion";
import { KNOWLEDGE_BASE_SECTIONS_PER_PAGE } from "../model/faqs";
import { KNOWLEDGE_BASE_SECTIONS } from "../model/knowledgeBase";
import type { KnowledgeBaseSection } from "../model/types";
import { KnowledgeBaseArticleCard } from "./KnowledgeBaseArticleCard";
import { KnowledgeBaseCarouselDialog } from "./KnowledgeBaseCarouselDialog";

interface KnowledgeBaseDialogState {
  sectionTitle: string;
  itemTitle: string;
  images: string[];
}

const KNOWLEDGE_BASE_MODAL_KEY = "view-knowledge-base";

export function KnowledgeBaseView() {
  const { stack, openModal, closeModalKey } = useModalStack();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<FilterState>({});
  const [carouselIndex, setCarouselIndex] = useState(0);

  const dialogFrame = stack.find((f) => f.key === KNOWLEDGE_BASE_MODAL_KEY);

  const dialog = useMemo((): KnowledgeBaseDialogState | null => {
    if (!dialogFrame) return null;
    const sectionIndex = Number(dialogFrame.params.s);
    const itemIndex = Number(dialogFrame.params.i);
    const section = KNOWLEDGE_BASE_SECTIONS[sectionIndex];
    const item = section?.items[itemIndex];
    if (!section || !item) return null;
    return {
      sectionTitle: section.section,
      itemTitle: item.title,
      images: item.images,
    };
  }, [dialogFrame]);

  // Reset the carousel whenever a different guide is opened.
  const dialogKey = dialogFrame
    ? `${dialogFrame.params.s}-${dialogFrame.params.i}`
    : null;
  useEffect(() => {
    setCarouselIndex(0);
  }, [dialogKey]);

  const allSections = useMemo(
    () => KNOWLEDGE_BASE_SECTIONS.map((section) => section.section),
    []
  );

  const filteredSections = useMemo((): KnowledgeBaseSection[] => {
    const searchLower = search.trim().toLowerCase();
    const selectedSections = Array.isArray(
      filters[FilterType.KNOWLEDGE_BASE_SECTIONS]
    )
      ? filters[FilterType.KNOWLEDGE_BASE_SECTIONS]
      : [];

    return KNOWLEDGE_BASE_SECTIONS.map((section) => {
      const filteredItems = section.items.filter((item) => {
        const matchesSection =
          selectedSections.length === 0 ||
          selectedSections.includes(section.section) ||
          selectedSections.includes(item.title);
        const matchesSearch =
          !searchLower ||
          item.title.toLowerCase().includes(searchLower) ||
          section.section.toLowerCase().includes(searchLower);
        return matchesSection && matchesSearch;
      });
      return { ...section, items: filteredItems };
    }).filter((section) => section.items.length > 0);
  }, [filters, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSections.length / KNOWLEDGE_BASE_SECTIONS_PER_PAGE)
  );

  const paginatedSections = filteredSections.slice(
    currentPage * KNOWLEDGE_BASE_SECTIONS_PER_PAGE,
    (currentPage + 1) * KNOWLEDGE_BASE_SECTIONS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [search, filters]);

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  const openDialog = useCallback(
    (sectionTitle: string, itemTitle: string) => {
      const sectionIndex = KNOWLEDGE_BASE_SECTIONS.findIndex(
        (s) => s.section === sectionTitle
      );
      if (sectionIndex === -1) return;
      const itemIndex = KNOWLEDGE_BASE_SECTIONS[sectionIndex].items.findIndex(
        (item) => item.title === itemTitle
      );
      if (itemIndex === -1) return;
      openModal(KNOWLEDGE_BASE_MODAL_KEY, {
        s: String(sectionIndex),
        i: String(itemIndex),
      });
    },
    [openModal]
  );

  const closeDialog = useCallback(() => {
    closeModalKey(KNOWLEDGE_BASE_MODAL_KEY);
  }, [closeModalKey]);

  const handlePrev = useCallback(() => {
    if (!dialog?.images.length) return;
    setCarouselIndex((index) =>
      index === 0 ? dialog.images.length - 1 : index - 1
    );
  }, [dialog?.images.length]);

  const handleNext = useCallback(() => {
    if (!dialog?.images.length) return;
    setCarouselIndex((index) =>
      index === dialog.images.length - 1 ? 0 : index + 1
    );
  }, [dialog?.images.length]);

  return (
    <div className="flex w-full max-w-6xl flex-col gap-8">
      <header className={HELP_APPEAR_CLASS}>
        <h1 className="text-text-primary text-2xl font-bold tracking-tight md:text-3xl">
          Knowledge Base
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Step-by-step guides organized by workflow.
        </p>
      </header>

      <div
        className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${HELP_APPEAR_CLASS}`}
        style={helpAppearStyle(1)}
      >
        <SearchInput
          className="w-full sm:max-w-sm md:max-w-md"
          placeholder="Search guides"
          value={search}
          variant="underlined"
          onChange={(event) => setSearch(event.target.value)}
          onClear={() => setSearch("")}
        />
        <div className="shrink-0">
          <Filter
            showClearAll
            wrapInModal
            configs={[
              {
                key: FilterType.KNOWLEDGE_BASE_SECTIONS,
                label: "Section",
                items: allSections.map((section) => ({
                  id: section,
                  title: section,
                })),
                labelField: "title",
                idField: "id",
                icon: <Layers aria-hidden className="h-4 w-4" />,
                renderItem: (item) => (
                  <span>{String(item.title ?? item.id)}</span>
                ),
              },
            ]}
            direction="vertical"
            filterState={filters}
            onFilterChange={setFilters}
          />
        </div>
      </div>

      <div className="space-y-12">
        {paginatedSections.map((section, sectionIndex) => (
          <section
            key={section.section}
            className={HELP_APPEAR_CLASS}
            style={helpAppearStyle(sectionIndex + 2)}
          >
            <h2 className="text-text-primary mb-4 text-lg font-semibold">
              {section.section}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {section.items.map((item, itemIndex) => (
                <KnowledgeBaseArticleCard
                  key={item.title}
                  appearIndex={itemIndex}
                  item={item}
                  onClick={() => openDialog(section.section, item.title)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {filteredSections.length > 0 ? (
        <div
          className={`flex flex-wrap justify-center gap-2 ${HELP_APPEAR_CLASS}`}
          style={helpAppearStyle(3)}
        >
          <Button
            aria-label="Prev"
            disabled={currentPage === 0}
            size={ComponentSizeEnum.SM}
            title="Prev"
            variant={ButtonVariantEnum.SURFACE}
            onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
          />
          {Array.from({ length: totalPages }).map((_, index) => (
            <Button
              key={index}
              aria-label={String(index + 1)}
              size={ComponentSizeEnum.SM}
              title={String(index + 1)}
              variant={
                currentPage === index
                  ? ButtonVariantEnum.ACCENT
                  : ButtonVariantEnum.SURFACE
              }
              onClick={() => setCurrentPage(index)}
            />
          ))}
          <Button
            aria-label="Next"
            disabled={currentPage >= totalPages - 1}
            size={ComponentSizeEnum.SM}
            title="Next"
            variant={ButtonVariantEnum.SURFACE}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages - 1, page + 1))
            }
          />
        </div>
      ) : (
        <p
          className={`text-text-muted py-12 text-center text-sm ${HELP_APPEAR_CLASS}`}
        >
          No guides match your search or filters.
        </p>
      )}

      <KnowledgeBaseCarouselDialog
        carouselIndex={carouselIndex}
        images={dialog?.images ?? []}
        isOpen={dialog !== null}
        itemTitle={dialog?.itemTitle ?? null}
        sectionTitle={dialog?.sectionTitle ?? null}
        onClose={closeDialog}
        onNext={handleNext}
        onPrev={handlePrev}
        onSelectIndex={setCarouselIndex}
      />
    </div>
  );
}
