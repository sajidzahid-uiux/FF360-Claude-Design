const TOTAL_STEPS = 4;

interface OrderPipeWizardStepIndicatorProps {
  currentStep: number;
  orientation?: "vertical" | "horizontal";
  onStepClick?: (step: number) => void;
}

function getStepInteraction(step: number, currentStep: number) {
  if (step === currentStep) return "current";
  if (step < currentStep) return "clickable";
  if (step === currentStep + 1) return "clickable";
  return "disabled";
}

export function OrderPipeWizardStepIndicator({
  currentStep,
  orientation = "vertical",
  onStepClick,
}: OrderPipeWizardStepIndicatorProps) {
  if (orientation === "horizontal") {
    return (
      <div className="relative flex h-12 w-full items-center justify-between px-2">
        <div className="bg-bg-surface absolute top-1/2 left-0 h-[7px] w-full -translate-y-1/2 rounded-full" />

        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => {
          const interaction = getStepInteraction(step, currentStep);
          return (
            <button
              key={step}
              className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                step === currentStep
                  ? "bg-foreground text-background"
                  : step < currentStep
                    ? "bg-bg-surface text-text-muted hover:bg-bg-surface/80"
                    : interaction === "clickable"
                      ? "border-border-subtle bg-bg-app text-text-primary hover:bg-bg-surface/50 border"
                      : "border-border-subtle bg-bg-app text-text-primary border opacity-50"
              } ${interaction === "clickable" ? "cursor-pointer" : ""}`}
              disabled={interaction === "current" || interaction === "disabled"}
              type="button"
              onClick={() => interaction === "clickable" && onStepClick?.(step)}
            >
              {step}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col items-center justify-between py-6">
      <div className="bg-border absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2" />

      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => {
        const interaction = getStepInteraction(step, currentStep);
        return (
          <button
            key={step}
            className={`relative z-10 flex h-[45px] w-[45px] flex-shrink-0 items-center justify-center rounded-full text-base font-semibold transition-colors ${
              step === currentStep
                ? "bg-foreground text-background"
                : step < currentStep
                  ? "bg-bg-surface text-text-muted hover:bg-bg-surface/80"
                  : interaction === "clickable"
                    ? "border-border-subtle bg-bg-app text-text-muted hover:bg-bg-surface/50 border-2"
                    : "border-border-subtle bg-bg-app text-text-muted border-2 opacity-50"
            } ${interaction === "clickable" ? "cursor-pointer" : ""}`}
            disabled={interaction === "current" || interaction === "disabled"}
            type="button"
            onClick={() => interaction === "clickable" && onStepClick?.(step)}
          >
            {step}
          </button>
        );
      })}
    </div>
  );
}
