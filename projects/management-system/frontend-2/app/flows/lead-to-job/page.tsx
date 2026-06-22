"use client";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";

import { GallerySection, PrototypeChrome } from "../../_prototype/PrototypeChrome";

const STEPS = [
  { n: 1, title: "Capture lead", detail: "New lead enters with contact, location, and project type." },
  { n: 2, title: "Qualify & estimate", detail: "Add acreage, attach maps, generate an estimate." },
  { n: 3, title: "Convert to job", detail: "Approve the lead and convert it into an active job." },
  { n: 4, title: "Schedule & assign crew", detail: "Place the job on the calendar and assign a crew." },
];

export default function LeadToJobPage() {
  return (
    <PrototypeChrome
      title="Lead → Job"
      subtitle="Prototype of the lead-to-job conversion journey. Scaffolded with org-ui components; wiring up step screens next."
      active="/flows"
    >
      <GallerySection title="Journey" description="The end-to-end path from lead capture to an active, crewed job.">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
                {s.n}
              </span>
              <h4 className="mt-3 font-semibold">{s.title}</h4>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{s.detail}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex gap-3">
          <Button title="Start: open Leads" variant={ButtonVariantEnum.DEFAULT} onClick={() => { window.location.href = "/organizations/1/leads"; }} />
          <Button title="View Jobs" variant={ButtonVariantEnum.GHOST} onClick={() => { window.location.href = "/organizations/1/jobs"; }} />
        </div>
      </GallerySection>

      <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        This is a scaffold. Next: add realistic lead/job dummy data to
        <code className="mx-1 rounded bg-zinc-200 px-1 dark:bg-zinc-800">mocks/mockApi.ts</code>
        and build each step screen from org-ui components.
      </p>
    </PrototypeChrome>
  );
}
