"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  SearchInput,
  TabsSwitcher,
  TabsSwitcherViewEnum,
} from "@fieldflow360/org-ui";
import { BookOpen, CircleHelp, Play } from "lucide-react";

import { HELP_APPEAR_CLASS, helpAppearStyle } from "../lib/helpCenterMotion";
import { FAQS_PER_PAGE, HELP_FAQ_ITEMS, HELP_QUICK_LINKS } from "../model/faqs";
import { HelpFaqAccordion } from "./HelpFaqAccordion";

type HelpContentTab = "faqs" | "quick-links";

const CONTENT_TABS = [
  { value: "faqs" as const, label: "FAQs" },
  { value: "quick-links" as const, label: "Quick Links" },
];

const QUICK_LINK_ICONS = {
  video: Play,
  book: BookOpen,
  steps: CircleHelp,
} as const;

export function HelpCenterPageContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqPage, setFaqPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentTab, setContentTab] = useState<HelpContentTab>("faqs");

  const filteredFaqs = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();
    if (!searchLower) {
      return HELP_FAQ_ITEMS;
    }
    return HELP_FAQ_ITEMS.filter((faq) => {
      const answerText =
        typeof faq.answer === "string" ? faq.answer.toLowerCase() : "";
      return (
        faq.question.toLowerCase().includes(searchLower) ||
        answerText.includes(searchLower)
      );
    });
  }, [searchQuery]);

  const totalFaqPages = Math.max(
    1,
    Math.ceil(filteredFaqs.length / FAQS_PER_PAGE)
  );
  const paginatedFaqs = filteredFaqs.slice(
    faqPage * FAQS_PER_PAGE,
    (faqPage + 1) * FAQS_PER_PAGE
  );

  useEffect(() => {
    setFaqPage(0);
    setOpenIndex(null);
  }, [searchQuery]);

  useEffect(() => {
    if (faqPage >= totalFaqPages) {
      setFaqPage(totalFaqPages - 1);
    }
  }, [faqPage, totalFaqPages]);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <header className={HELP_APPEAR_CLASS}>
        <h1 className="text-text-primary text-2xl font-bold tracking-tight md:text-3xl">
          Help Center
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Search FAQs or browse quick links for common workflows.
        </p>
      </header>

      <div className={HELP_APPEAR_CLASS} style={helpAppearStyle(1)}>
        <SearchInput
          className="w-full max-w-md"
          placeholder="Search questions and answers"
          value={searchQuery}
          variant="underlined"
          onChange={(event) => setSearchQuery(event.target.value)}
          onClear={() => setSearchQuery("")}
        />
      </div>

      <div className={HELP_APPEAR_CLASS} style={helpAppearStyle(2)}>
        <TabsSwitcher
          items={[...CONTENT_TABS]}
          size={ComponentSizeEnum.SM}
          value={contentTab}
          view={TabsSwitcherViewEnum.PILL}
          onChange={setContentTab}
        />
      </div>

      {contentTab === "faqs" ? (
        <>
          {paginatedFaqs.length > 0 ? (
            <HelpFaqAccordion
              items={paginatedFaqs}
              openIndex={openIndex}
              onToggle={(index) =>
                setOpenIndex((current) => (current === index ? null : index))
              }
            />
          ) : (
            <p
              className={`text-text-muted py-12 text-center text-sm ${HELP_APPEAR_CLASS}`}
            >
              No FAQs match your search.
            </p>
          )}
          {filteredFaqs.length > 0 ? (
            <div
              className={`flex flex-wrap justify-center gap-2 ${HELP_APPEAR_CLASS}`}
              style={helpAppearStyle(4)}
            >
              {Array.from({ length: totalFaqPages }).map((_, index) => (
                <Button
                  key={index}
                  aria-label={String(index + 1)}
                  size={ComponentSizeEnum.SM}
                  title={String(index + 1)}
                  variant={
                    faqPage === index
                      ? ButtonVariantEnum.ACCENT
                      : ButtonVariantEnum.SURFACE
                  }
                  onClick={() => {
                    setOpenIndex(null);
                    setFaqPage(index);
                  }}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <section className={HELP_APPEAR_CLASS} style={helpAppearStyle(3)}>
          <h2 className="text-text-primary mb-4 text-lg font-semibold">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HELP_QUICK_LINKS.map((link, index) => {
              const Icon = QUICK_LINK_ICONS[link.icon];
              return (
                <div
                  key={link.label}
                  className={`bg-bg-surface-elevated border-border-subtle flex flex-col items-center justify-center rounded-xl border p-8 shadow-sm transition-shadow hover:shadow-md ${HELP_APPEAR_CLASS}`}
                  style={helpAppearStyle(index)}
                >
                  <span className="bg-bg-surface text-accent mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                    <Icon aria-hidden className="h-6 w-6" />
                  </span>
                  <span className="text-text-primary text-base font-medium">
                    {link.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
