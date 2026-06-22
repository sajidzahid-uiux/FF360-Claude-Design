import type { QuickAction } from "@/api/types";

export interface QuickActionOrgUiColumnHandlers {
  onView: (quickAction: QuickAction) => void;
  onEdit: (quickAction: QuickAction) => void;
  onDelete: (quickAction: QuickAction) => void;
  canManage: boolean;
}

export type QuickActionRowActionKey = "view" | "edit" | "delete";

export interface QuickActionRowActionDescriptor {
  key: QuickActionRowActionKey;
  label: string;
  variant?: "danger";
}

export function getQuickActionRowActionDescriptors(
  handlers: Pick<QuickActionOrgUiColumnHandlers, "canManage">
): QuickActionRowActionDescriptor[] {
  const actions: QuickActionRowActionDescriptor[] = [
    { key: "view", label: "View details" },
  ];

  if (handlers.canManage) {
    actions.push({ key: "edit", label: "Edit" });
    actions.push({
      key: "delete",
      label: "Delete",
      variant: "danger",
    });
  }

  return actions;
}

export function buildQuickActionRowActions(
  quickAction: QuickAction,
  handlers: QuickActionOrgUiColumnHandlers
): Array<QuickActionRowActionDescriptor & { onClick: () => void }> {
  return getQuickActionRowActionDescriptors(handlers).map((descriptor) => {
    const onClick =
      descriptor.key === "view"
        ? () => handlers.onView(quickAction)
        : descriptor.key === "edit"
          ? () => handlers.onEdit(quickAction)
          : () => handlers.onDelete(quickAction);

    return {
      ...descriptor,
      onClick,
    };
  });
}
