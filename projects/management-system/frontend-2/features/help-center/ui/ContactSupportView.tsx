"use client";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { Calendar } from "lucide-react";

import { HELP_APPEAR_CLASS, helpAppearStyle } from "../lib/helpCenterMotion";
import { CALENDLY_BOOKING_URL } from "../model/contactSupport";
import { SupportTeamCards } from "./SupportTeamCards";
import { SupportTicketForm } from "./SupportTicketForm";

export function ContactSupportView() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <header className={HELP_APPEAR_CLASS}>
        <h1 className="text-text-primary text-2xl font-bold tracking-tight md:text-3xl">
          Contact Support
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Reach the right team or submit a request and we will follow up by
          email.
        </p>
      </header>

      <section
        className={`space-y-4 ${HELP_APPEAR_CLASS}`}
        style={helpAppearStyle(1)}
      >
        <h2 className="text-text-primary text-lg font-semibold">
          Support Team
        </h2>
        <SupportTeamCards />
      </section>

      <section
        className={`space-y-3 ${HELP_APPEAR_CLASS}`}
        style={helpAppearStyle(2)}
      >
        <h2 className="text-text-primary text-lg font-semibold">
          Reserve a Free Session
        </h2>
        <div className="bg-bg-surface-elevated border-border-subtle flex flex-col gap-4 rounded-xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-text-muted text-sm leading-relaxed">
            Your free session is just a click away—book now through Calendly.
          </p>
          <a
            href={CALENDLY_BOOKING_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Button
              leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
              title="Book Now"
              variant={ButtonVariantEnum.ACCENT}
            />
          </a>
        </div>
      </section>

      <section
        className={`space-y-4 ${HELP_APPEAR_CLASS}`}
        style={helpAppearStyle(3)}
      >
        <h2 className="text-text-primary text-lg font-semibold">
          Submit a Support Request
        </h2>
        <SupportTicketForm />
      </section>
    </div>
  );
}
