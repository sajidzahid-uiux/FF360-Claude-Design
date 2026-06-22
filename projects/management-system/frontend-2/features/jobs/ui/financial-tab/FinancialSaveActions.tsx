import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";

interface FinancialSaveActionsProps {
  isPending: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function FinancialSaveActions({
  isPending,
  onCancel,
  onSave,
}: FinancialSaveActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        aria-label="Cancel"
        disabled={isPending}
        title="Cancel"
        variant={ButtonVariantEnum.SURFACE}
        onClick={onCancel}
      />
      <Button
        aria-label="Save"
        disabled={isPending}
        loading={isPending}
        title="Save"
        onClick={onSave}
      />
    </div>
  );
}
