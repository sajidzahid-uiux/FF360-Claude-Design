"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type { OrderPipeItemPayload, Vendor, VendorFormV2 } from "@/api/types";

export interface OrderDetailsItem extends OrderPipeItemPayload {
  optionLabel?: string;
}

export interface OrderPipeWizardSession {
  vendorFormId: number;
  order: VendorFormV2;
  selectedVendor: Vendor | null;
  searchResults: Vendor[];
  orderItems: OrderDetailsItem[];
  currentStep: number;
}

interface OrderPipeWizardStore {
  activeSessionId: number | null;
  sessions: Record<number, OrderPipeWizardSession>;
  openSession: (
    order: VendorFormV2,
    initialStep: number,
    initialItems?: OrderDetailsItem[]
  ) => void;
  closeSession: (vendorFormId: number) => void;
  setCurrentStep: (vendorFormId: number, currentStep: number) => void;
  setSelectedVendor: (vendorFormId: number, vendor: Vendor | null) => void;
  setSearchResults: (vendorFormId: number, vendors: Vendor[]) => void;
  setOrderItems: (vendorFormId: number, items: OrderDetailsItem[]) => void;
  addOrderItem: (vendorFormId: number, item: OrderDetailsItem) => void;
  removeOrderItem: (vendorFormId: number, index: number) => void;
  updateOrderItem: (
    vendorFormId: number,
    index: number,
    item: OrderDetailsItem
  ) => void;
}

function resolveSession(
  sessions: Record<number, OrderPipeWizardSession>,
  vendorFormId: number
): OrderPipeWizardSession | null {
  return sessions[vendorFormId] ?? null;
}

export const useOrderPipeWizardStore = create<OrderPipeWizardStore>(
  (set, get) => ({
    activeSessionId: null,
    sessions: {},

    openSession: (order, initialStep, initialItems = []) => {
      const vendorFormId = order.id;
      set((state) => ({
        activeSessionId: vendorFormId,
        sessions: {
          ...state.sessions,
          [vendorFormId]: {
            vendorFormId,
            order,
            selectedVendor: null,
            searchResults: [],
            orderItems: initialItems,
            currentStep: initialStep,
          },
        },
      }));
    },

    closeSession: (vendorFormId) => {
      set((state) => {
        const nextSessions = { ...state.sessions };
        delete nextSessions[vendorFormId];
        return {
          sessions: nextSessions,
          activeSessionId:
            state.activeSessionId === vendorFormId
              ? null
              : state.activeSessionId,
        };
      });
    },

    setCurrentStep: (vendorFormId, currentStep) => {
      const session = resolveSession(get().sessions, vendorFormId);
      if (!session) return;
      set((state) => ({
        activeSessionId: vendorFormId,
        sessions: {
          ...state.sessions,
          [vendorFormId]: { ...session, currentStep },
        },
      }));
    },

    setSelectedVendor: (vendorFormId, selectedVendor) => {
      const session = resolveSession(get().sessions, vendorFormId);
      if (!session) return;
      set((state) => ({
        sessions: {
          ...state.sessions,
          [vendorFormId]: { ...session, selectedVendor },
        },
      }));
    },

    setSearchResults: (vendorFormId, searchResults) => {
      const session = resolveSession(get().sessions, vendorFormId);
      if (!session) return;
      set((state) => ({
        sessions: {
          ...state.sessions,
          [vendorFormId]: { ...session, searchResults },
        },
      }));
    },

    setOrderItems: (vendorFormId, orderItems) => {
      const session = resolveSession(get().sessions, vendorFormId);
      if (!session) return;
      set((state) => ({
        sessions: {
          ...state.sessions,
          [vendorFormId]: { ...session, orderItems },
        },
      }));
    },

    addOrderItem: (vendorFormId, item) => {
      const session = resolveSession(get().sessions, vendorFormId);
      if (!session) return;
      set((state) => ({
        sessions: {
          ...state.sessions,
          [vendorFormId]: {
            ...session,
            orderItems: [...session.orderItems, item],
          },
        },
      }));
    },

    removeOrderItem: (vendorFormId, index) => {
      const session = resolveSession(get().sessions, vendorFormId);
      if (!session) return;
      set((state) => ({
        sessions: {
          ...state.sessions,
          [vendorFormId]: {
            ...session,
            orderItems: session.orderItems.filter((_, i) => i !== index),
          },
        },
      }));
    },

    updateOrderItem: (vendorFormId, index, item) => {
      const session = resolveSession(get().sessions, vendorFormId);
      if (!session) return;
      set((state) => ({
        sessions: {
          ...state.sessions,
          [vendorFormId]: {
            ...session,
            orderItems: session.orderItems.map((existing, i) =>
              i === index ? item : existing
            ),
          },
        },
      }));
    },
  })
);

export function useOrderPipeWizardSession(vendorFormId: number | null) {
  return useOrderPipeWizardStore(
    useShallow((state) => {
      if (vendorFormId == null) return null;
      return state.sessions[vendorFormId] ?? null;
    })
  );
}

export function useOrderPipeWizardActions() {
  return useOrderPipeWizardStore(
    useShallow((state) => ({
      openSession: state.openSession,
      closeSession: state.closeSession,
      setCurrentStep: state.setCurrentStep,
      setSelectedVendor: state.setSelectedVendor,
      setSearchResults: state.setSearchResults,
      setOrderItems: state.setOrderItems,
      addOrderItem: state.addOrderItem,
      removeOrderItem: state.removeOrderItem,
      updateOrderItem: state.updateOrderItem,
    }))
  );
}

export function getOrderItemsPayload(
  items: OrderDetailsItem[]
): OrderPipeItemPayload[] {
  return items.map(({ pipe_type, sub_type, size, quantity }) => ({
    pipe_type,
    ...(sub_type != null && sub_type !== "" ? { sub_type } : {}),
    size,
    quantity,
  }));
}
