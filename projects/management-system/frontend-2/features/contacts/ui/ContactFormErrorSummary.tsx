import { AlertCircle } from "lucide-react";

interface ContactFormErrorSummaryProps {
  fieldErrors: Record<string, string>;
}

function formatFieldLabel(field: string): string {
  return field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function ContactFormErrorSummary({
  fieldErrors,
}: ContactFormErrorSummaryProps) {
  if (Object.keys(fieldErrors).length === 0) return null;

  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-[var(--color-feedback-error)]/30 bg-[var(--color-feedback-error-soft)] p-4">
      <AlertCircle
        aria-hidden
        className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-feedback-error)]"
      />
      <div className="flex-1">
        <p className="font-medium text-[var(--color-feedback-error-strong)]">
          Please fix the following errors:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--color-feedback-error)]">
          {Object.entries(fieldErrors).map(([field, error]) => (
            <li key={field}>
              <span className="font-medium">{formatFieldLabel(field)}</span>:{" "}
              {error}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
