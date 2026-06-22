import { AlertCircle, ArrowLeft } from "lucide-react";

interface OrderPipeWizardStepHeaderProps {
  /** When provided, step number is shown before the title (e.g. "1. Title"). Omit for no step. */
  stepNumber?: number;
  title: string;
  warning?: string;
  onBack: () => void;
}

export function OrderPipeWizardStepHeader({
  stepNumber,
  title,
  warning,
  onBack,
}: OrderPipeWizardStepHeaderProps) {
  return (
    <div className="min-w-0">
      <button
        className="text-text-primary mb-2 flex w-full items-center gap-2 text-left text-xl leading-tight font-semibold tracking-[-0.4px] transition-opacity hover:opacity-80 md:gap-4 md:text-[36px] md:leading-[1.2]"
        onClick={onBack}
      >
        <ArrowLeft className="h-6 w-6 flex-shrink-0 md:h-8 md:w-8" />
        {stepNumber != null && (
          <span className="flex-shrink-0 text-[36px] leading-[1.2] font-semibold">
            {stepNumber}.
          </span>
        )}
        <span className="min-w-0 truncate text-[36px] leading-[1.2] font-semibold">
          {title}
        </span>
      </button>
      {warning ? (
        <div
          className={`flex items-center gap-2 px-2 py-2 md:px-4 md:py-3 ${stepNumber != null ? "ml-8 md:ml-[48px]" : ""}`}
        >
          <span className="text-feedback-error flex flex-shrink-0 items-center justify-center">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
          </span>
          <p className="text-feedback-error m-0 min-w-0 text-sm leading-tight md:text-[20px] md:leading-normal">
            {warning}
          </p>
        </div>
      ) : (
        <div
          aria-hidden
          className={`min-h-[52px] md:min-h-[60px] ${stepNumber != null ? "ml-8 md:ml-[48px]" : ""}`}
        />
      )}
    </div>
  );
}
