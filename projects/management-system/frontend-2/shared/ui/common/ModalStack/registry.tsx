"use client";

import dynamic from "next/dynamic";

import type { ModalParams } from "@/shared/model/modal-url";

/**
 * Context handed to every registered modal renderer.
 *  - params: scalar params decoded from the URL frame
 *  - close:  closes THIS modal (and anything stacked above it)
 *  - isTop:  whether this is the top-most modal in the stack
 */
export interface ModalRenderContext {
  params: ModalParams;
  close: () => void;
  isTop: boolean;
}

export interface ModalRegistryEntry {
  render: (ctx: ModalRenderContext) => React.ReactNode;
}

/**
 * Central modal registry: URL key -> how to render it.
 *
 * Components are lazy-loaded so the whole modal graph isn't pulled into the
 * initial bundle. Each entry adapts the shared (params/close) context to that
 * modal's own prop shape (open/onOpenChange vs isOpen/onClose, etc.).
 *
 * Add a new modal: register a kebab-case key here, then open it from anywhere
 * with useModalStack().openModal("<key>", { id: "..." }).
 */

// ---- Contacts ----------------------------------------------------------------
const AddContactModal = dynamic(() =>
  import("@/features/contacts").then((m) => ({ default: m.AddContactModal }))
);
const FarmContactModal = dynamic(() =>
  import("@/features/contacts").then((m) => ({ default: m.FarmContactModal }))
);
const AddOnSiteOperationModal = dynamic(() =>
  import("@/features/contacts").then((m) => ({
    default: m.AddOnSiteOperationModal,
  }))
);

// ---- Leads / Jobs ------------------------------------------------------------
// Self-contained connected modals: they read the URL stack and own their create
// logic, so they can render globally (over any module) from the "+" button.
const AddLeadModalConnected = dynamic(() =>
  import("@/features/job-lead").then((m) => ({
    default: m.AddLeadModalConnected,
  }))
);
const AddJobModalConnected = dynamic(() =>
  import("@/features/job-lead").then((m) => ({
    default: m.AddJobModalConnected,
  }))
);

// ---- Equipment ---------------------------------------------------------------
const AddEquipmentModalConnected = dynamic(() =>
  import("@/features/equipment").then((m) => ({
    default: m.AddEquipmentModalConnected,
  }))
);

export const MODAL_REGISTRY: Record<string, ModalRegistryEntry> = {
  "add-contact": {
    render: ({ close }) => (
      <AddContactModal
        open
        onOpenChange={(open) => {
          if (!open) close();
        }}
      />
    ),
  },
  "add-farm-contact": {
    render: ({ close }) => (
      <FarmContactModal
        open
        onOpenChange={(open) => {
          if (!open) close();
        }}
      />
    ),
  },
  "edit-farm-contact": {
    render: ({ params, close }) => (
      <FarmContactModal
        open
        contactId={params.id != null ? Number(params.id) : null}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      />
    ),
  },
  "add-onsite-operation": {
    render: ({ close }) => (
      <AddOnSiteOperationModal
        open
        onOpenChange={(open) => {
          if (!open) close();
        }}
      />
    ),
  },
  // These read the stack themselves, so render takes no args.
  "add-lead": {
    render: () => <AddLeadModalConnected />,
  },
  "add-job": {
    render: () => <AddJobModalConnected />,
  },
  "add-equipment": {
    render: () => <AddEquipmentModalConnected />,
  },
};

export function getModalEntry(key: string): ModalRegistryEntry | undefined {
  return MODAL_REGISTRY[key];
}
