"use client";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";

import { GallerySection, PrototypeChrome } from "../../_prototype/PrototypeChrome";

export default function NewModulePage() {
  return (
    <PrototypeChrome
      title="New Module"
      subtitle="A blank sandbox for prototyping a brand-new module entirely from org-ui components, before it lands in the CMS."
      active="/flows"
    >
      <GallerySection title="Sandbox" description="Start composing here. Everything is wired to the org-ui design system and dummy data.">
        <div className="flex flex-col items-start gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This page is intentionally empty — drop in org-ui components to
            mock up the new module. Reference the{" "}
            <a className="font-medium underline" href="/design-system">
              Design System
            </a>{" "}
            for available building blocks.
          </p>
          <Button title="Placeholder action" variant={ButtonVariantEnum.ACCENT} />
        </div>
      </GallerySection>
    </PrototypeChrome>
  );
}
