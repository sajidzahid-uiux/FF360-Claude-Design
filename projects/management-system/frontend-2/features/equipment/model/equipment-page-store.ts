"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type { EquipmentTypeEnum } from "@/api/types";
import type { EquipmentPageData } from "@/features/equipment";

interface EquipmentPageStore {
  selectedIds: (string | number)[];
  editingEquipment: EquipmentPageData | null;
  addEquipmentType: EquipmentTypeEnum | null;
  setSelectedIds: (selectedIds: (string | number)[]) => void;
  setEditingEquipment: (equipment: EquipmentPageData | null) => void;
  setAddEquipmentType: (type: EquipmentTypeEnum | null) => void;
  clearSelection: () => void;
}

export const useEquipmentPageStore = create<EquipmentPageStore>((set) => ({
  selectedIds: [],
  editingEquipment: null,
  addEquipmentType: null,

  setSelectedIds: (selectedIds) => {
    set({ selectedIds });
  },

  setEditingEquipment: (editingEquipment) => {
    set({ editingEquipment });
  },

  setAddEquipmentType: (addEquipmentType) => {
    set({ addEquipmentType });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },
}));

export function useEquipmentPageUi() {
  return useEquipmentPageStore(
    useShallow((state) => ({
      selectedIds: state.selectedIds,
      editingEquipment: state.editingEquipment,
      addEquipmentType: state.addEquipmentType,
      setSelectedIds: state.setSelectedIds,
      setEditingEquipment: state.setEditingEquipment,
      setAddEquipmentType: state.setAddEquipmentType,
      clearSelection: state.clearSelection,
    }))
  );
}
