import { useCallback } from 'react';
import { ButtonVariantEnum, ComponentSizeEnum } from '../../../constants';
import { cn } from '../../../utils/cn';
import { Button } from '../../ui-components/Button';

export interface DownloadedFileProps {
  fileName: string;
  fileSize?: string;
  fileSizeBytes?: number;
  uploadedDate?: string;
  isActive?: boolean;
  hasError?: boolean;
  isProcessing?: boolean;
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  onInfo?: () => void;
  onSetActive?: () => void;
  className?: string;
}

const FileIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375H14.25V6.375A3.375 3.375 0 0 0 10.875 3H8.25m0 0H5.625A2.625 2.625 0 0 0 3 5.625v12.75A2.625 2.625 0 0 0 5.625 21h12.75A2.625 2.625 0 0 0 21 18.375V15.75M8.25 3h2.625A3.375 3.375 0 0 1 14.25 6.375v1.875" /></svg>;
const CheckIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>;
const SpinnerIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-3 w-3 animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3"/></svg>;
const AlertIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.95 3.374H4.647c-1.733 0-2.816-1.874-1.95-3.374L10.05 3.374c.866-1.5 3.033-1.5 3.9 0l7.353 12.752ZM12 15.75h.007v.008H12v-.008Z" /></svg>;
const StarIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4"><path d="m11.48 3.499-2.09 4.236-4.677.679 3.384 3.298-.8 4.658L12 13.98l4.183 2.39-.799-4.658 3.384-3.298-4.676-.679L12 3.499a.58.58 0 0 0-1.04 0Z" /></svg>;
const EyeIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1 1 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178a1 1 0 0 1 0 .644C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const DownloadIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 10.5 12 15m0 0 4.5-4.5M12 15V3" /></svg>;
const TrashIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21.75H8.084a2.25 2.25 0 0 1-2.245-2.077L4.772 5.79m14.456 0A48.108 48.108 0 0 0 15.75 5.25m-10.978.54c.34-.059.68-.114 1.022-.165m0 0A48.11 48.11 0 0 1 8.25 5.25m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0C9.16 2.17 8.25 3.154 8.25 4.334v.916" /></svg>;
const InfoIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.04-.02a.75.75 0 0 1 1.06.85l-.71 2.84m1.16-7.19a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;

export function DownloadedFile({
  fileName,
  fileSize,
  fileSizeBytes,
  uploadedDate,
  isActive,
  hasError,
  isProcessing,
  onView,
  onDownload,
  onDelete,
  onInfo,
  onSetActive,
  className,
}: DownloadedFileProps) {
  const formatFileSize = useCallback(
    (bytes?: number): string => {
      if (fileSize) return fileSize;
      if (!bytes) return '—';
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    },
    [fileSize]
  );

  const formatDate = useCallback((dateString?: string): string => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  }, []);

  return (
    <div
      className={cn(
        'border-border-subtle bg-bg-surface-elevated flex items-center justify-between rounded-lg border p-4',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="text-accent h-5 w-5 flex-shrink-0">{FileIcon}</span>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-text-primary truncate text-sm font-medium">
              {fileName}
            </span>
            {isActive ? (
              <span className="bg-accent/20 text-text-primary flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                {CheckIcon}
                Active
              </span>
            ) : null}
            {isProcessing && !hasError ? (
              <span className="bg-bg-hover text-text-secondary flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                {SpinnerIcon}
                Processing...
              </span>
            ) : null}
            {hasError ? (
              <span className="bg-[var(--color-feedback-error-soft)] text-[var(--color-feedback-error-strong)] flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                {AlertIcon}
                Error
              </span>
            ) : null}
          </div>
          <span className="text-text-muted text-xs">
            {formatFileSize(fileSizeBytes)} • {formatDate(uploadedDate)}
          </span>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        {onSetActive && !isActive ? (
          <Button
            onClick={onSetActive}
            variant={ButtonVariantEnum.GHOST}
            size={ComponentSizeEnum.SM}
            iconOnly
            className="text-accent hover:bg-accent-light hover:text-accent h-8 w-8 p-0"
            aria-label="Set as active dataset"
            leftIcon={StarIcon}
          />
        ) : null}
        {onView ? (
          <Button
            onClick={onView}
            variant={ButtonVariantEnum.GHOST}
            size={ComponentSizeEnum.SM}
            iconOnly
            className="h-8 w-8 p-0"
            aria-label="View file"
            leftIcon={EyeIcon}
          />
        ) : null}
        {onDownload ? (
          <Button
            onClick={onDownload}
            variant={ButtonVariantEnum.GHOST}
            size={ComponentSizeEnum.SM}
            iconOnly
            className="h-8 w-8 p-0"
            aria-label="Download file"
            leftIcon={DownloadIcon}
          />
        ) : null}
        {onDelete ? (
          <Button
            onClick={onDelete}
            variant={ButtonVariantEnum.GHOST}
            size={ComponentSizeEnum.SM}
            iconOnly
            className="text-[var(--color-feedback-error)] hover:bg-[var(--color-feedback-error-soft)] h-8 w-8 p-0 hover:text-[var(--color-feedback-error-strong)]"
            aria-label="Delete file"
            leftIcon={TrashIcon}
          />
        ) : null}
        {onInfo ? (
          <Button
            onClick={onInfo}
            variant={ButtonVariantEnum.GHOST}
            size={ComponentSizeEnum.SM}
            iconOnly
            className="h-8 w-8 p-0"
            aria-label="File information"
            leftIcon={InfoIcon}
          />
        ) : null}
      </div>
    </div>
  );
}
