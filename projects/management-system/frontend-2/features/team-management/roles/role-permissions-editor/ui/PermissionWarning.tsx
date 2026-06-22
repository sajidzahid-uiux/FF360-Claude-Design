import { AlertCircle } from "lucide-react";

interface PermissionWarningProps {
  message: string;
}

export function PermissionWarning({ message }: PermissionWarningProps) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-md border border-yellow-500 bg-yellow-50 p-3">
      <AlertCircle className="h-4 w-4 shrink-0 text-yellow-600" />
      <p className="text-sm text-yellow-800">{message}</p>
    </div>
  );
}
