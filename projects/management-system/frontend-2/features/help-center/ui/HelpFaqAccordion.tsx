"use client";

import { useRouter } from "next/navigation";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { ChevronDown } from "lucide-react";

import { HELP_APPEAR_CLASS, helpAppearStyle } from "../lib/helpCenterMotion";
import type { HelpFaqItem } from "../model/faqs";

interface HelpFaqAccordionProps {
  items: HelpFaqItem[];
  openIndex: number | null;
  onToggle: (index: number) => void;
}

function renderAnswer(item: HelpFaqItem, onContactSupport: () => void) {
  if (item.answer === "contact-support-cta") {
    return (
      <div className="space-y-3">
        <p className="text-text-muted text-sm leading-relaxed">
          You can email{" "}
          <a
            className="text-accent font-medium hover:underline"
            href="mailto:customer.support@fieldflow360.com"
          >
            customer.support@fieldflow360.com
          </a>{" "}
          or submit a support request.
        </p>
        <Button
          aria-label="Contact Support"
          size={ComponentSizeEnum.SM}
          title="Contact Support"
          variant={ButtonVariantEnum.ACCENT}
          onClick={onContactSupport}
        />
      </div>
    );
  }

  return (
    <p className="text-text-muted text-sm leading-relaxed">{item.answer}</p>
  );
}

export function HelpFaqAccordion({
  items,
  openIndex,
  onToggle,
}: HelpFaqAccordionProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.question}
            className={`bg-bg-surface-elevated border-border-subtle overflow-hidden rounded-xl border shadow-sm ${HELP_APPEAR_CLASS}`}
            style={helpAppearStyle(index)}
          >
            <button
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
              type="button"
              onClick={() => onToggle(index)}
            >
              <span className="text-text-primary text-sm font-medium md:text-base">
                {item.question}
              </span>
              <ChevronDown
                aria-hidden
                className={`text-text-muted h-5 w-5 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  aria-hidden={!isOpen}
                  className={`px-4 pt-3 pb-5 ${isOpen ? "animate-in fade-in slide-in-from-top-1 duration-200" : ""}`}
                >
                  <span className="bg-bg-surface text-text-muted mb-3 block rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide uppercase">
                    Answer
                  </span>
                  <div className="pl-0.5">
                    {isOpen
                      ? renderAnswer(item, () =>
                          router.push("/help-center/contact-support")
                        )
                      : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
