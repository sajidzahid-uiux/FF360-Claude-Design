import { Button } from '../../ui-components/Button';

export interface NotFoundProps {
  title?: string;
  description?: string;
  backLabel?: string;
  onBack?: () => void;
}

export function NotFound({
  title = 'Page Not Found',
  description = 'The content you are trying to access is unavailable or may have moved.',
  backLabel = 'Back',
  onBack,
}: NotFoundProps) {
  return (
    <div className="flex items-center justify-center p-6 md:p-12">
      <div className="border-border-subtle bg-bg-surface-elevated w-full max-w-xl rounded-2xl border p-8 text-center shadow-sm">
        <div className="bg-accent/20 text-text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-7 w-7"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519A3 3 0 0 1 12 6.75h0a3 3 0 0 1 2.121.879l2.25 2.25A3 3 0 0 1 17.25 12h0a3 3 0 0 1-.879 2.121l-2.25 2.25A3 3 0 0 1 12 17.25h0a3 3 0 0 1-2.121-.879l-2.25-2.25A3 3 0 0 1 6.75 12h0a3 3 0 0 1 .879-2.121l2.25-2.25Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12h4.5" />
          </svg>
        </div>
        <p className="text-text-primary text-xl font-semibold">{title}</p>
        {description ? (
          <p className="text-text-muted mt-2 text-sm">{description}</p>
        ) : null}
        {onBack ? (
          <Button onClick={onBack} className="mt-6" title={backLabel} />
        ) : null}
      </div>
    </div>
  );
}
