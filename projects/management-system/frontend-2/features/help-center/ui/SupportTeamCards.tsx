"use client";

import { Headphones, Mail, Timer } from "lucide-react";

import { SUPPORT_TEAM_CARDS } from "../model/contactSupport";

export function SupportTeamCards() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {SUPPORT_TEAM_CARDS.map((team) => (
        <article
          key={team.title}
          className="bg-bg-surface-elevated border-border-subtle flex flex-col gap-3 rounded-xl border p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="bg-accent/10 text-accent flex h-10 w-10 items-center justify-center rounded-full">
              <Headphones aria-hidden className="h-5 w-5" />
            </span>
            <h3 className="text-text-primary text-base font-semibold">
              {team.title}
            </h3>
          </div>
          <p className="text-text-muted text-sm leading-relaxed">
            {team.description}
          </p>
          <p className="text-text-primary mt-auto flex items-start gap-2 space-y-2 text-xs">
            <Mail
              aria-hidden
              className="text-text-muted mt-0.5 h-4 w-4 shrink-0"
            />
            <span>
              <span className="font-medium">Email: </span>
              <a
                className="text-accent hover:underline"
                href={`mailto:${team.email}`}
              >
                {team.email}
              </a>
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Timer aria-hidden className="text-text-muted h-4 w-4 shrink-0" />
            <span>
              <span className="font-medium">Response: </span>
              {team.responseTime}
            </span>
          </p>
        </article>
      ))}
    </div>
  );
}
