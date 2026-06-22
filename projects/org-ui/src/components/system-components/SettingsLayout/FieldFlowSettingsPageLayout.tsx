import { ReactNode } from 'react';

export interface FieldFlowSettingsPageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FieldFlowSettingsPageLayout({
  title,
  description,
  children,
}: FieldFlowSettingsPageLayoutProps) {
  return (
    <div className="flex w-full flex-col px-4 py-5 sm:px-6 md:px-8 md:py-7 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-5 flex flex-col gap-1.5 md:mb-7">
          <h1 className="text-text-primary text-2xl leading-[1.15] font-semibold tracking-[-0.02em] md:text-[38px] md:leading-[1.1]">
            {title}
          </h1>
          {description ? (
            <p className="text-text-secondary text-sm leading-6 md:text-base">{description}</p>
          ) : null}
        </header>
        {children}
      </div>
    </div>
  );
}

