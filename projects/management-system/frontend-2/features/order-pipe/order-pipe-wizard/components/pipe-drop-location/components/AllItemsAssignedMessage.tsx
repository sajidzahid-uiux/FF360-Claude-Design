export interface AllItemsAssignedMessageProps {
  show: boolean;
}

export function AllItemsAssignedMessage({
  show,
}: AllItemsAssignedMessageProps) {
  if (!show) return null;

  return (
    <div className="mt-6 rounded-lg border border-green-500 bg-green-50 p-4 dark:bg-green-950">
      <p className="text-center font-medium text-green-700 dark:text-green-300">
        ✓ All your items have been assigned a location. You may now proceed to
        step 4.
      </p>
    </div>
  );
}
