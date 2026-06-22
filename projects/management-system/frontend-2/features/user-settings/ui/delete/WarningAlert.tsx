import { cn } from "@fieldflow360/org-ui";
import { AlertCircle } from "lucide-react";

interface WarningAlertProps {
  className?: string;
}

export default function WarningAlert({ className }: WarningAlertProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-[var(--color-feedback-error)]/25 bg-[var(--color-feedback-error-soft)] px-4 py-3",
        className
      )}
      role="alert"
    >
      <AlertCircle
        aria-hidden
        className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-feedback-error)]"
      />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-[var(--color-feedback-error-strong)]">
          This action is irreversible
        </p>
        <p className="text-text-secondary text-sm leading-relaxed">
          Once you delete your account, your profile and associated personal
          data will be permanently removed.
        </p>
      </div>
    </div>
  );
}
