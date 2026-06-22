export const BASE_ITEMS = {
  farmer: {
    id: "farmer",
    label: "Farmer File",
    payload: {
      fileType: "farmer" as const,
      fileName: "",
      isFixedTitle: false,
    },
  },
  contractor: {
    id: "contractor",
    label: "Contractor File",
    payload: {
      fileType: "contractor" as const,
      fileName: "",
      isFixedTitle: false,
    },
  },
  designer: {
    id: "designer",
    label: "Designer File",
    payload: {
      fileType: "designer" as const,
      fileName: "",
      isFixedTitle: false,
    },
  },
  one_call: {
    id: "one_call",
    label: "One Call File",
    payload: {
      fileType: "one_call" as const,
      fileName: "one_call_file",
      isFixedTitle: false,
    },
  },
  other: {
    id: "other",
    label: "Other",
    payload: {
      fileType: "contractor" as const,
      fileName: "",
      isFixedTitle: false,
    },
  },
} as const;

export type BaseItemKey = keyof typeof BASE_ITEMS;
